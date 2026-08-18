import HomeClient from "../HomeClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getBooks() {
  try {
    const [featuredRes, newestRes, bestSellerRes] = await Promise.all([
      fetch(`${API_URL}/api/v1/books/featured`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/v1/books/newest`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/v1/books/best-seller`, { next: { revalidate: 60 } }),
    ]);
    const featuredData = featuredRes.ok ? await featuredRes.json() : {};
    const newestData = newestRes.ok ? await newestRes.json() : {};
    const bestSellerData = bestSellerRes.ok ? await bestSellerRes.json() : {};
    return {
      featuredBooks: featuredData.books || [],
      newestBooks: newestData.books || [],
      bestSellerBooks: bestSellerData.records || [],
    };
  } catch {
    return {
      featuredBooks: [],
      newestBooks: [],
      bestSellerBooks: [],
    };
  }
}

export default async function Home() {
  const { featuredBooks, newestBooks, bestSellerBooks } = await getBooks();

  return (
    <HomeClient
      featuredBooks={featuredBooks}
      newestBooks={newestBooks}
      bestSellerBooks={bestSellerBooks}
    />
  );
}
