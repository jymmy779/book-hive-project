module.exports.validateBook = (req, res, next) => {
    const { title, author, category_id } = req.body;
    const errors = [];
    if (!title || typeof title !== "string" || title.trim().length < 3) {
        return res
            .status(400)
            .json({ message: "Tên sách phải có ít nhất 3 ký tự!" });
    }
    if (!author || typeof author !== "string" || author.trim().length < 3) {
        return res
            .status(400)
            .json({ message: "Tác giả phải có ít nhất 3 ký tự!" });
    }
    if (!category_id) {
        return res.status(400).json({ message: "Vui lòng chọn thể loại" });
    }
    if (req.body.inStock !== undefined) {
        const inStock = Number(req.body.inStock);
        if (!Number.isInteger(inStock) || inStock < 0) {
            return res.status(400).json({ message: "inStock must be a non-negative integer." });
        }
        req.body.inStock = inStock;
    }
    if (errors.length > 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ!", errors });
    }
    next();
};
module.exports.validateCategory = (req, res, next) => {
    const { title } = req.body;
    const errors = [];
    if (!title || typeof title !== "string" || title.trim().length < 3) {
        return res
            .status(400)
            .json({ message: "Tên thể loại phải có ít nhất 3 ký tự!" });
    }
    if (errors.length > 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ!", errors });
    }
    next();
};
module.exports.validateRole = (req, res, next) => {
    const { title } = req.body;
    const errors = [];
    if (!title || typeof title !== "string" || title.trim().length < 3) {
        return res
            .status(400)
            .json({ message: "Tên vai trò phải có ít nhất 3 ký tự!" });
    }
    if (errors.length > 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ!", errors });
    }
    next();
};
module.exports.validatePermission = (req, res, next) => {
    const { key, label, group } = req.body;
    const errors = [];
    if (!key || typeof key !== "string" || key.trim().length < 3) {
        return res.status(400).json({ message: "Key là bắt buộc!" });
    }
    if (!label || typeof label !== "string" || label.trim().length < 3) {
        return res
            .status(400)
            .json({ message: "Tên quyền phải có ít nhất 3 ký tự!" });
    }
    if (!group || typeof group !== "string") {
        return res
            .status(400)
            .json({ message: "Vui lòng chọn chức năng cho quyền!" });
    }
    if (errors.length > 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ!", errors });
    }
    next();
};
module.exports.validateAccount = (req, res, next) => {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 3) {
        return res.status(400).json({ message: "Họ tên phải có ít nhất 3 ký tự!" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ!" });
    }
    if (req.method === "POST") {
        if (!password || typeof password !== "string" || password.length < 6) {
            return res
                .status(400)
                .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
        }
    }
    if (phone && !/^\d{10,11}$/.test(phone.replace(/\D/g, ""))) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ!" });
    }
    next();
};
module.exports.validateResetPassword = (req, res, next) => {
    const { newPassword } = req.body;
    if (!newPassword ||
        typeof newPassword !== "string" ||
        newPassword.length < 6) {
        return res
            .status(400)
            .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }
    next();
};
module.exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ!" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
        return res
            .status(400)
            .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }
    next();
};
module.exports.validateCheckout = (req, res, next) => {
    const { userInfo } = req.body;
    if (!userInfo || typeof userInfo !== "object") {
        return res
            .status(400)
            .json({ message: "Thông tin người dùng không hợp lệ!" });
    }
    const { fullName, email, phone, address } = userInfo;
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 3) {
        return res.status(400).json({ message: "Họ tên phải có ít nhất 3 ký tự!" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ!" });
    }
    if (!phone || !/^\d{10,11}$/.test(phone.replace(/\D/g, ""))) {
        return res
            .status(400)
            .json({ message: "Số điện thoại phải có 10-11 chữ số!" });
    }
    if (!address || typeof address !== "string" || address.trim().length < 5) {
        return res
            .status(400)
            .json({ message: "Địa chỉ phải có ít nhất 5 ký tự!" });
    }
    next();
};
module.exports.validateRegister = (req, res, next) => {
    const { fullName, email, password, confirmPassword } = req.body;
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 3) {
        return res.status(400).json({ message: "Họ tên phải có ít nhất 3 ký tự!" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ!" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
        return res
            .status(400)
            .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }
    if (!confirmPassword || confirmPassword !== password) {
        return res
            .status(400)
            .json({ message: "Mật khẩu xác nhận không trùng khớp!" });
    }
    next();
};
