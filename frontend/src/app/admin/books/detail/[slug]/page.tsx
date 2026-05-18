"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import DOMPurify from "dompurify";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import ConditionalRender from "@/app/components/Auth/ConditionalRender/ConditionalRender";
import Image from "next/image";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const accessToken = localStorage.getItem("accessToken_admin");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/books/detail/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          },
        );
        setBook(res.data.book);
      } catch (err) {
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug]);

  return (
    <PrivateRoute permission="view_books">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-gray-500">Đang tải...</div>
        </div>
      ) : !book ? (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 relative">
          <BackButton className="absolute top-2 left-8 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />
          <div className="text-xl text-gray-500">Không tìm thấy sách!</div>
        </div>
      ) : (
        <div className="min-h-screen  flex items-center justify-center relative">
          <BackButton className="absolute top-2 left-8 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />

          <div className="w-full mb-[48px] max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 bg-transparent">
            <div className="bg-white rounded-2xl p-10 text-center shadow-md flex flex-col items-center justify-center">
              {book.image && book.image !== "" ? (
                <Image
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                  width={400}
                  height={400}
                />
              ) : (
                <div className="text-8xl md:text-[128px] mb-6">📚</div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-3 text-primary">
                {book.title}
              </h1>
              <p className="text-[17.6px] text-slate-400 mb-2">
                Tác giả: {book.author}
              </p>
              <p className="text-base text-slate-400 mb-6">
                Thể loại: {book.category_name}
              </p>
              <p
                className="text-base text-slate-800 mb-8 leading-relaxed"
                style={{ maxHeight: 120, overflowY: "auto" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(book.description),
                }}
              ></p>
              <div className="bg-white rounded-xl p-6 mb-6 shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base text-slate-800">Giá mua:</span>
                  <span className="text-2xl font-bold text-secondary1">
                    {book.priceBuy
                      ? book.priceBuy.toLocaleString("vi-VN") + "đ"
                      : "Liên hệ"}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <ConditionalRender permission="edit_book">
                  <button
                    className="flex-1 py-4 font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer rounded-xl"
                    onClick={() =>
                      router.push(`/${ADMIN_PREFIX}/books/edit/${book.slug}`)
                    }
                  >
                    Chỉnh sửa
                  </button>
                </ConditionalRender>
              </div>
            </div>
          </div>
        </div>
      )}
    </PrivateRoute>
  );
}
