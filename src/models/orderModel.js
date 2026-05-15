const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    orderStatus: {
      type: String,
      enum: ['processing', 'completed', 'cancelled'],
      default: 'processing',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
