"use client";

import Link from "next/link";
import Image from "next/image";
import { Book } from "@/app/interfaces/book.interface";
import { FiAward, FiArrowRight, FiStar } from "react-icons/fi";

const MEDAL_STYLES = [
  {
    rank: "01",
    label: "Quán Quân Bán Chạy",
    badgeBg: "bg-amber-400 text-slate-950 font-black",
    border: "border-amber-300 ring-2 ring-amber-400/20",
    bg: "from-amber-50/60 to-white",
    textColor: "text-amber-500",
  },
  {
    rank: "02",
    label: "Á Quân Bán Chạy",
    badgeBg: "bg-slate-300 text-slate-900 font-bold",
    border: "border-slate-300 ring-1 ring-slate-300/30",
    bg: "from-slate-50/70 to-white",
    textColor: "text-slate-400",
  },
  {
    rank: "03",
    label: "Hạng 3 Tuần Này",
    badgeBg: "bg-amber-600/80 text-white font-bold",
    border: "border-amber-600/30",
    bg: "from-amber-100/30 to-white",
    textColor: "text-amber-700",
  },
];

export const RankingPodium = ({
  books,
}: {
  books: Book[];
}) => {
  const topThree = books.slice(0, 3);
  if (topThree.length === 0) return null;

  return (
    <div className="mb-14 md:mb-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <FiAward size={20} />
            </span>
            Bảng Xếp Hạng Độc Giả (Top Charts)
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Những tựa sách được tìm đọc và đặt mua nhiều nhất tuần này
          </p>
        </div>
        <Link
          href="/books?sort=best-seller"
          className="text-xs sm:text-sm font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors group"
        >
          <span>Xem trọn BXH</span>
          <FiArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Podium Grid (Top 1, 2, 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {topThree.map((book, idx) => {
          const medal = MEDAL_STYLES[idx] || MEDAL_STYLES[0];
          return (
            <Link
              key={book._id || idx}
              href={`/books/detail/${book.slug}`}
              className={`group relative rounded-2xl p-5 sm:p-6 bg-gradient-to-b ${medal.bg} border ${medal.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between`}
            >
              {/* Massive Stylized Rank Number in Background */}
              <div
                className={`absolute top-2 right-4 text-6xl sm:text-7xl font-black ${medal.textColor} opacity-20 pointer-events-none select-none font-mono`}
              >
                {medal.rank}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full shadow-xs ${medal.badgeBg}`}
                  >
                    <FiAward size={13} />
                    <span>Top {idx + 1}</span>
                  </span>
                  <span className="text-[11px] text-text-secondary font-medium">
                    {medal.label}
                  </span>
                </div>

                {/* Center Book Image */}
                <div className="relative aspect-[3/4] w-36 sm:w-40 mx-auto mb-4 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-500">
                  <Image
                    src={book.image || "/book-hive.webp"}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="text-center">
                  <h3 className="font-extrabold text-sm sm:text-base text-text-primary line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-1 mb-2">
                    {book.author}
                  </p>

                  <div className="flex items-center justify-center gap-3 text-xs text-text-muted mb-3">
                    <span className="flex items-center gap-1 text-warning font-bold">
                      <FiStar size={12} /> {book.reviews > 0 && book.rating > 0 ? Number(book.rating).toFixed(1) : "Chưa đánh giá"}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-text-secondary">
                      Đã bán {(book.soldCount || 0).toLocaleString("vi-VN")} cuốn
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Price & Action */}
              <div className="pt-3 border-t border-border-light flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-text-muted">Giá niêm yết</p>
                  <p className="text-sm sm:text-base font-extrabold text-primary">
                    {book.priceBuy ? book.priceBuy.toLocaleString("vi-VN") + "đ" : "Liên hệ"}
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-primary group-hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 transition-colors">
                  <span>Chi tiết</span>
                  <FiArrowRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
