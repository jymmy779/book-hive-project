"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { StatCard } from "@/app/components/Card/StatCard";

type DashboardStats = {
  totalBooks: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "processing":
      return "bg-secondary1";
    case "shipped":
      return "bg-purple-500";
    case "delivered":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
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
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken_admin");

        if (!token) {
          setError("Không có token, vui lòng đăng nhập lại");
          setLoading(false);
          return;
        }

        const [booksRes, ordersRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/books`),
          axios.get(`${API_URL}/api/v1/orders`),
          axios.get(`${API_URL}/api/v1/users`),
        ]);

        const books = booksRes.data?.books || [];
        const orders = ordersRes.data?.orders || [];
        const accounts = usersRes.data?.users || [];

        const totalRevenue = orders
          .filter((order: any) => order.status === "delivered")
          .reduce(
            (sum: number, order: any) => sum + (order.totalAmount || 0),
            0,
          );

        setStats({
          totalBooks: booksRes.data?.total || books.length,
          totalOrders: ordersRes.data?.total || orders.length,
          totalUsers: usersRes.data?.total || accounts.length,
          totalRevenue,
          recentOrders: orders.slice(0, 5),
        });
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        setError(
          `Lỗi: ${err.response?.data?.message || "Không thể tải dữ liệu dashboard"}`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      {loading ? (
        <div className="text-center text-gray-500 mt-[200px]">Đang tải...</div>
      ) : error ? (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-8">Trang tổng quan</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Tổng sách đang hoạt động"
              value={stats.totalBooks}
              color="bg-secondary1"
            />
            <StatCard
              label="Tổng đơn hàng"
              value={stats.totalOrders}
              color="bg-green-500"
            />
            <StatCard
              label="Tổng người dùng"
              value={stats.totalUsers}
              color="bg-purple-500"
            />
            <StatCard
              label="Tổng doanh thu"
              value={`${stats.totalRevenue.toLocaleString()}đ`}
              color="bg-orange-500"
            />
          </div>
          {stats.recentOrders.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Đơn hàng gần đây</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Mã đơn hàng</th>
                    <th className="text-left p-2">Khách hàng</th>
                    <th className="text-left p-2">Số điện thoại</th>
                    <th className="text-left p-2">Tổng tiền</th>
                    <th className="text-left p-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order: any) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-sm font-mono">
                        {order.orderCode}
                      </td>
                      <td className="p-2">
                        {order.userInfo?.fullName || "Liên hệ"}
                      </td>
                      <td className="p-2">
                        {order.userInfo?.phone || "Liên hệ"}
                      </td>
                      <td className="p-2 font-semibold">
                        {order.totalAmount?.toLocaleString()}đ
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-3 py-1 rounded text-white text-sm font-medium ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
