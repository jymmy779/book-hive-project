"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order = require("../../models/order.model");
const generateHelper = require("../../../../helpers/generate");
const { sendOrderConfirmationEmail } = require("../../../../helpers/sendEmail");
module.exports.index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        const orders = await Order.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await Order.countDocuments();
        return res.status(200).json({
            message: "Lấy danh sách đơn hàng thành công!",
            orders,
            total,
            limit,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi lấy danh sách đơn hàng!",
            error: error.message,
        });
    }
};
module.exports.create = async (req, res) => {
    try {
        const { userInfo, items, totalAmount, paymentMethod } = req.body;
        if (!userInfo || !items || items.length === 0 || !totalAmount) {
            return res.status(400).json({
                message: "Thông tin đơn hàng không đầy đủ!",
            });
        }
        const orderCode = generateHelper.generateOrderCode();
        const order = new Order({
            orderCode,
            userInfo,
            items,
            totalAmount,
            paymentMethod,
        });
        await order.save();
        if (paymentMethod === "cod") {
            try {
                await sendOrderConfirmationEmail({
                    userInfo,
                    orderCode,
                    items,
                    totalAmount,
                });
            }
            catch (emailErr) {
                console.error("Lỗi gửi email:", emailErr);
            }
        }
        return res.status(201).json({
            message: "Tạo đơn hàng thành công!",
            order,
        });
    }
    catch (error) {
        console.error("❌ Lỗi tạo đơn:", error);
        return res.status(500).json({
            message: "Lỗi tạo đơn hàng!",
            error: error.message,
        });
    }
};
module.exports.detail = async (req, res) => {
    try {
        const { code } = req.params;
        const order = await Order.findOne({ orderCode: String(code) });
        if (!order) {
            return res.status(404).json({
                message: "Không tìm thấy đơn hàng!",
            });
        }
        return res.status(200).json({
            message: "Lấy thông tin đơn hàng thành công!",
            order: order,
        });
    }
    catch (error) {
        console.error("❌ Detail error:", error);
        return res.status(500).json({
            message: "Lỗi lấy thông tin đơn hàng!",
            error: error.message,
        });
    }
};
module.exports.getOrdersByUser = async (req, res) => {
    try {
        const { email } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const orders = await Order.find({ "userInfo.email": email })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await Order.countDocuments({ "userInfo.email": email });
        return res.status(200).json({
            orders,
            total,
            page,
            limit,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi lấy danh sách đơn hàng!",
            error: error.message,
        });
    }
};
