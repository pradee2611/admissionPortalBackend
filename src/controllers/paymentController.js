const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orderModel');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const { decrementSeatsInSheet, savePurchasedUserToSheet } = require('../services/googleSheetService');
const sendEmail = require('../utils/sendEmail');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxx',
});

// @desc    Create Razorpay Order
// @route   POST /api/v1/payment/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { courseIds } = req.body;

  if (!courseIds || courseIds.length === 0) {
    res.status(400);
    throw new Error('No courses selected');
  }

  // Enforce "one course only" rule
  if (courseIds.length > 1) {
    res.status(400);
    throw new Error('You can only purchase one course at a time');
  }

  const user = await User.findById(req.user._id);
  if (user.purchasedCourses && user.purchasedCourses.length > 0) {
    res.status(400);
    throw new Error('You have already purchased a course. Each user is limited to one course enrollment.');
  }

  // Calculate total amount
  const courses = await Course.find({ _id: { $in: courseIds } });
  
  if (courses.length !== courseIds.length) {
    res.status(400);
    throw new Error('Some courses not found');
  }

  const totalAmount = courses.reduce((acc, item) => acc + (item.discountPrice || item.price), 0);

  // Create order in DB
  const order = await Order.create({
    user: req.user._id,
    courses: courseIds,
    totalAmount,
    paymentStatus: 'pending',
  });

  // Create Razorpay order
  const options = {
    amount: totalAmount * 100, // Amount in paise
    currency: 'INR',
    receipt: order._id.toString(),
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);
    
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      _id: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error creating Razorpay order');
  }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/v1/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Update order status
    const order = await Order.findById(order_id);
    
    if (order) {
      order.paymentStatus = 'success';
      order.razorpayPaymentId = razorpay_payment_id;
      order.orderStatus = 'completed';
      await order.save();

      // Add courses to user's purchased list
      const user = await User.findById(req.user._id);
      
      // Avoid duplicates
      order.courses.forEach(courseId => {
        if (!user.purchasedCourses.includes(courseId)) {
          user.purchasedCourses.push(courseId);
        }
      });
      
      await user.save();

      const purchasedCourses = await Course.find({ _id: { $in: order.courses } });

      // Update seat counts in Google Sheets
      try {
        for (const course of purchasedCourses) {
          if (course.originalName) {
            await decrementSeatsInSheet(course.originalName);
            // Update local DB count as well
            course.availableSeats = Math.max(0, (course.availableSeats || 0) - 1);
            await course.save();
          }
          // Save user data to category-specific sheet
          await savePurchasedUserToSheet(user, course, order, razorpay_payment_id);
        }
      } catch (sheetError) {
        console.error('Failed to update Google Sheet seats:', sheetError.message);
      }

      // Send Confirmation Email with Receipt
      try {
        const coursesList = purchasedCourses.map(c => `<li>${c.title} - ₹${c.discountPrice || c.price}</li>`).join('');
        
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4f46e5; margin: 0;">Admission Portal</h1>
              <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Payment Confirmation & Receipt</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>Thank you for your enrollment. We have successfully received your payment.</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e293b;">Order Summary</h3>
              <p style="font-size: 14px; margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
              <p style="font-size: 14px; margin: 5px 0;"><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
              <p style="font-size: 14px; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
              
              <ul style="padding-left: 20px; margin: 0; font-size: 14px;">
                ${coursesList}
              </ul>
              
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
              
              <p style="font-size: 18px; margin: 0; text-align: right;"><strong>Total Paid: ₹${order.totalAmount}</strong></p>
            </div>
            
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 12px; border: 1px solid #fee2e2; margin-bottom: 20px;">
              <p style="color: #991b1b; font-size: 13px; margin: 0;"><strong>⚠️ Important Notice:</strong> This enrollment is <strong>temporary</strong>. You are required to visit the SNS Institutions campus with your original documents for final verification and full confirmation within the next 7 working days.</p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #94a3b8;">
              <p>You have a <strong>1-hour window</strong> from the time of payment to change your course selection through your profile dashboard.</p>
              <p>This is a computer-generated receipt. No signature required.</p>
              <p>&copy; ${new Date().getFullYear()} Admission Portal. All rights reserved.</p>
            </div>
          </div>
        `;

        await sendEmail({
          email: user.email,
          subject: `Enrollment Successful - Admission Portal (Order #${order._id.toString().slice(-6)})`,
          html,
        });
        console.log(`Receipt sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError.message);
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } else {
    res.status(400);
    throw new Error('Invalid signature');
  }
});

module.exports = {
  createOrder,
  verifyPayment,
};
