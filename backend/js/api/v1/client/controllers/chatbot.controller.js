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
    var _a, _b;
    try {
        const { question } = req.body;
        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập câu hỏi",
            });
        }
        const history = Array.isArray(req.body.history)
            ? req.body.history
                .slice(-10)
                .filter((item) => item && ["user", "assistant"].includes(item.role))
                .map((item) => ({
                role: item.role,
                content: String(item.content || "").slice(0, 1200),
                bookIds: Array.isArray(item.bookIds)
                    ? item.bookIds
                        .filter((id) => /^[a-f\d]{24}$/i.test(String(id)))
                        .slice(0, 8)
                    : [],
            }))
            : [];
        const normalizedQuestion = question
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d");
        const isContextualFollowUp = /(may sach|sach tren|nhung sach|nhung cuon|cuon tren|sach do|cuon do|vua goi y|goi y tren|noi ve gi|noi ve cuon|tac gia do|gia cuon do|review cuon do|chung la gi)/.test(normalizedQuestion);
        let relatedBooks = [];
        if (isContextualFollowUp) {
            const previousBookIds = Array.from(new Set(history.flatMap((item) => item.role === "assistant" ? item.bookIds : []))).slice(-12);
            if (previousBookIds.length > 0) {
                relatedBooks = await Book.find({
                    _id: { $in: previousBookIds },
                    deleted: false,
                    status: "active",
                }).limit(8);
            }
        }
        else {
            relatedBooks = await aiService.findRelatedBooks(Book, question, { limit: 5 });
        }
        let userData = {
            orders: [],
            cart: null,
            user: null,
        };
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.bh_user_session;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.tokenType !== "user") {
                    throw new Error("Invalid session type");
                }
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
        const result = await aiService.queryAI(question, context, relatedBooks, history);
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
            "general_chat",
            "out_of_scope",
        ];
        const shouldShowBooks = !noBookIntents.includes((_b = result.ui) === null || _b === void 0 ? void 0 : _b.intent);
        const relatedBooksPayload = shouldShowBooks &&
            result.ui && Array.isArray(result.ui.cards) && result.ui.cards.length > 0
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
