import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Book Hive",
    default: "Book Hive - Nơi tri thức hội tụ",
  },
  description:
    "Hệ thống mua sắm sách trực tuyến hàng đầu với hàng ngàn đầu sách hấp dẫn.",
  openGraph: {
    title: "Book Hive - Nơi tri thức hội tụ",
    description: "Khám phá thế giới sách phong phú tại Book Hive.",
    url: "https://book-hive-project.vercel.app",
    siteName: "Book Hive",
    images: [
      {
        url: "https://book-hive-project.vercel.app/book-hive-banner.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  alternates: {
    canonical: "https://book-hive-project.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-surface-secondary">
        <main>{children}</main>
      </body>
    </html>
  );
}
