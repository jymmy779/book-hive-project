import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const accessToken = localStorage.getItem("accessToken_admin");

export function useBulkSelect(
  items: any[],
  fetchData: () => void,
  fetchAllItems: () => Promise<any[]>,
  resource: string,
  setEditedItems: (items: any[]) => void,
  editedItems: any[],
  label: string,
) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkValue, setBulkValue] = useState<string>("");
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [items]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((item) => item._id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id),
    );
  };

  const handleBulkChange = async () => {
    if (!bulkValue || selectedIds.length === 0) return;

    if (bulkValue === "delete_all") {
      setPendingDeleteIds(selectedIds);
      return;
    }

    let payload;
    if (bulkValue === "position-change") {
      payload = {
        ids: selectedIds.map((id) => {
          const editedItem = editedItems.find((b) => b._id === id);
          const newPosition = editedItem?.position ?? "";
          return `${id}-${newPosition}`;
        }),
        type: "position-change",
      };
    } else {
      payload = {
        ids: selectedIds,
        type: bulkValue,
      };
    }

    const bulkPromise = axios
      .patch(`${API_URL}/api/v1/admin/${resource}/change-multi`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      })
      .then(async () => {
        await fetchData({ force: true });
      });

    toast.promise(bulkPromise, {
      pending: "Đang cập nhật...",
      success: "Cập nhật thành công!",
      error: "Cập nhật thất bại!",
    });

    await bulkPromise;
    setSelectedIds([]);
    setBulkValue("");
  };

  const executeBulkDelete = async () => {
    if (pendingDeleteIds.length === 0) return;

    const count = pendingDeleteIds.length;
    const idsToDelete = [...pendingDeleteIds];

    // Close modal and reset select state immediately for instant UI feedback
    setPendingDeleteIds([]);
    setSelectedIds([]);
    setBulkValue("");

    const bulkPromise = axios
      .patch(
        `${API_URL}/api/v1/admin/${resource}/change-multi`,
        {
          ids: idsToDelete,
          type: "delete_all",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        },
      )
      .then(async () => {
        await fetchData({ force: true });
      });

    toast.promise(bulkPromise, {
      pending: "Đang xóa...",
      success: `Xóa thành công ${count} ${label}!`,
      error: "Xóa thất bại!",
    });

    try {
      await bulkPromise;
    } catch (error) {
      console.error(error);
    }
  };

  return {
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
  };
}
