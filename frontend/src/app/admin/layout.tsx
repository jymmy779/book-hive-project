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
          <div className="min-h-screen overflow-x-hidden bg-surface-secondary">
            <SideBar />
            <main className="min-h-screen px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24 lg:ml-[280px] lg:px-8 lg:py-8">
              {children}
            </main>
          </div>
        </AuthGuard>
      </AdminProvider>
    </>
  );
}
