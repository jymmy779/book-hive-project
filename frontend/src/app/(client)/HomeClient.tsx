"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import { BookCardSkeleton } from "@/app/components/Skeleton/BookCardSkeleton";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import { FiArrowRight } from "react-icons/fi";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { useUser } from "@/contexts/UserContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomeClient({
  featuredBooks,
  newestBooks,
  bestSellerBooks,
}: {
  featuredBooks: Book[];
  newestBooks: Book[];
  bestSellerBooks: Book[];
}) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("accessToken_user");
    setIsLoggedIn(!!token);

    if (!token || !user) {
      setFavoriteIds([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    axios
      .get(`${API_URL}/api/v1/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const favorites = res.data.favorites || [];
        setFavoriteIds(favorites.map((fav: any) => fav.bookId?._id));
      })
      .catch(() => setFavoriteIds([]))
      .finally(() => setIsLoading(false));
  }, [user]);

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

  return (
    <>
      <div className="py-4 px-4 md:py-[32px] md:px-[24px]">
        <div className="container mx-auto">
          <div className="mb-8 md:mb-12 rounded-2xl overflow-hidden shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-10" />
            <img
              src="/book-hive-banner.jpg"
              alt="Book Hive Banner"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <Link
                href="/books"
                className="px-6 md:px-10 py-2.5 md:py-4 bg-white text-primary font-bold text-sm md:text-lg rounded-xl shadow-lg hover:shadow-xl hover:bg-accent-light transition-all duration-200 hover:-translate-y-0.5"
              >
                Khám phá ngay
              </Link>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Sách mới</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[24px] mb-10">
              {newestBooks.slice(0, 8).map((book, index) => (
                <BookCard
                  key={index}
                  book={book}
                  featured={false}
                  newest={true}
                  isFavorite={favoriteIds.includes(book._id)}
                  onToggleFavorite={handleToggleFavorite}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-primary">Bán chạy nhất</h2>
            <Swiper
              slidesPerView={2}
              spaceBetween={16}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 16,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
              }}
              freeMode={true}
              pagination={{
                clickable: true,
              }}
              modules={[FreeMode, Pagination]}
              className="mySwiper !pt-[16px]"
            >
              {bestSellerBooks.map((book, index) => (
                <SwiperSlide key={index}>
                  <BookCard
                    book={book}
                    featured={false}
                    newest={false}
                    bestSeller={true}
                    isFavorite={favoriteIds.includes(book._id)}
                    onToggleFavorite={handleToggleFavorite}
                    isLoggedIn={isLoggedIn}
                  />
                </SwiperSlide>
              ))}
              <SwiperSlide>
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <Link
                    href="/books"
                    className="flex gap-2 items-center justify-center px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-sm font-semibold">Xem thêm</span>
                    <span className="text-xl"><FiArrowRight /></span>
                  </Link>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Sách nổi bật
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[24px] mb-10">
              {featuredBooks.slice(0, 8).map((book, index) => (
                <BookCard
                  key={index}
                  book={book}
                  featured={true}
                  newest={false}
                  isFavorite={favoriteIds.includes(book._id)}
                  onToggleFavorite={handleToggleFavorite}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
