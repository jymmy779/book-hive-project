"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Book = require("../../models/book.model");
const Category = require("../../models/category.model");
const { getBookDescription } = require("../../../../helpers/bookDescription");
module.exports.index = async (req, res) => {
    try {
        const keyword = String(req.query.keyWord || "").trim();
        const categorySlug = req.query.categorySlug;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
        const skip = (page - 1) * limit;
        const find = {
            deleted: false,
            status: "active",
        };
        if (categorySlug) {
            const category = await Category.findOne({
                slug: categorySlug,
                deleted: false,
                status: "active",
            })
                .select("_id")
                .lean();
            if (category) {
                find.category_id = category._id.toString();
            }
            else {
                find.category_id = "non-existent-id";
            }
        }
        if (keyword) {
            const textSearch = keyword.split(/\s+/).filter(Boolean).slice(0, 10).join(" ");
            const matchingCategories = await Category.find({
                $or: [
                    { $text: { $search: textSearch } },
                    { slug: new RegExp(textSearch.replace(/\s+/g, "-"), "i") },
                ],
                deleted: false,
                status: "active",
            })
                .select("_id")
                .lean();
            const categoryIds = matchingCategories.map((cat) => cat._id);
            find.$or = [
                { $text: { $search: textSearch } },
                ...(categoryIds.length > 0 ? [{ category_id: { $in: categoryIds } }] : []),
            ];
        }
        let sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = Number(req.query.sortValue);
        }
        else {
            sort.position = "desc";
        }
        const bookQuery = Book.find(find);
        if (keyword)
            bookQuery.select({ score: { $meta: "textScore" } });
        const [books, total] = await Promise.all([
            bookQuery
                .skip(skip)
                .limit(limit)
                .sort(keyword ? Object.assign({ score: { $meta: "textScore" } }, sort) : sort)
                .lean(),
            Book.countDocuments(find),
        ]);
        if (books) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const categoryIds = [...new Set(books.map((b) => b.category_id).filter(Boolean))];
            const categories = await Category.find({
                _id: { $in: categoryIds },
            })
                .select("title")
                .lean();
            const categoryMap = new Map(categories.map((cat) => [cat._id.toString(), cat.title]));
            const booksWithCategory = books.map((book) => {
                const bookObj = Object.assign({}, book);
                if (book.category_id) {
                    bookObj.category_name =
                        categoryMap.get(book.category_id.toString()) || "";
                }
                if (!bookObj.newest && book.createdAt >= thirtyDaysAgo) {
                    bookObj.newest = true;
                }
                return bookObj;
            });
            return res.status(200).json({
                message: "ThÃ nh cÃ´ng!",
                books: booksWithCategory,
                total: total,
                limit: limit,
            });
        }
        return res.status(200).json({
            message: "Thành công!",
            books: [],
            total: 0,
            limit,
        });
    }
    catch (error) {
        console.error("Book search/list error:", error);
        return res.status(500).json({ message: "Không thể tải danh sách sách." });
    }
};
module.exports.detail = async (req, res) => {
    try {
        const slug = req.params.bookSlug;
        const book = await Book.findOne({
            slug: slug,
            deleted: false,
            status: "active",
        }).lean();
        if (!book) {
            return res.status(404).json({ message: "KhÃ´ng tÃ¬m tháº¥y sÃ¡ch!" });
        }
        const bookObj = Object.assign({}, book);
        bookObj.description = getBookDescription(bookObj);
        if (book.category_id) {
            const category = await Category.findOne({
                _id: book.category_id,
            })
                .select("title")
                .lean();
            if (category) {
                bookObj.category_name = category.title;
            }
        }
        return res.status(200).json({
            message: "Láº¥y thÃ´ng tin sÃ¡ch thÃ nh cÃ´ng!",
            book: bookObj,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Lá»—i khi láº¥y thÃ´ng tin sÃ¡ch!",
        });
    }
};
module.exports.featured = async (req, res) => {
    try {
        const books = await Book.find({
            deleted: false,
            status: "active",
            featured: true,
        })
            .sort({ position: -1 })
            .lean();
        if (books) {
            return res.status(200).json({
                message: "ThÃ nh cÃ´ng!",
                books: books,
            });
        }
        return res.status(400).json({
            message: "KhÃ´ng cÃ³ sÃ¡ch nÃ o",
        });
    }
    catch (error) {
        res.json("KhÃ´ng tÃ¬m tháº¥y!");
    }
};
module.exports.hero = async (_req, res) => {
    try {
        const curatedBooks = await Book.find({
            deleted: false,
            status: "active",
            heroPosition: { $gte: 1, $lte: 8 },
        })
            .sort({ heroPosition: 1 })
            .limit(8)
            .lean();
        const books = curatedBooks.length
            ? curatedBooks
            : await Book.find({ deleted: false, status: "active" })
                .sort({ createdAt: -1 })
                .limit(8)
                .lean();
        return res.status(200).json({ books });
    }
    catch (_error) {
        return res.status(500).json({ message: "Could not load homepage hero books." });
    }
};
module.exports.editorRecommended = async (_req, res) => {
    try {
        const book = await Book.findOne({
            deleted: false,
            status: "active",
            editorRecommended: true,
        }).lean();
        return res.status(200).json({ book: book || null });
    }
    catch (_error) {
        return res.status(500).json({ message: "Could not load the editor recommendation." });
    }
};
module.exports.readerFavorites = async (_req, res) => {
    try {
        const books = await Book.find({
            deleted: false,
            status: "active",
            readerFavorite: true,
        })
            .sort({ rating: -1, reviews: -1, createdAt: -1 })
            .limit(8)
            .lean();
        return res.status(200).json({ books });
    }
    catch (_error) {
        return res.status(500).json({ message: "Could not load reader favorites." });
    }
};
module.exports.flashSale = async (_req, res) => {
    try {
        const books = await Book.find({
            deleted: false,
            status: "active",
            flashSale: true,
            discountPercent: { $gt: 0 },
            flashSaleEndAt: { $gt: new Date() },
        })
            .sort({ flashSaleEndAt: 1 })
            .limit(12)
            .lean();
        return res.status(200).json({ books });
    }
    catch (_error) {
        return res.status(500).json({ message: "Could not load flash sale books." });
    }
};
module.exports.newest = async (req, res) => {
    try {
        const books = await Book.find({
            deleted: false,
            status: "active",
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        return res.status(200).json({
            message: "ThÃ nh cÃ´ng!",
            total: books.length,
            books,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lá»—i server!",
        });
    }
};
module.exports.bestSeller = async (req, res) => {
    try {
        const curated = await Book.find({
            deleted: false,
            status: "active",
            topChartPosition: { $gte: 1, $lte: 3 },
        })
            .sort({ topChartPosition: 1 })
            .limit(3)
            .lean();
        const curatedIds = curated.map((book) => book._id);
        const automatic = await Book.find({
            deleted: false,
            status: "active",
            _id: { $nin: curatedIds },
        })
            .sort({ soldCount: -1 })
            .limit(Math.max(0, 10 - curated.length))
            .lean();
        const records = [...curated, ...automatic];
        if (!records) {
            return res.status(400).json({
                message: "KhÃ´ng tÃ¬m tháº¥y sÃ¡ch nÃ o!",
            });
        }
        return res.status(200).json({
            records,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lá»—i server!",
        });
    }
};
module.exports.categories = async (_req, res) => {
    try {
        const [categories, bookCounts] = await Promise.all([
            Category.find({ deleted: false, status: "active" })
                .select("title slug description")
                .sort({ position: 1, title: 1 })
                .lean(),
            Book.aggregate([
                { $match: { deleted: false, status: "active", category_id: { $exists: true, $ne: "" } } },
                { $group: { _id: "$category_id", bookCount: { $sum: 1 } } },
            ]),
        ]);
        const countByCategory = new Map(bookCounts.map((item) => [String(item._id), item.bookCount]));
        const categoriesWithCounts = categories.map((category) => (Object.assign(Object.assign({}, category), { bookCount: countByCategory.get(String(category._id)) || 0 })));
        return res.status(200).json({
            message: "ThÃ nh cÃ´ng!",
            categories: categoriesWithCounts,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lá»—i server!",
        });
    }
};
