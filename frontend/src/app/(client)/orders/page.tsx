"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import Pagination from "@/app/components/Pagination/Pagination";
import { OrderCard } from "@/app/components/Card/OrderCard";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import OrderCardSkeleton from "@/app/components/Skeleton/OrderCardSkeleton";
import { Order } from "@/app/interfaces/order.interface";
import { FiPackage, FiSearch, FiArrowLeft } from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});
type EmailForm = z.infer<typeof emailSchema>;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const limit = 10;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("searchEmail");
    if (savedEmail) {
      setValue("email", savedEmail);
    }
  }, [setValue]);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client_user") || "{}")
      : {};

  useEffect(() => {
    setIsLoggedIn(!!user.email);
  }, [user.email]);

  useEffect(() => {
    if (isLoggedIn && !searchMode) {
      fetchOrdersForLoggedInUser(1);
    }
  }, [isLoggedIn, searchMode]);

  const fetchOrdersForLoggedInUser = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/v1/orders/user/${user.email}`,
        {
          params: { page: currentPage, limit },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken_user")}`,
          },
        },
      );

      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPage(currentPage);
    } catch (error: any) {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOrders = async (
    form: EmailForm,
    searchPage: number = 1,
  ) => {
    try {
      setLoading(true);
      setHasSearched(true);

      localStorage.setItem("searchEmail", form.email.trim());

      const res = await axios.get(
        `${API_URL}/api/v1/orders/user/${form.email.trim()}`,
        {
          params: { page: searchPage, limit },
        },
      );

      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPage(searchPage);

      if (res.data.orders.length === 0) {
        toast.info("Không tìm thấy đơn hàng nào cho email này");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Email không tồn tại hoặc không có đơn hàng",
      );
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToMyOrders = () => {
    setSearchMode(false);
    setValue("email", "");
    localStorage.removeItem("searchEmail");
    setPage(1);
    setHasSearched(false);
    setOrders([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "shipped":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "delivered":
        return "bg-green-50 text-green-700 border border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      shipped: "Đã gửi",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-16">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-2xl shadow p-6 md:p-8 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 text-center md:text-left">
              Tra cứu đơn hàng
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-6 text-center md:text-left">
              Nhập email để xem lịch sử đơn hàng của bạn
            </p>

            <form
              onSubmit={handleSubmit((data) => handleSearchOrders(data, 1))}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Nhập email đặt hàng..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 text-sm md:text-base"
              >
                {loading ? "Đang tìm..." : "Tra cứu"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Bạn là khách hàng đã đăng ký?
              </p>
              <Link
                href="/auth/login"
                className="block w-full py-2.5 bg-blue-50 text-center text-primary font-bold rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm md:text-base"
              >
                Đăng nhập
              </Link>
            </div>
          </div>

          {hasSearched && (
            <div>
              {loading ? (
                <OrderCardSkeleton fullScreen={false} count={3} />
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Tìm thấy {total} đơn hàng
                  </h2>
                  {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))}

                  <Pagination
                    page={page}
                    total={total}
                    limit={limit}
                    onPageChange={(newPage) =>
                      handleSubmit((data) =>
                        handleSearchOrders(data, newPage),
                      )()
                    }
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row gap-3 md:gap-4">
          <button
            onClick={handleSwitchToMyOrders}
            className={`px-4 py-2.5 md:px-6 md:py-3 font-semibold rounded-lg transition-all duration-200 text-sm md:text-base w-full sm:w-auto ${
              !searchMode
                ? "bg-primary text-white shadow-md"
                : "bg-white text-primary border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FiPackage className="inline" /> Đơn hàng của tôi
          </button>
          <button
            onClick={() => {
              setSearchMode(true);
              setValue("email", "");
              setOrders([]);
              setTotal(0);
              setPage(1);
              setHasSearched(false);
            }}
            className={`px-4 py-2.5 md:px-6 md:py-3 font-semibold rounded-lg transition-all duration-200 text-sm md:text-base w-full sm:w-auto ${
              searchMode
                ? "bg-primary text-white shadow-md"
                : "bg-white text-primary border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FiSearch className="inline" /> Tra cứu đơn khác
          </button>
        </div>

        {!searchMode ? (
          <>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-8 md:mb-12">
              Đơn hàng của tôi
            </h1>

            {loading ? (
              <OrderCardSkeleton fullScreen={false} count={4} />
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 md:p-16 shadow-sm text-center">
                <div className="text-4xl md:text-6xl mb-4"><FiPackage /></div>
                <h2 className="text-xl md:text-3xl font-bold text-slate-800 mb-2">
                  Chưa có đơn hàng
                </h2>
                <p className="text-sm md:text-base text-slate-500 mb-8">
                  Bạn chưa mua sản phẩm nào. Hãy bắt đầu mua sắm ngay!
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-sm md:text-base"
                >
                  <FiArrowLeft className="inline mr-1" /> Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>

                <Pagination
                  page={page}
                  total={total}
                  limit={limit}
                  onPageChange={(newPage) => {
                    setLoading(true);
                    fetchOrdersForLoggedInUser(newPage);
                  }}
                />
              </>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 md:mb-8">
              Tra cứu đơn hàng
            </h1>

            <div className="max-w-md mb-8">
              <form
                onSubmit={handleSubmit((data) => handleSearchOrders(data, 1))}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập email để tìm đơn hàng
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Nhập email..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 text-sm md:text-base"
                >
                  {loading ? "Đang tìm..." : "Tra cứu"}
                </button>
              </form>
            </div>
            {hasSearched && (
              <>
                {loading ? (
                  <OrderCardSkeleton fullScreen={false} count={3} />
                ) : orders.length > 0 ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 md:mb-6">
                      Tìm thấy {total} đơn hàng
                    </h2>
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <OrderCard key={order._id} order={order} />
                      ))}
                    </div>

                    <Pagination
                      page={page}
                      total={total}
                      limit={limit}
                      onPageChange={(newPage) => {
                        setLoading(true);
                        handleSubmit((data) =>
                          handleSearchOrders(data, newPage),
                        )();
                      }}
                    />
                  </>
                ) : null}
              </>
            )}
          </>
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
