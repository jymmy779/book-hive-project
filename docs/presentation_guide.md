# 📚 HƯỚNG DẪN BÁO CÁO & DEMO ĐỒ ÁN: BOOK HIVE

Chào bạn **Lương Việt Thái (23631761 - DHKTPM19B)**! Ngày mai bạn sẽ có một buổi báo cáo cực kỳ quan trọng trước Thầy Cô về đồ án **Book Hive - Nền Tảng Thương Mại Điện Tử Sách**.

Tài liệu này được biên soạn nhằm giúp bạn tự tin làm chủ buổi báo cáo, trình bày mạch lạc những gì đã làm, thực hiện demo trơn tru không gặp lỗi và ghi điểm tuyệt đối trong mắt Thầy Cô chấm đồ án.

---

## 🗺️ TỔNG QUAN CHIẾN LƯỢC BÁO CÁO

> [!TIP]
> **Quy tắc vàng khi báo cáo:**
> 1. **Tập trung vào giá trị thực tế:** Trình bày ngắn gọn lý thuyết, tập trung show sản phẩm chạy thực tế (Demo). Thầy cô chấm điểm chủ yếu dựa trên sản phẩm thực tế ("có làm hay không").
> 2. **Tự tin và mạch lạc:** Trình bày cấu trúc dự án rõ ràng, nhấn mạnh các tính năng khó (AI Chatbot, Thanh toán trực tuyến, Phân quyền RBAC).
> 3. **Làm chủ Codebase:** Nắm rõ kiến trúc Client-Server và cách thức các công nghệ tương tác với nhau để tự tin phản biện.

---

## 📊 DÀN BÀI THUYẾT TRÌNH (SLIDE & NÓI)

Dưới đây là dàn bài thuyết trình 5 phần tối ưu, bạn có thể dùng để làm slide hoặc chuẩn bị bài nói trực tiếp:

### 1️⃣ Phần 1: Giới thiệu Đề tài & Lý do chọn đề tài (1-2 phút)
- **Tên đề tài:** Book Hive - Nền Tảng Thương Mại Điện Tử Sách.
- **Mục tiêu:** Xây dựng một ứng dụng Web App hiện đại dành cho việc mua sắm và quản lý sách trực tuyến, tối ưu hóa trải nghiệm người dùng với tốc độ tải trang cực nhanh, giao diện Responsive trên mọi thiết bị và tích hợp các tính năng thông minh.
- **Lý do chọn đề tài:** Nhu cầu mua sắm sách trực tuyến ngày càng cao, nhưng các trang web hiện tại thường load chậm, thiếu tính cá nhân hóa trong việc tư vấn sách và chưa tối ưu hóa luồng thanh toán không tiền mặt. **Book Hive** ra đời nhằm giải quyết toàn bộ các hạn chế trên.

### 2️⃣ Phần 2: Công nghệ Sử dụng & Kiến trúc Hệ thống (2 phút)
- **Mô hình kiến trúc:** **Client-Server tách biệt hoàn toàn** để tối ưu hóa hiệu năng, bảo mật và khả năng bảo trì.
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Redux Toolkit, React Query.
  - *Lý do chọn:* Next.js App Router cung cấp cơ chế **Server-side Rendering (SSR)** và **Static Site Generation (SSG)** giúp tối ưu SEO vượt trội và tăng tốc độ load trang đầu tiên.
- **Backend:** Node.js, Express, TypeScript.
  - *Lý do chọn:* TypeScript giúp kiểm soát kiểu dữ liệu chặt chẽ từ phía server, tránh các lỗi runtime tiềm ẩn và tăng độ tin cậy của hệ thống.
- **Database & Storage:** MongoDB Atlas (NoSQL) linh hoạt cùng với Cloudinary cho việc lưu trữ hình ảnh.
- **Các dịch vụ tích hợp bên thứ ba (Điểm cộng cực lớn):**
  - **PayOS:** Cổng thanh toán trực tuyến thế hệ mới của Việt Nam, hỗ trợ tạo mã QR động thanh toán nhanh chóng qua ngân hàng.
  - **Groq AI SDK:** Tích hợp trí tuệ nhân tạo (Llama 3) cung cấp trợ lý ảo tư vấn sách thời gian thực.
  - **Brevo (Sendinblue):** Dịch vụ gửi Email OTP và thông báo trạng thái đơn hàng tự động.

### 3️⃣ Phần 3: Kết quả đạt được sau 6 Sprints (2 phút)
Em đã hoàn thiện toàn bộ **6 Sprints** đúng tiến độ với đầy đủ các phân hệ tính năng:

*   **Phân hệ Client (Khách hàng):**
    *   **UI/UX Hiện đại:** Thiết kế Responsive hoàn chỉnh, giao diện sang trọng, mượt mà với Tailwind CSS.
    *   **Xác thực bảo mật:** Đăng ký, đăng nhập bảo mật bằng JWT (AccessToken & HttpOnly RefreshToken) + Đăng nhập nhanh bằng **Google OAuth2**.
    *   **Tìm kiếm & Lọc nâng cao:** Tìm kiếm tối ưu với cơ chế **Debounce Search** (giảm tải cho Server) + Bộ lọc sách đa tiêu chí (Thể loại, Khoảng giá, Xếp hạng sao).
    *   **Mua sắm hoàn chỉnh:** Giỏ hàng thời gian thực và luồng Checkout/Đặt hàng chuẩn TMĐT.
    *   **Thanh toán PayOS:** Tích hợp thanh toán QR Code tự động đồng bộ trạng thái qua **Webhook**.
    *   **AI Chatbot:** Trợ lý ảo tư vấn chọn sách cá nhân hóa dựa trên mô hình ngôn ngữ lớn (LLM).

*   **Phân hệ Admin (Quản trị viên):**
    *   **Dashboard trực quan:** Biểu đồ thống kê doanh thu theo thời gian, số lượng đơn hàng mới và sách bán chạy.
    *   **Quản lý Danh mục & Sách (CRUD):** Hỗ trợ danh mục lồng nhau (cha-con), thay đổi vị trí hiển thị (Position) linh hoạt, upload ảnh lên Cloudinary.
    *   **Phân quyền chi tiết (RBAC):** Tạo vai trò (Role) và gán quyền (Permissions) cho từng tài khoản quản trị (Admin, Staff, Warehouse) một cách chặt chẽ.

---

## 🎬 KỊCH BẢN DEMO SẢN PHẨM KHÔNG LỖI (5 phút)

> [!IMPORTANT]
> Hãy mở cả Frontend và Backend ở local, đăng nhập sẵn tài khoản Admin ở một tab khác để buổi demo diễn ra liền mạch và nhanh chóng nhất.

| Bước | Hành động trên màn hình | Lời thuyết minh tương ứng | Điểm nhấn kỹ thuật |
| :--- | :--- | :--- | :--- |
| **B1: Landing Page** | Truy cập `http://localhost:3000/home`. Cuộn trang xem các mục: Thể loại nổi bật, Sách mới nhất, Sách bán chạy. | "Đây là giao diện trang chủ của Book Hive. Thiết kế theo phong cách tối giản, hiện đại, load cực nhanh nhờ cơ chế Server-side Rendering của Next.js, giúp tối ưu SEO." | Giao diện mượt, thân thiện, chuẩn SEO. |
| **B2: Đăng nhập Google** | Bấm Đăng nhập -> Chọn "Đăng nhập bằng Google". Chọn tài khoản Google của bạn. | "Hệ thống hỗ trợ đăng nhập qua tài khoản thường bằng JWT với cơ chế Refresh Token giúp duy trì phiên đăng nhập bảo mật, hoặc đăng nhập nhanh bằng Google OAuth2." | Đăng nhập bằng Google cực kỳ chuyên nghiệp và mượt mà. |
| **B3: Tìm kiếm & Lọc Sách** | Gõ từ khóa tìm kiếm (ví dụ: "Đắc Nhân Tâm"). Áp dụng các bộ lọc như lọc theo Khoảng giá hoặc Đánh giá (Rating). | "Tính năng tìm kiếm sử dụng cơ chế Debounce Search giúp giảm thiểu tối đa request lên Server. Bộ lọc nâng cao hỗ trợ khách hàng tìm kiếm sách theo thể loại, khoảng giá và đánh giá của độc giả." | Debounce Search giúp tối ưu hiệu năng Server. |
| **B4: Giỏ hàng & Đặt hàng** | Click vào chi tiết sách. Thêm sách vào giỏ hàng. Vào trang Giỏ hàng, bấm nút "Đặt hàng". Điền thông tin giao hàng. | "Khách hàng có thể dễ dàng quản lý giỏ hàng trực quan. Khi chuyển sang bước Thanh toán, hệ thống sẽ tạo một đơn hàng ở trạng thái 'Chờ thanh toán'." | Luồng đặt hàng liền mạch, thân thiện. |
| **B5: Thanh toán PayOS** | Chọn phương thức thanh toán chuyển khoản QR qua **PayOS**. Màn hình sẽ chuyển sang trang thanh toán của PayOS với mã QR code thực tế. | "Điểm đặc biệt của Book Hive là tích hợp cổng thanh toán trực tuyến thế hệ mới PayOS. Hệ thống tự tạo mã QR động chứa sẵn số tiền và nội dung chuyển khoản. Khi người dùng quét mã thanh toán thành công, PayOS sẽ gửi tín hiệu Webhook về Backend để tự động cập nhật trạng thái đơn hàng sang 'Đã thanh toán'." | **PayOS Webhook**: Đây là tính năng cực kỳ đắt giá, thể hiện bạn làm ứng dụng thực tế chứ không phải app đồ chơi. |
| **B6: Trải nghiệm AI Chatbot** | Mở widget Chatbot AI ở góc dưới màn hình. Nhập câu hỏi tư vấn: *"Chào bạn, tôi muốn tìm sách về phát triển bản thân và tư duy tài chính, gợi ý giúp tôi với?"* | "Bên cạnh đó, Book Hive còn tích hợp một Trợ lý AI Chatbot thông minh sử dụng Groq Cloud. Chatbot này có khả năng đọc hiểu ngữ cảnh và đưa ra các gợi ý sách cực kỳ chính xác và cá nhân hóa cho từng khách hàng." | Tích hợp **AI Groq Cloud** giúp website nổi bật so với các đồ án thông thường. |
| **B7: Trang Admin & Dashboard** | Chuyển sang trang Admin `http://localhost:3001` (hoặc chuyển sang tab Admin). Chỉ vào Dashboard với biểu đồ doanh thu, thống kê. | "Bây giờ, em xin phép chuyển sang Phân hệ quản trị dành cho Admin. Trang Dashboard cung cấp số liệu trực quan về doanh thu theo thời gian, số lượng đơn hàng mới và sách bán chạy." | Dashboard đẹp mắt, biểu đồ trực quan. |
| **B8: Quản lý Danh mục & Phân quyền** | Vào mục Quản lý thể loại hoặc Quản lý sách. Demo tính năng thêm/sửa nhanh, phân quyền cho Role Admin. | "Trang Admin hỗ trợ CRUD toàn bộ dữ liệu sách, phân chia danh mục đa cấp, lưu trữ ảnh tự động qua Cloudinary. Hệ thống phân quyền chi tiết (RBAC) cho phép chủ cửa hàng phân quyền cụ thể cho từng nhân viên bán hàng hoặc nhân viên kho." | Phân quyền RBAC và lưu trữ Cloudinary. |

---

## 💬 CÁC CÂU HỎI PHẢN BIỆN THƯỜNG GẶP & CÁCH TRẢ LỜI "ĂN ĐIỂM"

> [!NOTE]
> Thầy cô thường sẽ hỏi sâu vào kiến trúc và cơ chế kỹ thuật để kiểm tra xem bạn có tự viết code hay không. Dưới đây là phao cứu sinh giúp bạn trả lời trôi chảy:

### ❓ Câu 1: Em hãy giải thích cơ chế xác thực JWT và cơ chế Refresh Token hoạt động như thế nào trong dự án?
- **Trả lời:**
  - *"Dự án của em sử dụng JWT (JSON Web Token) để xác thực người dùng không trạng thái (Stateless). Khi người dùng đăng nhập thành công, Server sẽ trả về 2 token: **AccessToken** (hạn dùng ngắn, ví dụ 15 phút, được gán vào header của mọi request gửi đi) và **RefreshToken** (hạn dùng dài, ví dụ 7 ngày, được lưu trong Cookie HttpOnly phía client để bảo mật tối đa trước các cuộc tấn công XSS)."*
  - *"Khi AccessToken hết hạn (gây ra lỗi 401 từ API), interceptor của axios ở Frontend sẽ tự động gửi RefreshToken lên endpoint `/api/v1/auth/refresh` của Backend để lấy AccessToken mới và tiếp tục thực hiện lại request cũ. Cơ chế này diễn ra hoàn toàn tự động, người dùng không hề nhận biết và không bị ngắt quãng trải nghiệm."*

### ❓ Câu 2: Tại sao em lại chọn MongoDB làm database thay vì các hệ quản trị CSDL quan hệ như MySQL hay PostgreSQL?
- **Trả lời:**
  - *"Dự án thương mại điện tử sách có cấu trúc dữ liệu linh hoạt và cần tốc độ đọc dữ liệu cực kỳ nhanh để hiển thị sách. MongoDB là cơ sở dữ liệu NoSQL dạng tài liệu (Document-based), rất phù hợp để lưu trữ các thông tin sách có thuộc tính động (nhiều thuộc tính khác nhau tùy loại sách) và các danh mục có cấu trúc lồng nhau (Parent-Child) như thể loại sách."*
  - *"Hơn nữa, MongoDB hỗ trợ việc lưu trữ dữ liệu dạng JSON/BSON trực quan, đồng bộ hoàn hảo với dữ liệu của JavaScript/TypeScript trên cả Frontend và Backend, giúp đẩy nhanh tiến độ phát triển dự án."*

### ❓ Câu 3: Làm sao Backend của em nhận biết được khách hàng đã thanh toán thành công qua PayOS để cập nhật trạng thái đơn hàng?
- **Trả lời:**
  - *"Em sử dụng cơ chế **Webhook** được cấu hình trên tài khoản PayOS. Khi khách hàng quét mã QR thanh toán thành công thông qua ngân hàng của họ, hệ thống PayOS sẽ ngay lập tức gửi một request POST (chứa thông tin giao dịch kèm theo chữ ký số SHA256 mã hóa để tránh giả mạo) tới endpoint Webhook của Backend em."*
  - *"Backend sẽ kiểm tra tính hợp lệ của chữ ký số bằng Secret Key được cấp, xác nhận mã đơn hàng tương ứng và tự động cập nhật trạng thái đơn hàng từ 'Chờ thanh toán' sang 'Đã thanh toán', đồng thời tự động kích hoạt gửi email hóa đơn và cảm ơn cho khách hàng thông qua Brevo API."*

### ❓ Câu 4: Chatbot AI của em hoạt động như thế nào? Nó gọi API trực tiếp từ Frontend hay qua Backend? Làm sao để bảo mật API Key của AI?
- **Trả lời:**
  - *"Để đảm bảo tính bảo mật tuyệt đối cho API Key của Groq Cloud, tất cả các request trò chuyện với AI đều được gửi từ Frontend lên Backend của em thông qua endpoint `/api/v1/chat/message`. Backend sau đó mới đính kèm API Key được cấu hình trong file `.env` và giao tiếp với Groq API."*
  - *"Điều này giúp ẩn hoàn toàn API Key khỏi phía client, tránh bị rò rỉ và lạm dụng API Key. Đồng thời, Backend cũng quản lý và giới hạn số lượng request (Rate Limiting) để bảo vệ server."*

### ❓ Câu 5: Em tối ưu SEO cho trang Next.js như thế nào?
- **Trả lời:**
  - *"Em tối ưu SEO bằng 3 phương pháp cốt lõi:*
    1.  *Sử dụng **Friendly URLs (Slug)** dạng `/book/dac-nhan-tam-123` thay vì chứa ID loằng ngoằng, giúp các bot của công cụ tìm kiếm dễ đọc và đánh giá tốt hơn."*
    2.  *Tận dụng cơ chế **Server-side Rendering (SSR)** của Next.js để sinh mã HTML hoàn chỉnh từ server trước khi trả về client, giúp các công cụ tìm kiếm như Google dễ dàng thu thập thông tin (crawling) và đánh chỉ mục (indexing)."*
    3.  *Định nghĩa đầy đủ **Metadata** động (như Title, Description, OpenGraph image) cho từng trang chi tiết sách thông qua hàm `generateMetadata` của Next.js."*

---

## 🛠️ HƯỚNG DẪN CHẠY LOCAL ĐỂ DEMO MƯỢT MÀ

Để chuẩn bị demo ngày mai, hãy làm sạch dữ liệu và khởi động server từ sớm bằng cách:
1.  Mở PowerShell tại thư mục gốc `book-hive-project`.
2.  Chạy lệnh cài đặt thư viện để chắc chắn không thiếu package: `npm install`
3.  Chạy Backend: `npm run dev:backend`
4.  Chạy Frontend: `npm run dev:frontend`
5.  Chuẩn bị sẵn 2 tài khoản test:
    - **Tài khoản Client:** một tài khoản Google hoặc tài khoản email test đăng ký sẵn.
    - **Tài khoản Admin:** tài khoản có quyền quản trị cao nhất để show dashboard và danh sách sản phẩm.

Chúc bạn có một buổi báo cáo thành công rực rỡ và đạt điểm số tối đa! Bạn chắc chắn sẽ làm được!
