const Book = require("../../models/book.model");
const Category = require("../../models/category.model");

// [GET] /api/v1/books
module.exports.index = async (req, res) => {
  try {
    const keyword = req.query.keyWord;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const find: any = {
      deleted: false,
      status: "active",
    };

    if (keyword) {
      const regex = new RegExp(keyword, "i");

      // Tìm categories match
      const matchingCategories = await Category.find({
        $or: [{ title: regex }, { slug: regex }],
        deleted: false,
        status: "active",
      }).select("_id");

      const categoryIds = matchingCategories.map((cat: any) => cat._id);

      // Search books theo title, author, description, category_id
      find.$or = [
        { title: regex },
        { author: regex },
        { description: regex },
        ...(categoryIds.length > 0
          ? [{ category_id: { $in: categoryIds } }]
          : []),
      ];
    }

    // sort
    let sort: any = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = Number(req.query.sortValue);
    } else {
      sort.position = "desc";
    }

    const books = await Book.find(find).skip(skip).limit(limit).sort(sort);
    const total = await Book.countDocuments(find);

    if (books && books.length > 0) {
      const booksWithCategory = [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const book of books) {
        const bookObj = book.toObject();
        if (book.category_id) {
          const category = await Category.findOne({
            _id: book.category_id,
          }).select("title");
          bookObj.category_name = category.title;
        }

        if (!bookObj.newest && book.createdAt >= thirtyDaysAgo) {
          bookObj.newest = true;
        }

        booksWithCategory.push(bookObj);
      }

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
  } catch (error) {
    res.json("Không tìm thấy!");
  }
};

// [GET] /api/v1/books/detail/:bookSlug
module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.bookSlug;

    const book = await Book.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    });
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    const bookObj = book.toObject();
    if (book.category_id) {
      const category = await Category.findOne({
        _id: book.category_id,
      }).select("title");
      bookObj.category_name = category.title;
    }

    return res.status(200).json({
      message: "Lấy thông tin sách thành công!",
      book: bookObj,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Lỗi khi lấy thông tin sách!",
    });
  }
};

// [GET] /api/v1/books/featured
module.exports.featured = async (req, res) => {
  try {
    const books = await Book.find({
      deleted: false,
      status: "active",
      featured: true,
    }).sort({ position: -1 });

    if (books) {
      return res.status(200).json({
        message: "Thành công!",
        books: books,
      });
    }

    return res.status(400).json({
      message: "Không có sách nào",
    });
  } catch (error) {
    res.json("Không tìm thấy!");
  }
};

// [GET] /api/v1/books/newest
module.exports.newest = async (req, res) => {
  try {
    const books = await Book.find({
      deleted: false,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      message: "Thành công!",
      total: books.length,
      books,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server!",
    });
  }
};

// [GET] /api/v1/books/best-seller
module.exports.bestSeller = async (req, res) => {
  try {
    const records = await Book.find().sort({ soldCount: -1 }).limit(10);

    if (!records) {
      return res.status(400).json({
        message: "Không tìm thấy sách nào!",
      });
    }

    return res.status(200).json({
      records,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server!",
    });
  }
};

export {};
