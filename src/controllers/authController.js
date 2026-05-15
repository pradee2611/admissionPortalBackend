const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { getOtpEmailTemplate } = require('../utils/emailTemplates');

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Send OTP to email
// @route   POST /api/v1/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.deleteMany({ email });
  await OTP.create({ email, otp });

  try {
    await sendEmail({
      email,
      subject: 'Your OTP for Registration - seatify',
      message: `Your OTP for registration is ${otp}. It is valid for 10 minutes.`,
      html: getOtpEmailTemplate(otp),
    });
    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error(error);
    await OTP.deleteMany({ email });
    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Verify OTP and register
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, otp } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord || otpRecord.otp !== otp) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    await OTP.deleteMany({ email });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('purchasedCourses');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      markSheet10: user.markSheet10,
      markSheet12: user.markSheet12,
      communityCert: user.communityCert,
      profileImage: user.profileImage,
      aadharCard: user.aadharCard,
      address: user.address,
      state: user.state,
      city: user.city,
      pincode: user.pincode,
      gender: user.gender,
      dob: user.dob,
      currentQualification: user.currentQualification,
      tc: user.tc,
      lateralCert: user.lateralCert,
      role: user.role,
      purchasedCourses: user.purchasedCourses,
      cart: user.cart,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update admission profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.state = req.body.state || user.state;
    user.city = req.body.city || user.city;
    user.pincode = req.body.pincode || user.pincode;
    user.gender = req.body.gender || user.gender;
    user.dob = req.body.dob || user.dob;
    user.currentQualification = req.body.currentQualification || user.currentQualification;

    // Files are uploaded to S3 by multer-s3
    if (req.files) {
      if (req.files.markSheet10) user.markSheet10 = req.files.markSheet10[0].location;
      if (req.files.markSheet12) user.markSheet12 = req.files.markSheet12[0].location;
      if (req.files.communityCert) user.communityCert = req.files.communityCert[0].location;
      if (req.files.profileImage) user.profileImage = req.files.profileImage[0].location;
      if (req.files.aadharCard) user.aadharCard = req.files.aadharCard[0].location;
      if (req.files.tc) user.tc = req.files.tc[0].location;
      if (req.files.lateralCert) user.lateralCert = req.files.lateralCert[0].location;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      markSheet10: updatedUser.markSheet10,
      markSheet12: updatedUser.markSheet12,
      communityCert: updatedUser.communityCert,
      profileImage: updatedUser.profileImage,
      aadharCard: updatedUser.aadharCard,
      tc: updatedUser.tc,
      lateralCert: updatedUser.lateralCert,
      address: updatedUser.address,
      state: updatedUser.state,
      city: updatedUser.city,
      pincode: updatedUser.pincode,
      gender: updatedUser.gender,
      dob: updatedUser.dob,
      currentQualification: updatedUser.currentQualification,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  loginUser,
  sendOtp,
  registerUser,
  getUserProfile,
  updateProfile,
};
