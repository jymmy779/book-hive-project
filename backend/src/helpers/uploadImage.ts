const multer = require("multer");
const CloudinaryStorage = require("multer-storage-cloudinary");
const cloudinaryConfig = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig,
  params: {
    folder: "book-store",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      { quality: "auto" },       // Tự động nén dung lượng tối ưu mà không giảm chất lượng ảnh
      { fetch_format: "auto" }   // Tự động chuyển đổi định dạng tối ưu nhất (WebP, AVIF,...)
    ]
  },
});

const upload = multer({ storage: storage });

console.log("here");

module.exports = upload;
