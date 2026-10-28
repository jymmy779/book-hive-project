const Favorite = require("../../models/favorite.model");
module.exports.index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const userId = req.user.userId;
        const [favorites, total] = await Promise.all([
            Favorite.find({ userId })
                .skip(skip)
                .limit(limit)
                .populate("bookId")
                .sort({ createdAt: -1 }),
            Favorite.countDocuments({ userId }),
        ]);
        return res.status(200).json({ favorites, total, limit });
    }
    catch (error) {
        return res.status(500).json({ message: "Lỗi server", error });
    }
};
module.exports.addFavorite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { bookId } = req.body;
        if (!bookId)
            return res.status(400).json({ message: "Không tìm thấy bookId" });
        const existed = await Favorite.findOne({ userId, bookId });
        if (existed)
            return res.status(409).json({ message: "Đã thêm có trong yêu thích" });
        const favorite = new Favorite({ userId, bookId });
        await favorite.save();
        return res.status(201).json({ favorite });
    }
    catch (error) {
        return res.status(500).json({ message: "Lỗi server", error });
    }
};
module.exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { bookId } = req.body;
        if (!bookId)
            return res.status(400).json({ message: "Không tìm thấy bookId" });
        const deleted = await Favorite.findOneAndDelete({ userId, bookId });
        if (!deleted)
            return res
                .status(404)
                .json({ message: "Không tìm thấy trong yêu thích" });
        return res.status(200).json({ message: "Đã xóa khỏi yêu thích" });
    }
    catch (error) {
        return res.status(500).json({ message: "Lỗi server", error });
    }
};
