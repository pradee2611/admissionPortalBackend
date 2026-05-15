const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const { decrementSeatsInSheet, savePurchasedUserToSheet } = require('../services/googleSheetService');

// @desc    Get user orders
// @route   GET /api/v1/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('courses');
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('courses').populate('user');

  if (order && order.user.toString() === req.user._id.toString()) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }
});

// @desc    Swap course within 1 hour
// @route   POST /api/v1/orders/:id/swap
// @access  Private
const swapCourse = asyncHandler(async (req, res) => {
  const { newCourseId } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // 1-hour window check
  const orderDate = new Date(order.createdAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / 60000);

  if (diffInMinutes > 60) {
    res.status(400);
    throw new Error('The 1-hour window to change your course has expired.');
  }

  const oldCourseId = order.courses[0];
  const oldCourse = await Course.findById(oldCourseId);
  const newCourse = await Course.findById(newCourseId);

  if (!newCourse) {
    res.status(404);
    throw new Error('New course not found');
  }

  // Update order
  order.courses = [newCourseId];
  await order.save();

  // Update user
  const user = await User.findById(req.user._id);
  user.purchasedCourses = user.purchasedCourses.filter(c => c.toString() !== oldCourseId.toString());
  if (!user.purchasedCourses.includes(newCourseId)) {
    user.purchasedCourses.push(newCourseId);
  }
  await user.save();

  // Update Seats in DB
  if (oldCourse) {
    oldCourse.availableSeats = (oldCourse.availableSeats || 0) + 1;
    await oldCourse.save();
  }
  if (newCourse) {
    newCourse.availableSeats = Math.max(0, (newCourse.availableSeats || 0) - 1);
    await newCourse.save();
    // Also update Google Sheet for the new course
    if (newCourse.originalName) {
      await decrementSeatsInSheet(newCourse.originalName);
      await savePurchasedUserToSheet(user, newCourse, order, order.razorpayPaymentId);
    }
  }

  res.json({ success: true, message: 'Course swapped successfully', order });
});

module.exports = {
  getMyOrders,
  getOrderById,
  swapCourse,
};
