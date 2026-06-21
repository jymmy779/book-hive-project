"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import StatusFilter from "@/app/components/StatusFilter/StatusFilter";
import Search from "@/app/components/Search/Search";
import { Category } from "@/app/interfaces/category.interface";
import debounce from "lodash.debounce";
import Pagination from "@/app/components/Pagination/Pagination";
import ChangeMulti from "@/app/components/ChangeMulti/ChangeMulti";
import useChangeStatus from "@/app/utils/useChangeStatus";
import { useBulkSelect } from "@/app/utils/useBulkSelect";
import ConfirmModal from "@/app/components/ConfirmModal/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import NewAddButton from "@/app/components/Button/NewAddButton/NewAddButton";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { useFetchDataAdmin } from "@/app/utils/useFetchDataAdmin";
import CategoryTable from "@/app/components/Table/CategoryTable/CategoryTable";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import ConditionalRender from "@/app/components/Auth/ConditionalRender/ConditionalRender";
import { FiFolder } from "react-icons/fi";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editedCategories, setEditedCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const limit = 8;
  const accessToken = localStorage.getItem("accessToken_admin");
  const [sortValue, setSortValue] = useState("");
  const sortOptions = [
    { value: "", label: "Sắp xếp" },
    { value: "title_asc", label: "Tên A-Z" },
    { value: "title_desc", label: "Tên Z-A" },
    { value: "createdAt_desc", label: "Mới nhất" },
    { value: "createdAt_asc", label: "Cũ nhất" },
  ];

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
      setCategories(items);
      setTotal(total);
    },
    setTotal,
    setLoading,
    source: "categories",
  });

  useEffect(() => {
    fetchData();
    return fetchData.cancel;
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [status, keyword]);

  useEffect(() => {
    setEditedCategories(categories);
  }, [categories]);

  const fetchAllCategories = async () => {
    const res = await axios.get(
      `${API_URL}/api/v1/${ADMIN_PREFIX}/categories`,
      {
        params: { page: 1, limit: 10000 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      },
    );
    return res.data.categories || [];
  };

  const handleChangeStatus = useChangeStatus(fetchData, "categories");

  // ĐỒNG BỘ page với URL mỗi khi searchParams thay đổi
  useSyncParams(setPage, setSortValue, setSort);

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
    categories,
    fetchData,
    fetchAllCategories,
    "categories",
    setEditedCategories,
    editedCategories,
    "thể loại",
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;

    // Close modal immediately for instant UI feedback
    setDeleteId(null);

    const deletePromise = axios.patch(
      `${API_URL}/api/v1/${ADMIN_PREFIX}/categories/delete/${idToDelete}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      },
    );

    toast.promise(deletePromise, {
      pending: "Đang xóa thể loại...",
      success: "Xóa thể loại thành công!",
      error: "Xóa thể loại thất bại",
    });

    try {
      await deletePromise;
      fetchData({ force: true });
    } catch (error) {
      console.error(error);
    }
  };

  // hàm thay đổi trang
  const handlePageChange = usePageChange("categories", setPage, "admin");

  //  Xử lý thay đổi sort từ dropdown
  const handleSortChange = useSortChange("categories", "admin");

  return (
    <>
      <PrivateRoute permission="view_categories">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[32px] font-bold m-0 text-primary flex items-center gap-2">
            <FiFolder className="text-primary" /> Quản lý thể loại
          </h1>
          <ConditionalRender permission="create_category">
            <NewAddButton label="Thêm thể loại mới" source="categories" />
          </ConditionalRender>
        </div>

        <div className="flex items-center justify-between mb-6">
          <StatusFilter value={status} onChange={setStatus} />
          <Search value={keyword} onChange={setKeyword} label="thể loại" />
        </div>

        <div className="flex justify-between items-center">
          <ConditionalRender permission="edit_category">
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
                handleSortChange(e, setSort);
                setSortValue(e.target.value);
              }}
              options={sortOptions}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-lg font-semibold">
            Không tìm thấy
          </div>
        ) : (
          <div>
            <CategoryTable
              categories={editedCategories}
              setEditedCategories={setEditedCategories}
              onChangeStatus={handleChangeStatus}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              setDeleteId={setDeleteId}
            />
          </div>
        )}

        {!loading && categories.length > 0 && (
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
