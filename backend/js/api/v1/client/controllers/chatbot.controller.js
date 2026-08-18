"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Book = require("../../models/book.model");
const Category = require("../../models/category.model");
const Order = require("../../models/order.model");
const Review = require("../../models/review.model");
const Cart = require("../../models/cart.model");
const User = require("../../models/user.model");
const aiService = require("../services/ai.service");
const jwt = require("jsonwebtoken");
module.exports.query = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập câu hỏi",
            });
        }
        const relatedBooks = await aiService.findRelatedBooks(Book, question, {
            limit: 5,
        });
        let userData = {
            orders: [],
            cart: null,
            user: null,
        };
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userData.orders = await Order.find({ "userInfo.email": decoded.email })
                    .sort({ createdAt: -1 })
                    .limit(3);
                userData.cart = await Cart.findOne({ userId: decoded.id });
                userData.user = await User.findOne({ _id: decoded.id }).select("fullName email");
            }
            catch (err) {
                console.log("Chatbot Auth optional error:", err.message);
            }
        }
        const bookIds = relatedBooks.map((b) => b._id);
        const relatedReviews = await Review.find({ book: { $in: bookIds } })
            .populate("user", "fullName")
            .populate("book", "title")
            .limit(10);
        const context = aiService.buildContext(relatedBooks, {
            orders: userData.orders,
            cart: userData.cart,
            reviews: relatedReviews,
            user: userData.user,
        });
        const result = await aiService.queryAI(question, context, relatedBooks);
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || "Lỗi khi xử lý câu hỏi",
            });
        }
        const noBookIntents = [
            "auth_login",
            "auth_register",
            "cart",
            "order",
            "payment",
            "general_help",
            "out_of_scope",
        ];
        const relatedBooksPayload = result.ui && Array.isArray(result.ui.cards) && result.ui.cards.length > 0
            ? result.ui.cards.map((card) => ({
                id: card.id,
                title: card.title,
                author: card.author,
                price: card.price,
                rating: card.rating,
                image: card.image,
                slug: card.slug,
                href: card.href,
            }))
            : [];
        return res.status(200).json({
            success: true,
            question: question,
            answer: result.answer,
            ui: result.ui || {},
            related_books: relatedBooksPayload,
        });
    }
    catch (error) {
        console.error("Chatbot Controller Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ",
            error: error.message,
        });
    }
};
