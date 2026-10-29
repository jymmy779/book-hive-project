"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order = require("../../models/order.model");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const statuses = ["pending", "confirmed", "shipping", "shipped", "delivered", "cancelled"];
module.exports.index = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
        const filter = {};
        if (statuses.includes(req.query.status))
            filter.status = req.query.status;
        const keyword = String(req.query.keyword || "").trim();
        if (keyword) {
            const regex = new RegExp(escapeRegex(keyword), "i");
            filter.$or = [
                { orderCode: regex }, { "userInfo.fullName": regex },
                { "userInfo.email": regex }, { "userInfo.phone": regex },
            ];
        }
        const [orders, total] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Order.countDocuments(filter),
        ]);
        return res.json({ orders, total, page, limit, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        console.error("Admin order list error:", error);
        return res.status(500).json({ message: "Không thể tải danh sách đơn hàng." });
    }
};
module.exports.detail = async (req, res) => {
    try {
        const order = await Order.findOne({ orderCode: req.params.code }).lean();
        if (!order)
            return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
        return res.json({ order });
    }
    catch (error) {
        console.error("Admin order detail error:", error);
        return res.status(500).json({ message: "Không thể tải chi tiết đơn hàng." });
    }
};
module.exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!statuses.includes(status))
            return res.status(400).json({ message: "Trạng thái đơn hàng không hợp lệ." });
        const order = await Order.findOne({ orderCode: req.params.code });
        if (!order)
            return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
        if (order.status === "cancelled" || order.status === "delivered") {
            return res.status(409).json({ message: "Đơn đã hủy hoặc hoàn thành nên không thể cập nhật trạng thái." });
        }
        order.status = status;
        await order.save();
        return res.json({ message: "Cập nhật trạng thái đơn hàng thành công.", order });
    }
    catch (error) {
        console.error("Admin order update error:", error);
        return res.status(500).json({ message: "Không thể cập nhật đơn hàng." });
    }
};
