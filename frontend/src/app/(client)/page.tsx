import HomeClient from "./HomeClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getBooks() {
  try {
    const [featuredRes, readerFavoritesRes, newestRes, heroRes, editorRecommendedRes, bestSellerRes, flashSaleRes, categoriesRes] =
      await Promise.all([
        fetch(`${API_URL}/api/v1/books/featured`, { next: { revalidate: 30 } }),
        fetch(`${API_URL}/api/v1/books/reader-favorites`, { next: { revalidate: 30 } }),
        fetch(`${API_URL}/api/v1/books/newest`, { next: { revalidate: 30 } }),
        fetch(`${API_URL}/api/v1/books/hero`, { next: { revalidate: 30 } }),
        fetch(`${API_URL}/api/v1/books/editor-recommended`, { next: { revalidate: 30 } }),
        fetch(`${API_URL}/api/v1/books/best-seller`, { next: { revalidate: 30 } }),
        fetch(`${API_URL}/api/v1/books/flash-sale`, { next: { revalidate: 30 } }),
        fetch(`${API_URL}/api/v1/books/categories`, { next: { revalidate: 30 } }).catch(() => null),
      ]);
    const featuredData = featuredRes.ok ? await featuredRes.json() : {};
    const readerFavoritesData = readerFavoritesRes.ok ? await readerFavoritesRes.json() : {};
    const newestData = newestRes.ok ? await newestRes.json() : {};
    const heroData = heroRes.ok ? await heroRes.json() : {};
    const editorRecommendedData = editorRecommendedRes.ok ? await editorRecommendedRes.json() : {};
    const bestSellerData = bestSellerRes.ok ? await bestSellerRes.json() : {};
    const flashSaleData = flashSaleRes.ok ? await flashSaleRes.json() : {};
    const categoriesData =
      categoriesRes && categoriesRes.ok ? await categoriesRes.json() : {};
    return {
      featuredBooks: featuredData.books || [],
      readerFavoriteBooks: readerFavoritesData.books || [],
      newestBooks: newestData.books || [],
      heroBooks: heroData.books || [],
      editorRecommendedBook: editorRecommendedData.book || null,
      bestSellerBooks: bestSellerData.records || [],
      flashSaleBooks: flashSaleData.books || [],
      categories: categoriesData.categories || [],
    };
  } catch {
    return {
      featuredBooks: [],
      readerFavoriteBooks: [],
      newestBooks: [],
      heroBooks: [],
      editorRecommendedBook: null,
      bestSellerBooks: [],
      flashSaleBooks: [],
      categories: [],
    };
  }
}

export default async function Home() {
  const { featuredBooks, readerFavoriteBooks, newestBooks, heroBooks, editorRecommendedBook, bestSellerBooks, flashSaleBooks, categories } =
    await getBooks();

  return (
    <HomeClient
      featuredBooks={featuredBooks}
      readerFavoriteBooks={readerFavoriteBooks}
      newestBooks={newestBooks}
      heroBooks={heroBooks}
      editorRecommendedBook={editorRecommendedBook}
      bestSellerBooks={bestSellerBooks}
      flashSaleBooks={flashSaleBooks}
      categories={categories}
    />
  );
}
