"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import { FiSearch, FiBookOpen, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { ScrollReveal } from "@/app/components/Animation/ScrollReveal";
import { useUser } from "@/contexts/UserContext";

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
  const { user } = useUser();
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

  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    setIsLoggedIn(Boolean(user));
  }, [user]);

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

  useSyncParams(setPage, setSortValue, setSort);

  const changeSearchPage = usePageChange("search", setPage, "client");
  const handlePageChange = (newPage: number) => {
    changeSearchPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSortChange = useSortChange("search", "client");

  const handleToggleFavorite = useCallback(
    async (bookId: string, next: boolean) => {
      if (!isLoggedIn) return;
      try {
        if (next) {
          await axios.post(
            `${API_URL}/api/v1/favorites/add`,
            { bookId },
          );
          setFavoriteIds((prev) => [...prev, bookId]);
        } else {
          await axios.delete(`${API_URL}/api/v1/favorites/remove`, {
            data: { bookId },
          });
          setFavoriteIds((prev) => prev.filter((id) => id !== bookId));
        }
      } catch (err) {}
    },
    [setFavoriteIds, isLoggedIn],
  );

  if (isLoading) {
    return <Loading fullScreen={true} size="lg" text="Đang tìm kiếm..." />;
  }

  // Empty state - no keyword
  if (!keyword.trim()) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiSearch size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-3">Tìm kiếm sách</h1>
          <p className="text-text-muted text-base mb-8">
            Nhập từ khóa vào thanh tìm kiếm để khám phá kho sách phong phú của BookHive
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-md"
          >
            <FiBookOpen size={18} />
            Xem tất cả sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:py-8 md:px-6">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollReveal direction="down" distance={16} duration={0.4}>
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-primary-light rounded-lg">
                    <FiSearch size={16} className="text-primary" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-primary">
                    Kết quả tìm kiếm
                  </h1>
                </div>
                <p className="text-sm text-text-secondary ml-0.5">
                  {keyword && (
                    <>
                      Từ khóa: <span className="font-semibold text-accent">&quot;{keyword}&quot;</span>
                    </>
                  )}
                  {total > 0 ? (
                    <span className="ml-1 text-text-muted">· Tìm thấy <strong className="text-primary">{total}</strong> sách</span>
                  ) : (
                    <span className="ml-1 text-text-muted">· Không tìm thấy kết quả nào</span>
                  )}
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
        </ScrollReveal>

        {books.length > 0 ? (
          <ScrollReveal direction="up" distance={20} duration={0.4} delay={0.05}>
            <div className="grid grid-cols-2 min-[768px]:grid-cols-3 min-[1032px]:grid-cols-4 gap-4 md:gap-6 mb-8">
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
          </ScrollReveal>
        ) : (
          /* No results state */
          <div className="py-16 md:py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-surface-secondary border border-border flex items-center justify-center mx-auto mb-6">
              <FiBookOpen size={38} className="text-text-muted" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">
              Không tìm thấy kết quả
            </h2>
            <p className="text-text-muted text-sm md:text-base max-w-sm mb-8">
              Không có sách nào phù hợp với từ khóa &quot;<strong className="text-primary">{keyword}</strong>&quot;. Hãy thử từ khóa khác nhé!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
              >
                <FiBookOpen size={16} />
                Xem tất cả sách
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-border text-text-secondary rounded-xl font-semibold hover:bg-surface-secondary transition-colors text-sm"
              >
                <FiArrowLeft size={16} />
                Về trang chủ
              </Link>
            </div>
            <div className="min-h-[200px]" />
          </div>
        )}
      </div>
    </div>
  );
}
