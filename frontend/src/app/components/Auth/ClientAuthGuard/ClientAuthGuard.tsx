"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClientAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { setUser } = useUser();

  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/api/v1/auth/verify`,
          {},
        );
        setUser(response.data.user || null);
      } catch {
        logout();
      } finally {
        setCheckedAuth(true);
      }
    };

    checkAuth();
  }, [setUser]);

  return <>{children}</>;
}
