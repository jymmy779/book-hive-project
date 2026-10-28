"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  FiSettings,
  FiCreditCard,
  FiMenu,
  FiX,
} from "react-icons/fi";

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
    label: "Quản lý trang chủ",
    icon: FiSettings,
    key: "homepage-sections",
    href: "/admin/homepage-sections",
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
  { label: "Giao dịch", icon: FiCreditCard, key: "transactions", href: "/admin/transactions", permission: "view_transactions" },
  { label: "Thông tin cá nhân", icon: FiUserCheck, key: "profile", href: "/admin/profile" },
];

export const SideBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { admin } = useAdmin();
  const permissions = admin?.permissions || [];
  const pathname = usePathname();
  const active =
    menu
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname?.startsWith(item.href))?.key || "";

  const navigation = (onNavigate?: () => void) => menu
    .filter((item) => !item.permission || permissions.includes(item.permission))
    .map((item) => {
      const Icon = item.icon;
      const isActive = active === item.key;
      return (
        <Link href={item.href} key={item.key} onClick={onNavigate} className="mb-1 block w-full">
          <span className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-accent text-white shadow-sm" : "text-text-secondary hover:bg-accent-light hover:text-accent"}`}>
            <Icon size={18} className={isActive ? "text-white" : "text-text-muted"} aria-hidden="true" />
            {item.label}
          </span>
        </Link>
      );
    });

  const brand = (
    <div className="flex items-center gap-2 text-xl font-bold text-primary">
      <FiBook className="shrink-0 text-accent" size={24} aria-hidden="true" />
      <span>BookHive Admin</span>
    </div>
  );

  const logout = (
    <Logout
      href="/auth/admin/login"
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F37B74] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#F2656E]"
      side="admin"
      icon={true}
    />
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 shadow-sm backdrop-blur lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu quản trị"
          aria-expanded={mobileOpen}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-primary hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FiMenu size={23} aria-hidden="true" />
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col bg-white p-6 shadow-[2px_0_8px_rgba(0,0,0,0.05)] lg:flex">
        <div className="mb-8">
          {brand}
          <p className="ml-1 mt-1 truncate text-sm text-text-muted">{admin?.email}</p>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto">{navigation()}</nav>
        <div className="mt-4">{logout}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu quản trị"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-stone-950/45"
          />
          <aside className="relative flex h-full w-[min(84vw,20rem)] flex-col bg-white p-5 shadow-2xl">
            <div className="mb-7 flex items-start justify-between gap-3">
              <div className="min-w-0">{brand}<p className="ml-1 mt-1 truncate text-sm text-text-muted">{admin?.email}</p></div>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-secondary"><FiX size={22} aria-hidden="true" /></button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto">{navigation(() => setMobileOpen(false))}</nav>
            <div className="mt-4">{logout}</div>
          </aside>
        </div>
      )}

      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
};
