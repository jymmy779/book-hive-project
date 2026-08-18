"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Account = require("../../models/account.model");
const generate = require("../../../../helpers/generate");
module.exports.login = async (req, res) => {
    var _a, _b, _c;
    try {
        const { email, password } = req.body;
        const user = await Account.findOne({ email }).populate("role_id");
        if (!user) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không đúng" });
        }
        if (user.deleted === true) {
            return res.status(400).json({ message: "Tài khoản đã bị xóa" });
        }
        if (user.status === "inactive") {
            return res.status(400).json({ message: "Tài khoản đang bị khóa" });
        }
        const refreshToken = generate.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        await user.save();
        res.cookie("refreshToken_admin", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: user.refreshTokenExpiresAt,
        });
        const accessToken = jwt.sign({
            id: user._id,
            email: user.email,
            role_id: user.role_id,
            permissions: ((_a = user.role_id) === null || _a === void 0 ? void 0 : _a.permissions) || [],
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        return res.status(200).json({
            message: "Đăng nhập thành công!",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                role: (_b = user.role_id) === null || _b === void 0 ? void 0 : _b.slug,
                permissions: ((_c = user.role_id) === null || _c === void 0 ? void 0 : _c.permissions) || [],
            },
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Đăng nhập thất bại",
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
        const refreshToken = req.cookies.refreshToken_admin;
        await Account.findOneAndUpdate({
            refreshToken: refreshToken,
        }, { refreshToken: null, refreshTokenExpiresAt: null });
        res.clearCookie("refreshToken_admin", {
            httpOnly: true,
            secure: true,
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
