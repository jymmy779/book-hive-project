"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Book } from "@/app/interfaces/book.interface";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import {
  FiArrowRight,
  FiShoppingCart,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useCart } from "@/contexts/CartContext";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Helper to extract the most vibrant dominant color from an image URL
const extractVibrantColor = (
  imageUrl: string,
): Promise<[number, number, number]> => {
  return new Promise((resolve) => {
    if (!imageUrl || typeof window === "undefined") {
      return resolve([180, 45, 45]);
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    const timeout = setTimeout(() => {
      resolve([180, 45, 45]);
    }, 2500);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve([180, 45, 45]);

        canvas.width = 32;
        canvas.height = 32;
        ctx.drawImage(img, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;

        let maxScore = -1;
        let bestR = 180,
          bestG = 45,
          bestB = 45;

        let avgR = 0,
          avgG = 0,
          avgB = 0,
          validPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          const brightness = (r + g + b) / 3;

          // Skip pure black or blown-out white
          if (brightness < 25 || brightness > 240) continue;

          avgR += r;
          avgG += g;
          avgB += b;
          validPixels++;

          // Score based on color saturation and comfortable luminance
          const score =
            saturation * 2.0 +
            (brightness > 60 && brightness < 200 ? 1.0 : 0);

          if (score > maxScore) {
            maxScore = score;
            bestR = r;
            bestG = g;
            bestB = b;
          }
        }

        if (maxScore > 0.35) {
          resolve([bestR, bestG, bestB]);
        } else if (validPixels > 0) {
          resolve([
            Math.round(avgR / validPixels),
            Math.round(avgG / validPixels),
            Math.round(avgB / validPixels),
          ]);
        } else {
          resolve([180, 45, 45]);
        }
      } catch {
        resolve([180, 45, 45]);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve([180, 45, 45]);
    };
  });
};

export const HeroBookSlider = ({ books }: { books: Book[] }) => {
  const { addToCart } = useCart();
  const slideBooks = books.slice(0, 8);
  const [bookColors, setBookColors] = useState<
    Record<string, [number, number, number]>
  >({});

  // Dynamically extract dominant color for each book
  useEffect(() => {
    let isMounted = true;
    slideBooks.forEach((book) => {
      if (!book.image) return;
      extractVibrantColor(book.image).then((color) => {
        if (isMounted) {
          setBookColors((prev) => ({
            ...prev,
            [book._id]: color,
          }));
        }
      });
    });
    return () => {
      isMounted = false;
    };
  }, [slideBooks]);

  const handleQuickAdd = (book: Book, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      bookId: book._id,
      title: book.title,
      price: book.priceBuy,
      quantity: 1,
      image: book.image,
      slug: book.slug,
    });
  };

  if (slideBooks.length === 0) return null;

  return (
    <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl border border-border text-white group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={700}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{
          nextEl: ".hero-swiper-next",
          prevEl: ".hero-swiper-prev",
        }}
        loop={slideBooks.length > 1}
        grabCursor={true}
        className="w-full"
      >
        {slideBooks.map((book, index) => {
          // Dynamic RGB color for the current book (defaults to rich crimson red if pending)
          const [r, g, b] = bookColors[book._id] || [190, 40, 40];

          return (
            <SwiperSlide key={book._id || index} className="w-full relative !h-auto">
              {/* Dynamic Synchronized Colorful Backdrop */}
              <div
                className="relative h-full min-h-[470px] sm:min-h-[500px] md:min-h-[530px] flex items-center p-6 sm:p-10 md:p-14 lg:p-16 transition-colors duration-700"
                style={{
                  backgroundColor: `rgb(${Math.round(r * 0.18)}, ${Math.round(
                    g * 0.18,
                  )}, ${Math.round(b * 0.18)})`,
                  backgroundImage: `
                    radial-gradient(ellipse at 78% 45%, rgba(${r}, ${g}, ${b}, 0.82) 0%, rgba(${r}, ${g}, ${b}, 0.45) 45%, rgba(${Math.round(r * 0.15)}, ${Math.round(g * 0.15)}, ${Math.round(b * 0.15)}, 0.95) 85%),
                    radial-gradient(ellipse at 15% 85%, rgba(${r}, ${g}, ${b}, 0.35) 0%, transparent 60%)
                  `,
                }}
              >
                {/* Extra blurred artwork layer for authentic texture */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                  <Image
                    src={book.image || "/book-hive.webp"}
                    alt=""
                    fill
                    priority={index === 0}
                    className="object-cover scale-125 blur-3xl opacity-30 saturate-200 contrast-125"
                    aria-hidden="true"
                  />
                  {/* Subtle left gradient vignette for high text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                </div>

                {/* Main Content Grid */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center w-full max-w-6xl mx-auto">
                  {/* Left Book Info */}
                  <div className="md:col-span-7 flex flex-col justify-center text-left">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-xs">
                        <HiSparkles size={13} />
                        <span>Sách Mới Phát Hành</span>
                      </span>
                      <span className="text-xs text-amber-200/90 font-medium">
                        #{index + 1} của tuần
                      </span>
                      {book.category_name && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 text-slate-100 border border-white/20 backdrop-blur-xs">
                          {book.category_name}
                        </span>
                      )}
                    </div>

                    {/* Book Title */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-3 drop-shadow-md line-clamp-2">
                      {book.title}
                    </h2>

                    {/* Author & Star Rating */}
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-200 mb-4 flex-wrap">
                      <p>
                        Tác giả:{" "}
                        <span className="font-semibold text-white">
                          {book.author || "Nhiều tác giả"}
                        </span>
                      </p>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <FiStar size={14} className="fill-amber-400" />
                        <span>
                          {book.reviews > 0 && book.rating > 0
                            ? Number(book.rating).toFixed(1)
                            : "5.0"}
                        </span>
                        <span className="text-slate-300 font-normal">
                          ({book.reviews ?? 0} đánh giá)
                        </span>
                      </div>
                    </div>

                    {/* Short Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-6 line-clamp-2 sm:line-clamp-3 max-w-xl drop-shadow-xs">
                      {book.description
                        ? book.description
                            .replace(/<[^>]*>?/gm, "")
                            .slice(0, 160) + "..."
                        : "Tác phẩm được tuyển chọn công phu, mở ra góc nhìn sâu sắc và khơi nguồn cảm hứng cho độc giả yêu sách."}
                    </p>

                    {/* Price & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="mr-2">
                        <p className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
                          Giá phát hành
                        </p>
                        <p className="text-xl sm:text-2xl font-black text-amber-300">
                          {book.priceBuy
                            ? `${book.priceBuy.toLocaleString("vi-VN")}đ`
                            : "Liên hệ"}
                        </p>
                      </div>

                      <Link
                        href={`/books/detail/${book.slug}`}
                        className="px-5 sm:px-7 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <span>Xem chi tiết</span>
                        <FiArrowRight size={15} />
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(book, e)}
                        className="px-4 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                        title="Thêm nhanh vào giỏ"
                      >
                        <FiShoppingCart size={16} />
                        <span className="hidden sm:inline">Thêm vào giỏ</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Book Cover (3D Art with Synchronized Halo) */}
                  <div className="md:col-span-5 flex justify-center md:justify-end">
                    <div className="relative">
                      {/* Dynamic Color Halo behind the Book Cover */}
                      <div
                        className="absolute -inset-4 rounded-3xl blur-2xl opacity-75 transition-all duration-700 pointer-events-none"
                        style={{
                          backgroundColor: `rgba(${r}, ${g}, ${b}, 0.85)`,
                        }}
                      />

                      <div className="relative aspect-[3/4] w-48 sm:w-56 md:w-64 lg:w-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 group-hover:scale-105 transition-transform duration-500 bg-slate-900">
                        <Image
                          src={book.image || "/book-hive.webp"}
                          alt={book.title}
                          fill
                          priority={index === 0}
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation Arrows */}
      <button
        type="button"
        className="hero-swiper-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-amber-400 hover:text-slate-950 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer hidden sm:flex"
        aria-label="Previous slide"
      >
        <FiChevronLeft size={20} />
      </button>
      <button
        type="button"
        className="hero-swiper-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-amber-400 hover:text-slate-950 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer hidden sm:flex"
        aria-label="Next slide"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
};
