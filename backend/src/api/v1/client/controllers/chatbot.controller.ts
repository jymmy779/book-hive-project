const Book = require("../../models/book.model");
const Category = require("../../models/category.model");
const Order = require("../../models/order.model");
const Review = require("../../models/review.model");
const Cart = require("../../models/cart.model");
const User = require("../../models/user.model");
const aiService = require("../services/ai.service");
const jwt = require("jsonwebtoken");

// [POST] /api/v1/chatbot/query
module.exports.query = async (req, res) => {
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
          .filter((item: any) => item && ["user", "assistant"].includes(item.role))
          .map((item: any) => ({
            role: item.role,
            content: String(item.content || "").slice(0, 1200),
            bookIds: Array.isArray(item.bookIds)
              ? item.bookIds
                  .filter((id: any) => /^[a-f\d]{24}$/i.test(String(id)))
                  .slice(0, 8)
              : [],
          }))
      : [];
    const normalizedQuestion = question
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
    const isContextualFollowUp =
      /(may sach|sach tren|nhung sach|nhung cuon|cuon tren|sach do|cuon do|vua goi y|goi y tren|noi ve gi|noi ve cuon|tac gia do|gia cuon do|review cuon do|chung la gi)/.test(
        normalizedQuestion,
      );

    // For follow-up questions, resolve the books the bot previously showed from
    // the database so the assistant can explain their real descriptions.
    let relatedBooks: any[] = [];
    if (isContextualFollowUp) {
      const previousBookIds = Array.from(
        new Set(history.flatMap((item: any) => item.role === "assistant" ? item.bookIds : [])),
      ).slice(-12);
      if (previousBookIds.length > 0) {
        relatedBooks = await Book.find({
          _id: { $in: previousBookIds },
          deleted: false,
          status: "active",
        }).limit(8);
      }
    } else {
      relatedBooks = await aiService.findRelatedBooks(Book, question, { limit: 5 });
    }

    // 2. Lấy thông tin người dùng (nếu có token)
    let userData = {
      orders: [],
      cart: null,
      user: null,
    };

    const token = req.cookies?.bh_user_session;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.tokenType !== "user") {
          throw new Error("Invalid session type");
        }

        // Lấy 3 đơn hàng gần nhất
        userData.orders = await Order.find({ "userInfo.email": decoded.email })
          .sort({ createdAt: -1 })
          .limit(3);

        // Lấy giỏ hàng
        userData.cart = await Cart.findOne({ userId: decoded.id });

        // Lấy thông tin user
        userData.user = await User.findOne({ _id: decoded.id }).select(
          "fullName email",
        );
      } catch (err) {
        console.log("Chatbot Auth optional error:", err.message);
      }
    }

    // 3. Lấy đánh giá (reviews) cho các cuốn sách liên quan
    const bookIds = relatedBooks.map((b) => b._id);
    const relatedReviews = await Review.find({ book: { $in: bookIds } })
      .populate("user", "fullName")
      .populate("book", "title")
      .limit(10);

    // 4. Build context đa tầng
    const context = aiService.buildContext(relatedBooks, {
      orders: userData.orders,
      cart: userData.cart,
      reviews: relatedReviews,
      user: userData.user,
    });

    // 5. Query AI
    const result = await aiService.queryAI(question, context, relatedBooks, history);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || "Lỗi khi xử lý câu hỏi",
      });
    }

    // Determine if we should send related books
    // Don't send books for: auth, cart, order, payment intents
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
    // Version 4: Chỉ gửi các sách mà AI đã chọn lọc trong ui.cards
    const shouldShowBooks = !noBookIntents.includes(result.ui?.intent);
    const relatedBooksPayload =
      shouldShowBooks &&
      result.ui && Array.isArray(result.ui.cards) && result.ui.cards.length > 0
        ? result.ui.cards.map((card: any) => ({
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
  } catch (error: any) {
    console.error("Chatbot Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

export {};
