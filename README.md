# Book Hive - Nền Tảng Thương Mại Điện Tử Sách

Dự án **Book Hive** là một ứng dụng Web App hiện đại dành cho việc mua sắm và quản lý sách, được xây dựng với mục tiêu mang lại trải nghiệm mượt mà cho cả người dùng cuối và quản trị viên.

## 🚀 Demo Trực Tuyến
- **Trang Khách hàng (Client):** [https://book-hive-project.vercel.app/home](https://book-hive-project.vercel.app)
- **Trang Quản trị (Admin):** [https://book-hive-project.vercel.app/auth/admin/login](https://book-hive-project.vercel.app/auth/admin/login)

---

## 📚 Tài Liệu Dự Án
Các tài liệu kỹ thuật chi tiết có thể được tìm thấy trong thư mục `/docs`:
- [Sơ đồ thực thể quan hệ (ERD)](docs/ERD.md)
- [Tài liệu API Specification](docs/API_spec.md)
- [Kiến trúc hệ thống](docs/Architecture.md)
- [Báo cáo tiến độ (6 Sprints)](docs/sprints/)

---

## 🛠 Công Nghệ Sử Dụng (Tech Stack)
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Redux Toolkit, React Query.
- **Backend:** Node.js, Express, TypeScript, JWT.
- **Database:** MongoDB (Mongoose).
- **Media:** Cloudinary.
- **Thanh toán:** PayOS.
- **AI:** Groq AI Cloud.

---

## ⚙️ Hướng Dẫn Cài Đặt Local

### 1. Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB (Local hoặc Atlas)

### 2. Cấu hình biến môi trường
Dựa vào các file `.env.example`, hãy tạo file `.env` tương ứng trong từng thư mục.

### 2. Chạy ứng dụng

Dự án sử dụng **NPM Workspaces**, bạn có thể quản lý cả Frontend và Backend từ thư mục gốc:

**Cài đặt thư viện cho toàn bộ dự án:**
```bash
npm install
```

**Chạy Backend:**
```bash
npm run dev:backend
```

**Chạy Frontend:**
```bash
npm run dev:frontend
```

**Định dạng lại code (Prettier):**
```bash
npm run format:all
```

Ứng dụng sẽ khả dụng tại:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/admin/dashboard/login` (Admin)

---

## 👥 Thông Tin Sinh Viên
- **Họ và tên:** Lương Việt Thái
- **Mã số sinh viên:** 23631761
- **Lớp:** DHKTPM19B
- **Repo:** [https://github.com/thaigithurb/book-hive-project](https://github.com/thaigithurb/book-hive-project)
