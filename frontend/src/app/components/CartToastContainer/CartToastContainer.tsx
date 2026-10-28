"use client";

import { ToastContainer } from "react-toastify";

export function CartToastContainer() {
  return (
    <ToastContainer
      containerId="cart-actions"
      position="top-right"
      autoClose={2000}
      hideProgressBar
      pauseOnHover={false}
    />
  );
}
