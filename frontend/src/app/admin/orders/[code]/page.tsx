"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import ConditionalRender from "@/app/components/Auth/ConditionalRender/ConditionalRender";
import { FiArrowLeft, FiPackage, FiSave } from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const statuses = [{ key: "pending", label: "Chờ thanh toán" }, { key: "confirmed", label: "Đã xác nhận" }, { key: "shipping", label: "Đang giao" }, { key: "shipped", label: "Đã gửi hàng" }, { key: "delivered", label: "Hoàn thành" }, { key: "cancelled", label: "Đã hủy" }];
const money = (value?: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const date = (value?: string) => value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short" }).format(new Date(value)) : "—";
type Order = { orderCode: string; userInfo?: { fullName?: string; email?: string; phone?: string; address?: string }; items?: { id?: string; title?: string; price?: number; quantity?: number }[]; totalAmount?: number; status: string; paymentMethod: string; createdAt: string; updatedAt?: string; expiredAt?: string; stockDeducted?: boolean };

export default function OrderDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fetchOrder = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await axios.get(`${API_URL}/api/v1/${ADMIN_PREFIX}/orders/${encodeURIComponent(code)}`); setOrder(response.data.order); setStatus(response.data.order.status); }
    catch (requestError: any) { setError(requestError.response?.status === 404 ? "Không tìm thấy đơn hàng." : "Không tải được chi tiết đơn hàng."); }
    finally { setLoading(false); }
  }, [code]);
  useEffect(() => { fetchOrder(); }, [fetchOrder]);
  const saveStatus = async () => {
    setSaving(true); setError("");
    try { const response = await axios.patch(`${API_URL}/api/v1/${ADMIN_PREFIX}/orders/${encodeURIComponent(code)}/status`, { status }); setOrder(response.data.order); }
    catch (requestError: any) { setError(requestError.response?.data?.message || "Không cập nhật được trạng thái. Hãy kiểm tra quyền chỉnh sửa đơn hàng."); }
    finally { setSaving(false); }
  };
  const field = (label: string, value?: string) => <div><dt className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-text-primary">{value || "—"}</dd></div>;

  return <PrivateRoute permission="view_orders"><div className="mx-auto max-w-6xl space-y-6">
    <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent"><FiArrowLeft/>Quay lại danh sách đơn</Link>
    {loading ? <div className="rounded-xl bg-white p-12 text-center text-text-muted shadow-sm">Đang tải đơn hàng…</div> : error && !order ? <div className="rounded-xl bg-white p-8 text-center text-red-600 shadow-sm">{error}</div> : order && <>
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-lg bg-accent/10 p-2 text-accent"><FiPackage size={22}/></span><div><h1 className="text-2xl font-bold text-text-primary">Đơn {order.orderCode}</h1><p className="mt-1 text-sm text-text-muted">Tạo lúc {date(order.createdAt)}</p></div></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">{statuses.find((item) => item.key === order.status)?.label || order.status}</span></header>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-semibold text-text-primary">Thông tin khách hàng</h2><dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">{field("Họ tên", order.userInfo?.fullName)}{field("Email", order.userInfo?.email)}{field("Điện thoại", order.userInfo?.phone)}<div className="sm:col-span-2"><dt className="text-xs font-medium uppercase tracking-wide text-text-muted">Địa chỉ</dt><dd className="mt-1 text-sm font-medium text-text-primary">{order.userInfo?.address || "—"}</dd></div>{field("Thanh toán", order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản")}{field("Hạn thanh toán", date(order.expiredAt))}{field("Cập nhật lần cuối", date(order.updatedAt))}</dl></section>
      <section className="overflow-hidden rounded-xl bg-white shadow-sm"><h2 className="px-6 pt-6 text-lg font-semibold text-text-primary">Sản phẩm</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-6 py-3">Sách</th><th className="px-6 py-3">Đơn giá</th><th className="px-6 py-3">Số lượng</th><th className="px-6 py-3">Thành tiền</th></tr></thead><tbody className="divide-y divide-gray-100">{order.items?.map((item, index) => <tr key={`${item.id || item.title}-${index}`}><td className="px-6 py-4 font-medium text-text-primary">{item.title || "Sản phẩm"}</td><td className="px-6 py-4">{money(item.price)}</td><td className="px-6 py-4">{item.quantity || 0}</td><td className="px-6 py-4 font-medium">{money((item.price || 0) * (item.quantity || 0))}</td></tr>)}</tbody><tfoot><tr><td colSpan={3} className="px-6 py-4 text-right font-semibold">Tổng đơn</td><td className="px-6 py-4 text-base font-bold text-accent">{money(order.totalAmount)}</td></tr></tfoot></table></div></section>
      <ConditionalRender permission="edit_orders"><section className="flex flex-wrap items-end justify-between gap-4 rounded-xl bg-white p-6 shadow-sm"><div><label htmlFor="order-status" className="mb-2 block text-sm font-semibold text-text-primary">Cập nhật trạng thái</label><select id="order-status" value={status} onChange={(event) => setStatus(event.target.value)} disabled={order.status === "cancelled" || order.status === "delivered"} className="min-h-11 min-w-56 rounded-lg border border-gray-200 bg-white px-3 text-sm disabled:bg-gray-100">{statuses.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></div><button type="button" disabled={saving || status === order.status || order.status === "cancelled" || order.status === "delivered"} onClick={saveStatus} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><FiSave/>{saving ? "Đang lưu…" : "Lưu trạng thái"}</button></section></ConditionalRender>
    </>}
  </div></PrivateRoute>;
}
