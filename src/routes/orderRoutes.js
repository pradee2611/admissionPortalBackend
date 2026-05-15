const express = require('express');
const router = express.Router();
const { getMyOrders, getOrderById, swapCourse } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/swap').post(protect, swapCourse);

module.exports = router;
