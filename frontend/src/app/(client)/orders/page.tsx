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
import { FiPackage, FiSearch, FiArrowLeft, FiMail } from "react-icons/fi";
import { ScrollReveal } from "@/app/components/Animation/ScrollReveal";
import { useUser } from "@/contexts/UserContext";

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

  const { user } = useUser();

  useEffect(() => {
    setIsLoggedIn(Boolean(user?.email));
  }, [user]);

  useEffect(() => {
    if (isLoggedIn && !searchMode) {
      fetchOrdersForLoggedInUser(1);
    }
  }, [isLoggedIn, searchMode]);

  const fetchOrdersForLoggedInUser = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/v1/orders/user/${user?.email}`,
        {
          params: { page: currentPage, limit },
          headers: {
          },
        },
      );
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPage(currentPage);
    } catch {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOrders = async (form: EmailForm, searchPage: number = 1) => {
    try {
      setLoading(true);
      setHasSearched(true);
      localStorage.setItem("searchEmail", form.email.trim());

      const res = await axios.get(
        `${API_URL}/api/v1/orders/user/${form.email.trim()}`,
        { params: { page: searchPage, limit } },
      );

      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPage(searchPage);

      if (res.data.orders.length === 0) {
        toast.info("Không tìm thấy đơn hàng nào cho email này");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Email không tồn tại hoặc không có đơn hàng",
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

  // Guest user — email lookup UI
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-surface-cream py-8 md:py-16 px-4">
        <div className="container mx-auto max-w-lg">
          {/* Header card */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary-light rounded-xl">
                <FiSearch size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-primary">
                  Tra cứu đơn hàng
                </h1>
                <p className="text-sm text-text-muted">
                  Nhập email để xem lịch sử đơn hàng của bạn
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit((data) => handleSearchOrders(data, 1))}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Nhập email đặt hàng..."
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface-secondary text-sm transition"
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <FiSearch size={15} />
                {loading ? "Đang tìm..." : "Tra cứu đơn hàng"}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-sm text-text-muted mb-3 text-center">
                Bạn là khách hàng đã đăng ký?
              </p>
              <Link
                href="/auth/login"
                className="block w-full py-2.5 bg-primary-light text-center text-primary font-bold rounded-xl hover:bg-primary-subtle transition-all text-sm"
              >
                Đăng nhập để xem đơn hàng
              </Link>
            </div>
          </div>

          {hasSearched && (
            <div>
              {loading ? (
                <OrderCardSkeleton fullScreen={false} count={3} />
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                    <FiPackage size={16} />
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
                      handleSubmit((data) => handleSearchOrders(data, newPage))()
                    }
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
        <ToastContainer autoClose={1500} hideProgressBar={true} pauseOnHover={false} />
      </div>
    );
  }

  // Logged-in user
  return (
    <div className="min-h-screen bg-surface-cream py-6 md:py-10 px-4">
      <div className="container mx-auto">
        {/* Tab switcher */}
        <ScrollReveal direction="down" distance={16} duration={0.4}>
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSwitchToMyOrders}
              className={`px-5 py-2.5 font-semibold rounded-xl transition-all text-sm flex items-center gap-2 justify-center w-full sm:w-auto cursor-pointer ${
                !searchMode
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface border border-border text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              <FiPackage size={15} />
              Đơn hàng của tôi
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
              className={`px-5 py-2.5 font-semibold rounded-xl transition-all text-sm flex items-center gap-2 justify-center w-full sm:w-auto cursor-pointer ${
                searchMode
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface border border-border text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              <FiSearch size={15} />
              Tra cứu đơn khác
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" distance={20} duration={0.4} delay={0.05}>

        {!searchMode ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-light rounded-xl">
                <FiPackage size={18} className="text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">
                Đơn hàng của tôi
              </h1>
            </div>

            {loading ? (
              <OrderCardSkeleton fullScreen={false} count={4} />
            ) : orders.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-border p-10 md:p-16 shadow-sm text-center">
                <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
                  <FiPackage size={36} className="text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">
                  Chưa có đơn hàng nào
                </h2>
                <p className="text-text-muted text-sm mb-8">
                  Bạn chưa mua sản phẩm nào. Hãy bắt đầu mua sắm ngay!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-md text-sm"
                >
                  <FiArrowLeft size={15} />
                  Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:space-y-4">
                  {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>
                <div className="mt-6">
                  <Pagination
                    page={page}
                    total={total}
                    limit={limit}
                    onPageChange={(newPage) => {
                      setLoading(true);
                      fetchOrdersForLoggedInUser(newPage);
                    }}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-light rounded-xl">
                <FiSearch size={18} className="text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">
                Tra cứu đơn hàng
              </h1>
            </div>

            <div className="max-w-md mb-8 bg-surface rounded-2xl border border-border shadow-sm p-5 md:p-6">
              <form
                onSubmit={handleSubmit((data) => handleSearchOrders(data, 1))}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Nhập email để tìm đơn hàng
                  </label>
                  <div className="relative">
                    <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="Nhập email..."
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface-secondary text-sm transition"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-error text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <FiSearch size={15} />
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
                    <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                      <FiPackage size={16} />
                      Tìm thấy {total} đơn hàng
                    </h2>
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <OrderCard key={order._id} order={order} />
                      ))}
                    </div>
                    <div className="mt-6">
                      <Pagination
                        page={page}
                        total={total}
                        limit={limit}
                        onPageChange={(newPage) => {
                          setLoading(true);
                          handleSubmit((data) => handleSearchOrders(data, newPage))();
                        }}
                      />
                    </div>
                  </>
                ) : null}
              </>
            )}
          </>
        )}
        </ScrollReveal>
      </div>
      <ToastContainer autoClose={1500} hideProgressBar={true} pauseOnHover={false} />
    </div>
  );
}
