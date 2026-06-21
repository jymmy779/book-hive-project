"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { FiLock } from "react-icons/fi";

export default function PrivateRoute({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { admin } = useAdmin();

  if (admin === undefined) return null;
  if (!admin?.permissions?.includes(permission)) {
    return (
      <div style={{ padding: 200, textAlign: "center", color: "#d32f2f" }}>
        <h2><FiLock className="inline mr-2" /> Bạn không có quyền truy cập trang này</h2>
        <p>Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là nhầm lẫn.</p>
      </div>
    );
  }
  return <>{children}</>;
}
