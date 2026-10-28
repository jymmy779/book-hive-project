"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Account = require("../../models/account.model");
const authCookie = require("../../../../helpers/authCookie");
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
        const accessToken = jwt.sign({
            id: user._id,
            email: user.email,
            tokenType: "admin",
            role_id: user.role_id,
            permissions: ((_a = user.role_id) === null || _a === void 0 ? void 0 : _a.permissions) || [],
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        authCookie.setAuthCookie(res, "bh_admin_session", accessToken);
        return res.status(200).json({
            message: "Đăng nhập thành công!",
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
    var _a, _b, _c;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.bh_admin_session;
        if (!token)
            return res.status(401).json({ message: 'Unauthenticated' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || decoded.tokenType !== "admin") {
            return res.status(400).json({ message: "Token không hợp lệ!" });
        }
        const account = await Account.findOne({
            _id: decoded.id,
            status: "active",
            deleted: false,
        }).populate("role_id");
        if (!account)
            return res.status(401).json({ message: "Unauthenticated" });
        const user = {
            id: account._id,
            email: account.email,
            role: (_b = account.role_id) === null || _b === void 0 ? void 0 : _b.slug,
            permissions: ((_c = account.role_id) === null || _c === void 0 ? void 0 : _c.permissions) || [],
        };
        req.user = Object.assign(Object.assign({}, decoded), { role: user.role, permissions: user.permissions });
        return res.status(200).json({ message: "Token hợp lệ!", user });
    }
    catch (error) {
        return res.status(400).json({
            message: "Xác thực không thành công",
        });
    }
};
module.exports.logout = async (req, res) => {
    authCookie.clearAuthCookie(res, 'bh_admin_session');
    return res.status(200).json({ message: 'Logged out' });
};
module.exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body || {};
        if (typeof currentPassword !== "string" || !currentPassword) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại." });
        }
        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự." });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu xác nhận không khớp." });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "Mật khẩu mới phải khác mật khẩu hiện tại." });
        }
        const account = await Account.findOne({ _id: req.user.id, status: "active", deleted: false });
        if (!account) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản admin." });
        }
        const matches = await bcrypt.compare(currentPassword, account.password);
        if (!matches) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không đúng." });
        }
        account.password = await bcrypt.hash(newPassword, 10);
        await account.save();
        return res.status(200).json({ message: "Đổi mật khẩu thành công." });
    }
    catch (error) {
        console.error("Admin change password error:", error);
        return res.status(500).json({ message: "Không thể đổi mật khẩu lúc này." });
    }
};
