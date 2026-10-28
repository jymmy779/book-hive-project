const Book = require("../../models/book.model");
const Category = require("../../models/category.model");
const Account = require("../../models/account.model");
const slugify = require("slugify");
const { getBookDescription } = require("../../../../helpers/bookDescription");

const HOMEPAGE_SECTION_LIMITS = {
  readerFavorite: 8,
  featured: 8,
  flashSale: 12,
};

// [GET] /api/v1/admin/books/homepage-sections
module.exports.homepageSectionsIndex = async (_req, res) => {
  try {
    const books = await Book.find({ deleted: false, status: "active" })
      .select("title author image priceBuy inStock featured editorRecommended readerFavorite topChartPosition heroPosition flashSale discountPercent flashSaleEndAt slug")
      .sort({ title: 1 })
      .lean();
    return res.status(200).json({ books });
  } catch (_error) {
    return res.status(500).json({ message: "Could not load homepage section books." });
  }
};

// [PATCH] /api/v1/admin/books/homepage-sections/:id
module.exports.updateHomepageSections = async (req, res) => {
  try {
    const allowedFields = [
      "featured",
      "editorRecommended",
      "readerFavorite",
      "topChartPosition",
      "heroPosition",
      "flashSale",
      "discountPercent",
      "flashSaleEndAt",
    ];
    const updates: any = {};

    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;
      const value = req.body[field];

      if (["featured", "editorRecommended", "readerFavorite", "flashSale"].includes(field)) {
        if (typeof value !== "boolean") {
          return res.status(400).json({ message: `${field} must be a boolean.` });
        }
        updates[field] = value;
      } else if (field === "topChartPosition") {
        if (value !== null && (!Number.isInteger(value) || value < 1 || value > 3)) {
          return res.status(400).json({ message: "Top chart position must be 1, 2, 3, or null." });
        }
        updates[field] = value;
      } else if (field === "heroPosition") {
        if (value !== null && (!Number.isInteger(value) || value < 1 || value > 8)) {
          return res.status(400).json({ message: "Hero position must be between 1 and 8, or null." });
        }
        updates[field] = value;
      } else if (field === "discountPercent") {
        if (!Number.isInteger(value) || value < 0 || value > 90) {
          return res.status(400).json({ message: "Discount must be an integer from 0 to 90." });
        }
        updates[field] = value;
      } else if (field === "flashSaleEndAt") {
        const date = new Date(value);
        if (!value || Number.isNaN(date.getTime())) {
          return res.status(400).json({ message: "Flash sale end time is invalid." });
        }
        updates[field] = date;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No homepage section settings provided." });
    }

    const currentBook = await Book.findOne({ _id: req.params.id, deleted: false });
    if (!currentBook) {
      return res.status(404).json({ message: "Book not found." });
    }

    const now = new Date();
    const selectionCaps = [
      {
        field: "readerFavorite",
        currentlySelected: Boolean(currentBook.readerFavorite),
        filter: { readerFavorite: true },
      },
      {
        field: "featured",
        currentlySelected: Boolean(currentBook.featured),
        filter: { featured: true },
      },
      {
        field: "flashSale",
        currentlySelected: Boolean(currentBook.flashSale && currentBook.flashSaleEndAt && currentBook.flashSaleEndAt > now),
        filter: { flashSale: true, flashSaleEndAt: { $gt: now } },
      },
    ];
    for (const section of selectionCaps) {
      if (updates[section.field] !== true || section.currentlySelected) continue;
      const selectedCount = await Book.countDocuments({
        ...section.filter,
        _id: { $ne: currentBook._id },
        deleted: false,
        status: "active",
      });
      const limit = HOMEPAGE_SECTION_LIMITS[section.field];
      if (selectedCount >= limit) {
        return res.status(400).json({
          message: `This homepage section already has the maximum of ${limit} books.`,
          limit,
          selectedCount,
        });
      }
    }

    const nextFlashSale = updates.flashSale ?? currentBook.flashSale;
    const nextDiscount = updates.discountPercent ?? currentBook.discountPercent;
    const nextEndAt = updates.flashSaleEndAt ?? currentBook.flashSaleEndAt;
    if (nextFlashSale && (!nextDiscount || !nextEndAt || nextEndAt <= new Date())) {
      return res.status(400).json({
        message: "A flash deal needs a discount and a future end time.",
      });
    }

    const rankField = Object.prototype.hasOwnProperty.call(updates, "topChartPosition")
      ? "topChartPosition"
      : Object.prototype.hasOwnProperty.call(updates, "heroPosition")
        ? "heroPosition"
        : null;
    if (rankField && updates[rankField]) {
      await Book.updateMany(
        {
          _id: { $ne: currentBook._id },
          [rankField]: updates[rankField],
        },
        { $unset: { [rankField]: 1 } },
      );
    }

    if (updates.editorRecommended === true) {
      await Book.updateMany(
        { _id: { $ne: currentBook._id }, editorRecommended: true },
        { $set: { editorRecommended: false } },
      );
    }

    updates.updatedBy = req.user.id;
    const book = await Book.findByIdAndUpdate(currentBook._id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (rankField) {
      const rankedBooks = await Book.find({
        deleted: false,
        status: "active",
        [rankField]: { $gte: 1 },
      })
        .sort({ [rankField]: 1 })
        .select(`_id ${rankField}`)
        .lean();
      if (rankedBooks.length > 0) {
        await Book.bulkWrite(
          rankedBooks.map((rankedBook: any, index: number) => ({
            updateOne: {
              filter: { _id: rankedBook._id },
              update: { $set: { [rankField]: index + 1 } },
            },
          })),
        );
      }
    }

    return res.status(200).json({ book });
  } catch (_error) {
    return res.status(500).json({ message: "Could not update homepage section settings." });
  }
};

// [GET] /api/v1/admin/books
module.exports.index = async (req, res) => {
  try {
    const status = req.query.status;
    const keyword = req.query.keyWord;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    const find: any = {
      deleted: false,
    };

    if (status) {
      find.status = status;
    }

    if (keyword) {
      const regex = new RegExp(String(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      find.$or = [{ title: regex }, { author: regex }];
    }

    // sort
    let sort: any = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = Number(req.query.sortValue);
    } else {
      sort.position = "desc";
    }

    const [books, total] = await Promise.all([
      Book.find(find)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate("updatedBy", "fullName")
        .populate("createdBy", "fullName")
        .populate("deletedBy", "fullName"),
      Book.countDocuments(find),
    ]);

    if (books && books.length > 0) {
      // Tối ưu hóa N+1 query: Lấy tất cả category_id duy nhất và fetch bằng 1 query duy nhất
      const categoryIds = [...new Set(books.map((b: any) => b.category_id).filter(Boolean))];
      const categories = await Category.find({
        _id: { $in: categoryIds },
      }).select("title");
      const categoryMap = new Map(
        categories.map((cat: any) => [cat._id.toString(), cat.title])
      );

      const booksWithCategory = books.map((book: any) => {
        const bookObj = book.toObject();
        if (book.category_id) {
          bookObj.category_name =
            categoryMap.get(book.category_id.toString()) || "";
        }
        return bookObj;
      });

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

// [PATCH] /api/v1/admin/books/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    if (!status) {
      return res.status(404).json({ message: "Không tìm thấy status!" });
    }

    const book = await Book.updateOne(
      {
        _id: id,
      },
      {
        status: status,
        updatedBy: req.user.id,
      },
    );

    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái thành công!",
      book: book,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// [PATCH] /api/v1/admin/books/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = Array.isArray(req.body.ids)
      ? req.body.ids
      : req.body.ids.split(", ");

    switch (type) {
      case "active":
        await Book.updateMany(
          { _id: { $in: ids } },
          { status: "active", updatedBy: req.user.id },
        );
        return res.status(200).json({
          message: `Cập nhật trạng thái thành công ${ids.length} sách!`,
        });
      case "inactive":
        await Book.updateMany(
          { _id: { $in: ids } },
          { status: "inactive", updatedBy: req.user.id },
        );
        return res.status(200).json({
          message: `Cập nhật trạng thái thành công ${ids.length} sách!`,
        });
      case "delete_all":
        const booksToDeleted = await Book.find({ _id: { $in: ids } });
        await Promise.all(
          booksToDeleted.map((b) =>
            Book.updateOne(
              { _id: b._id },
              {
                deleted: true,
                deletedAt: new Date(),
                deletedBy: req.user.id,
                slug: `${b.slug}-deleted-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              },
            ),
          ),
        );

        // Sau khi xóa, cập nhật lại position cho các sách còn lại
        const booksLeft = await Book.find({ deleted: false }).sort({
          position: 1,
        });
        await Promise.all(
          booksLeft.map((book, i) =>
            Book.updateOne({ _id: book._id }, { position: i + 1 })
          )
        );

        return res.status(200).json({
          message: `Đã xóa ${ids.length} sách!`,
        });
      case "position-change":
        // Nếu chỉ gửi 1 item
        if (ids.length === 1) {
          const [id, newPosStr] = ids[0].split("-");
          const newPos = parseInt(newPosStr);

          const currentBook = await Book.findById(id);
          if (!currentBook) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
          }
          const oldPos = currentBook.position;

          if (oldPos === newPos) {
            break;
          }

          if (oldPos < newPos) {
            await Book.updateMany(
              { position: { $gt: oldPos, $lte: newPos }, deleted: false },
              { $inc: { position: -1 } },
            );
          } else {
            await Book.updateMany(
              { position: { $gte: newPos, $lt: oldPos }, deleted: false },
              { $inc: { position: 1 } },
            );
          }

          await Book.updateOne(
            { _id: id },
            { position: newPos, updatedBy: req.user.id },
          );

          const books = await Book.find({ deleted: false }).sort({
            position: 1,
          });
          return res.status(200).json({
            message: `Cập nhật vị trí thành công!`,
            books: books,
          });
        }

        // Nếu gửi nhiều item
        //Cập nhật vị trí cho các sách đã chọn
        await Promise.all(
          ids.map((item) => {
            const [id, newPosStr] = item.split("-");
            const newPos = parseInt(newPosStr);
            return Book.updateOne(
              { _id: id },
              { position: newPos, updatedBy: req.user.id },
            );
          })
        );

        // Sắp xếp lại vị trí cho tất cả sách để tránh trùng/thiếu
        const allBooks = await Book.find({ deleted: false }).sort({
          position: 1,
        });
        await Promise.all(
          allBooks.map((book, i) =>
            Book.updateOne({ _id: book._id }, { position: i + 1 })
          )
        );

        const books = await Book.find({ deleted: false }).sort({ position: 1 });
        return res.status(200).json({
          message: `Cập nhật vị trí thành công cho ${ids.length} sách!`,
          books: books,
        });
      default:
        return res.status(400).json({
          message: "Loại thao tác không hợp lệ!",
        });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Cập nhật thất bại!",
    });
  }
};
// [PATCH] /api/v1/admin/books/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Lấy thông tin sách để cập nhật slug tránh trùng lặp
    const book = await Book.findById(id);
    const deletedSlug = book ? `${book.slug}-deleted-${Date.now()}` : `deleted-${Date.now()}`;

    // xóa sách
    await Book.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedBy: req.user.id,
        deletedAt: new Date(),
        slug: deletedSlug,
      },
    );    // Cập nhật lại position cho các sách còn lại
    const booksLeft = await Book.find({ deleted: false }).sort({
      position: 1,
    });
    await Promise.all(
      booksLeft.map((book, i) =>
        Book.updateOne({ _id: book._id }, { position: i + 1 })
      )
    );

    return res.status(200).json({
      message: "Xóa thành công!",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Xóa thất bại",
    });
  }
};

// [POST] /api/v1/admin/books/create
module.exports.create = async (req, res) => {
  try {
    console.log("--- CREATE BOOK LOGS ---");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    let { position, title, ...newBookData } = req.body;

    const slug = slugify(title, { lower: true, strict: true, locale: "vi" });

    const priceBuy = req.body.priceBuy ? Number(req.body.priceBuy) : 0;

    // Lấy link ảnh từ file upload
    let image = "";
    if (req.file) {
      image = req.file.path || req.file.url || req.file.secure_url || "";
    }

    const maxBook = await Book.findOne({
      deleted: false,
    }).sort({ position: -1 });

    const maxPosition = maxBook ? maxBook.position : 0;

    if (!position) {
      position = maxPosition + 1;
    } else {
      await Book.updateMany(
        { position: { $gte: position } },
        { $inc: { position: 1 } },
      );
    }

    const newBook = new Book({
      ...newBookData,
      position,
      image,
      priceBuy,
      slug,
      title,
      createdBy: req.user.id,
    });
    await newBook.save();

    return res.status(200).json({
      message: "Tạo mới sản phẩm thành công!",
      newBook: newBook,
    });
  } catch (error: any) {
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
};

// [GET] /api/v1/admin/books/:slug
module.exports.getBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const book = await Book.findOne({ slug: slug, deleted: false });
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    const bookObj = book.toObject();
    bookObj.description = getBookDescription(bookObj);

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

// [PATCH] /api/v1/admin/books/edit/:slug
module.exports.edit = async (req, res) => {
  try {
    const slug = req.params.slug;

    const book = await Book.findOne({ slug, deleted: false });
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    const oldPos = book.position;
    const newPos = Number(req.body.position);

    if (newPos && newPos !== oldPos) {
      if (oldPos < newPos) {
        await Book.updateMany(
          { position: { $gt: oldPos, $lte: newPos }, deleted: false },
          { $inc: { position: -1 } },
        );
      } else {
        await Book.updateMany(
          { position: { $gte: newPos, $lt: oldPos }, deleted: false },
          { $inc: { position: 1 } },
        );
      }
    }

    const priceBuy = req.body.priceBuy ? Number(req.body.priceBuy) : 0;
    const updateData: any = { 
      ...req.body, 
      position: newPos || oldPos,
      priceBuy: priceBuy
    };
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

    // Cập nhật sách
    await Book.updateOne({ _id: book._id }, updateData);

    return res.status(200).json({
      message: "Cập nhật thông tin thành công!",
    });
  } catch (error: any) {
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
};

// [GET] /api/v1/admin/books/detail/:slug
module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const book = await Book.findOne({ slug: slug, deleted: false });
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    const bookObj = book.toObject();
    bookObj.description = getBookDescription(bookObj);
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

export { };
