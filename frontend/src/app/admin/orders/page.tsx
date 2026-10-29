"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import { FiSearch, FiShoppingBag } from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const PAGE_SIZE = 20;
const labels: Record<string, string> = { pending: "Chờ thanh toán", confirmed: "Đã xác nhận", shipping: "Đang giao", shipped: "Đã gửi hàng", delivered: "Hoàn thành", cancelled: "Đã hủy" };
const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const date = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
type Order = { _id: string; orderCode: string; userInfo?: { fullName?: string; email?: string; phone?: string }; totalAmount: number; status: string; paymentMethod: string; createdAt: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchOrders = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await axios.get(`${API_URL}/api/v1/${ADMIN_PREFIX}/orders`, { params: { page, limit: PAGE_SIZE, status: status || undefined, keyword: search || undefined } });
      setOrders(response.data.orders || []); setTotal(response.data.total || 0);
    } catch { setError("Không tải được đơn hàng. Hãy kiểm tra quyền xem đơn hàng của tài khoản admin."); }
    finally { setLoading(false); }
  }, [page, search, status]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return <PrivateRoute permission="view_orders"><div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-text-primary">Quản lý đơn hàng</h1><p className="mt-1 text-sm text-text-muted">Tra cứu thông tin và theo dõi tiến trình xử lý đơn.</p></div><div className="rounded-xl bg-white px-5 py-3 shadow-sm"><span className="text-sm text-text-muted">Tổng đơn hàng</span><p className="text-xl font-semibold text-text-primary">{total.toLocaleString("vi-VN")}</p></div></header>
    <section className="rounded-xl bg-white p-4 shadow-sm"><div className="flex flex-wrap gap-3"><form onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(keyword.trim()); }} className="flex min-w-[260px] flex-1 gap-2"><div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3"><FiSearch className="text-gray-400"/><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm mã đơn, tên, email hoặc số điện thoại" className="w-full py-2.5 text-sm outline-none"/></div><button className="rounded-lg bg-accent px-4 text-sm font-medium text-white">Tìm</button></form><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"><option value="">Tất cả trạng thái</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div></section>
    <section className="overflow-hidden rounded-xl bg-white shadow-sm">{error && <p className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Mã đơn / Khách hàng</th><th className="px-5 py-3">Ngày tạo</th><th className="px-5 py-3">Thanh toán</th><th className="px-5 py-3">Tổng tiền</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Chi tiết</th></tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">Đang tải đơn hàng…</td></tr> : orders.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">Không tìm thấy đơn hàng.</td></tr> : orders.map((order) => <tr key={order._id} className="hover:bg-gray-50/70"><td className="px-5 py-4"><Link className="font-semibold text-accent hover:underline" href={`/admin/orders/${encodeURIComponent(order.orderCode)}`}>{order.orderCode}</Link><div className="mt-1 text-text-primary">{order.userInfo?.fullName || "Khách hàng"}</div><div className="mt-0.5 text-xs text-text-muted">{order.userInfo?.email}</div></td><td className="whitespace-nowrap px-5 py-4">{date(order.createdAt)}</td><td className="px-5 py-4">{order.paymentMethod === "cod" ? "COD" : "Chuyển khoản"}</td><td className="whitespace-nowrap px-5 py-4 font-semibold">{money(order.totalAmount)}</td><td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">{labels[order.status] || order.status}</span></td><td className="px-5 py-4"><Link className="inline-flex items-center gap-2 font-medium text-accent hover:underline" href={`/admin/orders/${encodeURIComponent(order.orderCode)}`}><FiShoppingBag/>Mở đơn</Link></td></tr>)}</tbody></table></div><footer className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-sm"><span className="text-text-muted">Trang {page} / {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Trước</button><button disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Sau</button></div></footer></section>
  </div></PrivateRoute>;
}
