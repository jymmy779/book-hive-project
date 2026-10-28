"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const Account = require("../../models/account.model");
module.exports.index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const keyword = req.query.keyWord;
        const find = {
            deleted: false,
        };
        if (status) {
            find.status = status;
        }
        if (keyword) {
            const regex = new RegExp(String(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            find.$or = [{ title: regex }];
        }
        let sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = Number(req.query.sortValue);
        }
        const [accounts, total] = await Promise.all([
            Account.find(find)
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .populate("updatedBy", "fullName")
                .populate("createdBy", "fullName")
                .populate("deletedBy", "fullName"),
            Account.countDocuments(find),
        ]);
        if (accounts) {
            return res.status(200).json({
                message: "Thành công!",
                accounts: accounts,
                total: total,
                limit: limit,
            });
        }
        return res.status(400).json({
            message: "Không có tài khoản nào",
        });
    }
    catch (error) {
        return res.status(400).json("Không tìm thấy!");
    }
};
module.exports.changeStatus = async (req, res) => {
    try {
        const { id, status } = req.params;
        if (!status) {
            return res.status(404).json({ message: "Không tìm thấy status!" });
        }
        const account = await Account.updateOne({
            _id: id,
        }, {
            status: status,
            updatedBy: req.user.id,
        });
        if (!account) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
        }
        return res.status(200).json({
            message: "Cập nhật trạng thái thành công!",
            account: account,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server!" });
    }
};
module.exports.changeMulti = async (req, res) => {
    try {
        const type = req.body.type;
        const ids = Array.isArray(req.body.ids)
            ? req.body.ids
            : req.body.ids.split(", ");
        switch (type) {
            case "active":
                await Account.updateMany({ _id: { $in: ids } }, { status: "active", updatedBy: req.user.id });
                return res.status(200).json({
                    message: `Cập nhật trạng thái thành công ${ids.length} tài khoản!`,
                });
            case "inactive":
                await Account.updateMany({ _id: { $in: ids } }, { status: "inactive", updatedBy: req.user.id });
                return res.status(200).json({
                    message: `Cập nhật trạng thái thành công ${ids.length} tài khoản!`,
                });
            case "delete_all":
                await Account.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date(), deletedBy: req.user.id });
                const accountsLeft = await Account.find({ deleted: false }).sort({
                    position: 1,
                });
                await Promise.all(accountsLeft.map((account, i) => Account.updateOne({ _id: account._id }, { position: i + 1 })));
                return res.status(200).json({
                    message: `Đã xóa ${ids.length} tài khoản!`,
                });
            default:
                return res.status(400).json({
                    message: "Loại thao tác không hợp lệ!",
                });
        }
    }
    catch (error) {
        return res.status(400).json({
            message: "Cập nhật thất bại!",
        });
    }
};
module.exports.create = async (req, res) => {
    try {
        let _a = req.body, { fullName, password } = _a, newAccData = __rest(_a, ["fullName", "password"]);
        const slug = slugify(fullName, { lower: true, strict: true, locale: "vi" });
        let avatar = "";
        if (req.file) {
            avatar = req.file.path || req.file.url || req.file.secure_url || "";
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAcc = new Account(Object.assign(Object.assign({}, newAccData), { avatar,
            slug,
            fullName, password: hashedPassword, createdBy: req.user.id }));
        await newAcc.save();
        return res.status(200).json({
            message: "Tạo mới tài khoản thành công!",
            newAcc: newAcc,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Tạo mới tài khoản thất bại",
        });
    }
};
module.exports.detail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const account = await Account.findOne({
            slug: slug,
            deleted: false,
        })
            .select("-password")
            .populate("role_id", "title");
        if (!account) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
        }
        return res.status(200).json({
            message: "Lấy thông tin tài khoản thành công!",
            account: account,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Lỗi khi lấy thông tin tài khoản!",
        });
    }
};
module.exports.edit = async (req, res) => {
    try {
        const slug = req.params.slug;
        const account = await Account.findOne({ slug, deleted: false });
        if (!account) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
        }
        const updateData = Object.assign({}, req.body);
        if (!req.file && (req.body.image === undefined || req.body.image === "")) {
            updateData.image = account.image;
        }
        if (req.file) {
            updateData.image = req.file.path || req.file.url || req.file.secure_url || "";
        }
        if (req.body.title) {
            updateData.slug = slugify(req.body.title, {
                lower: true,
                strict: true,
                locale: "vi",
            });
        }
        updateData.updatedBy = req.user.id;
        await Account.updateOne({ _id: account._id }, updateData);
        return res.status(200).json({
            message: "Cập nhật thông tin thành công!",
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Cập nhật thông tin thất bại",
        });
    }
};
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Account.updateOne({
            _id: id,
        }, {
            deleted: true,
            deletedBy: req.user.id,
            deletedAt: new Date(),
        });
        return res.status(200).json({
            message: "Xóa thành công!",
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Xóa thất bại",
        });
    }
};
module.exports.resetPassword = async (req, res) => {
    try {
        const slug = req.params.slug;
        const { newPassword } = req.body;
        const account = await Account.findOne({
            slug: slug,
        });
        if (!account) {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản!",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Account.updateOne({
            slug: slug,
        }, {
            password: hashedPassword,
            updatedBy: req.user.id,
        });
        return res.status(200).json({
            message: "Cập nhật thành công!",
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Cập nhật thất bại!",
        });
    }
};
module.exports.profile = async (req, res) => {
    try {
        const id = req.user.id;
        const account = await Account.findOne({
            _id: id,
        })
            .select("-password")
            .populate("role_id", "title");
        if (!account) {
            return res.status(404).json({ message: "Không tìm thấy hồ sơ!" });
        }
        return res.status(200).json({
            message: "Lấy thông tin hồ sơ thành công!",
            account: account,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Lỗi khi lấy thông tin hồ sơ!",
        });
    }
};
module.exports.updateProfile = async (req, res) => {
    try {
        const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
        const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
        if (fullName.length < 2) {
            return res.status(400).json({ message: "Họ tên cần có ít nhất 2 ký tự." });
        }
        if (phone && !/^[0-9+().\-\s]{8,20}$/.test(phone)) {
            return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
        }
        const account = await Account.findOneAndUpdate({ _id: req.user.id, status: "active", deleted: false }, { $set: { fullName, phone } }, { new: true, runValidators: true }).select("fullName email phone avatar role_id").populate("role_id", "title");
        if (!account)
            return res.status(404).json({ message: "Không tìm thấy hồ sơ cá nhân." });
        return res.status(200).json({ message: "Cập nhật hồ sơ thành công.", account });
    }
    catch (error) {
        console.error("Admin profile update error:", error);
        return res.status(500).json({ message: "Không thể cập nhật hồ sơ lúc này." });
    }
};
