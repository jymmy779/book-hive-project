"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import PaginationComponent from "@/app/components/Pagination/Pagination";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import { BookCardSkeleton } from "@/app/components/Skeleton/BookCardSkeleton";
import { useFetchFavorites } from "@/app/utils/useFetchFavorites";
import { ScrollReveal } from "@/app/components/Animation/ScrollReveal";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Books() {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialCategory = searchParams.get("category") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(initialPage);
  const [categories, setCategories] = useState<
    { title: string; slug: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const limit = 12;
  const [sortValue, setSortValue] = useState("");
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
  const requestSeqRef = useRef<number>(0);
  const { favoriteIds, setFavoriteIds, isLoggedIn } = useFetchFavorites();

  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    if (!loading) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page, sortValue, loading]);

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
          await axios.post(
            `${API_URL}/api/v1/favorites/remove`,
            { bookId },
          );
          setFavoriteIds((prev) => prev.filter((id) => id !== bookId));
        }
      } catch (err) {}
    },
    [setFavoriteIds, isLoggedIn],
  );

  useEffect(() => {
    axios
      .get(`${API_URL}/api/v1/books/categories`)
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const urlCategory = searchParams.get("category") || "";
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams]);

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setPage(1);
    const params = new URLSearchParams(window.location.search);
    if (categorySlug) {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    const currentSeq = ++requestSeqRef.current;

    axios
      .get(`${API_URL}/api/v1/books`, {
        params: {
          ...(keyword && { keyWord: keyword }),
          ...(selectedCategory && { categorySlug: selectedCategory }),
          ...(sort && { sortKey: sort.key, sortValue: sort.value }),
          page,
          limit,
        },
      })
      .then((res) => {
        if (currentSeq === requestSeqRef.current) {
          setBooks(res.data.books || []);
          setTotal(res.data.total || 0);
        }
      })
      .catch(() => {
        if (currentSeq === requestSeqRef.current) {
          setBooks([]);
        }
      })
      .finally(() => {
        if (currentSeq === requestSeqRef.current) {
          setLoading(false);
        }
      });
  }, [sort, keyword, page, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useSyncParams(setPage, setSortValue, setSort);
  const handlePageChange = usePageChange("books", setPage, "client");
  const handleSortChange = useSortChange("books", "client");

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5] py-4 px-4 md:py-[32px] md:px-[24px]">
        <div className="container mx-auto">
          {/* Editorial Catalog Header */}
          <ScrollReveal direction="down" distance={16} duration={0.4}>
            <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] text-white mb-6 shadow-md overflow-hidden border border-white/10">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 20%, #10b981 0%, transparent 50%)",
                }}
              />
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-amber-300 mb-3 border border-white/10">
                  ✨ Kho Sách Tinh Tuyển
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white">
                  Khám Phá Toàn Bộ Tủ Sách BookHive
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                  Tuyển tập hàng ngàn đầu sách bản quyền phong phú thể loại: Văn học, Kinh tế, Kỹ năng, Tâm lý học và Công nghệ.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Quick Category Filter Pills */}
          <ScrollReveal direction="up" distance={16} duration={0.4} delay={0.05}>
            <div className="mb-6 w-full min-w-0 overflow-hidden rounded-2xl border border-[#e8e2d8] bg-white/90 py-3 shadow-sm sm:py-4">
              <div className="mb-3 flex items-center justify-between px-4">
                <div>
                  <h2 className="text-sm font-bold text-[#064e3b] sm:text-base">
                    Lọc theo thể loại
                  </h2>
                </div>
              </div>
              <Swiper
                slidesPerView="auto"
                spaceBetween={8}
                freeMode
                modules={[FreeMode]}
                className="!w-full !min-w-0 !overflow-hidden !px-4"
              >
                <SwiperSlide className="!w-auto !max-w-[min(70vw,18rem)]">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("")}
                    aria-pressed={!selectedCategory}
                    className={`max-w-full truncate rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                      !selectedCategory
                        ? "border-[#064e3b] bg-[#064e3b] text-white shadow-sm"
                        : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#064e3b]/40 hover:text-[#064e3b]"
                    }`}
                  >
                    Tất cả sách
                  </button>
                </SwiperSlide>
                {categories.map((cat) => (
                  <SwiperSlide
                    key={cat.slug}
                    className="!w-auto !max-w-[min(70vw,18rem)]"
                  >
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat.slug)}
                      aria-pressed={selectedCategory === cat.slug}
                      title={cat.title}
                      className={`max-w-full truncate rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                        selectedCategory === cat.slug
                          ? "border-[#064e3b] bg-[#064e3b] text-white shadow-sm"
                          : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#064e3b]/40 hover:text-[#064e3b]"
                      }`}
                    >
                      {cat.title}
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#064e3b]">
                  {selectedCategory
                    ? `Sách thể loại: ${
                        categories.find((c) => c.slug === selectedCategory)
                          ?.title || ""
                      }`
                    : "Tất cả sách"}
                </h2>
                {!loading && (
                  <p className="text-sm text-[#6b7280] mt-0.5">
                    {total} đầu sách
                  </p>
                )}
              </div>

              <div className="w-full md:w-auto">
                <SortSelect
                  onChange={(e) => {
                    setSortValue(e.target.value);
                    handleSortChange(e, setSort);
                  }}
                  options={sortOptions}
                  sortValue={sortValue}
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" distance={20} duration={0.4} delay={0.1}>
            <div
              ref={resultsRef}
              className="grid grid-cols-2 min-[768px]:grid-cols-3 min-[1032px]:grid-cols-4 gap-4 md:gap-[24px] mb-8"
            >
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))
            ) : books.length > 0 ? (
              books.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  newest={book.newest ? true : false}
                  featured={book.featured ? true : false}
                  isFavorite={favoriteIdsSet.has(book._id)}
                  onToggleFavorite={handleToggleFavorite}
                  isLoggedIn={isLoggedIn}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#064e3b]/10 flex items-center justify-center">
                  <span className="text-3xl">📚</span>
                </div>
                <p className="text-lg md:text-xl font-semibold text-[#374151]">
                  Không tìm thấy sách nào
                </p>
                <p className="text-sm text-[#6b7280]">
                  Thử thay đổi bộ lọc hoặc danh mục
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>

          {books.length > 0 && (
            <div className="flex justify-center">
              <PaginationComponent
                page={page}
                total={total}
                limit={limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
