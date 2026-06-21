import type { Metadata } from "next";
import React from "react";
import { SideBar } from "../components/SideBar/SideBar";
import AuthGuard from "../components/Auth/AuthGuard/AuthGuard";
import { AdminProvider } from "@/contexts/AdminContext";

export const metadata: Metadata = {
  title: "BookHive Admin",
  description: "Quản lý hệ thống",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminProvider>
        <AuthGuard>
          <div className="pl-70 min-h-screen bg-surface-secondary">
            <SideBar />
            <main className="p-8">{children}</main>
          </div>
        </AuthGuard>
      </AdminProvider>
    </>
  );
}
