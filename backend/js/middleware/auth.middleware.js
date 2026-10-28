const jwt = require("jsonwebtoken");
const Account = require("../api/v1/models/account.model");
const User = require("../api/v1/models/user.model");
const isTrustedMutation = (req) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method))
        return true;
    const frontendOrigin = process.env.FRONTEND_URL
        ? new URL(process.env.FRONTEND_URL).origin
        : "";
    return Boolean(frontendOrigin && req.get("origin") === frontendOrigin);
};
module.exports.adminAuth = async (req, res, next) => {
    var _a, _b, _c;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.bh_admin_session;
    if (!token)
        return res.status(401).json({ message: "Unauthenticated" });
    if (!isTrustedMutation(req))
        return res.status(403).json({ message: "Untrusted request origin" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.tokenType !== "admin") {
            return res.status(403).json({ message: "JWT không dành cho quản trị viên" });
        }
        const account = await Account.findOne({
            _id: decoded.id,
            status: "active",
            deleted: false,
        }).populate("role_id");
        if (!account) {
            return res
                .status(403)
                .json({ message: "Tài khoản không hợp lệ hoặc đã bị khóa" });
        }
        const permissions = ((_b = account.role_id) === null || _b === void 0 ? void 0 : _b.permissions) || [];
        req.user = Object.assign(Object.assign({}, decoded), { role: (_c = account.role_id) === null || _c === void 0 ? void 0 : _c.slug, permissions });
        next();
    }
    catch (err) {
        return res
            .status(400)
            .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};
module.exports.clientAuth = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.bh_user_session;
        if (!token)
            return res.status(401).json({ success: false, message: "Unauthenticated" });
        if (!isTrustedMutation(req))
            return res.status(403).json({ success: false, message: "Untrusted request origin" });
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.tokenType !== "user") {
                return res.status(403).json({
                    success: false,
                    message: "JWT không dành cho tài khoản khách hàng",
                });
            }
            const user = await User.findOne({
                _id: decoded.id,
                deleted: false,
                status: "active",
            });
            if (!user) {
                return res.status(403).json({
                    success: false,
                    message: "Tài khoản không hợp lệ hoặc đã bị khóa",
                });
            }
            req.user = {
                id: decoded.id,
                email: decoded.email,
                userId: user._id,
            };
            next();
        }
        catch (err) {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ hoặc đã hết hạn",
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};
