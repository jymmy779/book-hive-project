"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import { FiZap, FiArrowRight, FiClock } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

export const FlashSaleSection = ({
  books,
  isLoggedIn,
  favoriteIdsSet,
  onToggleFavorite,
}: {
  books: Book[];
  isLoggedIn: boolean;
  favoriteIdsSet: Set<string>;
  onToggleFavorite: (id: string, next: boolean) => void;
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const saleBooks = books
    .filter(
      (book) =>
        book.flashSaleEndAt && new Date(book.flashSaleEndAt).getTime() > now,
    )
    .slice(0, 6);
  if (saleBooks.length === 0) return null;

  const nextEndAt = Math.min(
    ...saleBooks.map((book) => new Date(book.flashSaleEndAt!).getTime()),
  );
  const secondsLeft = Math.max(0, Math.floor((nextEndAt - now) / 1000));
  const timeLeft = {
    hours: Math.floor(secondsLeft / 3600),
    minutes: Math.floor((secondsLeft % 3600) / 60),
    seconds: secondsLeft % 60,
  };

  return (
    <div className="mb-14 md:mb-18 rounded-3xl p-2 sm:p-4 md:p-6 bg-gradient-to-br from-[#fef3c7]/60 via-white to-[#f5f0ea] border border-amber-200 shadow-sm relative overflow-hidden">
      {/* Decorative top ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
            <FiZap size={22} className="" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight">
                Deal Chớp Nhoáng
              </h2>
              <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Flash Sale
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Ưu đãi có thời hạn, được quản lý trực tiếp từ trang quản trị.
            </p>
          </div>
        </div>

        {/* Countdown Box */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-xs">
          <FiClock className="text-amber-600 text-sm" />
          <span className="text-xs font-semibold text-text-secondary">
            Kết thúc sau:
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-xs text-white">
            <span className="bg-amber-700 px-2 py-1 rounded-md min-w-[26px] text-center">
              {formatNumber(timeLeft.hours)}
            </span>
            <span className="text-amber-700 font-bold">:</span>
            <span className="bg-amber-700 px-2 py-1 rounded-md min-w-[26px] text-center">
              {formatNumber(timeLeft.minutes)}
            </span>
            <span className="text-amber-700 font-bold">:</span>
            <span className="bg-amber-700 px-2 py-1 rounded-md min-w-[26px] text-center">
              {formatNumber(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Swiper of Flash Sale Books */}
      <Swiper
        slidesPerView={2}
        spaceBetween={14}
        breakpoints={{
          768: { slidesPerView: 3, spaceBetween: 18 },
          1032: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 4, spaceBetween: 24 },
        }}
        freeMode={true}
        pagination={{ clickable: true, dynamicBullets: true }}
        modules={[FreeMode, Pagination]}
        className="mySwiper !pb-10"
      >
        {saleBooks.map((book, index) => {
          const discount = book.discountPercent || 0;
          const soldCount = Math.max(0, Number(book.soldCount) || 0);
          const inStock =
            typeof book.inStock === "number"
              ? Math.max(0, book.inStock)
              : undefined;
          const trackedUnits = inStock === undefined ? 0 : soldCount + inStock;
          const soldPercent =
            trackedUnits > 0
              ? Math.min(100, Math.round((soldCount / trackedUnits) * 100))
              : 0;

          return (
            <SwiperSlide key={book._id || index} className="h-auto">
              <div className="flex flex-col h-full">
                <BookCard
                  book={book}
                  isLoggedIn={isLoggedIn}
                  isFavorite={favoriteIdsSet.has(book._id)}
                  onToggleFavorite={onToggleFavorite}
                  discountPercent={discount}
                />
                <div className="mt-2 rounded-xl border border-rose-100 bg-white px-3 py-2 shadow-xs">
                  {inStock === undefined ? (
                    <p className="text-[11px] font-semibold text-rose-600">
                      Ch\u01b0a c\u1eadp nh\u1eadt t\u1ed3n kho
                    </p>
                  ) : (
                    <>
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold text-rose-700">
                        <span>Đã bán {soldCount.toLocaleString("vi-VN")}</span>
                        <span>
                          {inStock > 0
                            ? `Còn ${inStock.toLocaleString("vi-VN")}`
                            : "Tạm hết hàng"}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Tỷ lệ bán của ${book.title}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={soldPercent}
                        className="h-2 overflow-hidden rounded-full bg-rose-100"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-[width] duration-500"
                          style={{ width: `${soldPercent}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};
