const User = require("../../models/user.model");

// [GET] /api/v1/users
module.exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách người dùng thành công!",
      users,
      total,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy danh sách người dùng!",
      error: error.message,
    });
  }
};

// [Get] /api/v1/users/me
module.exports.getUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ _id: userId }).select(
      "fullName phone email",
    );

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng!",
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin người dùng thành công!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy thông tin người dùng!",
      error: error.message,
    });
  }
};

// [PATCH] /api/v1/users/edit
module.exports.edit = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ _id: userId }).select("fullName phone ");

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng!",
      });
    }

    const { fullName, phone } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone || "";

    await user.save();

    return res.status(200).json({
      message: "Cập nhật thông tin thành công!",
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi cập nhật thông tin người dùng!",
      error: error.message,
    });
  }
};

export {};
