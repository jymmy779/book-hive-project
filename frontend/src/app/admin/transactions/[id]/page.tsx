"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import { FiArrowLeft, FiCreditCard } from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

type Detail = {
  transaction: {
    _id: string;
    orderCode: string;
    bankCode: string;
    accountNo: string;
    amount: number;
    description: string;
    transactionDate: string | null;
    status: string;
    verifiedAt: string | null;
    createdAt: string;
  };
  order: {
    orderCode: string;
    userInfo?: { fullName?: string; email?: string; phone?: string; address?: string };
    items?: { id?: string; title: string; price: number; quantity: number; image?: string; slug?: string }[];
    totalAmount?: number;
    paymentMethod?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    expiredAt?: string;
  } | null;
};

const money = (value?: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const dateTime = (value?: string | null) => value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short" }).format(new Date(value)) : "—";
const transactionStatuses: Record<string, string> = { success: "Thành công", pending: "Đang chờ", failed: "Thất bại" };
const orderStatuses: Record<string, string> = { pending: "Chờ thanh toán", confirmed: "Đã xác nhận", shipping: "Đang giao", shipped: "Đã gửi hàng", delivered: "Hoàn thành", cancelled: "Đã hủy" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><dt className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-text-primary">{children || "—"}</dd></div>;
}

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/api/v1/${ADMIN_PREFIX}/transactions/${params.id}`, {
      
    }).then((response) => {
      if (active) setDetail(response.data);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.status === 404 ? "Không tìm thấy giao dịch." : "Không tải được chi tiết giao dịch.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  const transaction = detail?.transaction;
  const order = detail?.order;
  const isDemo = transaction?.description?.startsWith("DEMO-SEED") || transaction?.bankCode === "DEMO";

  return (
    <PrivateRoute permission="view_transactions">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/admin/transactions" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent"><FiArrowLeft />Quay lại danh sách giao dịch</Link>
        {loading ? <div className="rounded-xl bg-white p-12 text-center text-text-muted shadow-sm">Đang tải chi tiết giao dịch…</div> : error ? <div className="rounded-xl bg-white p-8 text-center text-red-600 shadow-sm">{error}</div> : transaction && <>
          <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-white p-6 shadow-sm">
            <div><div className="flex items-center gap-3"><span className="rounded-lg bg-accent/10 p-2 text-accent"><FiCreditCard size={22} /></span><h1 className="text-2xl font-bold text-text-primary">Chi tiết giao dịch</h1></div><p className="mt-3 text-sm text-text-muted">Mã giao dịch <span className="font-semibold text-text-primary">{transaction._id}</span></p></div>
            <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1.5 text-sm font-medium ${transaction.status === "success" ? "bg-green-50 text-green-700" : transaction.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{transactionStatuses[transaction.status] || transaction.status}</span>{isDemo && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">Dữ liệu demo</span>}</div>
          </header>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-text-primary">Thông tin thanh toán</h2>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Số tiền">{money(transaction.amount)}</Field>
              <Field label="Trạng thái">{transactionStatuses[transaction.status] || transaction.status}</Field>
              <Field label="Ngân hàng">{transaction.bankCode}</Field>
              <Field label="Tài khoản nhận">•••• {transaction.accountNo?.slice(-4) || "—"}</Field>
              <Field label="Thời gian giao dịch">{dateTime(transaction.transactionDate)}</Field>
              <Field label="Thời gian ghi nhận">{dateTime(transaction.createdAt)}</Field>
              <Field label="Thời gian xác minh">{dateTime(transaction.verifiedAt)}</Field>
              <div className="sm:col-span-2"><Field label="Nội dung chuyển khoản">{transaction.description}</Field></div>
            </dl>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-text-primary">Đơn hàng liên quan</h2>{order && <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-text-secondary">{orderStatuses[order.status || ""] || order.status || "Không rõ trạng thái"}</span>}</div>
            {!order ? <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Không tìm thấy đơn hàng khớp với mã giao dịch này.</p> : <>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Mã đơn hàng">{order.orderCode}</Field>
                <Field label="Trạng thái đơn">{orderStatuses[order.status || ""] || order.status}</Field>
                <Field label="Phương thức thanh toán">{order.paymentMethod === "transfer" ? "Chuyển khoản" : order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : order.paymentMethod}</Field>
                <Field label="Khách hàng">{order.userInfo?.fullName}</Field>
                <Field label="Email">{order.userInfo?.email}</Field>
                <Field label="Số điện thoại">{order.userInfo?.phone}</Field>
                <Field label="Địa chỉ giao hàng">{order.userInfo?.address}</Field>
                <Field label="Tổng tiền đơn">{money(order.totalAmount)}</Field>
                <Field label="Tạo đơn lúc">{dateTime(order.createdAt)}</Field>
                <Field label="Cập nhật lúc">{dateTime(order.updatedAt)}</Field>
                <Field label="Hạn thanh toán">{dateTime(order.expiredAt)}</Field>
              </dl>
              <div className="mt-7 overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Sách</th><th className="px-4 py-3">Đơn giá</th><th className="px-4 py-3">Số lượng</th><th className="px-4 py-3">Thành tiền</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">{(order.items || []).map((item, index) => <tr key={`${item.id || item.slug || item.title}-${index}`}><td className="px-4 py-3 font-medium">{item.title}</td><td className="px-4 py-3">{money(item.price)}</td><td className="px-4 py-3">{item.quantity}</td><td className="px-4 py-3 font-medium">{money(item.price * item.quantity)}</td></tr>)}</tbody>
                  <tfoot><tr><td colSpan={3} className="px-4 py-3 text-right font-semibold">Tổng đơn</td><td className="px-4 py-3 font-bold">{money(order.totalAmount)}</td></tr></tfoot>
                </table>
              </div>
            </>}
          </section>
        </>}
      </div>
    </PrivateRoute>
  );
}
