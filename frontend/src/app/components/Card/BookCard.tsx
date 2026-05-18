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
        <div className="bg-[#ffff] rounded-2xl p-3 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-300 hover:-translate-y-2 relative h-full flex flex-col">
          {featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">
              Nổi bật
            </div>
          )}
          {newest && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">
              Mới nhất
            </div>
          )}
          {bestSeller && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">
              Bán chạy
            </div>
          )}
          <div className="mb-2 h-[140px] sm:h-[160px] md:h-[190px] object-cover shrink-0">
            <Image
              src={book.image || "/book-hive.jpg"}
              className="w-full h-full object-cover rounded-[10px]"
              alt={book.title}
              loading="lazy"
              width={400}
              height={400}
            />
          </div>

          <div className="flex flex-col flex-1">
            <h3 className="text-left text-sm sm:text-base md:text-[17px] line-clamp-1 min-h-[20px] md:min-h-[28px] font-[700] mb-1 md:mb-[8px] text-primary">
              {book.title}
            </h3>
            <p className="text-xs sm:text-sm md:text-[14.4px] text-secondary2 text-left mb-1 md:mb-[8px] line-clamp-1">
              {book.author}
            </p>
            <div className="flex justify-between items-center gap-2 mb-2 md:mb-3">
              <div className="flex items-center gap-1">
                {book.rating ? (
                  <span className="text-yellow-400 text-sm md:text-[16px]">
                    <FaStar />
                  </span>
                ) : (
                  <span className="text-gray-300 text-sm md:text-[16px]">
                    <FaStar />
                  </span>
                )}
                <span className="text-xs md:text-[14.4px] text-primary font-semibold">
                  {book.rating ? book.rating : "Chưa có đánh giá"}
                </span>
              </div>
              <span className="text-xs md:text-[13.6px] text-secondary2 bg-gray-100 px-2 py-1 rounded-full">
                Đã bán{" "}
                {book.soldCount >= 1000
                  ? (book.soldCount / 1000).toFixed(1) + "k"
                  : book.soldCount}
              </span>
            </div>
            <div className="flex justify-between items-center mt-auto pt-2">
              <div>
                <p className="text-base md:text-[17.6px] font-bold text-secondary1 m-0">
                  {book.priceBuy
                    ? book.priceBuy.toLocaleString("vi-VN") + "đ"
                    : "Liên hệ"}
                </p>
                <p className="text-[10px] md:text-[13.6px] text-secondary2 mt-1 mb-0" />
              </div>
              <span className="text-base md:text-[20px] text-primary">
                <FaArrowRightLong />
              </span>
            </div>
          </div>
        </div>
      </Link>
      {isLoggedIn && (
        <button
          className="absolute cursor-pointer top-2 left-2 md:top-6 md:left-6 z-20 bg-white/80 rounded-full p-1 hover:scale-110 transition-all shadow-sm"
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
              size={24}
              className="text-red-500 transition-all duration-200 md:w-[28px] md:h-[28px]"
            />
          ) : (
            <AiOutlineHeart
              size={24}
              className="text-gray-400 transition-all duration-200 md:w-[28px] md:h-[28px]"
            />
          )}
        </button>
      )}
    </div>
  );
};
