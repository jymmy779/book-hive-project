"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Search from "@/app/components/Search/Search";
import debounce from "lodash.debounce";
import Pagination from "@/app/components/Pagination/Pagination";
import ChangeMulti from "@/app/components/ChangeMulti/ChangeMulti";
import { useBulkSelect } from "@/app/utils/useBulkSelect";
import ConfirmModal from "@/app/components/ConfirmModal/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import { Role } from "@/app/interfaces/role.interface";
import NewAddButton from "@/app/components/Button/NewAddButton/NewAddButton";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { useFetchDataAdmin } from "@/app/utils/useFetchDataAdmin";
import RoleTable from "@/app/components/Table/RoleTable/RoleTable";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import ConditionalRender from "@/app/components/Auth/ConditionalRender/ConditionalRender";
import { FiShield } from "react-icons/fi";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editedRoles, setEditedRoles] = useState<Role[]>([]);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const limit = 5;
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
      setRoles(items);
      setTotal(total);
    },
    setTotal,
    setLoading,
    source: "roles",
  });

  useEffect(() => {
    fetchData();
    return fetchData.cancel;
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [status, keyword]);

  useEffect(() => {
    setEditedRoles(roles);
  }, [roles]);

  const fetchAllRoles = async () => {
    const res = await axios.get(`${API_URL}/api/v1/${ADMIN_PREFIX}/roles`, {
      params: { page: 1, limit: 10000 },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return res.data.roles || [];
  };

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
    roles,
    fetchData,
    fetchAllRoles,
    "roles",
    setEditedRoles,
    editedRoles,
    "vai trò",
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;

    // Close modal immediately for instant UI feedback
    setDeleteId(null);

    const deletePromise = axios.patch(
      `${API_URL}/api/v1/${ADMIN_PREFIX}/roles/delete/${idToDelete}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      },
    );

    toast.promise(deletePromise, {
      pending: "Đang xóa vai trò...",
      success: "Xóa vai trò thành công!",
      error: "Xóa vai trò thất bại",
    });

    try {
      await deletePromise;
      fetchData({ force: true });
    } catch (error) {
      console.error(error);
    }
  };

  // hàm thay đổi trang
  const handlePageChange = usePageChange("roles", setPage, "admin");

  //  Xử lý thay đổi sort từ dropdown
  const handleSortChange = useSortChange("roles", "admin");

  // ĐỒNG BỘ page với URL mỗi khi searchParams thay đổi
  useSyncParams(setPage, setSortValue, setSort);

  return (
    <>
      <PrivateRoute permission="view_roles">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[32px] font-bold m-0 text-primary flex items-center gap-2">
            <FiShield className="text-primary" /> Nhóm quyền
          </h1>
          <ConditionalRender permission="create_role">
            <NewAddButton label="Thêm vai trò mới" source="roles" />
          </ConditionalRender>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Search value={keyword} onChange={setKeyword} label="vai trò" />
        </div>

        <div className="flex justify-between items-center">
          <ConditionalRender permission="edit_role">
            <ChangeMulti
              options={[{ label: "Xóa tất cả", value: "delete_all" }]}
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
          <div className="text-center text-gray-500 py-8">Đang tải...</div>
        ) : roles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-lg font-semibold">
            Không tìm thấy
          </div>
        ) : (
          <div>
            <RoleTable
              roles={editedRoles}
              setEditedRoles={setEditedRoles}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              setDeleteId={setDeleteId}
            />
          </div>
        )}

        {!loading && roles.length > 0 && (
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
