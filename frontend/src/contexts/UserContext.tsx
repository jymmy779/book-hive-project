"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type User = {
  id: string;
  email: string;
  role: string;
  fullName: string;
  permissions: string[];
} | null;

type UserContextType = {
  user: User;
  setUser: any;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUser phải được sử dụng bên trong UserProvider");
  return context;
};
