"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Logout from "../Auth/Logout/Logout";
import { useAdmin } from "@/contexts/AdminContext";
import {
  FiGrid,
  FiBook,
  FiTag,
  FiShield,
  FiLock,
  FiUsers,
  FiUserCheck,
  FiLogOut,
} from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const menu = [
  { label: "Dashboard", icon: FiGrid, key: "dashboard", href: "/admin/dashboard" },
  {
    label: "Quản lý sách",
    icon: FiBook,
    key: "books",
    href: "/admin/books",
    permission: "view_books",
  },
  {
    label: "Quản lý thể loại",
    icon: FiTag,
    key: "categories",
    href: "/admin/categories",
    permission: "view_categories",
  },
  {
    label: "Nhóm quyền",
    icon: FiShield,
    key: "roles",
    href: "/admin/roles",
    permission: "view_roles",
  },
  {
    label: "Phân quyền",
    icon: FiLock,
    key: "permissions",
    href: "/admin/roles/permissions",
    permission: "view_permissions",
  },
  {
    label: "Quản lý tài khoản",
    icon: FiUsers,
    key: "accounts",
    href: "/admin/accounts",
    permission: "view_accounts",
  },
  { label: "Thông tin cá nhân", icon: FiUserCheck, key: "profile", href: "/admin/profile" },
];

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export const SideBar = () => {
  const { admin } = useAdmin();
  const permissions = admin?.permissions || [];
  const pathname = usePathname();
  const active =
    menu
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname?.startsWith(item.href))?.key || "";

  return (
    <>
      <aside className="fixed top-0 left-0 h-screen w-[280px] bg-white p-6 shadow-[2px_0_8px_rgba(0,0,0,0.05)] z-30 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <FiBook className="text-accent" size={24} />
            BookHive Admin
          </h2>
          <p className="text-sm text-text-muted mt-1 ml-1">{admin?.email}</p>
        </div>
        <nav className="flex-1">
          {menu
            .filter(
              (item) =>
                !item.permission || permissions.includes(item.permission),
            )
            .map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <Link
                  href={item.href}
                  key={item.key}
                  className="block w-full mb-1"
                >
                  <div
                    className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-accent text-white shadow-sm"
                        : "text-text-secondary hover:bg-accent-light hover:text-accent"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-white" : "text-text-muted"} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
        </nav>

        <div className="flex justify-center w-full">
          <Logout
            url={`${API_URL}/api/v1/${ADMIN_PREFIX}/auth/logout`}
            href={"/auth/admin/login"}
            className="flex w-[80%] items-center py-3 px-6 bg-[#F37B74] transition-colors duration-200 text-white rounded-[12px] text-[16px] font-semibold cursor-pointer hover:bg-[#F2656E]"
            side="admin"
            icon={true}
          />
        </div>
      </aside>
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
};
