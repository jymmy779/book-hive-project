"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiBookOpen,
  FiCpu,
  FiGrid,
  FiHeart,
  FiTrendingUp,
  FiUserCheck,
} from "react-icons/fi";

type HomeCategory = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  bookCount: number;
};

const CARD_STYLES = [
  { icon: FiBookOpen, bg: "from-blue-600 to-indigo-800", light: "bg-blue-50 text-blue-700", cols: "md:col-span-8" },
  { icon: FiTrendingUp, bg: "from-emerald-600 to-teal-800", light: "bg-emerald-50 text-emerald-700", cols: "md:col-span-4" },
  { icon: FiUserCheck, bg: "from-amber-500 to-orange-700", light: "bg-amber-50 text-amber-700", cols: "md:col-span-4" },
  { icon: FiHeart, bg: "from-rose-500 to-pink-700", light: "bg-rose-50 text-rose-700", cols: "md:col-span-4" },
  { icon: FiCpu, bg: "from-purple-600 to-violet-800", light: "bg-purple-50 text-purple-700", cols: "md:col-span-4" },
];

export const BentoCategories = ({ categories }: { categories: HomeCategory[] }) => {
  const visibleCategories = categories.slice(0, CARD_STYLES.length);

  return (
    <div className="mb-14 md:mb-18">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-bold leading-tight text-primary sm:text-2xl">
            <span className="shrink-0 rounded-lg bg-primary-light p-1.5 text-primary">
              <FiGrid size={20} />
            </span>
            Khám Phá Theo Chủ Đề
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-text-muted sm:mt-0.5 sm:text-sm">
            Khám phá các danh mục sách đang có tại BookHive.
          </p>
        </div>
        <Link
          href="/books"
          className="group inline-flex w-fit items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-accent-hover sm:shrink-0 sm:text-sm"
        >
          <span>Xem tất cả thể loại</span>
          <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {visibleCategories.length === 0 ? (
        <p className="rounded-2xl border border-border bg-white p-6 text-sm text-text-muted">
          Chưa có danh mục sách để hiển thị.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {visibleCategories.map((category, index) => {
            const style = CARD_STYLES[index];
            const Icon = style.icon;
            return (
              <Link
                key={category._id}
                href={`/books?category=${encodeURIComponent(category.slug)}&page=1`}
                className={`${style.cols} group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[190px] sm:p-7`}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />
                <div className="relative mb-4 flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold shadow-xs transition-transform group-hover:scale-110 ${style.light}`}>
                    <Icon size={20} />
                  </div>
                  <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-[11px] font-semibold text-text-muted">
                    {category.bookCount.toLocaleString("vi-VN")} tựa sách
                  </span>
                </div>
                <div className="relative">
                  <h3 className="flex items-center justify-between text-base font-extrabold text-text-primary transition-colors group-hover:text-primary sm:text-lg">
                    <span>{category.title}</span>
                    <FiArrowRight size={16} className="-translate-x-2 text-accent opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                    {category.description || `Khám phá sách thuộc chủ đề ${category.title}.`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
