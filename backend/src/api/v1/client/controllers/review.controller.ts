const mongoose = require("mongoose");
const Review = require("../../models/review.model");
const Book = require("../../models/book.model");

// [GET] /api/v1/reviews/:bookId
module.exports.bookReviews = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    if (!bookId) {
      return res.status(400).json({
        message: "Không có bookId",
      });
    }

    const reviewFilter = { book: bookId };
    const [records, total] = await Promise.all([
      Review.find(reviewFilter)
        .populate("user", "fullName")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments(reviewFilter),
    ]);

    res.status(200).json({
      records: records,
      total,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đánh giá",
      error: error.message,
    });
  }
};

// [POST] /api/v1/reviews/send
module.exports.sendReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bookId, rating, comment } = req.body;

    const existingReview = await Review.findOne({
      book: bookId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Bạn đã đánh giá sách này rồi",
      });
    }

    const review = new Review({
      book: bookId,
      user: userId,
      rating: rating,
      comment: comment,
    });

    await review.save();

    // Cập nhật rating cho sách
    const [reviewStats] = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(bookId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviews: { $sum: 1 },
        },
      },
    ]);

    await Book.findByIdAndUpdate(bookId, {
      rating: Math.round((reviewStats?.averageRating || 0) * 10) / 10,
      reviews: reviewStats?.reviews || 0,
    });

    return res.status(201).json({
      message: "Gửi đánh giá thành công",
      data: review,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi khi gửi đánh giá",
      error: error.message,
    });
  }
};

// [GET] /api/v1/reviews/my-review/:bookId
module.exports.myReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookId = req.params.bookId;

    const record = await Review.findOne({
      user: userId,
      book: bookId,
    });

    if (!record) {
      return res.status(400).json({
        message: "Không tìm thấy đánh giá nào!",
      });
    }

    res.status(200).json({
      record: record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy đánh giá riêng",
      error: error.message,
    });
  }
};

export {};
