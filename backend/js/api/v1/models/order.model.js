"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    orderCode: {
        type: String,
        unique: true,
        required: true,
    },
    userInfo: {
        fullName: String,
        email: String,
        phone: String,
        address: String,
    },
    items: [
        {
            id: String,
            title: String,
            price: Number,
            quantity: Number,
            image: String,
            slug: String,
        },
    ],
    totalAmount: Number,
    paymentMethod: {
        type: String,
        enum: ["transfer", "cod"],
        default: "transfer",
    },
    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "shipping",
            "shipped",
            "delivered",
            "cancelled",
        ],
        default: "pending",
    },
    expiredAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000),
    },
    checkoutUrl: {
        type: String,
        default: null,
    },
    isExpired: {
        type: Boolean,
        default: false,
    },
    stockDeducted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Order = mongoose.model("Order", orderSchema, "orders");
module.exports = Order;
