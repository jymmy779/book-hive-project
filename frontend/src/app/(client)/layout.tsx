import type { Metadata } from "next";
import React, { Suspense } from "react";
import Footer from "../components/Layout/Footer/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { UserProvider } from "@/contexts/UserContext";
import { Header } from "../components/Layout/Header/Header";
import ClientAuthGuard from "../components/Auth/ClientAuthGuard/ClientAuthGuard";
import { BookCardSkeleton } from "../components/Skeleton/BookCardSkeleton";
import AIChat from "../components/AIChat/AIChat";

export const metadata: Metadata = {
  title: "BookHive",
  description: "Nơi tri thức hội tụ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <CartProvider>
        <ClientAuthGuard>
          <Header />
          <main className="pt-[85px] md:pt-[120px] lg:pt-[144px]">
            <Suspense
              fallback={
                <div className="py-4 px-4 md:py-[32px] md:px-[24px]">
                  <div className="container mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[24px]">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <BookCardSkeleton key={i} />
                      ))}
                    </div>
                  </div>
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
          <Footer />
        </ClientAuthGuard>
      </CartProvider>
      <AIChat />
    </UserProvider>
  );
}
