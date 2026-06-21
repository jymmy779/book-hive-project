import { Book } from "@/app/interfaces/book.interface";
import Image from "next/image";
import Link from "next/link";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaStar } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";

interface BookCardProps {
  book: Book;
  featured?: boolean;
  newest?: boolean;
  isFavorite?: boolean;
  bestSeller?: boolean;
  onToggleFavorite?: (bookId: string, next: boolean) => void;
  isLoggedIn: boolean;
}

export const BookCard = ({
  book,
  featured,
  newest,
  isFavorite = false,
  bestSeller,
  isLoggedIn,
  onToggleFavorite,
}: BookCardProps) => {
  return (
    <div className="relative group h-full">
      <Link href={`/books/detail/${book.slug}`} className="block h-full">
        <div className="bg-surface rounded-xl p-3 md:p-4 shadow-sm border border-border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md relative h-full flex flex-col">
          {featured && (
            <div className="absolute top-2 right-2 bg-warning text-white text-[10px] font-semibold px-2.5 py-1 rounded-md z-10 shadow-sm">
              Nổi bật
            </div>
          )}
          {newest && (
            <div className="absolute top-2 right-2 bg-info text-white text-[10px] font-semibold px-2.5 py-1 rounded-md z-10 shadow-sm">
              Mới nhất
            </div>
          )}
          {bestSeller && (
            <div className="absolute top-2 right-2 bg-error text-white text-[10px] font-semibold px-2.5 py-1 rounded-md z-10 shadow-sm">
              Bán chạy
            </div>
          )}
          <div className="mb-2 h-[140px] sm:h-[160px] md:h-[190px] shrink-0">
            <Image
              src={book.image || "/book-hive.jpg"}
              className="w-full h-full object-cover rounded-lg"
              alt={book.title}
              loading="lazy"
              width={400}
              height={400}
            />
          </div>

          <div className="flex flex-col flex-1">
            <h3 className="text-left text-sm md:text-base line-clamp-1 font-bold mb-1 text-text-primary">
              {book.title}
            </h3>
            <p className="text-xs md:text-sm text-text-secondary text-left mb-1 line-clamp-1">
              {book.author}
            </p>
            <div className="flex justify-between items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <span className={`text-sm ${book.rating ? "text-warning" : "text-gray-300"}`}>
                  <FaStar />
                </span>
                <span className="text-xs font-semibold text-text-secondary">
                  {book.rating || "Chưa có đánh giá"}
                </span>
              </div>
              <span className="text-[11px] text-text-muted bg-surface-secondary px-2 py-0.5 rounded-full">
                Đã bán{" "}
                {book.soldCount >= 1000
                  ? (book.soldCount / 1000).toFixed(1) + "k"
                  : book.soldCount}
              </span>
            </div>
            <div className="flex justify-between items-center mt-auto pt-2 border-t border-border-light">
              <div>
                <p className="text-sm md:text-base font-bold text-accent">
                  {book.priceBuy
                    ? book.priceBuy.toLocaleString("vi-VN") + "đ"
                    : "Liên hệ"}
                </p>
              </div>
              <span className="text-text-muted group-hover:text-accent transition-colors duration-200">
                <FaArrowRightLong />
              </span>
            </div>
          </div>
        </div>
      </Link>
      {isLoggedIn && (
        <button
          className="absolute cursor-pointer top-2 left-2 md:top-4 md:left-4 z-20 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:scale-110 transition-all shadow-sm"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite?.(book._id, !isFavorite);
          }}
          aria-label="Yêu thích"
        >
          {isFavorite ? (
            <AiFillHeart
              size={18}
              className="text-error transition-all duration-200"
            />
          ) : (
            <AiOutlineHeart
              size={18}
              className="text-text-muted transition-all duration-200"
            />
          )}
        </button>
      )}
    </div>
  );
};
