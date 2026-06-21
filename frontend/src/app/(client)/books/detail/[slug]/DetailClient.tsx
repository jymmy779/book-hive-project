"use client";

import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import { ToastContainer, toast } from "react-toastify";
import DOMPurify from "dompurify";
import { useCart } from "@/contexts/CartContext";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { useState } from "react";
import { Book } from "@/app/interfaces/book.interface";
import Image from "next/image";
import ReviewForm from "@/app/components/Form/ReviewForm/ReviewForm";
import ReviewList from "@/app/components/ReviewList/ReviewList";

type DetailClientProps = {
  book: Book;
};

export default function DetailClient({ book }: DetailClientProps) {
  const { addToCart } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("accessToken_user");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBuyNow = () => {
    if (!book) return;
    addToCart({
      bookId: book._id,
      title: book.title,
      price: book.priceBuy,
      quantity: 1,
      image: book.image,
      slug: book.slug,
    } as any);
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <>
      <div className="py-6 md:py-12 relative px-4 md:px-0">
        <BackButton className="absolute top-0 left-4 md:-top-4 md:left-20 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer z-10" />

        <div className="max-w-4xl mx-auto mt-12 md:mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-12">
            <div className="bg-white rounded-2xl p-6 md:p-10 text-center shadow flex flex-col items-center justify-center">
              {book.image && book.image !== "" ? (
                <Image
                  src={book.image}
                  alt={book.title}
                  width={400}
                  height={400}
                  className="w-full h-auto max-h-[400px] object-contain rounded-lg mb-6"
                />
              ) : (
                <div className="text-8xl md:text-[128px] mb-6 flex items-center justify-center text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => {
                    const fillPercentage = book.rating - i;
                    if (fillPercentage >= 1) {
                      return (
                        <span
                          key={i}
                          className="text-yellow-400 text-l md:text-xl"
                        >
                          <FaStar />
                        </span>
                      );
                    } else if (fillPercentage > 0) {
                      return (
                        <span
                          key={i}
                          className="text-yellow-400 text-l md:text-xl"
                        >
                          <FaStarHalfAlt />
                        </span>
                      );
                    } else {
                      return (
                        <span
                          key={i}
                          className="text-gray-300 text-l md:text-xl"
                        >
                          <FaStar />
                        </span>
                      );
                    }
                  })}
                </div>
                <span className="text-lg md:text-xl font-bold text-slate-800">
                  {book.rating}
                </span>
                <span className="text-sm md:text-base text-slate-400">
                  ({book.reviews ?? 0} đánh giá)
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 text-slate-800">
                {book.title}
              </h1>
              <p className="text-base md:text-[17.6px] text-slate-400 mb-2">
                Tác giả: {book.author}
              </p>
              <p className="text-sm md:text-base text-slate-400 mb-6">
                Thể loại: {book.category_name}
              </p>
              <p
                className="text-sm md:text-base text-slate-800 mb-8 leading-relaxed"
                style={{ maxHeight: 120, overflowY: "auto" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(book.description),
                }}
              ></p>
              <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm md:text-base text-slate-800">
                    Giá mua:
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-secondary1">
                    {book.priceBuy
                      ? `${book.priceBuy.toLocaleString("vi-VN")}đ`
                      : "Liên hệ"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 md:py-4 font-semibold cursor-pointer bg-secondary1 text-white rounded-xl text-sm md:text-base hover:bg-blue-700 transition-colors duration-200"
                >
                  <FiShoppingCart className="inline mr-2" /> Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-8 shadow">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-slate-800">
              Đánh giá &amp; Nhận xét
            </h2>

            {token ? (
              <ReviewForm
                bookId={book._id}
                token={token}
                onReviewSubmitted={setRefreshTrigger}
                refreshTrigger={refreshTrigger}
              />
            ) : (
              <div className="bg-yellow-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8 border border-yellow-200 text-center">
                <p className="text-slate-700 text-sm md:text-base">
                  Vui lòng{" "}
                  <a
                    href="/auth/login"
                    className="font-semibold text-secondary1 hover:underline"
                  >
                    đăng nhập
                  </a>{" "}
                  để viết đánh giá
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
        </div>
      </div>
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
}
