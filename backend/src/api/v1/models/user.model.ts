const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    googleEmail: String,
    phone: String,
    avatar: String,
    status: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    loginMethod: String,
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    resetOTP: {
      type: String,
      default: null,
    },
    resetOTPExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;

export {};
