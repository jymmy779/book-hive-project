"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Book } from "@/app/interfaces/book.interface";
import {
  FiArrowRight,
  FiShoppingCart,
  FiStar,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useCart } from "@/contexts/CartContext";


const extractVibrantColor = (imageUrl: string): Promise<[number, number, number]> =>
  new Promise((resolve) => {
    if (!imageUrl || typeof window === "undefined") return resolve([180, 45, 45]);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    const timeout = setTimeout(() => resolve([180, 45, 45]), 2500);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve([180, 45, 45]);
        canvas.width = canvas.height = 32;
        ctx.drawImage(img, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;
        let best: [number, number, number] = [180, 45, 45];
        let bestScore = -1;
        let total: [number, number, number] = [0, 0, 0];
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const [r, g, b, a] = data.slice(i, i + 4);
          if (a < 128) continue;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const brightness = (r + g + b) / 3;
          if (brightness < 25 || brightness > 240) continue;
          total = [total[0] + r, total[1] + g, total[2] + b];
          count++;
          const score = (max === 0 ? 0 : (max - min) / max) * 2 + (brightness > 60 && brightness < 200 ? 1 : 0);
          if (score > bestScore) {
            bestScore = score;
            best = [r, g, b];
          }
        }
        resolve(bestScore > 0.35 ? best : count ? total.map((value) => Math.round(value / count)) as [number, number, number] : [180, 45, 45]);
      } catch {
        resolve([180, 45, 45]);
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve([180, 45, 45]);
    };
  });

export const HeroBookSlider = ({ books }: { books: Book[] }) => {
  const { addToCart } = useCart();
  const slideBooks = books.slice(0, 8);
  const [activeIndex, setActiveIndex] = useState(0);
  const [bookColors, setBookColors] = useState<Record<string, [number, number, number]>>({});
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    slideBooks.forEach((book) => {
      if (!book.image || bookColors[book._id]) return;
      extractVibrantColor(book.image).then((color) => {
        if (isMounted) setBookColors((previous) => ({ ...previous, [book._id]: color }));
      });
    });
    return () => {
      isMounted = false;
    };
  }, [slideBooks, bookColors]);

  useEffect(() => {
    if (slideBooks.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideBooks.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slideBooks.length, activeIndex]);

  useEffect(() => {
    const activeItem = document.querySelector<HTMLElement>(
      `[data-hero-slide="${activeIndex}"] [data-hero-book-index="${activeIndex}"]`,
    );
    const list = activeItem?.parentElement;
    if (!activeItem || !list) return;

    const itemTop = activeItem.offsetTop;
    const itemBottom = itemTop + activeItem.offsetHeight;
    if (itemTop < list.scrollTop) {
      list.scrollTo({ top: itemTop, behavior: "smooth" });
    } else if (itemBottom > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: itemBottom - list.clientHeight, behavior: "smooth" });
    }
  }, [activeIndex]);

  const handleQuickAdd = (book: Book, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart({
      bookId: book._id,
      title: book.title,
      price: book.priceBuy,
      quantity: 1,
      image: book.image,
      slug: book.slug,
    });
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || slideBooks.length < 2) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      setActiveIndex((current) =>
        (current + (deltaX < 0 ? 1 : -1) + slideBooks.length) % slideBooks.length,
      );
    }
    setTouchStartX(null);
  };

  if (!slideBooks.length) return null;

  return (
    <div className="relative mb-12 overflow-hidden rounded-3xl border border-border bg-[#fffaf5] text-slate-900 shadow-xl">
      <div className="relative w-full">
        {slideBooks.map((book, index) => {
          const [r, g, b] = bookColors[book._id] || [190, 75, 30];
          const isActive = index === activeIndex;
          return (
            <div key={book._id || index} data-hero-slide={index} aria-hidden={!isActive} className={`transition-[opacity,transform] duration-500 ease-out ${isActive ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}>
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative min-h-[700px] overflow-hidden p-4 sm:min-h-[600px] sm:p-7 min-[1200px]:h-[560px] min-[1200px]:min-h-0 min-[1200px]:p-10"
                style={{
                  backgroundColor: "#fffaf5",
                  backgroundImage: `radial-gradient(ellipse at 78% 35%, rgba(${r}, ${g}, ${b}, 0.10), transparent 48%), linear-gradient(135deg, #fffaf5 0%, #fff 68%, #fff7ef 100%)`,
                }}
              >
                <div className="relative z-10 mx-auto grid min-h-0 max-w-7xl grid-cols-1 gap-4 sm:gap-5 min-[1200px]:h-full min-[1200px]:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
                  <aside className="order-2 hidden min-h-0 flex-col rounded-2xl border border-[#efe7df] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm min-[1200px]:flex min-[1200px]:h-full min-[1200px]:px-4 min-[1200px]:py-5">
                    <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#f0e9e2] pb-3">
                      <h3 className="text-sm font-bold text-slate-900 sm:text-base">Đang quan tâm</h3>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-800">Chọn sách</span>
                    </div>
                    <div className="hero-book-list flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 pb-1 md:overflow-x-hidden md:pb-0">
                      {slideBooks.map((item, itemIndex) => (
                        <button
                          key={item._id || itemIndex}
                          data-hero-book-index={itemIndex}
                          type="button"
                          onClick={() => {
                            setActiveIndex(itemIndex);
                          }}
                          aria-pressed={activeIndex === itemIndex}
                          className={`group flex w-full shrink-0 items-center gap-3 rounded-xl border p-2 text-left transition-colors ${activeIndex === itemIndex ? "border-amber-300 bg-amber-50 shadow-sm" : "border-transparent hover:border-[#efe7df] hover:bg-[#fcfaf8]"}`}
                        >
                          <span className="relative h-[68px] w-[48px] shrink-0 overflow-hidden rounded-md bg-slate-100 shadow-sm">
                            <Image src={item.image || "/book-hive.webp"} alt={item.title} fill sizes="48px" className="object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[9px] font-bold uppercase tracking-wide text-amber-800">{itemIndex === 0 ? "Sách nổi bật" : item.category_name || `Gợi ý #${itemIndex + 1}`}</span>
                            <span className="mt-1 line-clamp-1 block text-xs font-semibold leading-snug text-slate-900 sm:text-sm">{item.title}</span>
                            <span className="mt-1 block text-xs font-bold text-amber-800">{item.priceBuy ? `${item.priceBuy.toLocaleString("vi-VN")}đ` : "Liên hệ"}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <section className="relative order-1 flex min-h-[600px] min-w-0 flex-col overflow-hidden rounded-2xl bg-white/75 p-4 shadow-sm ring-1 ring-white/80 sm:min-h-[500px] sm:p-6 min-[1200px]:min-h-0 min-[1200px]:p-7 2xl:p-9">
                    <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.13)` }} />
                    <div className="relative z-10 grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:gap-6 md:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
                      <div className="order-2 min-w-0 text-left sm:order-1">
                        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700"><FiStar className="fill-amber-500 text-amber-500" /> {book.reviews > 0 && book.rating > 0 ? Number(book.rating).toFixed(1) : "5.0"} Đánh giá</span>
                          {book.category_name && <><span className="text-amber-800/40">•</span><span className="font-medium text-amber-800">{book.category_name}</span></>}
                        </div>
                        <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200/70">
                          <HiSparkles size={12} /> Được BookHive tuyển chọn
                        </span>
                        <h2 className="mb-1 line-clamp-2 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl md:text-4xl lg:text-5xl">{book.title}</h2>
                        <p className="mb-4 line-clamp-1 text-sm font-semibold text-slate-700 sm:text-base">Tác giả: {book.author || "Nhiều tác giả"}</p>
                        <p className="mb-5 line-clamp-2 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                          {book.description ? book.description.replace(/<[^>]*>?/gm, "").slice(0, 190) + "..." : "Khám phá tác phẩm được độc giả yêu thích và tuyển chọn dành riêng cho bạn."}
                        </p>

                        <div className="mb-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                          <span className="text-2xl font-black text-amber-800 sm:text-3xl">{book.priceBuy ? `${book.priceBuy.toLocaleString("vi-VN")}đ` : "Liên hệ"}</span>
                          <span className="mb-1 text-xs text-slate-500">Đã bán {(book.soldCount || 0).toLocaleString("vi-VN")} cuốn</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={(event) => handleQuickAdd(book, event)}
                            disabled={book.inStock === 0}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-3 sm:text-sm"
                          >
                            <FiShoppingCart size={15} /> Thêm vào giỏ
                          </button>
                          <Link href={`/books/detail/${book.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-[#f2ece6] px-4 py-2.5 text-xs font-semibold text-slate-900 transition hover:bg-[#e9dfd6] sm:px-5 sm:py-3 sm:text-sm">
                            Xem chi tiết <FiArrowRight size={15} />
                          </Link>
                        </div>
                      </div>

                      <Link href={`/books/detail/${book.slug}`} className="group relative order-1 mx-auto block w-[190px] sm:order-2 sm:w-[170px] md:w-[200px] lg:w-[230px]">
                        <div className="absolute -inset-5 rounded-[2rem] blur-2xl transition-opacity duration-500 group-hover:opacity-90" style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)` }} />
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-black/5 bg-slate-100 shadow-[0_22px_45px_-18px_rgba(15,23,42,0.45)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-1">
                          <Image src={book.image || "/book-hive.webp"} alt={book.title} fill priority={index === 0} sizes="(max-width: 640px) 145px, (max-width: 1024px) 200px, 230px" className="object-cover" />
                        </div>
                      </Link>
                    </div>

                    <div className="relative z-10 mt-2 md:mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#efe7df] pt-3 text-[10px] text-slate-600 sm:text-xs">
                      <span className="inline-flex items-center gap-1.5"><HiSparkles className="text-amber-700" />Giao sách nhanh chóng, đóng gói cẩn thận</span>
                    </div>
                  </section>
                </div>
                <div className="relative z-20 mt-8 flex items-center justify-center gap-2 min-[1200px]:hidden" aria-label="Chọn sách nổi bật">
                  {slideBooks.map((item, itemIndex) => (
                    <button
                      key={item._id || itemIndex}
                      type="button"
                      onClick={() => setActiveIndex(itemIndex)}
                      aria-label={`Hiển thị sách ${item.title}`}
                      aria-current={activeIndex === itemIndex ? "true" : undefined}
                      className={`h-2.5 rounded-full transition-all duration-300 ${activeIndex === itemIndex ? "w-7 bg-amber-800" : "w-2.5 bg-slate-300 hover:bg-amber-500"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
