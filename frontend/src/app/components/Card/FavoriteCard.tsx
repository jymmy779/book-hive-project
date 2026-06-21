import Link from "next/link";
import { FiBook, FiArrowRight } from "react-icons/fi";
import { Book } from "@/app/interfaces/book.interface";
import Image from "next/image";
import { AiOutlineDelete } from "react-icons/ai";

interface FavoriteCardProps {
  book: Book;
  onRemove?: (bookId: string) => void;
}

export const FavoriteCard = ({ book, onRemove }: FavoriteCardProps) => (
  <div className="relative group h-full">
    <Link
      href={`/books/detail/${book.slug}`}
      className="block h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row h-full">
        <div className="relative w-full h-[200px] md:w-[180px] md:h-auto bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
          {book.image ? (
            <Image
              width={400}
              height={400}
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-4xl md:text-5xl"><FiBook /></div>
          )}
        </div>

        <div className="flex-1 flex flex-col p-3 md:p-5">
          <div className="mb-2">
            <h3 className="font-bold text-sm md:text-lg text-primary mb-1 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-xs md:text-sm text-secondary2 line-clamp-1 mb-2">
              {book.author}
            </p>
            <div className="hidden md:block text-xs text-gray-400 line-clamp-2 mb-2">
              Sách chất lượng cao từ BookHive...
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 border-dashed">
            <span className="text-base md:text-lg font-bold text-secondary1">
              {book.priceBuy
                ? book.priceBuy.toLocaleString("vi-VN") + "đ"
                : "Liên hệ"}
            </span>
            <span className="text-primary text-lg md:text-xl transition-transform duration-300 group-hover:translate-x-1">
              <FiArrowRight />
            </span>
          </div>
        </div>
      </div>
    </Link>

    {onRemove && (
      <button
        className="absolute top-2 right-2 z-20 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-sm border border-red-100 hover:bg-red-500 hover:text-white hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
        title="Xóa khỏi yêu thích"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(book._id);
        }}
      >
        <AiOutlineDelete size={18} className="md:w-5 md:h-5" />
      </button>
    )}
  </div>
);
