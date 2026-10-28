"use client";
import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Loading } from "@/app/components/Loading/Loading";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { setAdmin } = useAdmin();
  const router = useRouter();

  const logout = () => {
    setAdmin(null);
    router.replace(`/auth/${ADMIN_PREFIX}/login`);
  };

  const checkAuth = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/${ADMIN_PREFIX}/auth/verify`,
        {},
      );
      setAdmin(response.data.user || null);
    } catch {
      logout();
    } finally {
      setCheckedAuth(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [setAdmin]);

  if (!checkedAuth)
    return <Loading fullScreen={true} size="lg" text="Đang xác thực..." />;
  return <>{children}</>;
}
