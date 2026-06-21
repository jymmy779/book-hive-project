import HomeClient from "./HomeClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getBooks() {
  const [featuredRes, newestRes, bestSellerRes] = await Promise.all([
    fetch(`${API_URL}/api/v1/books/featured`, { cache: "no-store" }),
    fetch(`${API_URL}/api/v1/books/newest`, { cache: "no-store" }),
    fetch(`${API_URL}/api/v1/books/best-seller`, { cache: "no-store" }),
  ]);
  const featuredData = await featuredRes.json();
  const newestData = await newestRes.json();
  const bestSellerData = await bestSellerRes.json();
  return {
    featuredBooks: featuredData.books || [],
    newestBooks: newestData.books || [],
    bestSellerBooks: bestSellerData.records || [],
  };
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