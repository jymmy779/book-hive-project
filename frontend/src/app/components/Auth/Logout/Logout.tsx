import { MdLogout } from "react-icons/md";
import { toast } from "react-toastify";
import ConfirmModal from "../../ConfirmModal/ConfirmModal";
import { useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

interface LogoutProps {
  href: string;
  className: string;
  side: string;
  icon: boolean;
}

export default function Logout({ href, className, side, icon }: LogoutProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      const authPath = side === "admin"
        ? `/api/v1/${ADMIN_PREFIX}/auth/logout`
        : "/api/v1/auth/logout";
      await axios.post(`${API_URL}${authPath}`, {});
    setShowLogoutModal(false);
    toast.success("Đăng xuất thành công!");
    setTimeout(() => {
      window.location.href = href;
    }, 800);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng xuất thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <ConfirmModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        message="Bạn có chắc chắn muốn đăng xuất?"
        label="Có"
        labelCancel="Hủy"
      />
      <button
        type="button"
        onClick={() => setShowLogoutModal(true)}
        className={className}
      >
        {icon && <MdLogout className="mr-2" aria-hidden="true" />}
        <span className="flex-1">Đăng xuất</span>
      </button>
    </>
  );
}
