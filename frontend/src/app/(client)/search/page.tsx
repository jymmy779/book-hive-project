"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import { Loading } from "@/app/components/Loading/Loading";
import Pagination from "@/app/components/Pagination/Pagination";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { useMemo, useRef } from "react";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { BookCardSkeleton } from "@/app/components/Skeleton/BookCardSkeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);
  const keyword = searchParams.get("keyWord") || "";
  const limit = parseInt(searchParams.get("limit") || "12");

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaging, setIsPaging] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const prevKeyword = useRef(keyword);
  const [sortValue, setSortValue] = useState("");
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const requestSeqRef = useRef<number>(0);

  const sortOptions = useMemo(
    () => [
      { value: "", label: "Sắp xếp" },
      { value: "title_asc", label: "Tên A-Z" },
      { value: "title_desc", label: "Tên Z-A" },
      { value: "priceBuy_asc", label: "Giá mua tăng" },
      { value: "priceBuy_desc", label: "Giá mua giảm" },
      { value: "createdAt_desc", label: "Mới nhất" },
      { value: "createdAt_asc", label: "Cũ nhất" },
    ],
    [],
  );

  const resultsRef = useRef<any>(null);

  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken_user");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!keyword.trim()) {
        setIsLoading(false);
        return;
      }

      if (prevKeyword.current !== keyword) {
        setIsLoading(true);
        prevKeyword.current = keyword;
      } else {
        setIsPaging(true);
      }

      const currentSeq = ++requestSeqRef.current;

      try {
        const res = await axios.get(`${API_URL}/api/v1/books`, {
          params: {
            ...(keyword && { keyWord: keyword }),
            ...(sort && { sortKey: sort.key, sortValue: sort.value }),
            page,
            limit,
          },
        });

        if (currentSeq === requestSeqRef.current) {
          setBooks(res.data.books || []);
          setTotal(res.data.total || 0);
        }
      } catch (error) {
        if (currentSeq === requestSeqRef.current) {
          setBooks([]);
          setTotal(0);
        }
        console.error(error);
      } finally {
        if (currentSeq === requestSeqRef.current) {
          setIsLoading(false);
          setIsPaging(false);
        }
      }
    };

    fetchBooks();
  }, [keyword, page, limit, sort]);

  useEffect(() => {
    if (!isLoading) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page, sortValue, isLoading]);

  useSyncParams(setPage, setSortValue, setSort);

  const handlePageChange = usePageChange("search", setPage, "client");
  const handleSortChange = useSortChange("search", "client");

  if (isLoading) {
    return <Loading fullScreen={true} size="lg" text="Đang tìm kiếm..." />;
  }

  const handleToggleFavorite = async (bookId: string, next: boolean) => {
    const token = localStorage.getItem("accessToken_user");
    if (!token) return;
    try {
      if (next) {
        await axios.post(
          `${API_URL}/api/v1/favorites/add`,
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setFavoriteIds((prev) => [...prev, bookId]);
      } else {
        await axios.delete(`${API_URL}/api/v1/favorites/remove`, {
          data: { bookId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteIds((prev) => prev.filter((id) => id !== bookId));
      }
    } catch (err) {}
  };

  return (
    <div className="py-6 px-4 md:py-8 md:px-6">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                Kết quả tìm kiếm
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {keyword && `Từ khóa: "${keyword}"`}
                {total > 0
                  ? ` - Tìm thấy ${total} sách`
                  : " - Không tìm thấy sách nào"}
              </p>
            </div>
            {total > 0 && (
              <div className="w-full md:w-auto">
                <SortSelect
                  options={sortOptions}
                  sortValue={sortValue}
                  onChange={(e) => {
                    setSortValue(e.target.value);
                    handleSortChange(e, setSort);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {books.length > 0 ? (
          <>
            <div
              ref={resultsRef}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[24px] mb-8"
            >
              {isPaging
                ? Array.from({ length: 12 }).map((_, i) => (
                    <BookCardSkeleton key={i} />
                  ))
                : books.map((book) => (
                    <BookCard
                      key={book._id}
                      book={book}
                      featured={false}
                      newest={false}
                      isFavorite={favoriteIdsSet.has(book._id)}
                      onToggleFavorite={handleToggleFavorite}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
            </div>

            <div className="flex justify-center">
              <Pagination
                page={page}
                total={total}
                limit={limit}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 md:py-16">
            <p className="sm:text-lg md:text-xl text-gray-500">
              Không tìm thấy sách nào phù hợp với từ khóa "{keyword}"
            </p>
            <div className="min-h-[300px] md:min-h-[400px]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
