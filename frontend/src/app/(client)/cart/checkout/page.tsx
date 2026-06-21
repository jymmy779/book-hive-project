"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import { Loading } from "@/app/components/Loading/Loading";
import { FiCreditCard, FiTruck, FiCheck, FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(8, "Vui lòng nhập số điện thoại"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "cod">(
    "transfer",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && items.length === 0) {
      router.push("/cart");
    }
  }, [isLoaded, items.length, router]);

  if (!isLoaded || isRedirecting) {
    return <Loading fullScreen={true} size="lg" text="Đang tải..." />;
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleContinue = async (formData: CheckoutForm) => {
    setIsProcessing(true);

    try {
      const orderData = {
        userInfo: formData,
        items: items.map((item) => ({
          id: item.bookId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          slug: item.slug,
          image: item.image,
        })),
        totalAmount,
        paymentMethod,
      };

      const orderResponse = await axios.post(
        `${API_URL}/api/v1/orders/create`,
        orderData,
      );

      const createdCode = orderResponse.data.order.orderCode;

      if (paymentMethod === "cod") {
        try {
          const accessToken = localStorage.getItem("accessToken_user");
          if (accessToken) {
            await axios.delete(`${API_URL}/api/v1/cart/delete-all`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
          }
        } catch (error) {
          console.error("Lỗi xóa cart:", error);
        }

        clearCart();
        toast.success("Đơn hàng đã được tạo!");
        setIsRedirecting(true);

        setTimeout(() => {
          router.push(`/order-success?codes=${createdCode}`);
        }, 1500);
      } else {
        sessionStorage.setItem("codes", JSON.stringify([createdCode]));
        sessionStorage.setItem("paymentMethod", paymentMethod);
        sessionStorage.setItem("totalAmount", totalAmount.toString());

        toast.success("Đơn hàng đã được tạo!");

        setTimeout(() => {
          router.push("/cart/checkout/payment");
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Lỗi tạo đơn hàng!";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-6 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-6 md:mb-8">
          Thanh toán
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 md:p-12 shadow text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
              Không có sản phẩm
            </h1>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleContinue)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <div className="bg-white rounded-lg shadow p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">
                    Thông tin giao hàng
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        {...register("fullName")}
                        placeholder="Nhập họ tên"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                        disabled={isProcessing}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          {...register("email")}
                          placeholder="Nhập email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                          disabled={isProcessing}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          {...register("phone")}
                          placeholder="Nhập số điện thoại"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                          disabled={isProcessing}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Địa chỉ giao hàng
                      </label>
                      <textarea
                        {...register("address")}
                        placeholder="Nhập địa chỉ nhận hàng"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm md:text-base"
                        disabled={isProcessing}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">
                    Phương thức thanh toán
                  </h2>

                  <div className="space-y-4">
                    <label
                      className="flex items-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200"
                      style={{
                        borderColor:
                          paymentMethod === "transfer" ? "#3b82f6" : "#e5e7eb",
                        backgroundColor:
                          paymentMethod === "transfer" ? "#eff6ff" : "white",
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={paymentMethod === "transfer"}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as "transfer" | "cod")
                        }
                        className="w-4 h-4 text-primary shrink-0"
                      />
                      <div className="ml-3 md:ml-4">
                        <p className="font-semibold text-slate-800 text-sm md:text-base">
                          <FiCreditCard className="inline mr-2" /> Chuyển khoản ngân hàng
                        </p>
                        <p className="text-xs md:text-sm text-slate-500">
                          Quét mã QR hoặc chuyển khoản thủ công
                        </p>
                      </div>
                    </label>

                    <label
                      className="flex items-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200"
                      style={{
                        borderColor:
                          paymentMethod === "cod" ? "#3b82f6" : "#e5e7eb",
                        backgroundColor:
                          paymentMethod === "cod" ? "#eff6ff" : "white",
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as "transfer" | "cod")
                        }
                        className="w-4 h-4 text-primary shrink-0"
                      />
                      <div className="ml-3 md:ml-4">
                        <p className="font-semibold text-slate-800 text-sm md:text-base">
                          <FiTruck className="inline mr-2" /> Thanh toán khi nhận hàng
                        </p>
                        <p className="text-xs md:text-sm text-slate-500">
                          Thanh toán tiền mặt khi nhận sách
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">
                    Chi tiết đơn hàng
                  </h2>

                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start pb-3 border-b border-gray-200"
                      >
                        <div className="flex-1 pr-4">
                          <p className="font-semibold text-slate-800 text-sm md:text-base">
                            {item.title}
                          </p>
                          <p className="text-xs md:text-sm text-slate-500">
                            x{item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-primary text-sm md:text-base whitespace-nowrap">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}{" "}
                          đ
                        </p>
                      </div>
                    ))}

                    <div className="flex justify-between pt-3">
                      <span className="font-bold text-base md:text-lg text-slate-800">
                        Tổng cộng:
                      </span>
                      <span className="text-xl md:text-2xl font-bold text-primary">
                        {totalAmount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-4 md:p-6 sticky top-[80px] md:top-40">
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6">
                    Tóm tắt
                  </h3>

                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-200 text-sm md:text-base">
                    <div className="flex justify-between text-slate-600">
                      <span>Tạm tính:</span>
                      <span className="font-semibold">
                        {totalAmount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Phí vận chuyển:</span>
                      <span className="font-semibold text-green-600">
                        Miễn phí
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-4 md:mb-6">
                    <span className="text-base md:text-lg font-bold text-slate-800">
                      Tổng:
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-primary">
                      {totalAmount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 cursor-pointer bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm md:text-base"
                  >
                    {isProcessing ? "Đang xử lý..." : <><FiCheck className="inline mr-2" /> Tiếp tục</>}
                  </button>

                  <Link
                    href="/cart"
                    className="block w-full py-3 bg-gray-100 text-slate-800 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-200 text-center mt-3 text-sm md:text-base"
                  >
                    <FiArrowLeft className="inline mr-2" /> Quay lại giỏ hàng
                  </Link>

                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 text-xs md:text-sm text-slate-500 space-y-2">
                    <p><FiCheck className="inline mr-1" /> Giao hàng toàn quốc</p>
                    <p><FiCheck className="inline mr-1" /> Đổi trả trong 30 ngày</p>
                    <p><FiCheck className="inline mr-1" /> Thanh toán an toàn</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </div>
  );
}
