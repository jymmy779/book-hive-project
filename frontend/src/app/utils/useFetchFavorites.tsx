import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useFetchFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const isAuthenticated = Boolean(user);
    setIsLoggedIn(isAuthenticated);
    if (!isAuthenticated) {
      setFavoriteIds([]);
      return;
    }
    axios
      .get(`${API_URL}/api/v1/favorites`, {
      })
      .then((res) => {
        const favorites = res.data.favorites || [];
        setFavoriteIds(favorites.map((fav: any) => fav.bookId?._id));
      })
      .catch(() => setFavoriteIds([]));
  }, [user]);

  return { favoriteIds, setFavoriteIds, isLoggedIn };
}
