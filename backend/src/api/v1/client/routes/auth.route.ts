const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");
const {
  validateLogin,
  validateRegister,
} = require("../../../../middleware/validate.middleware");
const { clientAuth } = require("../../../../middleware/auth.middleware");

router.post("/register", validateRegister, controller.register);

router.post("/loginWithPassword", validateLogin, controller.loginWithPassword);

router.post("/verify", controller.verify);

router.post("/logout", controller.logout);

router.post("/loginWithGoogle", controller.loginWithGoogle);

router.post("/forgot-password/send-otp", controller.sendOtpForgotPassword);

router.post("/forgot-password/verify-otp", controller.verifyOtpForgotPassword);

router.patch("/reset-password", controller.resetPassword);

router.patch("/change-password", clientAuth, controller.changePassword);

module.exports = router;

export {};
