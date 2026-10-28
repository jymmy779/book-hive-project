"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "./UserContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CartItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      axios
        .get(`${API_URL}/api/v1/cart`, {
          headers: {
          },
        })
        .then((res) => {
          setItems(res.data.items || []);
          setIsLoaded(true);
          setIsLoading(false);
        })
        .catch(() => {
          setItems([]);
          setIsLoaded(true);
          setIsLoading(false);
        });
    } else {
      const savedCart = localStorage.getItem("guest_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      setIsLoaded(true);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) {
      localStorage.setItem("guest_cart", JSON.stringify(items));
    } else localStorage.removeItem("guest_cart");
  }, [items, isLoaded, isAuthenticated]);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.bookId === newItem.bookId,
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.bookId === newItem.bookId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        );
      }
      return [...prevItems, newItem];
    });
    if (isAuthenticated) {
      axios.post(`${API_URL}/api/v1/cart/add-item`, newItem);
    }
  };

  const removeFromCart = async (id: string) => {
    if (isAuthenticated) {
      try {
        const res = await axios.delete(`${API_URL}/api/v1/cart/delete/${id}`, {
          headers: {
          },
        });
        setItems(res.data.items || []);
      } catch (error) {
        toast.error("Xóa sản phẩm thất bại");
      }
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.bookId !== id));
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.bookId === id ? { ...item, quantity } : item,
      ),
    );
    if (isAuthenticated) {
      axios.patch(
        `${API_URL}/api/v1/cart/edit/${id}`,
        { quantity },
        {
          headers: {
          },
        },
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    if (isAuthenticated) {
      axios.delete(`${API_URL}/api/v1/cart/delete-all`, {
        headers: {
        },
      });
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được dùng trong CartProvider");
  }
  return context;
};
