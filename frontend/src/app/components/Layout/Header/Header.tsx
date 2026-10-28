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

let cachedCategories: { title: string; slug: string }[] | null = null;

type HeaderProps = {
  initialCategories?: { title: string; slug: string }[];
};

export const Header = ({ initialCategories = [] }: HeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getTotalItems } = useCart();
  const [keyword, setKeyword] = useState(searchParams.get("keyWord") || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{ title: string; slug: string }[]>(
    initialCategories,
  );
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const cartCount = getTotalItems();
  const { user } = useUser();

  // Đồng bộ ô input search khi URL thay đổi
  useEffect(() => {
    const urlKeyword = searchParams.get("keyWord") || "";
    setKeyword(urlKeyword);
  }, [searchParams]);

  useEffect(() => {
    if (initialCategories.length > 0) {
      cachedCategories = initialCategories;
      sessionStorage.setItem(
        "bookhive_categories",
        JSON.stringify(initialCategories),
      );
      return;
    }

    if (cachedCategories && cachedCategories.length > 0) {
      setCategories(cachedCategories);
      return;
    }
    if (typeof window !== "undefined") {
      const sessionData = sessionStorage.getItem("bookhive_categories");
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedCategories = parsed;
            setCategories(parsed);
            return;
          }
        } catch {}
      }
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API_URL}/api/v1/books/categories`)
      .then((res) => res.json())
      .then((data) => {
        const list = data.categories || [];
        cachedCategories = list;
        if (typeof window !== "undefined") {
          sessionStorage.setItem("bookhive_categories", JSON.stringify(list));
        }
        setCategories(list);
      })
      .catch(() => {});
  }, [initialCategories]);

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
    "text-emerald-700 bg-emerald-100/70 border-emerald-200",
    "text-amber-700 bg-amber-100/70 border-amber-200",
    "text-stone-700 bg-stone-100 border-stone-200",
    "text-teal-700 bg-teal-100/70 border-teal-200",
    "text-orange-700 bg-orange-100/70 border-orange-200",
    "text-lime-700 bg-lime-100/70 border-lime-200",
    "text-rose-700 bg-rose-100/70 border-rose-200",
    "text-cyan-700 bg-cyan-100/70 border-cyan-200",
  ];

  return (
    <>
      <header className="px-3 md:px-6 fixed top-0 z-[999] w-full bg-[#faf8f5]/90 backdrop-blur-md border-b border-border shadow-xs">
        <nav className="max-w-7xl mx-auto flex flex-wrap items-center justify-between min-h-14 md:min-h-16 lg:h-16">
          <div className="flex items-center justify-between w-full lg:w-auto h-14 md:h-16">
            <Link
              href={"/"}
              className="flex gap-2 md:gap-3 items-center group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
                <Image
                  width={400}
                  height={400}
                  src="/book-hive.webp"
                  className="w-full h-full object-contain"
                  alt="logo"
                />
              </div>
              <div>
                <h1
                  className="m-0 text-base md:text-xl font-extrabold text-primary tracking-tight leading-tight group-hover:text-primary-dark transition-colors"
                  title="BookHive"
                >
                  BookHive
                </h1>
                <p className="text-[10px] md:text-xs text-text-muted leading-tight font-medium">
                  Nơi tri thức hội tụ
                </p>
              </div>
            </Link>

            <button
              className="relative cursor-pointer rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-secondary lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="primary-navigation"
            >
              <span className="relative block h-5 w-5">
                <FiMenu
                  size={20}
                  aria-hidden="true"
                  className={`absolute inset-0 transition-all duration-200 ease-out ${
                    isMobileMenuOpen
                      ? "rotate-90 scale-75 opacity-0"
                      : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <FiX
                  size={20}
                  aria-hidden="true"
                  className={`absolute inset-0 transition-all duration-200 ease-out ${
                    isMobileMenuOpen
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-75 opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>

          <div
            id="primary-navigation"
            className={`flex w-full flex-col items-stretch gap-2 overflow-y-auto transition-[max-height,opacity,transform,margin,padding,visibility] duration-300 ease-out lg:w-auto lg:flex-row lg:items-center lg:gap-4 lg:overflow-visible lg:transition-none ${
              isMobileMenuOpen
                ? "visible mt-3 max-h-[calc(100vh-4rem)] translate-y-0 pb-4 opacity-100"
                : "invisible pointer-events-none mt-0 max-h-0 -translate-y-2 pb-0 opacity-0"
            } lg:visible lg:pointer-events-auto lg:mt-0 lg:max-h-none lg:translate-y-0 lg:pb-0 lg:opacity-100`}
          >
            <form
              className="flex items-center gap-2 bg-surface-secondary rounded-xl px-3 py-2 border border-border transition-all duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 w-full lg:w-72"
              onSubmit={handleSearch}
            >
              <FiSearch className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm sách, tác giả..."
                className="bg-transparent outline-none text-xs sm:text-sm text-text-primary placeholder:text-text-muted flex-1 min-w-[120px]"
              />
            </form>

            <div className="flex flex-col lg:flex-row gap-1 items-start lg:items-center text-sm">
              <div className="relative group w-full lg:w-auto">
                <div className="flex items-center gap-1 cursor-pointer py-2 lg:py-0">
                  <Link
                    href="/books"
                    className="text-text-secondary font-medium transition-colors duration-200 hover:text-primary px-3 py-2 rounded-xl hover:bg-surface-secondary flex items-center gap-1.5 w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiBookOpen size={16} />
                    <span>Tất cả sách</span>
                    <FiChevronDown
                      size={14}
                      className="text-text-muted transition-transform duration-200 group-hover:rotate-180 hidden lg:block"
                    />
                  </Link>
                </div>

                {/* Dropdown Popup trên Desktop */}
                <div className="invisible pointer-events-none absolute left-1/2 top-full z-[9999] hidden w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-[opacity,transform,visibility] duration-200 ease-out group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 lg:block">
                  <div className="rounded-2xl border border-border bg-[#faf8f5] p-5 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5 text-xs font-bold text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <FiFolder size={14} /> Khám phá thể loại sách
                    </span>
                    <span className="text-[11px] text-accent font-semibold">
                      Tuyển chọn độc quyền
                    </span>
                  </div>
                  <div className="grid max-h-[min(60vh,28rem)] grid-cols-2 gap-2 overflow-y-auto overscroll-contain pr-1 xl:grid-cols-3">
                    {/* Lựa chọn "Tất cả sách" */}
                    <Link
                      href="/books"
                      className="flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold text-primary bg-primary-light hover:bg-primary hover:text-white rounded-xl transition-all duration-200"
                    >
                      <FiBookOpen size={16} />
                      <span className="line-clamp-1">Toàn bộ kho sách</span>
                    </Link>
                    {/* Danh sách thể loại động */}
                    {categories.map((cat, idx) => {
                      const colorClass =
                        categoryColors[idx % categoryColors.length];
                      return (
                        <Link
                          key={cat.slug}
                          href={`/books?category=${cat.slug}&page=1`}
                          className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-text-secondary hover:text-primary bg-white hover:bg-surface-secondary rounded-xl transition-all duration-200 border border-border/70 hover:border-primary/30"
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border ${colorClass}`}
                          >
                            {cat.title.charAt(0).toUpperCase()}
                          </span>
                          <span className="line-clamp-1">{cat.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                  </div>
                </div>

                {/* Submenu trên Mobile */}
                <div className="lg:hidden pl-4 flex flex-col gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    aria-expanded={isCategoriesOpen}
                    aria-controls="mobile-category-menu"
                    className="flex w-full items-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-secondary hover:text-primary"
                  >
                    <FiFolder size={14} /> Thể loại
                    <FiChevronDown
                      size={12}
                      className={`ml-auto transition-transform duration-300 ease-out ${
                        isCategoriesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    id="mobile-category-menu"
                    aria-hidden={!isCategoriesOpen}
                    inert={!isCategoriesOpen}
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isCategoriesOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "pointer-events-none grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="mt-1 flex max-h-60 flex-col gap-1 overflow-y-auto overscroll-contain border-l border-border py-1 pl-3 pr-1">
                      <Link
                        href="/books"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsCategoriesOpen(false);
                        }}
                        className="text-sm text-text-secondary hover:text-primary py-1.5 flex items-center gap-1.5"
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
                          className="text-sm text-text-secondary hover:text-primary py-1.5 flex items-center gap-1.5"
                        >
                          <FiFolder size={14} /> {cat.title}
                        </Link>
                      ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/orders"
                className="flex items-center gap-1.5 px-3 py-2 text-text-secondary font-medium transition-colors duration-200 hover:text-primary rounded-xl hover:bg-surface-secondary w-full lg:w-auto"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiFileText size={16} />
                <span>Đơn hàng</span>
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 px-3 py-2 text-text-secondary font-medium transition-colors duration-200 hover:text-primary rounded-xl hover:bg-surface-secondary w-full lg:w-auto"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiShoppingCart size={16} />
                <span>Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 left-6 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-2 text-text-secondary font-medium transition-colors duration-200 hover:text-primary rounded-xl hover:bg-surface-secondary w-full lg:w-auto"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUser size={16} />
                <span>{user && user.fullName ? user.fullName : "Tài khoản"}</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
