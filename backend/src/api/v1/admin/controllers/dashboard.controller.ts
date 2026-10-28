const Book = require("../../models/book.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");

module.exports.index = async (_req, res) => {
  try {
    const [totalBooks, totalOrders, totalUsers, revenueResult, recentOrders] =
      await Promise.all([
        Book.countDocuments({ deleted: false, status: "active" }),
        Order.countDocuments(),
        User.countDocuments({ deleted: false, status: "active" }),
        Order.aggregate([
          { $match: { status: "delivered" } },
          { $group: { _id: null, total: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
        ]),
        Order.find()
          .select("orderCode userInfo.fullName userInfo.phone totalAmount status createdAt")
          .sort({ createdAt: -1, _id: -1 })
          .limit(5)
          .lean(),
      ]);

    return res.status(200).json({
      totalBooks,
      totalOrders,
      totalUsers,
      totalRevenue: revenueResult[0]?.total || 0,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin dashboard summary error:", error);
    return res.status(500).json({ message: "Không thể tải tổng quan dashboard." });
  }
};

export {};
