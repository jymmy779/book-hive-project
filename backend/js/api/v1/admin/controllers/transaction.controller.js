"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Transaction = require("../../models/transaction.model");
const Order = require("../../models/order.model");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
module.exports.index = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
        const filter = {};
        if (["success", "pending", "failed"].includes(req.query.status)) {
            filter.status = req.query.status;
        }
        const keyword = String(req.query.keyword || "").trim();
        if (keyword) {
            const regex = new RegExp(escapeRegex(keyword), "i");
            filter.$or = [
                { orderCode: regex },
                { bankCode: regex },
                { description: regex },
            ];
        }
        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .sort({ transactionDate: -1, createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Transaction.countDocuments(filter),
        ]);
        const orderCodes = transactions.map((transaction) => transaction.orderCode);
        const orders = await Order.find({ orderCode: { $in: orderCodes } })
            .select("orderCode userInfo.fullName userInfo.email totalAmount status")
            .lean();
        const orderByCode = new Map(orders.map((order) => [order.orderCode, order]));
        return res.status(200).json({
            transactions: transactions.map((transaction) => (Object.assign(Object.assign({}, transaction), { order: orderByCode.get(transaction.orderCode) || null }))),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        console.error("Admin transaction list error:", error);
        return res.status(500).json({ message: "Không thể tải danh sách giao dịch." });
    }
};
module.exports.detail = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).lean();
        if (!transaction) {
            return res.status(404).json({ message: "Không tìm thấy giao dịch." });
        }
        const order = await Order.findOne({ orderCode: transaction.orderCode })
            .select("orderCode userInfo items totalAmount paymentMethod status createdAt updatedAt expiredAt checkoutUrl")
            .lean();
        return res.status(200).json({ transaction, order: order || null });
    }
    catch (error) {
        console.error("Admin transaction detail error:", error);
        return res.status(500).json({ message: "Không thể tải chi tiết giao dịch." });
    }
};
