const express = require('express');
const router = express.Router();
const { loginUser, sendOtp, registerUser, getUserProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/s3Upload');

router.post('/send-otp', sendOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.put(
  '/profile',
  protect,
  upload.fields([
    { name: 'markSheet10', maxCount: 1 },
    { name: 'markSheet12', maxCount: 1 },
    { name: 'communityCert', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'tc', maxCount: 1 },
    { name: 'lateralCert', maxCount: 1 },
  ]),
  updateProfile
);

module.exports = router;
