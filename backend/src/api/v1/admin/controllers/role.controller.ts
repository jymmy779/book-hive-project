const Role = require("../../models/role.model");
const Permission = require("../../models/permission.model");
const slugify = require("slugify");

// [GET] /api/v1/admin/roles
module.exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyWord;

    const find: any = {
      deleted: false,
    };

    if (keyword) {
      const regex = new RegExp(String(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      find.$or = [{ title: regex }];
    }

    // sort
    let sort: any = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = Number(req.query.sortValue);
    }

    const [roles, total] = await Promise.all([
      Role.find(find)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate("updatedBy", "fullName")
        .populate("createdBy", "fullName")
        .populate("deletedBy", "fullName"),
      Role.countDocuments(find),
    ]);

    if (roles) {
      return res.status(200).json({
        message: "Thành công!",
        roles: roles,
        total: total,
        limit: limit,
      });
    }

    return res.status(400).json({
      message: "Không có vai trò nào",
    });
  } catch (error) {
    return res.status(400).json("Không tìm thấy!");
  }
};

// [POST] /api/v1/admin/roles/create
module.exports.create = async (req, res) => {
  try {
    const { title, ...newRoleData } = req.body;
    const slug = slugify(title, { lower: true, strict: true, locale: "vi" });

    const newRole = new Role({
      ...newRoleData,
      slug,
      title,
      createdBy: req.user.id,
    });
    await newRole.save();
    return res.status(200).json({
      message: "Tạo mới vai trò thành công",
    });
  } catch (error) {
    return res.status(400).json("Tạo mới vai trò thất bại!");
  }
};

// [GET] /api/v1/admin/roles/:id
module.exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const role = await Role.findOne({ _id: id, deleted: false });
    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy vai trò!" });
    }

    return res.status(200).json({
      message: "Lấy thông tin vai trò thành công!",
      role: role,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Lỗi khi lấy thông tin vai trò!",
    });
  }
};

// [GET] /api/v1/admin/roles/detail/:slug
module.exports.detail = async (req, res) => {
  const slug = req.params.slug;
  const role = await Role.findOne({ slug });
  if (!role)
    return res.status(404).json({ message: "Không tìm thấy vai trò!" });
  return res.status(200).json({ role });
};

// [GET] /api/v1/admin/roles/edit/:slug
module.exports.edit = async (req, res) => {
  try {
    const slug = req.params.slug;
    const role = await Role.findOne({
      slug: slug,
    });
    if (!role) {
      res.status(400).json({
        message: "Không tìm thấy vai trò!",
      });
    }

    const updateData = { ...req.body };

    if (req.body.title) {
      updateData.slug = slugify(req.body.title, {
        lower: true,
        strict: true,
        locale: "vi",
      });
    }

    updateData.updatedBy = req.user.id;

    await Role.updateOne({ slug: slug }, updateData);
    res.status(200).json({
      message: "Cập nhật vai trò thành công!",
    });
  } catch (error) {
    res.status(400).json({
      message: "Cập nhật vai trò không thành công!",
    });
  }
};

// [GET] /api/v1/admin/roles/permissions
module.exports.permissions = async (req, res) => {
  try {
    // Keep the transaction access right available in the role editor on
    // existing databases without requiring a manual permission seed.
    await Permission.updateOne(
      { key: "view_transactions" },
      {
        $setOnInsert: {
          key: "view_transactions",
          label: "Xem giao dịch",
          group: "Giao dịch",
          slug: "view-transactions",
          deleted: false,
        },
      },
      { upsert: true },
    );
    const permissions = await Permission.find({
      deleted: false,
    });
    const permissionGroups = permissions.reduce((acc: any, perm: any) => {
      const group = perm.group;
      acc[group] = acc[group] || [];
      acc[group].push(perm);
      return acc;
    }, {});
    res.status(200).json({ permissionGroups });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/v1/admin/roles/permissions/edit
module.exports.permissionsEdit = async (req, res) => {
  try {
    const { roles } = req.body;
    for (const role of roles) {
      await Role.findByIdAndUpdate(role._id, {
        permissions: role.permissions,
        updatedBy: req.user.id,
      });
    }
    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/v1/admin/roles/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const role = await Role.findOne({ _id: id });
    if (role) {
      await Role.updateOne(
        { _id: id },
        { deleted: true, deletedBy: req.user.id, deletedAt: new Date() },
      );
      res.status(200).json({ message: "Đã xóa vai trò!" });
    } else {
      res.status(400).json({ message: "Không tìm thấy vai trò!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/v1/admin/roles/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = Array.isArray(req.body.ids)
      ? req.body.ids
      : req.body.ids.split(", ");

    switch (type) {
      case "delete_all":
        await Role.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date(), deletedBy: req.user.id },
        );

        return res.status(200).json({
          message: `Đã xóa ${ids.length} vai trò!`,
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

// [POST] /api/v1/admin/roles/permissions/create
module.exports.createPerm = async (req, res) => {
  try {
    const { key, label, group } = req.body;

    const checkKey = await Permission.findOne({
      key: { $regex: key, $options: "i" },
    });
    const checkLabel = await Permission.findOne({
      label: { $regex: label, $options: "i" },
    });

    if (checkKey) {
      return res.status(400).json({ message: "Key đã tồn tại!" });
    }
    if (checkLabel) {
      return res.status(400).json({ message: "Quyền đã tồn tại!" });
    }

    const slug = slugify(label, { lower: true, strict: true, locale: "vi" });

    const newPerm = new Permission({
      key,
      label,
      group,
      slug,
      createdBy: req.user.id,
    });
    await newPerm.save();
    return res.status(200).json({ message: "Tạo quyền mới thành công!" });
  } catch (err) {
    console.error("Lỗi tạo permission:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/v1/admin/roles/permissions/edit/:slug
module.exports.editPerm = async (req, res) => {
  try {
    const slug = req.params.slug;
    const { key, label, ...permData } = req.body;
    const perm = await Permission.findOne({
      slug: slug,
    });

    if (!perm) {
      return res.status(400).json({ message: "Không tìm thấy quyền!" });
    }

    const checkKey = await Permission.findOne({
      key: { $regex: key, $options: "i" },
      slug: { $ne: slug },
    });

    const checkLabel = await Permission.findOne({
      label: { $regex: label, $options: "i" },
      slug: { $ne: slug },
    });

    if (checkKey) {
      return res.status(400).json({ message: "Key đã tồn tại!" });
    }

    if (checkLabel) {
      return res.status(400).json({ message: "Quyền đã tồn tại!" });
    }

    const updateData = { ...permData, key, label };

    if (req.body.label) {
      updateData.slug = slugify(req.body.label, {
        lower: true,
        strict: true,
        locale: "vi",
      });
    }

    updateData.updatedBy = req.user.id;

    await Permission.updateOne(
      {
        slug: slug,
      },
      updateData,
    );
    return res.status(200).json({ message: "Cập nhật quyền thành công!" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/v1/admin/roles/permissions/delete/:id
module.exports.deletePerm = async (req, res) => {
  try {
    const id = req.params.id;
    const perm = await Permission.findOne({
      _id: id,
    });

    if (!perm) {
      return res.status(400).json({ message: "Không tìm thấy quyền!" });
    }

    await Permission.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
      },
    );

    return res.status(200).json({ message: "Xóa quyền thành công!" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// [GET] /api/v1/admin/roles/permissions/detail/:slug
module.exports.detailPerm = async (req, res) => {
  try {
    const slug = req.params.slug;
    const perm = await Permission.findOne({ slug: slug, deleted: false });
    if (!perm) {
      return res.status(404).json({ message: "Không tìm thấy quyền!" });
    }

    return res.status(200).json({
      message: "Lấy thông tin quyền thành công!",
      perm: perm,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy thông tin quyền!",
    });
  }
};

export {};
