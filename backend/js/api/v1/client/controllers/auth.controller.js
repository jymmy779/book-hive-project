"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slugify_1 = require("slugify");
const { OAuth2Client } = require("google-auth-library");
const generate = require("../../../../helpers/generate");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const { sendOTPEmail } = require("../../../../helpers/sendEmail");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;
        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin",
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu không khớp",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email đã được đăng ký",
            });
        }
        const slug = (0, slugify_1.default)(fullName, { lower: true, strict: true, locale: "vi" });
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            slug,
            loginMethod: "password",
            status: "active",
        });
        await newUser.save();
        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            user: {
                id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Lỗi server",
        });
    }
};
exports.loginWithPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email,
            deleted: false,
            status: "active",
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc password sai",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc password sai",
            });
        }
        const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        const refreshToken = generate.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        res.cookie("refreshToken_user", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: user.refreshTokenExpiresAt,
        });
        await user.save();
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
};
module.exports.verify = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Không có accessToken" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(400).json({ message: "Token không hợp lệ!" });
        }
        req.user = decoded;
        return res.status(200).json({ message: "Token hợp lệ!" });
    }
    catch (error) {
        return res.status(400).json({
            message: "Xác thực không thành công",
        });
    }
};
module.exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken_user;
        await User.findOneAndUpdate({
            refreshToken: refreshToken,
        }, { refreshToken: null, refreshTokenExpiresAt: null });
        res.clearCookie("refreshToken_user", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        return res.status(200).json({ message: "Đăng xuất thành công!" });
    }
    catch (error) {
        return res.status(400).json({
            message: "Đăng xuất thất bại",
        });
    }
};
module.exports.loginWithGoogle = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token Google không được cung cấp",
            });
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const googleEmail = payload.email;
        const fullName = payload.name;
        let user = await User.findOne({ googleId, deleted: false });
        if (!user) {
            user = await User.findOne({ email: googleEmail, deleted: false });
            if (!user) {
                const slug = (0, slugify_1.default)(fullName, {
                    lower: true,
                    strict: true,
                    locale: "vi",
                });
                user = new User({
                    fullName,
                    email: googleEmail,
                    googleId,
                    googleEmail,
                    slug,
                    loginMethod: "google",
                    status: "active",
                    isEmailVerified: true,
                });
                await user.save();
            }
            else {
                user.googleId = googleId;
                user.googleEmail = googleEmail;
                user.loginMethod = "google";
                user.isEmailVerified = true;
                await user.save();
            }
        }
        const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        const refreshToken = generate.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        res.cookie("refreshToken_user", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: user.refreshTokenExpiresAt,
        });
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Đăng nhập với Google thành công!",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                loginMethod: user.loginMethod,
            },
        });
    }
    catch (error) {
        console.error("Google auth error:", error);
        return res.status(400).json({
            success: false,
            message: "Đăng nhập Google thất bại",
            error: error.message,
        });
    }
};
module.exports.sendOtpForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email",
            });
        }
        const user = await User.findOne({
            email,
            deleted: false,
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email không tồn tại",
            });
        }
        const otp = generate.generateOTP();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
        user.resetOTP = otp;
        user.resetOTPExpiresAt = expiresAt;
        await user.save();
        await sendOTPEmail(email, user.fullName, otp);
        return res.status(200).json({
            success: true,
            message: "OTP đã được gửi tới email của bạn",
            expiresAt: expiresAt,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
};
module.exports.verifyOtpForgotPassword = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và OTP",
            });
        }
        const user = await User.findOne({
            email,
            deleted: false,
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email không tồn tại",
            });
        }
        if (!user.resetOTPExpiresAt || user.resetOTPExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP đã hết hạn",
            });
        }
        if (user.resetOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: "OTP không chính xác",
            });
        }
        return res.status(200).json({
            success: true,
            message: "OTP chính xác",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
};
module.exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin",
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu không khớp",
            });
        }
        const user = await User.findOne({
            email,
            deleted: false,
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User không tồn tại",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOTP = null;
        user.resetOTPExpiresAt = null;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Đặt lại mật khẩu thành công",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
};
