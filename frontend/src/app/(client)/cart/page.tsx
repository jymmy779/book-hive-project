"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import CartSkeleton from "@/app/components/Skeleton/CartSkeleton";
import ConfirmModal from "@/app/components/ConfirmModal/ConfirmModal";
import { ScrollReveal } from "@/app/components/Animation/ScrollReveal";
import Image from "next/image";
import {
  FiShoppingCart,
  FiTrash2,
  FiCreditCard,
  FiCheck,
  FiRefreshCw,
  FiShield,
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiPackage,
} from "react-icons/fi";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, isLoading } =
    useCart();
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: "",
    action: null as (() => void) | null,
  });

  if (isLoading) {
    return <CartSkeleton />;
  }

  const handleConfirmModal = (message: string, action: () => void) => {
    setConfirmModal({ open: true, message, action });
  };

  const handleRemoveItem = (bookId: string) => {
    handleConfirmModal("Bạn chắc chắn muốn xóa sản phẩm này?", () => {
      removeFromCart(bookId);
      toast.info("Đã xóa khỏi giỏ hàng");
      setConfirmModal({ open: false, message: "", action: null });
    });
  };

  const handleClearCart = () => {
    handleConfirmModal(
      "Bạn chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?",
      () => {
        clearCart();
        toast.info("Đã xóa tất cả sản phẩm");
        setConfirmModal({ open: false, message: "", action: null });
      },
    );
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-6">
            <FiShoppingCart size={42} className="text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3">
            Giỏ hàng trống
          </h1>
          <p className="text-text-muted text-base mb-8">
            Chưa có sản phẩm nào trong giỏ hàng. Khám phá kho sách phong phú của BookHive ngay!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-md text-sm md:text-base"
          >
            <FiArrowLeft size={16} />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    router.push("/cart/checkout");
  };

  return (
    <div className="min-h-screen py-6 md:py-10 bg-surface-cream">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <ScrollReveal direction="down" distance={16} duration={0.4}>
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-light rounded-xl">
                <FiShoppingCart size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-primary leading-tight">
                  Giỏ hàng của tôi
                </h1>
                <p className="text-xs text-text-muted">{totalItems} sản phẩm</p>
              </div>
            </div>
            <button
              onClick={handleClearCart}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 bg-red-50 border border-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all active:scale-95 text-xs md:text-sm"
            >
              <FiTrash2 size={14} />
              <span className="hidden sm:inline">Xóa tất cả</span>
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" distance={20} duration={0.5} delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="group relative bg-surface rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 p-4 md:p-5 flex gap-4 items-start"
              >
                {/* Mobile remove button */}
                <button
                  onClick={() => handleRemoveItem(item.bookId)}
                  className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all sm:hidden z-10"
                >
                  <FiTrash2 size={16} />
                </button>

                {/* Book cover */}
                <Link
                  href={`/books/detail/${item.slug}`}
                  className="flex-shrink-0 w-[72px] h-[100px] md:w-[88px] md:h-[120px] bg-surface-secondary rounded-xl overflow-hidden shadow-sm hover:opacity-85 transition-opacity"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-light">
                      <FiPackage size={24} className="text-primary/40" />
                    </div>
                  )}
                </Link>

                {/* Book info */}
                <div className="flex flex-col sm:flex-row flex-1 gap-3 pr-7 sm:pr-0">
                  <div className="flex-1">
                    <Link href={`/books/detail/${item.slug}`}>
                      <h3 className="text-sm md:text-base font-bold text-primary mb-1 line-clamp-2 hover:text-primary-dark transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-accent font-bold text-base md:text-lg mb-3">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.bookId, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-surface-secondary hover:bg-primary-light hover:text-primary border border-border rounded-lg transition-all font-bold text-text-secondary"
                      >
                        <FiMinus size={12} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          if (value > 0) updateQuantity(item.bookId, value);
                        }}
                        className="w-10 h-7 md:h-8 text-center border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-semibold bg-surface"
                      />
                      <button
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-surface-secondary hover:bg-primary-light hover:text-primary border border-border rounded-lg transition-all font-bold text-text-secondary"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + remove (desktop) */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <p className="text-sm font-bold text-primary">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.bookId)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs font-semibold"
                    >
                      <FiTrash2 size={12} />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 md:p-6 sticky top-[80px] md:top-[90px]">
              <h2 className="text-base md:text-lg font-bold text-primary mb-5 flex items-center gap-2">
                <FiPackage size={18} />
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-2.5 mb-5 pb-5 border-b border-border text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Số lượng sản phẩm</span>
                  <span className="font-semibold text-text-primary">{totalItems}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-text-primary">{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-success">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-5">
                <span className="text-base font-bold text-primary">Tổng cộng</span>
                <span className="text-xl md:text-2xl font-bold text-accent">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full cursor-pointer py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all duration-200 mb-3 active:scale-95 text-sm md:text-base inline-flex items-center justify-center gap-2 shadow-md"
              >
                <FiCreditCard size={16} />
                Thanh toán ngay
              </button>

              <Link
                href="/"
                className="block w-full py-2.5 bg-surface-secondary border border-border text-text-secondary font-semibold rounded-xl hover:bg-primary-light hover:text-primary hover:border-primary/30 transition-all text-center text-sm"
              >
                <FiArrowLeft className="inline mr-1.5" size={14} />
                Tiếp tục mua sắm
              </Link>

              {/* Trust badges */}
              <div className="mt-5 pt-5 border-t border-border text-xs text-text-muted space-y-2">
                <p className="flex items-center gap-2">
                  <FiCheck size={13} className="text-success shrink-0" />
                  Giao hàng toàn quốc
                </p>
                <p className="flex items-center gap-2">
                  <FiRefreshCw size={13} className="text-success shrink-0" />
                  Đổi trả miễn phí trong 30 ngày
                </p>
                <p className="flex items-center gap-2">
                  <FiShield size={13} className="text-success shrink-0" />
                  Thanh toán bảo mật 100%
                </p>
              </div>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        message={confirmModal.message}
        label="Xóa"
        labelCancel="Hủy"
        onConfirm={() => confirmModal.action?.()}
        onCancel={() => setConfirmModal({ open: false, message: "", action: null })}
      />

      <ToastContainer autoClose={1500} hideProgressBar={true} pauseOnHover={false} />
    </div>
  );
}