"use client";

import Link from "next/link";
import Image from "next/image";
import { Book } from "@/app/interfaces/book.interface";
import {
  FiBookmark,
  FiStar,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

export const SpotlightBook = ({
  book,
  showEditorBadge = false,
}: {
  book?: Book;
  showEditorBadge?: boolean;
}) => {
  if (!book) return null;

  return (
    <div className="mb-14 md:mb-18 rounded-3xl bg-surface-secondary border border-border/80 p-6 sm:p-10 md:p-12 shadow-sm overflow-hidden relative">
      {/* Decorative background shape */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent-light/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Book Display */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative aspect-[3/4] w-52 sm:w-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white group">
            <Image
              src={book.image || "/book-hive.webp"}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className={`absolute top-3 left-3 bg-accent text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 ${showEditorBadge ? "" : "hidden"}`}>
              <FiBookmark size={12} />
              <span>Biên Tập Viên Khuyên Đọc</span>
            </div>
          </div>
        </div>

        {/* Right Editorial Info */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent-light px-3 py-1 rounded-full mb-3">
            <FiStar size={13} />
            <span>Tác Phẩm Của Tháng</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-text-primary mb-2 leading-tight">
            {book.title}
          </h2>

          <p className="text-sm sm:text-base text-text-secondary font-medium mb-4">
            Tác giả: <span className="text-primary font-bold">{book.author}</span>
          </p>

          <blockquote className="border-l-4 border-accent pl-4 italic text-sm text-text-secondary mb-6 leading-relaxed bg-white/70 p-3 rounded-r-xl">
            &ldquo;Mỗi trang sách là một cuộc đối thoại sâu sắc với chính mình, giúp ta nhìn nhận lại những giá trị cốt lõi trong cuộc sống thường nhật.&rdquo;
          </blockquote>

          {/* Quick Perks */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-emerald-500 shrink-0" size={15} />
              <span>Bản in mới nhất từ NXB uy tín</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-emerald-500 shrink-0" size={15} />
              <span>Kèm bookmark thiết kế độc quyền</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="text-accent shrink-0" size={15} />
              <span>Thời lượng đọc: ~4 - 6 giờ</span>
            </div>
            <div className="flex items-center gap-2">
              <FiStar className="text-warning shrink-0" size={15} />
              <span>{book.reviews > 0 && book.rating > 0 ? `Đánh giá: ${Number(book.rating).toFixed(1)}/5.0` : "Chưa có đánh giá"}</span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-[11px] text-text-muted">Giá ưu đãi hôm nay</p>
              <p className="text-xl sm:text-2xl font-black text-primary">
                {book.priceBuy ? book.priceBuy.toLocaleString("vi-VN") + "đ" : "Liên hệ"}
              </p>
            </div>
            <Link
              href={`/books/detail/${book.slug}`}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <span>Xem chi tiết tác phẩm</span>
              <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
