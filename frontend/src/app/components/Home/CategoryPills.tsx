"use client";

import Link from "next/link";
import { FiBookOpen, FiGrid, FiArrowRight } from "react-icons/fi";

const DEFAULT_CATEGORIES = [
  { title: "Văn học", slug: "van-hoc" },
  { title: "Kinh tế - Kinh doanh", slug: "kinh-te" },
  { title: "Kỹ năng sống", slug: "ky-nang-song" },
  { title: "Tâm lý học", slug: "tam-ly-hoc" },
  { title: "Công nghệ - Khoa học", slug: "cong-nghe" },
  { title: "Nuôi dạy con", slug: "nuoi-day-con" },
  { title: "Manga - Comic", slug: "manga-comic" },
  { title: "Ngoại ngữ", slug: "ngoai-ngu" },
];

const COLORS = [
  "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
  "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
  "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
  "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200",
  "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200",
  "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200",
  "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
];

export const CategoryPills = ({
  categories = [],
}: {
  categories?: { title: string; slug: string }[];
}) => {
  const displayList =
    categories.length > 0 ? categories.slice(0, 8) : DEFAULT_CATEGORIES;

  return (
    <div className="mb-10 md:mb-14">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary-light text-primary">
              <FiGrid size={18} />
            </span>
            Khám phá theo thể loại
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Tìm nhanh sách theo chủ đề bạn quan tâm
          </p>
        </div>
        <Link
          href="/books"
          className="text-xs sm:text-sm font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
        >
          <span>Tất cả</span>
          <FiArrowRight size={14} />
        </Link>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <Link
          href="/books"
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all duration-200 shadow-xs"
        >
          <FiBookOpen size={15} />
          <span>Tất cả sách</span>
        </Link>

        {displayList.map((cat, idx) => {
          const colorClass = COLORS[idx % COLORS.length];
          return (
            <Link
              key={cat.slug || idx}
              href={`/books?category=${cat.slug}&page=1`}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] ${colorClass}`}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-70" />
              <span>{cat.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
