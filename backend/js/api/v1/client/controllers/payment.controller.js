"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PayOS } = require("@payos/node");
const Order = require("../../models/order.model");
const Book = require("../../models/book.model");
const Transaction = require("../../models/transaction.model");
const mongoose = require("mongoose");
const { sendOrderConfirmationEmail } = require("../../../../helpers/sendEmail");
const { generateDescriptionCode } = require("../../../../helpers/generate");
const payOS = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});
async function cancelOrderAndRestoreStock(orderId) {
    const session = await mongoose.startSession();
    let cancelledOrder = null;
    try {
        await session.withTransaction(async () => {
            const order = await Order.findById(orderId).session(session);
            if (!order || order.status === "delivered")
                return;
            if (order.status === "cancelled") {
                cancelledOrder = order;
                return;
            }
            const itemsToRestore = order.stockDeducted ? order.items || [] : [];
            order.status = "cancelled";
            order.isExpired = true;
            order.stockDeducted = false;
            await order.save({ session });
            for (const item of itemsToRestore) {
                await Book.updateOne({ _id: item.id }, { $inc: { inStock: Number(item.quantity) || 0 } }, { session });
            }
            cancelledOrder = order;
        });
    }
    finally {
        await session.endSession();
    }
    return cancelledOrder;
}
const findDocumentByCode = async (code) => {
    const document = await Order.findOne({ orderCode: String(code) });
    if (document)
        return { document, type: "order" };
    return { document: null, type: null };
};
module.exports.createCombinedPaymentLink = async (req, res) => {
    try {
        const { codes, amount, items } = req.body;
        if (!codes || codes.length === 0) {
            return res.status(400).json({
                error: -1,
                message: "Không có mã đơn hàng!",
            });
        }
        const documents = [];
        for (const code of codes) {
            const { document, type } = await findDocumentByCode(code);
            if (document) {
                documents.push({ code, document, type });
            }
        }
        if (documents.length === 0) {
            return res.status(404).json({
                error: -1,
                message: "Không tìm thấy đơn hàng nào!",
            });
        }
        for (const doc of documents) {
            if (doc.document.isExpired ||
                (doc.document.expiredAt && new Date() > doc.document.expiredAt)) {
                await cancelOrderAndRestoreStock(doc.document._id);
                return res.status(400).json({
                    error: -1,
                    message: `Đơn hàng ${doc.code} đã hết hạn`,
                });
            }
        }
        const mainCode = codes[0];
        const cancelUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/cart`;
        const returnUrl = `${process.env.FRONTEND_URL}/order-success?codes=${encodeURIComponent(codes.join(","))}`;
        const descriptionCode = generateDescriptionCode();
        const paymentLink = await payOS.paymentRequests.create({
            orderCode: Number(String(mainCode).replace(/\D/g, "")),
            amount: Number(amount),
            description: descriptionCode,
            items: items || [],
            cancelUrl,
            returnUrl,
        });
        for (const doc of documents) {
            doc.document.checkoutUrl = paymentLink.checkoutUrl;
            await doc.document.save();
        }
        return res.json({
            error: 0,
            message: "Tạo link thanh toán thành công",
            data: {
                checkoutUrl: paymentLink.checkoutUrl,
                codes: codes,
                amount: amount,
            },
        });
    }
    catch (err) {
        console.error("❌ Lỗi tạo link:", err);
        return res.status(500).json({
            error: -1,
            message: "Lỗi tạo link thanh toán",
            details: err.message,
        });
    }
};
module.exports.webhook = async (req, res) => {
    try {
        const { code, desc, data } = req.body;
        if (code === "00" && desc === "success") {
            const orderCode = String(data.orderCode);
            const mainDoc = await Order.findOne({ orderCode: orderCode });
            const paidDocuments = [];
            if (mainDoc && mainDoc.checkoutUrl) {
                const checkoutUrl = mainDoc.checkoutUrl;
                const pendingOrders = await Order.find({
                    checkoutUrl,
                    status: "pending",
                });
                for (const order of pendingOrders) {
                    order.status = "confirmed";
                    await order.save();
                    paidDocuments.push({ doc: order, type: "order" });
                    await new Transaction({
                        orderCode: String(order.orderCode),
                        bankCode: data.counterAccountBankId,
                        accountNo: data.accountNumber,
                        amount: data.amount,
                        description: data.description,
                        transactionDate: data.transactionDateTime
                            ? new Date(data.transactionDateTime)
                            : new Date(),
                        status: "success",
                        verifiedAt: new Date(),
                    }).save();
                }
            }
            try {
                if (paidDocuments.length === 1) {
                    const { doc } = paidDocuments[0];
                    const emailOrder = {
                        userInfo: doc.userInfo,
                        orderCode: doc.orderCode,
                        items: doc.items || [],
                        totalAmount: doc.totalAmount || 0,
                    };
                    await sendOrderConfirmationEmail(emailOrder);
                }
                else if (paidDocuments.length > 1) {
                    const firstDoc = paidDocuments[0].doc;
                    const userInfo = firstDoc.userInfo;
                    const combinedCode = paidDocuments
                        .map((d) => d.doc.orderCode)
                        .join(", ");
                    const combinedItems = paidDocuments.flatMap((d) => d.doc.items || []);
                    const combinedTotal = paidDocuments.reduce((sum, d) => sum + (d.doc.totalAmount || 0), 0);
                    const combinedOrder = {
                        userInfo,
                        orderCode: combinedCode,
                        items: combinedItems,
                        totalAmount: combinedTotal,
                    };
                    await sendOrderConfirmationEmail(combinedOrder);
                }
            }
            catch (emailErr) {
                console.error("Lỗi gửi email xác nhận đơn:", emailErr);
            }
        }
        return res.json({ message: "OK" });
    }
    catch (err) {
        console.error("Lỗi webhook:", err);
        return res.status(500).json({ message: "Lỗi xử lý webhook" });
    }
};
module.exports.cancelPaymentLink = async (req, res) => {
    try {
        const { code } = req.params;
        const { document, type } = await findDocumentByCode(code);
        if (!document) {
            return res.status(404).json({
                error: -1,
                message: "Không tìm thấy đơn hàng!",
            });
        }
        if (document.status === "processing") {
            return res.status(400).json({
                error: -1,
                message: "Đã thanh toán, không thể hủy",
            });
        }
        const cancelledDocument = await cancelOrderAndRestoreStock(document._id);
        if (!cancelledDocument) {
            return res.status(400).json({
                error: -1,
                message: "Không thể hủy đơn hàng đã hoàn tất.",
            });
        }
        try {
            const orderCode = Number(String(code).replace(/\D/g, ""));
            await payOS.paymentRequests.cancel(orderCode);
        }
        catch (e) { }
        return res.json({
            error: 0,
            message: "Hủy thành công",
            type: type,
            code: code,
        });
    }
    catch (err) {
        console.error("Lỗi hủy:", err);
        return res.status(500).json({
            error: -1,
            message: "Lỗi hủy",
        });
    }
};
