const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    purchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    cart: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
      },
    ],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phone: String,
    markSheet10: String, // S3 URL
    markSheet12: String, // S3 URL
    communityCert: String, // S3 URL
    profileImage: String, // S3 URL
    aadharCard: String,
    address: String,
    state: String,
    city: String,
    pincode: String,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    dob: Date,
    currentQualification: String,
    tc: String, // Transfer Certificate URL
    lateralCert: String, // Diploma Marksheet/Cert for Lateral Entry
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
