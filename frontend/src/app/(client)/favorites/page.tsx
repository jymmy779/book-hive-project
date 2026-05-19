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

  const fetchFavorites = async () => {
    setLoading(true);
    const currentSeq = ++requestSeqRef.current;
    try {
      const token = localStorage.getItem("accessToken_user");
      const res = await axios.get(
        `${API_URL}/api/v1/favorites?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
  }, [page]);

  useSyncParams(setPage, setSortValue, setSort);
  const handlePageChange = usePageChange("favorites", setPage, "client");

  const handleRemoveFavorite = async (bookId: string) => {
    const token = localStorage.getItem("accessToken_user");
    if (!token) return;
    try {
      await axios.post(
        `${API_URL}/api/v1/favorites/remove`,
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } },
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
      <div className="min-h-[calc(100vh-64px-56px)] bg-[#f8fafc] py-6 md:py-8 flex flex-col">
        <div className="container mx-auto px-4 flex-1 flex flex-col">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-slate-800 text-center md:text-left">
            Sản phẩm yêu thích của bạn
          </h2>
          {loading ? (
            <div className="space-y-3 md:space-y-4">
              {Array.from({ length: limit }).map((_, i) => (
                <FavoriteCardSkeleton key={i} />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center text-gray-500 text-sm md:text-base">
              Bạn chưa thêm sản phẩm nào vào mục yêu thích.
            </div>
          ) : (
            <>
              <div className="space-y-3 md:space-y-4">
                {favorites.map((fav) => (
                  <FavoriteCard
                    key={fav._id}
                    book={fav.bookId}
                    onRemove={handleRemoveFavorite}
                  />
                ))}
              </div>
              <div className="mt-6 md:mt-8">
                <Pagination
                  page={page}
                  total={total}
                  limit={limit}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
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
