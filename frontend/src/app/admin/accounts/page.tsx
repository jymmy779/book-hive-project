"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import StatusFilter from "@/app/components/StatusFilter/StatusFilter";
import Search from "@/app/components/Search/Search";
import Pagination from "@/app/components/Pagination/Pagination";
import ChangeMulti from "@/app/components/ChangeMulti/ChangeMulti";
import { useBulkSelect } from "@/app/utils/useBulkSelect";
import ConfirmModal from "@/app/components/ConfirmModal/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import { Account } from "@/app/interfaces/account.interface";
import NewAddButton from "@/app/components/Button/NewAddButton/NewAddButton";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { useFetchDataAdmin } from "@/app/utils/useFetchDataAdmin";
import AccountTable from "@/app/components/Table/AccountTable/AccountTable";
import useChangeStatus from "@/app/utils/useChangeStatus";
import { useUser } from "@/contexts/UserContext";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import ConditionalRender from "@/app/components/Auth/ConditionalRender/ConditionalRender";
import { FiUsers } from "react-icons/fi";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editedAccounts, setEditedAccounts] = useState<Account[]>([]);
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
      setAccounts(items);
      setTotal(total);
    },
    setTotal,
    setLoading,
    source: "accounts",
  });

  useEffect(() => {
    fetchData();
    return fetchData.cancel;
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [status, keyword]);

  // lấy tất cả tài khoản không phân trang
  useEffect(() => {
    setEditedAccounts(accounts);
  }, [accounts]);

  const fetchAllAccounts = async () => {
    const res = await axios.get(`${API_URL}/api/v1/${ADMIN_PREFIX}/accounts`, {
      params: { page: 1, limit: 10000 },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return res.data.accounts || [];
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
    accounts,
    fetchData,
    fetchAllAccounts,
    "accounts",
    setEditedAccounts,
    editedAccounts,
    "tài khoản",
  );

  // ĐỒNG BỘ page với URL mỗi khi searchParams thay đổi
  useSyncParams(setPage, setSortValue, setSort);

  // Hàm đổi trạng thái
  const handleChangeStatus = useChangeStatus(fetchData, "accounts");

  const handleDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;

    // Close modal immediately for instant UI feedback
    setDeleteId(null);

    const deletePromise = axios.patch(
      `${API_URL}/api/v1/${ADMIN_PREFIX}/accounts/delete/${idToDelete}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      },
    );

    toast.promise(deletePromise, {
      pending: "Đang xóa tài khoản...",
      success: "Xóa tài khoản thành công!",
      error: "Xóa tài khoản thất bại",
    });

    try {
      await deletePromise;
      fetchData({ force: true });
    } catch (error) {
      console.error(error);
    }
  };

  // hàm thay đổi trang
  const handlePageChange = usePageChange("accounts", setPage, "admin");

  //  Xử lý thay đổi sort từ dropdown
  const handleSortChange = useSortChange("accounts", "admin");

  return (
    <>
      <PrivateRoute permission="view_accounts">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[32px] font-bold m-0 text-primary flex items-center gap-2">
            <FiUsers className="text-primary" /> Quản lý tài khoản
          </h1>
          <ConditionalRender permission="create_account">
            <NewAddButton label="Thêm tài khoản mới" source="accounts" />
          </ConditionalRender>
        </div>
        <div className="flex items-center justify-between mb-6">
          <StatusFilter value={status} onChange={setStatus} />
          <Search value={keyword} onChange={setKeyword} label="tài khoản" />
        </div>

        <div className="flex justify-between items-center">
          <ConditionalRender permission="edit_account">
            <ChangeMulti
              options={[
                { label: "Xóa tất cả", value: "delete_all" },
                { label: "Hoạt động", value: "active" },
                { label: "Dừng hoạt động", value: "inactive" },
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
          <div className="text-center text-gray-500 py-8">Đang tải...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-lg font-semibold">
            Không tìm thấy
          </div>
        ) : (
          <div>
            <AccountTable
              accounts={editedAccounts}
              onChangeStatus={handleChangeStatus}
              setEditedAccounts={setEditedAccounts}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              setDeleteId={setDeleteId}
            />
          </div>
        )}

        {!loading && accounts.length > 0 && (
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
