"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import StatusFilter from "@/app/components/StatusFilter/StatusFilter";
import Search from "@/app/components/Search/Search";
import { Book } from "@/app/interfaces/book.interface";
import Pagination from "@/app/components/Pagination/Pagination";
import ChangeMulti from "@/app/components/ChangeMulti/ChangeMulti";
import { useBulkSelect } from "@/app/utils/useBulkSelect";
import ConfirmModal from "@/app/components/ConfirmModal/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import NewAddButton from "@/app/components/Button/NewAddButton/NewAddButton";
import { useSearchParams } from "next/navigation";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import { useSyncParams } from "@/app/utils/useSyncParams";
import BookTable from "@/app/components/Table/BookTable/BookTable";
import useChangeStatus from "@/app/utils/useChangeStatus";
import { useFetchDataAdmin } from "@/app/utils/useFetchDataAdmin";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import ConditionalRender from "@/app/components/Auth/ConditionalRender/ConditionalRender";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Books() {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;

  const [books, setBooks] = useState<Book[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editedBooks, setEditedBooks] = useState<Book[]>([]);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const limit = 7;
  const accessToken = localStorage.getItem("accessToken_admin");
  const sortOptions = [
    { value: "", label: "Sắp xếp" },
    { value: "title_asc", label: "Tên A-Z" },
    { value: "title_desc", label: "Tên Z-A" },
    { value: "priceBuy_asc", label: "Giá mua tăng" },
    { value: "priceBuy_desc", label: "Giá mua giảm" },
    { value: "createdAt_desc", label: "Mới nhất" },
    { value: "createdAt_asc", label: "Cũ nhất" },
  ];
  const [sortValue, setSortValue] = useState("");

  // fetchData
  const fetchData = useFetchDataAdmin({
    status,
    keyword,
    page,
    sort,
    limit,
    accessToken,
    ADMIN_PREFIX,
    onSuccess: ({ items, total }) => {
      setBooks(items);
      setTotal(total);
    },
    setTotal,
    setLoading,
    source: "books",
  });

  useEffect(() => {
    fetchData();
    return fetchData.cancel;
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [status, keyword]);

  // lấy tất cả các book ko phân trang
  useEffect(() => {
    setEditedBooks(books);
  }, [books]);

  const fetchAllBooks = async () => {
    const res = await axios.get(`${API_URL}/api/v1/${ADMIN_PREFIX}/books`, {
      params: { page: 1, limit: 10000 },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return res.data.books || [];
  };

  // ĐỒNG BỘ page với URL mỗi khi searchParams thay đổi
  useSyncParams(setPage, setSortValue, setSort);

  // Hàm đổi trạng thái
  const handleChangeStatus = useChangeStatus(fetchData, "books");

  // hàm xử lí change-multi
  const {
    selectedIds,
    setSelectedIds,
    bulkValue,
    setBulkValue,
    handleSelectAll,
    handleSelect,
    handleBulkChange,
    pendingDeleteIds,
    setPendingDeleteIds,
    executeBulkDelete,
  } = useBulkSelect(
    books,
    fetchData,
    fetchAllBooks,
    "books",
    setEditedBooks,
    editedBooks,
    "sách",
  );

  // hàm xóa 1 item
  const handleDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    
    // Close modal immediately for instant UI feedback
    setDeleteId(null);

    const deletePromise = axios.patch(
      `${API_URL}/api/v1/${ADMIN_PREFIX}/books/delete/${idToDelete}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      },
    );

    toast.promise(deletePromise, {
      pending: "Đang xóa sách...",
      success: "Xóa sách thành công!",
      error: "Xóa sách thất bại",
    });

    try {
      await deletePromise;
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  // hàm thay đổi trang
  const handlePageChange = usePageChange("books", setPage, "admin");

  //  Xử lý thay đổi sort từ dropdown
  const handleSortChange = useSortChange("books", "admin");

  return (
    <>
      <PrivateRoute permission="view_books">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[32px] font-bold m-0 text-primary">
            📚 Quản lý sách
          </h1>
          <ConditionalRender permission="create_book">
            <NewAddButton label="Thêm sách mới" source="books" />
          </ConditionalRender>
        </div>
        <div className="flex items-center justify-between mb-6">
          <StatusFilter value={status} onChange={setStatus} />
          <Search value={keyword} onChange={setKeyword} label="sách" />
        </div>
        <div className="flex justify-between items-center">
          <ConditionalRender permission="edit_book">
            <ChangeMulti
              options={[
                { label: "Hoạt động", value: "active" },
                { label: "Dừng hoạt động", value: "inactive" },
                { label: "Đổi vị trí", value: "position-change" },
                { label: "Xóa tất cả", value: "delete_all" },
              ]}
              bulkValue={bulkValue}
              setBulkValue={setBulkValue}
              onBulkChange={handleBulkChange}
              disabled={!bulkValue || selectedIds.length === 0}
            />
          </ConditionalRender>
          <div className="mb-6">
            <SortSelect
              sortValue={sortValue}
              onChange={(e) => {
                setSortValue(e.target.value);
                handleSortChange(e, setSort);
              }}
              options={sortOptions}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-8">Đang tải...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-lg font-semibold">
            Không tìm thấy
          </div>
        ) : (
          <div>
            <BookTable
              books={editedBooks}
              setEditedBooks={setEditedBooks}
              onChangeStatus={handleChangeStatus}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              setDeleteId={setDeleteId}
            />
          </div>
        )}
        {!loading && books.length > 0 && (
          <div>
            <Pagination
              page={page}
              total={total}
              limit={limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        <ConfirmModal
          open={!!deleteId || pendingDeleteIds.length > 0}
          onCancel={() => {
            setDeleteId(null);
            setPendingDeleteIds([]);
          }}
          onConfirm={() => {
            if (deleteId) {
              handleDelete();
            } else {
              executeBulkDelete();
            }
          }}
          message={
            pendingDeleteIds.length > 0
              ? `Bạn có chắc chắn muốn xóa ${pendingDeleteIds.length} mục đã chọn?`
              : deleteId
                ? "Bạn có chắc chắn muốn xóa mục này?"
                : ""
          }
          label="Xóa"
          labelCancel="Hủy"
        />
        <ToastContainer
          autoClose={1500}
          hideProgressBar={true}
          pauseOnHover={false}
        />
      </PrivateRoute>
    </>
  );
}
