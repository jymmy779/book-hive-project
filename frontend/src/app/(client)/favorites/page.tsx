"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import Pagination from "@/app/components/Pagination/Pagination";
import { FavoriteCard } from "@/app/components/Card/FavoriteCard";
import { FavoriteCardSkeleton } from "@/app/components/Skeleton/FavoriteCardSkeleton";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { usePageChange } from "@/app/utils/usePageChange";
import { toast, ToastContainer } from "react-toastify";
import { FiHeart, FiBookOpen } from "react-icons/fi";
import Link from "next/link";
import { ScrollReveal } from "@/app/components/Animation/ScrollReveal";
import { useUser } from "@/contexts/UserContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Favorite {
  _id: string;
  bookId: Book;
}

const limit = 6;

export default function FavoritesPage() {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const [sortValue, setSortValue] = useState("");
  const requestSeqRef = useRef<number>(0);
  const { user } = useUser();

  const fetchFavorites = async () => {
    setLoading(true);
    const currentSeq = ++requestSeqRef.current;
    try {
      const res = await axios.get(
        `${API_URL}/api/v1/favorites?page=${page}&limit=${limit}`,
        {
          headers: {
          },
        },
      );
      if (currentSeq === requestSeqRef.current) {
        setFavorites(res.data.favorites || []);
        setTotal(res.data.total || 0);
        setLoading(false);
      }
    } catch (err) {
      if (currentSeq === requestSeqRef.current) {
        setFavorites([]);
        setTotal(0);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [page, user]);

  useSyncParams(setPage, setSortValue, setSort);
  const handlePageChange = usePageChange("favorites", setPage, "client");

  const handleRemoveFavorite = async (bookId: string) => {
    if (!user) return;
    try {
      await axios.post(
        `${API_URL}/api/v1/favorites/remove`,
        { bookId },
      );
      toast.success("Đã xóa khỏi mục yêu thích");
      setTimeout(() => {
        fetchFavorites();
      }, 1000);
    } catch (err) {
      toast.error("Lỗi xóa khỏi mục yêu thích");
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5]">
        {/* Page Header Banner */}
        <ScrollReveal direction="down" distance={16} duration={0.4}>
          <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] py-10 px-4 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, #d97706 0%, transparent 60%), radial-gradient(circle at 80% 20%, #10b981 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10 container mx-auto max-w-4xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <FiHeart className="text-amber-300" size={22} />
              </div>
              <div>
                <p className="text-amber-300 text-xs font-semibold uppercase tracking-widest mb-0.5">
                  Thư viện cá nhân
                </p>
                <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Sách Yêu Thích
                </h1>
              </div>
              {total > 0 && (
                <span className="ml-auto bg-white/15 backdrop-blur-sm text-white text-sm font-bold px-4 py-1.5 rounded-full border border-white/20">
                  {total} cuốn
                </span>
              )}
            </div>
          </div>
        </ScrollReveal>

        <div className="container mx-auto max-w-4xl px-4 py-8 flex-1 flex flex-col">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: limit }).map((_, i) => (
                <FavoriteCardSkeleton key={i} />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            /* Empty State */
            <ScrollReveal direction="up" distance={20} duration={0.4}>
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#064e3b]/8 flex items-center justify-center mb-5">
                  <FiBookOpen className="text-[#064e3b]/40" size={36} />
                </div>
                <h3 className="text-xl font-bold text-[#1f2937] mb-2">
                  Chưa có sách yêu thích
                </h3>
                <p className="text-sm text-[#6b7280] max-w-xs mb-6">
                  Hãy khám phá kho sách và thêm những cuốn sách bạn yêu thích vào
                  đây để dễ dàng tìm lại sau.
                </p>
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#064e3b] text-white text-sm font-semibold rounded-xl hover:bg-[#065f46] transition-all shadow-sm"
                >
                  <FiBookOpen size={16} />
                  Khám phá sách ngay
                </Link>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal direction="up" distance={20} duration={0.4}>
              <div className="space-y-4">
                {favorites.map((fav) => (
                  <FavoriteCard
                    key={fav._id}
                    book={fav.bookId}
                    onRemove={handleRemoveFavorite}
                  />
                ))}
              </div>
              <div className="mt-8">
                <Pagination
                  page={page}
                  total={total}
                  limit={limit}
                  onPageChange={handlePageChange}
                />
              </div>
            </ScrollReveal>
          )}
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
