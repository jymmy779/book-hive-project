"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import debounce from "lodash.debounce";
import PaginationComponent from "@/app/components/Pagination/Pagination";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import { BookCardSkeleton } from "@/app/components/Skeleton/BookCardSkeleton";
import { useFetchFavorites } from "@/app/utils/useFetchFavorites";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
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

  // Xử lý toggle favorite
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
        await axios.post(
          `${API_URL}/api/v1/favorites/remove`,
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setFavoriteIds((prev) => prev.filter((id) => id !== bookId));
      }
    } catch (err) {}
  };

  // xử lí load data cùng với lọc và tìm kiếm
  const fetchData = useCallback(() => {
    setLoading(true);
    setBooks([]);
    axios
      .get(`${API_URL}/api/v1/books`, {
        params: {
          ...(keyword && { keyWord: keyword }),
          ...(sort && { sortKey: sort.key, sortValue: sort.value }),
          page,
          limit,
        },
      })
      .then((res) => {
        setBooks(res.data.books || []);
        setTotal(res.data.total || 0);
      })
      .catch(() => setBooks([]))
      .finally(() => {
        setLoading(false);
      });
  }, [sort, keyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useSyncParams(setPage, setSortValue, setSort);
  const handlePageChange = usePageChange("books", setPage, "client");
  const handleSortChange = useSortChange("books", "client");

  return (
    <>
      <div className="py-4 px-4 md:py-[32px] md:px-[24px]">
        <div className="container mx-auto">
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            pagination={{
              clickable: true,
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            modules={[Autoplay, Pagination]}
            className="mySwiper"
          >
            <SwiperSlide>
              <div className="mb-8 md:mb-12 rounded-2xl overflow-hidden shadow-lg relative group">
                <img
                  src="/book-hive-banner-2.png"
                  alt="Book Hive Banner"
                  className="w-full h-auto object-cover"
                />
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="mb-8 md:mb-12 rounded-2xl overflow-hidden shadow-lg relative group">
                <img
                  src="/book-hive-banner-3.png"
                  alt="Book Hive Banner"
                  className="w-full h-auto object-cover"
                />
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="mb-8 md:mb-12 rounded-2xl overflow-hidden shadow-lg relative group">
                <img
                  src="/book-hive-banner-4.png"
                  alt="Book Hive Banner"
                  className="w-full h-auto object-cover"
                />
              </div>
            </SwiperSlide>
          </Swiper>

          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-primary">
              Tất cả sách
            </h2>

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

          <div
            ref={resultsRef}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[24px] mb-8"
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
              <div className="col-span-full flex items-center justify-center min-h-[300px] md:min-h-[400px] text-gray-500 text-center">
                <p className="text-lg md:text-xl">Không tìm thấy sách nào</p>
              </div>
            )}
          </div>

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
