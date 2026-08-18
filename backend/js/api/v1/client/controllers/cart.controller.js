"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cart = require("../../models/cart.model");
module.exports.index = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.json({ items: [], total: 0 });
        }
        const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        res.json({
            items: cart.items,
            total,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Lấy cart thất bại" });
    }
};
module.exports.add = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId, quantity, title, price, image, slug } = req.body;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }
        const existing = cart.items.find((item) => item.bookId.toString() === bookId);
        if (existing) {
            existing.quantity += quantity;
        }
        else {
            cart.items.push({
                bookId,
                quantity,
                title,
                price,
                image,
                slug,
            });
        }
        await cart.save();
        res.json({ items: cart.items });
    }
    catch (error) {
        res.status(500).json({ error: "Thêm vào cart thất bại" });
    }
};
module.exports.editItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { quantity } = req.body;
        const cart = await Cart.findOne({ userId });
        if (!cart)
            return res.status(404).json({ error: "Cart không tồn tại" });
        const item = cart.items.find((item) => item.bookId.toString() === id);
        if (!item)
            return res.status(404).json({ error: "Item không tồn tại" });
        if (quantity <= 0) {
            cart.items = cart.items.filter((item) => item.bookId.toString() !== id);
        }
        else {
            item.quantity = quantity;
        }
        await cart.save();
        res.json({ items: cart.items });
    }
    catch (error) {
        res.status(500).json({ error: "Cập nhật cart thất bại" });
    }
};
module.exports.deleteItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const cart = await Cart.findOne({ userId });
        if (!cart)
            return res.status(404).json({ error: "Cart không tồn tại" });
        cart.items = cart.items.filter((item) => item.bookId.toString() !== id);
        await cart.save();
        res.json({ items: cart.items });
    }
    catch (error) {
        res.status(500).json({ error: "Xóa sản phẩm thất bại" });
    }
};
module.exports.clear = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });
        if (!cart)
            return res.status(404).json({ error: "Cart không tồn tại" });
        cart.items = [];
        await cart.save();
        res.json({ items: [] });
    }
    catch (error) {
        res.status(500).json({ error: "Xóa toàn bộ cart thất bại" });
    }
};
