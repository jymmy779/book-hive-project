"use client";

import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiFileText,
  FiMenu,
  FiX,
  FiChevronDown,
  FiFolder,
  FiBookOpen,
} from "react-icons/fi";

export const Header = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getTotalItems } = useCart();
  const [keyword, setKeyword] = useState(searchParams.get("keyWord") || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{ title: string; slug: string }[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const cartCount = getTotalItems();
  const { user } = useUser();

  // Đồng bộ ô input search khi URL thay đổi (VD khi gõ từ khóa mới, bấm back/forward)
  useEffect(() => {
    const urlKeyword = searchParams.get("keyWord") || "";
    setKeyword(urlKeyword);
  }, [searchParams]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API_URL}/api/v1/books/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => { });
  }, []);

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    const params = new URLSearchParams({
      keyWord: keyword,
      page: "1",
      limit: "12",
    });
    router.push(`/search?${params.toString()}`);
    setIsMobileMenuOpen(false);
  };

  const categoryColors = [
    "text-blue-600 bg-blue-50",
    "text-purple-600 bg-purple-50",
    "text-emerald-600 bg-emerald-50",
    "text-amber-600 bg-amber-50",
    "text-rose-600 bg-rose-50",
    "text-cyan-600 bg-cyan-50",
    "text-indigo-600 bg-indigo-50",
    "text-teal-600 bg-teal-50",
    "text-orange-600 bg-orange-50",
    "text-pink-600 bg-pink-50",
    "text-lime-600 bg-lime-50",
    "text-violet-600 bg-violet-50",
  ];

  return (
    <>
      <header className="px-3 md:px-6 fixed top-0 z-[999] w-full bg-white border-b border-border shadow-sm">
        <nav className="max-w-7xl mx-auto flex flex-wrap items-center justify-between h-14 md:h-16">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <Link
              href={"/"}
              className="flex gap-2 md:gap-3 items-center"
            >
              <Image
                width={400}
                height={400}
                src="/book-hive.jpg"
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
                alt="logo"
              />
              <div>
                <h1
                  className="m-0 text-base md:text-xl font-bold text-primary leading-tight"
                  title="BookHive"
                >
                  BookHive
                </h1>
                <p className="text-[10px] md:text-xs text-text-muted leading-tight">
                  Nơi tri thức hội tụ
                </p>
              </div>
            </Link>

            <button
              className="lg:hidden p-2 text-text-secondary hover:bg-surface-secondary rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>

          <div
            className={`${isMobileMenuOpen ? "flex" : "hidden"
              } lg:flex flex-col lg:flex-row w-full lg:w-auto gap-2 lg:gap-4 items-stretch lg:items-center mt-3 lg:mt-0 pb-4 lg:pb-0 transition-all duration-200`}
          >
            <form
              className="flex items-center gap-2 bg-surface-secondary rounded-lg px-3 py-2 border border-border transition-all duration-200 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent w-full lg:w-72"
              onSubmit={handleSearch}
            >
              <FiSearch className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm sách..."
                className="bg-transparent outline-none text-sm text-text-primary placeholder-text-muted flex-1 min-w-[120px]"
              />
            </form>

            <div className="flex flex-col lg:flex-row gap-1 lg:gap-1 items-start lg:items-center text-sm">
              <div className="relative group w-full lg:w-auto">
                <div className="flex items-center gap-1 cursor-pointer py-2 lg:py-0">
                  <Link
                    href="/books"
                    className="text-text-secondary font-medium transition-colors duration-200 hover:text-accent px-3 py-2 rounded-lg hover:bg-accent-light flex items-center gap-1.5 w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiBookOpen size={16} />
                    Tất cả sách
                    <FiChevronDown size={14} className="text-text-muted transition-transform duration-200 group-hover:rotate-180 hidden lg:block" />
                  </Link>
                </div>

                {/* Dropdown Popup trên Desktop */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[760px] bg-white rounded-xl shadow-lg border border-border p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-[9999] hidden lg:block">
                  <div className="text-xs font-semibold text-text-muted border-b border-border pb-2 mb-3 flex items-center gap-1.5">
                    <FiFolder size={14} /> Khám phá thể loại
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Lựa chọn "Tất cả sách" */}
                    <Link
                      href="/books"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-accent bg-accent-light hover:bg-accent hover:text-white rounded-lg transition-all duration-200"
                    >
                      <FiBookOpen size={16} />
                      <span className="line-clamp-1">Tất cả sách</span>
                    </Link>
                    {/* Danh sách thể loại động */}
                    {categories.map((cat, idx) => {
                      const colorClass = categoryColors[idx % categoryColors.length];
                      return (
                        <Link
                          key={cat.slug}
                          href={`/books?category=${cat.slug}&page=1`}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-accent bg-surface-secondary hover:bg-accent-light rounded-lg transition-all duration-200 border border-border hover:border-accent/20"
                        >
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${colorClass}`}>
                            {cat.title.charAt(0).toUpperCase()}
                          </span>
                          <span className="line-clamp-1">{cat.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Submenu trên Mobile (Click to expand) */}
                <div className="lg:hidden pl-4 flex flex-col gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className="text-xs font-semibold text-text-muted flex items-center gap-1.5 py-1.5"
                  >
                    <FiFolder size={14} /> Thể loại
                    <FiChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isCategoriesOpen && (
                    <div className="flex flex-col gap-1 pl-3 border-l border-border mt-1 pb-2">
                      <Link
                        href="/books"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsCategoriesOpen(false);
                        }}
                        className="text-sm text-text-secondary hover:text-accent py-1.5 flex items-center gap-1.5"
                      >
                        <FiBookOpen size={14} /> Tất cả sách
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/books?category=${cat.slug}&page=1`}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsCategoriesOpen(false);
                          }}
                          className="text-sm text-text-secondary hover:text-accent py-1.5 flex items-center gap-1.5"
                        >
                          <FiFolder size={14} /> {cat.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Link
                href="/orders"
                className="flex items-center gap-1.5 px-3 py-2 text-text-secondary font-medium transition-colors duration-200 hover:text-accent rounded-lg hover:bg-accent-light w-full lg:w-auto"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiFileText size={16} />
                <span>Đơn hàng</span>
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 px-3 py-2 text-text-secondary font-medium transition-colors duration-200 hover:text-accent rounded-lg hover:bg-accent-light w-full lg:w-auto"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiShoppingCart size={16} />
                <span>Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 left-6 bg-error text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-2 text-text-secondary font-medium transition-colors duration-200 hover:text-accent rounded-lg hover:bg-accent-light w-full lg:w-auto"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUser size={16} />
                {user && user.fullName ? user.fullName : "Tài khoản"}
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};