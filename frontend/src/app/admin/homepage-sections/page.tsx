"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import { FiAward, FiBookOpen, FiBookmark, FiImage, FiSearch, FiStar, FiZap } from "react-icons/fi";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import { useAdmin } from "@/contexts/AdminContext";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SectionBook = {
  _id: string;
  title: string;
  author: string;
  image?: string;
  priceBuy?: number;
  inStock?: number;
  featured?: boolean;
  editorRecommended?: boolean;
  readerFavorite?: boolean;
  topChartPosition?: number;
  heroPosition?: number;
  flashSale?: boolean;
  discountPercent?: number;
  flashSaleEndAt?: string;
};

type SectionKey = "charts" | "favorites" | "featured" | "deals" | "hero" | "editorPick";
type SelectionFilter = "all" | "selected" | "unselected";

const FILTER_OPTIONS: { id: SelectionFilter; label: string }[] = [
  { id: "all", label: "T\u1ea5t c\u1ea3" },
  { id: "selected", label: "\u0110ang hi\u1ec3n th\u1ecb" },
  { id: "unselected", label: "Ch\u01b0a ch\u1ecdn" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SECTION_LIMITS: Record<SectionKey, number> = {
  charts: 3,
  favorites: 8,
  featured: 8,
  deals: 12,
  hero: 8,
  editorPick: 1,
};

const SECTIONS: { id: SectionKey; title: string; icon: typeof FiAward }[] = [
  { id: "charts", title: "Top Charts", icon: FiAward },
  { id: "favorites", title: "Được bạn đọc yêu thích nhất", icon: FiStar },
  { id: "deals", title: "Deal Chớp Nhoáng", icon: FiZap },
  { id: "featured", title: "Nổi bật", icon: FiBookOpen },
];

const ALL_SECTIONS: typeof SECTIONS = [
  ...SECTIONS,
  { id: "hero", title: "Hero Banner", icon: FiImage },
  { id: "editorPick", title: "Biên Tập Viên Khuyên Đọc", icon: FiBookmark },
];

function toLocalDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function HomepageSectionsManagement() {
  const [books, setBooks] = useState<SectionBook[]>([]);
  const [section, setSection] = useState<SectionKey>("charts");
  const [keyword, setKeyword] = useState("");
  const [selectionFilter, setSelectionFilter] = useState<SelectionFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const { admin } = useAdmin();
  const canEdit = admin?.permissions?.includes("edit_book") ?? false;

  const loadBooks = () =>
    axios
      .get(`${API_URL}/api/v1/${ADMIN_PREFIX}/books/homepage-sections`, {
        
      })
      .then((res) => setBooks(res.data.books || []))
      .catch(() => toast.error("Không tải được danh sách sách"))
      .finally(() => setLoading(false));

  useEffect(() => {
    void loadBooks();
  }, []);

  const visibleBooks = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi");
    return books.filter((book) => {
      const matchesQuery =
        !query ||
        `${book.title} ${book.author}`.toLocaleLowerCase("vi").includes(query);
      const isSelected =
        section === "charts"
          ? Boolean(book.topChartPosition)
          : section === "favorites"
            ? Boolean(book.readerFavorite)
            : section === "featured"
              ? Boolean(book.featured)
              : section === "hero"
                ? Boolean(book.heroPosition)
                : section === "editorPick"
                  ? Boolean(book.editorRecommended)
              : Boolean(
                  book.flashSale &&
                    book.flashSaleEndAt &&
                    new Date(book.flashSaleEndAt).getTime() > Date.now(),
                );
      const matchesSelection =
        selectionFilter === "all" ||
        (selectionFilter === "selected" ? isSelected : !isSelected);
      return matchesQuery && matchesSelection;
    });
  }, [books, keyword, section, selectionFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleBooks.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedBooks = visibleBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const saveSettings = async (book: SectionBook, patch: Record<string, unknown>) => {
    const previous = { ...book };
    setSavingIds((ids) => [...ids, book._id]);
    setBooks((current) =>
      current.map((item) =>
        item._id === book._id ? { ...item, ...patch } : item,
      ),
    );

    try {
      await axios.patch(
        `${API_URL}/api/v1/${ADMIN_PREFIX}/books/homepage-sections/${book._id}`,
        patch,
        {
          
        },
      );
      toast.success("Đã cập nhật section trang chủ");
      if (Object.prototype.hasOwnProperty.call(patch, "topChartPosition") || Object.prototype.hasOwnProperty.call(patch, "heroPosition") || Object.prototype.hasOwnProperty.call(patch, "editorRecommended")) void loadBooks();
    } catch (error) {
      setBooks((current) =>
        current.map((item) =>
          item._id === book._id ? { ...item, ...previous } : item,
        ),
      );
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Cập nhật thất bại");
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== book._id));
    }
  };

  const updateToggle = (
    book: SectionBook,
    field: "readerFavorite" | "featured" | "editorRecommended",
    value: boolean,
  ) => saveSettings(book, { [field]: value });

  const updateDeal = (book: SectionBook, enabled: boolean) => {
    if (!enabled) {
      void saveSettings(book, { flashSale: false });
      return;
    }
    const endAt = book.flashSaleEndAt
      ? new Date(book.flashSaleEndAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const safeEndAt = endAt > new Date() ? endAt : new Date(Date.now() + 24 * 60 * 60 * 1000);
    void saveSettings(book, {
      flashSale: true,
      discountPercent: book.discountPercent || 10,
      flashSaleEndAt: safeEndAt.toISOString(),
    });
  };

  const saveDealDetails = (book: SectionBook) => {
    const discountPercent = Number(book.discountPercent);
    if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 90) {
      toast.error("Nhập mức giảm từ 1% đến 90%");
      return;
    }
    if (!book.flashSaleEndAt || new Date(book.flashSaleEndAt).getTime() <= Date.now()) {
      toast.error("Chọn thời điểm kết thúc ở tương lai");
      return;
    }
    void saveSettings(book, {
      flashSale: true,
      discountPercent,
      flashSaleEndAt: book.flashSaleEndAt,
    });
  };

  const sectionCounts = {
    charts: books.filter((book) => Boolean(book.topChartPosition)).length,
    hero: books.filter((book) => Boolean(book.heroPosition)).length,
    editorPick: books.filter((book) => book.editorRecommended).length,
    favorites: books.filter((book) => book.readerFavorite).length,
    featured: books.filter((book) => book.featured).length,
    deals: books.filter(
      (book) => book.flashSale && book.flashSaleEndAt && new Date(book.flashSaleEndAt) > new Date(),
    ).length,
  };
  const selectedCount = sectionCounts[section];
  const sectionLimit = SECTION_LIMITS[section];
  const selectionLimitReached = selectedCount >= sectionLimit;

  const activeSection = ALL_SECTIONS.find((item) => item.id === section)!;
  const ActiveIcon = activeSection.icon;

  return (
    <PrivateRoute permission="view_books">
      <main className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-primary">Quản lý section trang chủ</h1>
          <p className="mt-1 text-sm text-gray-500">
            Chọn sách cho từng khu vực. Top Charts nhận tối đa 3 sách; deal cần có mức giảm và thời hạn.
          </p>
        </header>

        <nav className="flex flex-wrap gap-2">
          {ALL_SECTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSection(item.id);
                  setSelectionFilter("all");
                  setPage(1);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${section === item.id ? "bg-primary text-white shadow" : "bg-white text-gray-600 hover:bg-slate-50"}`}
              >
                <Icon /> {item.title}
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                  {sectionCounts[item.id]}
                </span>
              </button>
            );
          })}
        </nav>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
              <ActiveIcon /> {activeSection.title}
            </h2>
            <label className="flex min-w-64 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <FiSearch className="text-gray-400" />
              <input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm tên sách hoặc tác giả"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-gray-500">Lựa chọn</span>
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectionFilter(option.id);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${selectionFilter === option.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {option.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">
              {visibleBooks.length} / {books.length}
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="text-gray-600">
              Đang chọn <strong>{selectedCount}</strong> / <strong>{sectionLimit}</strong> sách tối đa
            </span>
            <label className="flex items-center gap-2 text-gray-600">
              Mỗi trang
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-gray-200 bg-white px-2 py-1"
              >
                {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>

          {!canEdit && (
            <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Tài khoản hiện tại chỉ có quyền xem; cần quyền chỉnh sửa sách để thay đổi lựa chọn.
            </p>
          )}

          {loading ? (
            <p className="py-12 text-center text-gray-500">Đang tải danh sách sách...</p>
          ) : visibleBooks.length === 0 ? (
            <p className="py-12 text-center text-gray-500">Không tìm thấy sách phù hợp.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedBooks.map((book) => {
                const saving = savingIds.includes(book._id);
                const selectedInCurrentSection = section === "charts"
                  ? Boolean(book.topChartPosition)
                  : section === "favorites"
                    ? Boolean(book.readerFavorite)
                    : section === "featured"
                      ? Boolean(book.featured)
                      : section === "hero"
                        ? Boolean(book.heroPosition)
                        : section === "editorPick"
                          ? Boolean(book.editorRecommended)
                        : Boolean(book.flashSale && book.flashSaleEndAt && new Date(book.flashSaleEndAt).getTime() > Date.now());
                const limitBlocksSelection = selectionLimitReached && !selectedInCurrentSection;
                return (
                  <div key={book._id} className="flex flex-wrap items-center gap-4 py-3">
                    <Image
                      width={64}
                      height={80}
                      src={book.image || "/book-hive.webp"}
                      alt={book.title}
                      className="h-16 w-12 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-primary">{book.title}</p>
                      <p className="truncate text-sm text-gray-500">{book.author}</p>
                    </div>
                    <div className="hidden text-right text-sm text-gray-500 md:block">
                      <p>{book.priceBuy?.toLocaleString("vi-VN") ?? 0}₫</p>
                      <p>Tồn kho: {book.inStock ?? 0}</p>
                    </div>

                    {(section === "charts" || section === "hero") && (
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        {section === "charts" ? "Hạng" : "Slide"}
                        <select
                          value={section === "charts" ? book.topChartPosition ?? "" : book.heroPosition ?? ""}
                          disabled={!canEdit || saving || limitBlocksSelection}
                          onChange={(event) => {
                            const value = event.target.value ? Number(event.target.value) : null;
                            void saveSettings(book, section === "charts"
                              ? { topChartPosition: value }
                              : { heroPosition: value });
                          }}
                          className="rounded-lg border border-gray-200 px-3 py-2"
                        >
                          <option value="">{section === "charts" ? "Tự động" : "Không hiển thị"}</option>
                          {Array.from({ length: section === "charts" ? 3 : 8 }, (_, index) => (
                            <option key={index + 1} value={index + 1}>#{index + 1}</option>
                          ))}
                        </select>
                      </label>
                    )}

                    {(section === "favorites" || section === "featured" || section === "editorPick") && (
                      <label className="flex items-center gap-2 text-sm font-medium text-primary">
                        <input
                          type="checkbox"
                          checked={section === "favorites" ? Boolean(book.readerFavorite) : section === "featured" ? Boolean(book.featured) : Boolean(book.editorRecommended)}
                          disabled={!canEdit || saving || limitBlocksSelection}
                          onChange={(event) =>
                            updateToggle(
                              book,
                              section === "favorites" ? "readerFavorite" : section === "featured" ? "featured" : "editorRecommended",
                              event.target.checked,
                            )
                          }
                          className="h-4 w-4 accent-amber-500"
                        />
                        Đưa vào section
                      </label>
                    )}

                    {section === "deals" && (
                      <div className="flex flex-wrap items-end gap-3">
                        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-primary">
                          <input
                            type="checkbox"
                            checked={Boolean(book.flashSale)}
                            disabled={!canEdit || saving || limitBlocksSelection}
                            onChange={(event) => updateDeal(book, event.target.checked)}
                            className="h-4 w-4 accent-amber-500"
                          />
                          Flash deal
                        </label>
                        <label className="text-xs text-gray-500">
                          Giảm %
                          <input
                            type="number"
                            min={1}
                            max={90}
                            value={book.discountPercent || ""}
                            disabled={!canEdit || !book.flashSale || saving}
                            onChange={(event) => {
                              const discountPercent = Number(event.target.value);
                              setBooks((current) => current.map((item) => item._id === book._id ? { ...item, discountPercent } : item));
                            }}
                            className="mt-1 block w-20 rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-800"
                          />
                        </label>
                        <label className="text-xs text-gray-500">
                          Kết thúc lúc
                          <input
                            type="datetime-local"
                            value={toLocalDateTime(book.flashSaleEndAt)}
                            disabled={!canEdit || !book.flashSale || saving}
                            onChange={(event) => {
                              const flashSaleEndAt = event.target.value
                                ? new Date(event.target.value).toISOString()
                                : undefined;
                              setBooks((current) => current.map((item) => item._id === book._id ? { ...item, flashSaleEndAt } : item));
                            }}
                            className="mt-1 block rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-800"
                          />
                        </label>
                        <button
                          type="button"
                          disabled={!canEdit || !book.flashSale || saving}
                          onClick={() => saveDealDetails(book)}
                          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Lưu deal
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && visibleBooks.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, visibleBooks.length)} / {visibleBooks.length} sách
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40"
                >Trước</button>
                <span className="min-w-20 text-center text-sm text-gray-600">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40"
                >Tiếp</button>
              </div>
            </div>
          )}
        </section>
      </main>
      <ToastContainer autoClose={1600} hideProgressBar pauseOnHover={false} />
    </PrivateRoute>
  );
}
