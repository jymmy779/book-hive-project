const Order = require("../../models/order.model");
const Book = require("../../models/book.model");
const mongoose = require("mongoose");
const generateHelper = require("../../../../helpers/generate");
const { sendOrderConfirmationEmail } = require("../../../../helpers/sendEmail");

// [GET] /api/v1/orders
module.exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Order.countDocuments(),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công!",
      orders,
      total,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy danh sách đơn hàng!",
      error: error.message,
    });
  }
};

// [POST] /api/v1/orders/create
module.exports.create = async (req, res) => {
  try {
    const { userInfo, items, totalAmount, paymentMethod } = req.body;

    if (!userInfo || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        message: "Thông tin đơn hàng không đầy đủ!",
      });
    }

    const quantitiesByBook = new Map();
    for (const item of items) {
      const bookId = String(item.id || "");
      const quantity = Number(item.quantity);
      if (!mongoose.isValidObjectId(bookId) || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Sản phẩm hoặc số lượng trong đơn không hợp lệ." });
      }
      quantitiesByBook.set(bookId, (quantitiesByBook.get(bookId) || 0) + quantity);
    }

    const orderCode = generateHelper.generateOrderCode();
    const session = await mongoose.startSession();
    let order;
    try {
      await session.withTransaction(async () => {
        for (const [bookId, quantity] of quantitiesByBook) {
          const result = await Book.updateOne(
            {
              _id: bookId,
              deleted: false,
              status: "active",
              inStock: { $gte: quantity },
            },
            { $inc: { inStock: -quantity } },
            { session },
          );
          if (result.modifiedCount !== 1) {
            const error: any = new Error("Không đủ tồn kho để tạo đơn hàng.");
            error.code = "INSUFFICIENT_STOCK";
            error.bookId = bookId;
            throw error;
          }
        }

        order = new Order({
          orderCode,
          userInfo,
          items,
          totalAmount,
          paymentMethod,
          stockDeducted: true,
        });
        await order.save({ session });
      });
    } catch (error) {
      if (error.code === "INSUFFICIENT_STOCK") {
        return res.status(409).json({
          message: `Sách "${items.find((item) => String(item.id) === error.bookId)?.title || "đã chọn"}" không đủ số lượng trong kho.`,
        });
      }
      throw error;
    } finally {
      await session.endSession();
    }

    if (paymentMethod === "cod") {
      try {
        await sendOrderConfirmationEmail({
          userInfo,
          orderCode,
          items,
          totalAmount,
        });
      } catch (emailErr) {
        console.error("Lỗi gửi email:", emailErr);
      }
    }

    return res.status(201).json({
      message: "Tạo đơn hàng thành công!",
      order,
    });
  } catch (error) {
    console.error("❌ Lỗi tạo đơn:", error);
    return res.status(500).json({
      message: "Lỗi tạo đơn hàng!",
      error: error.message,
    });
  }
};

// [GET] /api/v1/orders/detail/:code
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
  } catch (error) {
    console.error("❌ Detail error:", error);
    return res.status(500).json({
      message: "Lỗi lấy thông tin đơn hàng!",
      error: error.message,
    });
  }
};

// [GET] /api/v1/orders/user/:email
module.exports.getOrdersByUser = async (req, res) => {
  try {
    const { email } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userFilter = { "userInfo.email": email };
    const [orders, total] = await Promise.all([
      Order.find(userFilter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Order.countDocuments(userFilter),
    ]);

    return res.status(200).json({
      orders,
      total,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy danh sách đơn hàng!",
      error: error.message,
    });
  }
};

export {};
