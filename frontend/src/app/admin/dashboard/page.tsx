"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  FiActivity,
  FiArrowDownRight,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";

type DashboardStats = {
  totalBooks: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

const getStatusStyle = (status: string) => {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "confirmed":
    case "processing":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "shipping":
    case "shipped":
      return "border-violet-200 bg-violet-50 text-violet-800";
    case "delivered":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao",
    shipped: "Đã gửi",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
};

const formatCurrency = (amount: number) =>
  `${amount.toLocaleString("vi-VN")} ₫`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken_admin")}`,
            },
            withCredentials: true,
            signal: controller.signal,
          },
        );

        setStats({
          totalBooks: response.data?.totalBooks || 0,
          totalOrders: response.data?.totalOrders || 0,
          totalUsers: response.data?.totalUsers || 0,
          totalRevenue: response.data?.totalRevenue || 0,
          recentOrders: response.data?.recentOrders || [],
        });
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        console.error("Error fetching dashboard stats:", err);
        setError(
          `Lỗi: ${err.response?.data?.message || "Không thể tải dữ liệu dashboard"}`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    return () => controller.abort();
  }, []);

  const metrics = [
    {
      label: "Tổng sách đang hoạt động",
      value: stats.totalBooks.toLocaleString("vi-VN"),
      icon: FiBookOpen,
      tone: "bg-emerald-50 text-emerald-800",
      iconTone: "bg-emerald-100 text-emerald-800",
      note: "Đầu sách trong cửa hàng",
    },
    {
      label: "Tổng đơn hàng",
      value: stats.totalOrders.toLocaleString("vi-VN"),
      icon: FiShoppingBag,
      tone: "bg-sky-50 text-sky-800",
      iconTone: "bg-sky-100 text-sky-800",
      note: "Đơn hàng đã ghi nhận",
    },
    {
      label: "Tổng người dùng",
      value: stats.totalUsers.toLocaleString("vi-VN"),
      icon: FiUsers,
      tone: "bg-violet-50 text-violet-800",
      iconTone: "bg-violet-100 text-violet-800",
      note: "Tài khoản khách hàng",
    },
    {
      label: "Doanh thu đã giao",
      value: formatCurrency(stats.totalRevenue),
      icon: FiDollarSign,
      tone: "bg-amber-50 text-amber-900",
      iconTone: "bg-amber-100 text-amber-900",
      note: "Tổng đơn đã giao thành công",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f7f8f5] p-5 sm:p-8 lg:p-10">
        <div
          className="mx-auto max-w-7xl animate-pulse space-y-8"
          aria-label="Đang tải dashboard"
        >
          <div className="h-36 rounded-3xl bg-white ring-1 ring-stone-200" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-40 rounded-2xl bg-white ring-1 ring-stone-200"
              />
            ))}
          </div>
          <div className="h-80 rounded-3xl bg-white ring-1 ring-stone-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] bg-[#f7f8f5] p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <FiActivity size={22} aria-hidden="true" />
          </div>
          <h1 className="mt-5  text-2xl font-semibold text-stone-900">
            Không thể tải tổng quan
          </h1>
          <p role="alert" className="mt-2 text-sm leading-6 text-rose-800">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8 lg:space-y-10">
        <header className="relative overflow-hidden rounded-[1.75rem] bg-[#183d32] px-6 py-7 text-white shadow-lg shadow-emerald-950/10 sm:px-9 sm:py-9">
          <div className="pointer-events-none absolute -right-14 -top-32 h-80 w-80 rounded-full border-[48px] border-white/[0.04]" />
          <div className="pointer-events-none absolute bottom-[-7rem] right-1/4 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-emerald-50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Không gian quản trị BookHive
              </div>
              <h1 className="mt-5  text-3xl font-medium tracking-tight sm:text-4xl">
                Tổng quan cửa hàng
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
                Theo dõi sách, đơn hàng, khách hàng và doanh thu đã hoàn tất ở
                một nơi.
              </p>
            </div>
            <Link
              href="/admin/books"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-[#d6e7a5] px-4 text-sm font-semibold text-[#17362d] transition-colors hover:bg-[#e3f0c0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#183d32]"
            >
              Quản lý sách <FiArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </header>

        <section aria-labelledby="metrics-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
                Sức khỏe cửa hàng
              </p>
              <h2
                id="metrics-heading"
                className="mt-1  text-2xl font-semibold tracking-tight text-stone-900"
              >
                Các chỉ số chính
              </h2>
            </div>
            <span className="hidden items-center gap-1.5 text-xs font-medium text-stone-500 sm:inline-flex">
              <FiActivity size={14} aria-hidden="true" /> Dữ liệu hiện tại
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article
                  key={metric.label}
                  className="group rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.iconTone}`}
                    >
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${metric.tone}`}
                    >
                      Tổng quan
                    </span>
                  </div>
                  <p className="mt-5 text-sm font-medium text-stone-600">
                    {metric.label}
                  </p>
                  <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-stone-950 sm:text-[1.75rem]">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs text-stone-500">{metric.note}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="recent-orders-heading"
          className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3ec] text-[#285642]">
                <FiPackage size={19} aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="recent-orders-heading"
                  className=" text-xl font-semibold text-stone-900"
                >
                  Đơn hàng gần đây
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  5 đơn hàng mới nhất trong hệ thống
                </p>
              </div>
            </div>
            <Link
              href="/admin/transactions"
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg px-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              Xem giao dịch <FiArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
                <FiClock size={21} aria-hidden="true" />
              </div>
              <p className="mt-4 font-medium text-stone-800">
                Chưa có đơn hàng
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Các đơn hàng mới sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#fafbf9] text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                    <th scope="col" className="px-6 py-3.5">
                      Mã đơn hàng
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Ngày đặt
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Tổng tiền
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {stats.recentOrders.map((order: any) => (
                    <tr
                      key={order._id}
                      className="transition-colors hover:bg-[#fafbf8]"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/admin/transactions/${order._id}`}
                          className="font-mono text-sm font-semibold text-emerald-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                        >
                          {order.orderCode || "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <p className="max-w-[220px] truncate text-sm font-medium text-stone-800">
                          {order.userInfo?.fullName || "Khách hàng"}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {order.userInfo?.phone || "Chưa có số điện thoại"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-stone-600">
                        {order.createdAt ? formatDate(order.createdAt) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-stone-900">
                        {formatCurrency(order.totalAmount || 0)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(order.status)}`}
                        >
                          {order.status === "delivered" ? (
                            <FiCheckCircle size={12} aria-hidden="true" />
                          ) : order.status === "pending" ? (
                            <FiClock size={12} aria-hidden="true" />
                          ) : (
                            <FiArrowDownRight size={12} aria-hidden="true" />
                          )}
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
