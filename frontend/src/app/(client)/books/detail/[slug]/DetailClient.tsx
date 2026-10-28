"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";
import { Book } from "@/app/interfaces/book.interface";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import ReviewForm from "@/app/components/Form/ReviewForm/ReviewForm";
import ReviewList from "@/app/components/ReviewList/ReviewList";
import { ScrollReveal } from "@/app/components/Animation/ScrollReveal";

import {
  FaStar,
  FaStarHalfAlt,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import {
  FiShoppingCart,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiCheck,
  FiChevronRight,
  FiBookOpen,
  FiMinus,
  FiPlus,
  FiShare2,
} from "react-icons/fi";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type DetailClientProps = {
  book: Book;
};

export default function DetailClient({ book }: DetailClientProps) {
  const { addToCart } = useCart();
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs">("desc");
  const [isFavorite, setIsFavorite] = useState(false);
  const isFlashSaleActive = Boolean(
    book.flashSale &&
      book.flashSaleEndAt &&
      new Date(book.flashSaleEndAt).getTime() > Date.now(),
  );
  const displayPrice = isFlashSaleActive && book.discountPercent
    ? Math.round(book.priceBuy * (1 - book.discountPercent / 100))
    : book.priceBuy;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = Boolean(user);
      setIsAuthenticated(isLoggedIn);

      if (isLoggedIn && book?._id) {
        axios
          .get(`${API_URL}/api/v1/favorites`, {
          })
          .then((res) => {
            const list = res.data.favorites || [];
            const hasFav = list.some(
              (f: any) => (f.bookId?._id || f.bookId) === book._id,
            );
            setIsFavorite(hasFav);
          })
          .catch(() => {});
      }
    }
  }, [book?._id, user]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để lưu sách yêu thích!");
      return;
    }
    try {
      if (isFavorite) {
        await axios.post(
          `${API_URL}/api/v1/favorites/remove`,
          { bookId: book._id },
        );
        setIsFavorite(false);
        toast.info("Đã bỏ khỏi danh sách yêu thích");
      } else {
        await axios.post(
          `${API_URL}/api/v1/favorites/add`,
          { bookId: book._id },
        );
        setIsFavorite(true);
        toast.success("Đã thêm vào danh sách yêu thích!");
      }
    } catch {
      toast.error("Không thể cập nhật yêu thích lúc này");
    }
  };

  const handleAddToCart = () => {
    if (!book) return;
    addToCart({
      bookId: book._id,
      title: book.title,
      price: displayPrice,
      quantity,
      image: book.image,
      slug: book.slug,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (typeof window !== "undefined") {
      window.location.href = "/cart";
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết sách vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="py-6 md:py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <FiChevronRight size={12} />
          <Link href="/books" className="hover:text-primary transition-colors">
            Tất cả sách
          </Link>
          {book.category_name && (
            <>
              <FiChevronRight size={12} />
              <Link
                href={`/books?category=${book.category_id || ""}`}
                className="hover:text-primary transition-colors"
              >
                {book.category_name}
              </Link>
            </>
          )}
          <FiChevronRight size={12} />
          <span className="text-text-primary font-medium truncate max-w-[200px] sm:max-w-xs">
            {book.title}
          </span>
        </nav>

        {/* Main Product Showcase Box */}
        <ScrollReveal direction="up" distance={20} duration={0.4}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-border shadow-xs mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Book Cover Image & Guarantees */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative aspect-[3/4] w-full max-w-sm rounded-2xl overflow-hidden bg-surface-secondary shadow-xl border-4 border-white mb-6 group">
                <Image
                  src={book.image || "/book-hive.webp"}
                  alt={book.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Favorite Heart Button */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-rose-600 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  title="Thêm vào yêu thích"
                >
                  {isFavorite ? (
                    <FaHeart className="text-rose-600 text-lg" />
                  ) : (
                    <FaRegHeart className="text-lg" />
                  )}
                </button>

                {/* Badge 100% Chính Hãng */}
                <div className="absolute bottom-3 left-3 bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                  <FiShield size={13} className="text-amber-400" />
                  <span>100% Sách Thật</span>
                </div>
              </div>

              {/* Guarantees Strip */}
              <div className="w-full max-w-sm grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-secondary/70 border border-border/80 text-[11px] text-text-secondary">
                  <FiTruck className="text-primary shrink-0" size={16} />
                  <span>Giao nhanh toàn quốc</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-secondary/70 border border-border/80 text-[11px] text-text-secondary">
                  <FiRefreshCw className="text-accent shrink-0" size={16} />
                  <span>Đổi trả trong 7 ngày</span>
                </div>
              </div>
            </div>

            {/* Right: Book Details & Actions */}
            <div className="md:col-span-7 flex flex-col">
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary border border-primary-subtle">
                  <FiBookOpen size={12} />
                  <span>{book.category_name || "Sách Chọn Lọc"}</span>
                </span>

                <button
                  type="button"
                  onClick={handleShare}
                  className="text-xs text-text-muted hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FiShare2 size={14} />
                  <span>Chia sẻ</span>
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary leading-tight tracking-tight mb-2">
                {book.title}
              </h1>

              {/* Author & Reviews Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-text-secondary mb-5 pb-5 border-b border-border-light">
                <p>
                  Tác giả: <span className="font-bold text-text-primary">{book.author || "Nhiều tác giả"}</span>
                </p>
                <span>â€¢</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => {
                      const fill = (book.reviews > 0 ? book.rating || 0 : 0) - i;
                      if (fill >= 1) return <FaStar key={i} size={14} />;
                      if (fill > 0) return <FaStarHalfAlt key={i} size={14} />;
                      return <FaStar key={i} className="text-stone-300" size={14} />;
                    })}
                  </div>
                  <span className="font-bold text-text-primary">
                    {book.reviews > 0 && book.rating > 0 ? Number(book.rating).toFixed(1) : "Chưa đánh giá"}
                  </span>
                  <span className="text-text-muted">({book.reviews ?? 0} đánh giá)</span>
                </div>
                <span>â€¢</span>
                <span className="text-text-muted">
                  Đã bán {(book.soldCount || 0).toLocaleString("vi-VN")} cuốn
                </span>
              </div>

              {/* Price Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#faf8f5] border border-border mb-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-xs text-text-muted font-medium">Giá bán:</span>
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-primary">
                    {displayPrice
                      ? `${displayPrice.toLocaleString("vi-VN")}\u20ab`
                      : "Li\u00ean h\u1ec7"}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                  <FiCheck size={14} /> Tiết kiệm hơn khi đặt trực tuyến tại BookHive
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-semibold text-text-secondary">Số lượng:</span>
                <div className="flex items-center border border-border rounded-xl bg-white shadow-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-text-secondary hover:bg-surface-secondary active:scale-95 transition-all cursor-pointer"
                    aria-label="Giảm"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-text-primary select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-text-secondary hover:bg-surface-secondary active:scale-95 transition-all cursor-pointer"
                    aria-label="Tăng"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-auto">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm bg-accent hover:bg-accent-hover text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <FiShoppingCart size={18} />
                  <span>Thêm vào giỏ hàng</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Mua ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

        {/* Content Tabs */}
        <ScrollReveal direction="up" distance={20} duration={0.4} delay={0.05}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-border shadow-xs mb-10">
          <div className="flex items-center gap-4 border-b border-border pb-4 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("desc")}
              className={`pb-2 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
                activeTab === "desc"
                  ? "text-primary border-b-2 border-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Giới thiệu tác phẩm
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`pb-2 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
                activeTab === "specs"
                  ? "text-primary border-b-2 border-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Thông tin chi tiết
            </button>
          </div>

          {activeTab === "desc" ? (
            <div
              className="text-xs sm:text-sm text-text-secondary leading-relaxed prose prose-stone max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  book.description ||
                    "Đang cập nhật nội dung giới thiệu chi tiết cho cuốn sách này.",
                ),
              }}
            />
          ) : (
            <div className="max-w-xl text-xs sm:text-sm">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-border-light">
                    <td className="py-2.5 text-text-muted font-medium w-1/3">Tác giả</td>
                    <td className="py-2.5 text-text-primary font-semibold">{book.author || "Nhiều tác giả"}</td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="py-2.5 text-text-muted font-medium">Thể loại</td>
                    <td className="py-2.5 text-text-primary font-semibold">{book.category_name || "Sách chọn lọc"}</td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="py-2.5 text-text-muted font-medium">Hình thức</td>
                    <td className="py-2.5 text-text-primary font-semibold">Bìa mềm cao cấp</td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="py-2.5 text-text-muted font-medium">Nhà xuất bản</td>
                    <td className="py-2.5 text-text-primary font-semibold">NXB Văn Học / Trẻ</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-text-muted font-medium">Ngôn ngữ</td>
                    <td className="py-2.5 text-text-primary font-semibold">Tiếng Việt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        </ScrollReveal>

        {/* Reviews Section */}
        <ScrollReveal direction="up" distance={20} duration={0.4} delay={0.1}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-border shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                Độc Giả Nhận Xét &amp; Đánh Giá
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Chia sẻ cảm nhận thực tế của bạn về cuốn sách
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="mb-8">
              <ReviewForm
                bookId={book._id}
                isAuthenticated={isAuthenticated}
                onReviewSubmitted={setRefreshTrigger}
                refreshTrigger={refreshTrigger}
              />
            </div>
          ) : (
            <div className="bg-amber-50 rounded-2xl p-5 mb-8 border border-amber-200 text-center">
              <p className="text-stone-800 text-xs sm:text-sm">
                Bạn đã đọc cuốn sách này? Vui lòng{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-primary underline hover:text-primary-dark"
                >
                  đăng nhập
                </Link>{" "}
                để gửi đánh giá của bạn.
              </p>
            </div>
          )}

          <ReviewList
            bookId={book._id}
            refreshTrigger={refreshTrigger}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
        </ScrollReveal>
      </div>

    </div>
  );
}
