"use client";

import { Book } from "@/app/interfaces/book.interface";
import Image from "next/image";
import Link from "next/link";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaStar } from "react-icons/fa";
import { FiShoppingCart, FiEye } from "react-icons/fi";
import { memo } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-toastify";

interface BookCardProps {
  book: Book;
  featured?: boolean;
  newest?: boolean;
  isFavorite?: boolean;
  bestSeller?: boolean;
  onToggleFavorite?: (bookId: string, next: boolean) => void;
  isLoggedIn: boolean;
  discountPercent?: number;
}

export const BookCard = memo(
  ({
    book,
    featured,
    newest,
    isFavorite = false,
    bestSeller,
    isLoggedIn,
    onToggleFavorite,
    discountPercent,
  }: BookCardProps) => {
    const { addToCart } = useCart();
    const salePrice = discountPercent && book.priceBuy
      ? Math.round(book.priceBuy * (1 - discountPercent / 100))
      : book.priceBuy;

    const handleQuickAdd = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      addToCart({
        bookId: book._id,
        title: book.title,
        price: salePrice,
        quantity: 1,
        image: book.image,
        slug: book.slug,
      });

      toast.success(`Đã thêm "${book.title}" vào giỏ hàng!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    };

    return (
      <div className="relative group h-full">
        <Link href={`/books/detail/${book.slug}`} className="block h-full">
          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-2.5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:rounded-3xl sm:p-4 motion-reduce:transform-none motion-reduce:transition-none">
            {/* Top Badges */}
            <div className="absolute right-2.5 top-2.5 z-20 flex flex-col items-end gap-1">
              {discountPercent && (
                <span className="rounded-full bg-rose-700 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                  -{discountPercent}%
                </span>
              )}
              {featured && (
                <span className="rounded-full bg-amber-700 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                  Nổi bật
                </span>
              )}
              {newest && (
                <span className="rounded-full bg-sky-800 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                  Mới
                </span>
              )}
              {bestSeller && (
                <span className="rounded-full bg-rose-800 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                  Hot
                </span>
              )}
            </div>

            {/* Book Image with 3/4 aspect ratio */}
            <div className="relative mb-3 aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-secondary shadow-sm transition-shadow duration-300 group-hover:shadow-md md:aspect-[3/4] sm:mb-4 sm:rounded-2xl">
              <Image
                src={book.image || "/book-hive.webp"}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                alt={book.title}
                loading="lazy"
                width={360}
                height={480}
              />

              {/* Quick Action Overlay on Desktop Hover */}
              <div className="absolute bottom-2 right-2 z-20 flex items-center justify-center transition-all duration-200 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus-within:translate-y-0 sm:focus-within:opacity-100">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98]"
                  title="Thêm nhanh vào giỏ"
                  aria-label={`Thêm ${book.title} vào giỏ hàng`}
                >
                  <FiShoppingCart size={17} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Book Meta Details */}
            <div className="flex flex-col flex-1">
              <span className="mb-1 truncate text-[10px] font-semibold uppercase tracking-wide text-accent-hover sm:text-[11px]">
                {book.category_name || "Sách chọn lọc"}
              </span>

              <h3 className="mb-1 min-h-8 line-clamp-2 text-xs font-semibold leading-4 text-text-primary transition-colors group-hover:text-primary sm:min-h-11 sm:text-base sm:leading-snug">
                {book.title}
              </h3>

              <p className="mb-2 min-h-4 truncate text-[11px] text-text-secondary sm:mb-3 sm:min-h-5 sm:text-sm">
                {book.author || "Nhiều tác giả"}
              </p>

              {/* Rating and Sold count */}
              <div className="mb-2 flex items-center justify-between gap-1 text-[10px] sm:mb-3 sm:text-xs">
                <div className="flex items-center gap-1 text-warning">
                  <FaStar size={11} />
                  <span className="font-bold text-text-primary">
                    {book.reviews > 0 && book.rating > 0 ? Number(book.rating).toFixed(1) : "Chưa đánh giá"}
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-md bg-surface-secondary px-1.5 py-0.5 font-medium text-text-secondary sm:px-2 sm:py-1">
                  Đã bán{" "}
                  {book.soldCount >= 1000
                    ? (book.soldCount / 1000).toFixed(1) + "k"
                    : book.soldCount || 0}
                </span>
              </div>

              {/* Price Row */}
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-light pt-2 sm:pt-3">
                <div className="flex min-h-9 flex-col justify-end sm:min-h-10">
                  {discountPercent && book.priceBuy ? (
                    <>
                      <p className="text-xs font-bold text-rose-700 sm:text-base">
                        {salePrice.toLocaleString("vi-VN")} {"\u20ab"}
                      </p>
                      <p className="text-[10px] text-text-muted line-through sm:text-xs">
                        {book.priceBuy.toLocaleString("vi-VN")} {"\u20ab"}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs font-bold text-primary sm:text-base">
                      {book.priceBuy
                        ? book.priceBuy.toLocaleString("vi-VN") + "\u20ab"
                        : "Li\u00ean h\u1ec7"}
                    </p>
                  )}
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-white sm:h-9 sm:w-9">
                  <FiEye size={13} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Favorite Heart Button */}
        {isLoggedIn && (
          <button
            className="absolute cursor-pointer left-2.5 top-2.5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/95 shadow-sm backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.(book._id, !isFavorite);
            }}
            aria-label={isFavorite ? `Bỏ yêu thích ${book.title}` : `Yêu thích ${book.title}`}
            aria-pressed={isFavorite}
          >
            {isFavorite ? (
              <AiFillHeart size={16} className="text-error" />
            ) : (
              <AiOutlineHeart size={16} className="text-text-muted" />
            )}
          </button>
        )}
      </div>
    );
  },
);

BookCard.displayName = "BookCard";
