"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type AdminUser = {
  id: string;
  email: string;
  role: string;
  permissions: string[];
} | null;

type AdminContextType = {
  admin: AdminUser;
  setAdmin: any;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser>(null);

  return (
    <AdminContext.Provider value={{ admin, setAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdmin phải được sử dụng bên trong AdminProvider");
  return context;
};
