"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiAward } from "react-icons/fi";
import { useUser } from "@/contexts/UserContext";
import {
  ScrollReveal,
  ScrollRevealItem,
} from "@/app/components/Animation/ScrollReveal";

import { HeroBookSlider } from "@/app/components/Home/HeroBookSlider";
import { ValueBadges } from "@/app/components/Home/ValueBadges";
import { FlashSaleSection } from "@/app/components/Home/FlashSaleSection";
import { BentoCategories } from "@/app/components/Home/BentoCategories";
import { RankingPodium } from "@/app/components/Home/RankingPodium";
import { SpotlightBook } from "@/app/components/Home/SpotlightBook";
import { AISmartFinder } from "@/app/components/Home/AISmartFinder";
import { ReaderCommunity } from "@/app/components/Home/ReaderCommunity";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomeClient({
  featuredBooks,
  readerFavoriteBooks,
  newestBooks,
  heroBooks,
  editorRecommendedBook,
  bestSellerBooks,
  flashSaleBooks,
  categories,
}: {
  featuredBooks: Book[];
  readerFavoriteBooks: Book[];
  newestBooks: Book[];
  heroBooks: Book[];
  editorRecommendedBook?: Book | null;
  bestSellerBooks: Book[];
  flashSaleBooks: Book[];
  categories: { _id: string; title: string; slug: string; description?: string; bookCount: number }[];
}) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { user } = useUser();
  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    setIsLoggedIn(!!user);

    if (!user) {
      setFavoriteIds([]);
      return;
    }

    axios
      .get(`${API_URL}/api/v1/favorites`, {
      })
      .then((res) => {
        const favorites = res.data.favorites || [];
        setFavoriteIds(favorites.map((fav: any) => fav.bookId?._id));
      })
      .catch(() => setFavoriteIds([]));
  }, [user]);

  const handleToggleFavorite = useCallback(
    async (bookId: string, next: boolean) => {
      if (!user) return;
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
    [setFavoriteIds, user],
  );

  const spotlightBook =
    featuredBooks.length > 0
      ? featuredBooks[0]
      : bestSellerBooks.length > 0
        ? bestSellerBooks[0]
        : undefined;

  const editorialBook =
    featuredBooks.length > 1
      ? featuredBooks[1]
      : bestSellerBooks.length > 1
        ? bestSellerBooks[1]
        : spotlightBook;

  return (
    <div className="py-4 px-3 sm:px-4 md:py-8 md:px-6">
      <div className="container mx-auto">
        {/* 1. Interactive Hero Slider (5-8 cuốn sách mới nhất - Kéo lướt thủ công & Auto slide) */}
        <ScrollReveal direction="down" duration={0.6}>
          <HeroBookSlider books={heroBooks.length ? heroBooks : newestBooks} />
        </ScrollReveal>

        {/* 2. Value Badges (4 Cam kết độc quyền) */}
        <ScrollReveal staggerChildren={0.08} duration={0.4}>
          <ValueBadges />
        </ScrollReveal>

        {/* 3. Flash Sale / Deal Chớp Nhoáng (Đồng hồ đếm ngược + Progress bar) */}
        <ScrollReveal direction="up" delay={0.1}>
          <FlashSaleSection
            books={flashSaleBooks}
            isLoggedIn={isLoggedIn}
            favoriteIdsSet={favoriteIdsSet}
            onToggleFavorite={handleToggleFavorite}
          />
        </ScrollReveal>

        {/* 4. Bento Categories Grid (Khám phá theo thể loại) */}
        <ScrollReveal direction="up" delay={0.1}>
          <BentoCategories categories={categories} />
        </ScrollReveal>

        {/* 5. Sách Mới Nhất Lên Kệ */}
        <div className="mb-14 md:mb-18">
          <ScrollReveal direction="up" delay={0.05}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-primary-light text-primary">
                    <FiBookOpen size={20} />
                  </span>
                  Sách Mới Phát Hành
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  Các ấn phẩm bản quyền vừa cập bến kho BookHive
                </p>
              </div>
              <Link
                href="/books?sort=newest"
                className="text-xs sm:text-sm font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors group"
              >
                <span>Xem tất cả</span>
                <FiArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </ScrollReveal>

          {/* Staggered Grid for Newest Books */}
          <ScrollReveal
            staggerChildren={0.06}
            className="grid grid-cols-2 min-[768px]:grid-cols-3 min-[1032px]:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {newestBooks.slice(0, 8).map((book, index) => (
              <ScrollRevealItem key={book._id || index}>
                <BookCard
                  book={book}
                  featured={false}
                  newest={true}
                  isFavorite={favoriteIdsSet.has(book._id)}
                  onToggleFavorite={handleToggleFavorite}
                  isLoggedIn={isLoggedIn}
                />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </div>

        {/* 6. Bảng Xếp Hạng Bestseller (Top Charts 1 - 2 - 3) */}
        <ScrollReveal direction="up" delay={0.1}>
          <RankingPodium books={bestSellerBooks} />
        </ScrollReveal>

        {/* 7. Spotlight Book of the Month (Phong cách Tạp chí Editorial) */}
        <ScrollReveal direction="up" delay={0.1}>
          <SpotlightBook
            book={editorRecommendedBook || editorialBook}
            showEditorBadge={Boolean(editorRecommendedBook)}
          />
        </ScrollReveal>

        {/* 8. Sách Nổi Bật Dành Cho Bạn */}
        <div className="mb-14 md:mb-18">
          <ScrollReveal direction="up" delay={0.05}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <FiAward size={20} />
                  </span>
                  Được Bạn Đọc Yêu Thích Nhất
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  Những cuốn sách nhận được nhiều đánh giá 5 sao từ cộng đồng
                </p>
              </div>
              <Link
                href="/books?featured=true"
                className="text-xs sm:text-sm font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors group"
              >
                <span>Xem tất cả</span>
                <FiArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal
            staggerChildren={0.06}
            className="grid grid-cols-2 min-[768px]:grid-cols-3 min-[1032px]:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {readerFavoriteBooks.slice(0, 8).map((book, index) => (
              <ScrollRevealItem key={book._id || index}>
                <BookCard
                  book={book}
                  featured={false}
                  newest={false}
                  isFavorite={favoriteIdsSet.has(book._id)}
                  onToggleFavorite={handleToggleFavorite}
                  isLoggedIn={isLoggedIn}
                />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </div>

        {/* 9. AI Smart Finder Studio (Chỉ 1 vị trí duy nhất, tương tác thực tế) */}
        <div className="mb-14 md:mb-18">
          <ScrollReveal direction="up" delay={0.05}>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primary sm:text-2xl">Sách nổi bật</h2>
              <p className="mt-0.5 text-xs text-text-muted sm:text-sm">
                Những tựa sách được BookHive tuyển chọn.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal
            staggerChildren={0.06}
            className="grid grid-cols-2 min-[768px]:grid-cols-3 min-[1032px]:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {featuredBooks.slice(0, 8).map((book, index) => (
              <ScrollRevealItem key={book._id || index}>
                <BookCard
                  book={book}
                  featured
                  newest={false}
                  isFavorite={favoriteIdsSet.has(book._id)}
                  onToggleFavorite={handleToggleFavorite}
                  isLoggedIn={isLoggedIn}
                />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </div>

        <ScrollReveal direction="up" delay={0.1}>
          <AISmartFinder />
        </ScrollReveal>

        {/* 10. Độc Giả Nói Gì & Câu Lạc Bộ BookHive (Reviews + Newsletter Voucher) */}
        <ScrollReveal direction="up" delay={0.1}>
          <ReaderCommunity />
        </ScrollReveal>
      </div>
    </div>
  );
}
