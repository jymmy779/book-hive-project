import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import DetailClient from "./DetailClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getBook = cache(async (slug: string) => {
  try {
    const res = await fetch(`${API_URL}/api/v1/books/detail/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.book || null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    return {
      title: "Không tìm thấy sách",
    };
  }

  return {
    title: book.title,
    description:
      book.description || `Mua cuốn sách ${book.title} tại Book Hive`,
    openGraph: {
      title: `${book.title} | Book Hive`,
      description: book.description,
      images: [book.image],
    },
    alternates: {
      canonical: `https://book-hive-project.vercel.app/books/detail/${slug}`,
    },
  };
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    notFound();
  }

  return <DetailClient book={book} />;
}
