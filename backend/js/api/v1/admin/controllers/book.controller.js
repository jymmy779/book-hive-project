"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Book = require("../../models/book.model");
const Category = require("../../models/category.model");
const Account = require("../../models/account.model");
const slugify = require("slugify");
module.exports.index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = req.query.status;
        const keyword = req.query.keyWord;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 7;
        const skip = (page - 1) * limit;
        const find = {
            deleted: false,
        };
        if (status) {
            find.status = status;
        }
        if (keyword) {
            const regex = new RegExp(keyword, "i");
            find.$or = [{ title: regex }, { author: regex }];
        }
        let sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = Number(req.query.sortValue);
        }
        else {
            sort.position = "desc";
        }
        const books = yield Book.find(find)
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .populate("updatedBy", "fullName")
            .populate("createdBy", "fullName")
            .populate("deletedBy", "fullName");
        const total = yield Book.countDocuments(find);
        if (books && books.length > 0) {
            const booksWithCategory = yield Promise.all(books.map((book) => __awaiter(void 0, void 0, void 0, function* () {
                const bookObj = book.toObject();
                if (book.category_id) {
                    const category = yield Category.findOne({
                        _id: book.category_id,
                    }).select("title");
                    if (category) {
                        bookObj.category_name = category.title;
                    }
                }
                return bookObj;
            })));
            return res.status(200).json({
                message: "Thành công!",
                books: booksWithCategory,
                total: total,
                limit: limit,
            });
        }
        return res.status(400).json({
            message: "Không có sách nào",
        });
    }
    catch (error) {
        res.json("Không tìm thấy!");
    }
});
module.exports.changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, status } = req.params;
        if (!status) {
            return res.status(404).json({ message: "Không tìm thấy status!" });
        }
        const book = yield Book.updateOne({
            _id: id,
        }, {
            status: status,
            updatedBy: req.user.id,
        });
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
        }
        return res.status(200).json({
            message: "Cập nhật trạng thái thành công!",
            book: book,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server!" });
    }
});
module.exports.changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const type = req.body.type;
        const ids = Array.isArray(req.body.ids)
            ? req.body.ids
            : req.body.ids.split(", ");
        switch (type) {
            case "active":
                yield Book.updateMany({ _id: { $in: ids } }, { status: "active", updatedBy: req.user.id });
                return res.status(200).json({
                    message: `Cập nhật trạng thái thành công ${ids.length} sách!`,
                });
            case "inactive":
                yield Book.updateMany({ _id: { $in: ids } }, { status: "inactive", updatedBy: req.user.id });
                return res.status(200).json({
                    message: `Cập nhật trạng thái thành công ${ids.length} sách!`,
                });
            case "delete_all":
                const booksToDeleted = yield Book.find({ _id: { $in: ids } });
                yield Promise.all(booksToDeleted.map((b) => Book.updateOne({ _id: b._id }, {
                    deleted: true,
                    deletedAt: new Date(),
                    deletedBy: req.user.id,
                    slug: `${b.slug}-deleted-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                })));
                const booksLeft = yield Book.find({ deleted: false }).sort({
                    position: 1,
                });
                yield Promise.all(booksLeft.map((book, i) => Book.updateOne({ _id: book._id }, { position: i + 1 })));
                return res.status(200).json({
                    message: `Đã xóa ${ids.length} sách!`,
                });
            case "position-change":
                if (ids.length === 1) {
                    const [id, newPosStr] = ids[0].split("-");
                    const newPos = parseInt(newPosStr);
                    const currentBook = yield Book.findById(id);
                    if (!currentBook) {
                        return res.status(404).json({ message: "Không tìm thấy sách!" });
                    }
                    const oldPos = currentBook.position;
                    if (oldPos === newPos) {
                        break;
                    }
                    if (oldPos < newPos) {
                        yield Book.updateMany({ position: { $gt: oldPos, $lte: newPos }, deleted: false }, { $inc: { position: -1 } });
                    }
                    else {
                        yield Book.updateMany({ position: { $gte: newPos, $lt: oldPos }, deleted: false }, { $inc: { position: 1 } });
                    }
                    yield Book.updateOne({ _id: id }, { position: newPos, updatedBy: req.user.id });
                    const books = yield Book.find({ deleted: false }).sort({
                        position: 1,
                    });
                    return res.status(200).json({
                        message: `Cập nhật vị trí thành công!`,
                        books: books,
                    });
                }
                yield Promise.all(ids.map((item) => {
                    const [id, newPosStr] = item.split("-");
                    const newPos = parseInt(newPosStr);
                    return Book.updateOne({ _id: id }, { position: newPos, updatedBy: req.user.id });
                }));
                const allBooks = yield Book.find({ deleted: false }).sort({
                    position: 1,
                });
                yield Promise.all(allBooks.map((book, i) => Book.updateOne({ _id: book._id }, { position: i + 1 })));
                const books = yield Book.find({ deleted: false }).sort({ position: 1 });
                return res.status(200).json({
                    message: `Cập nhật vị trí thành công cho ${ids.length} sách!`,
                    books: books,
                });
            default:
                return res.status(400).json({
                    message: "Loại thao tác không hợp lệ!",
                });
        }
    }
    catch (error) {
        return res.status(400).json({
            message: "Cập nhật thất bại!",
        });
    }
});
module.exports.delete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const book = yield Book.findById(id);
        const deletedSlug = book ? `${book.slug}-deleted-${Date.now()}` : `deleted-${Date.now()}`;
        yield Book.updateOne({
            _id: id,
        }, {
            deleted: true,
            deletedBy: req.user.id,
            deletedAt: new Date(),
            slug: deletedSlug,
        });
        const booksLeft = yield Book.find({ deleted: false }).sort({
            position: 1,
        });
        yield Promise.all(booksLeft.map((book, i) => Book.updateOne({ _id: book._id }, { position: i + 1 })));
        return res.status(200).json({
            message: "Xóa thành công!",
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Xóa thất bại",
        });
    }
});
module.exports.create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("--- CREATE BOOK LOGS ---");
        console.log("req.file:", req.file);
        console.log("req.body:", req.body);
        let _a = req.body, { position, title } = _a, newBookData = __rest(_a, ["position", "title"]);
        const slug = slugify(title, { lower: true, strict: true, locale: "vi" });
        const priceBuy = req.body.priceBuy ? Number(req.body.priceBuy) : 0;
        let image = "";
        if (req.file) {
            image = req.file.path || req.file.url || req.file.secure_url || "";
        }
        const maxBook = yield Book.findOne({
            deleted: false,
        }).sort({ position: -1 });
        const maxPosition = maxBook ? maxBook.position : 0;
        if (!position) {
            position = maxPosition + 1;
        }
        else {
            yield Book.updateMany({ position: { $gte: position } }, { $inc: { position: 1 } });
        }
        const newBook = new Book(Object.assign(Object.assign({}, newBookData), { position,
            image,
            priceBuy,
            slug,
            title, createdBy: req.user.id }));
        yield newBook.save();
        return res.status(200).json({
            message: "Tạo mới sản phẩm thành công!",
            newBook: newBook,
        });
    }
    catch (error) {
        console.error("CREATE BOOK ERROR:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Tên sách đã tồn tại, vui lòng chọn tên khác!",
            });
        }
        return res.status(400).json({
            message: "Tạo mới sản phẩm thất bại!",
        });
    }
});
module.exports.getBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const book = yield Book.findOne({ slug: slug, deleted: false });
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
        }
        return res.status(200).json({
            message: "Lấy thông tin sách thành công!",
            book: book,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Lỗi khi lấy thông tin sách!",
        });
    }
});
module.exports.edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const book = yield Book.findOne({ slug, deleted: false });
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
        }
        const oldPos = book.position;
        const newPos = Number(req.body.position);
        if (newPos && newPos !== oldPos) {
            if (oldPos < newPos) {
                yield Book.updateMany({ position: { $gt: oldPos, $lte: newPos }, deleted: false }, { $inc: { position: -1 } });
            }
            else {
                yield Book.updateMany({ position: { $gte: newPos, $lt: oldPos }, deleted: false }, { $inc: { position: 1 } });
            }
        }
        const priceBuy = req.body.priceBuy ? Number(req.body.priceBuy) : 0;
        const updateData = Object.assign(Object.assign({}, req.body), { position: newPos || oldPos, priceBuy: priceBuy });
        if (!req.file && (req.body.image === undefined || req.body.image === "")) {
            updateData.image = book.image;
        }
        if (req.file) {
            updateData.image = req.file.path || req.file.url || req.file.secure_url || "";
        }
        if (req.body.title) {
            updateData.slug = slugify(req.body.title, {
                lower: true,
                strict: true,
                locale: "vi",
            });
        }
        updateData.updatedBy = req.user.id;
        yield Book.updateOne({ _id: book._id }, updateData);
        return res.status(200).json({
            message: "Cập nhật thông tin thành công!",
        });
    }
    catch (error) {
        console.error("EDIT BOOK ERROR:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Tên sách đã tồn tại, vui lòng chọn tên khác!",
            });
        }
        return res.status(400).json({
            message: "Cập nhật thông tin thất bại!",
        });
    }
});
module.exports.detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const book = yield Book.findOne({ slug: slug, deleted: false });
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
        }
        const bookObj = book.toObject();
        if (book.category_id) {
            const category = yield Category.findOne({
                _id: book.category_id,
            }).select("title");
            bookObj.category_name = category.title;
        }
        return res.status(200).json({
            message: "Lấy thông tin sách thành công!",
            book: bookObj,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Lỗi khi lấy thông tin sách!",
        });
    }
});
