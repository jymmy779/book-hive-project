"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import { FiCreditCard, FiSearch } from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const PAGE_SIZE = 20;

type Transaction = {
  _id: string;
  orderCode: string;
  bankCode: string;
  accountNo: string;
  amount: number;
  description: string;
  transactionDate: string | null;
  status: "success" | "pending" | "failed";
  verifiedAt: string | null;
  createdAt: string;
  order?: { userInfo?: { fullName?: string }; status?: string } | null;
};

const statusLabels: Record<Transaction["status"], string> = {
  success: "Thành công",
  pending: "Đang chờ",
  failed: "Thất bại",
};
const orderStatusLabels: Record<string, string> = {
  pending: "Chờ thanh toán", confirmed: "Đã xác nhận", shipping: "Đang giao",
  shipped: "Đã gửi hàng", delivered: "Hoàn thành", cancelled: "Đã hủy",
};
const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const dateTime = (value?: string | null) => value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/api/v1/${ADMIN_PREFIX}/transactions`, {
        params: { page, limit: PAGE_SIZE, status: status || undefined, keyword: search || undefined },
        
      });
      setTransactions(response.data.transactions || []);
      setTotal(response.data.total || 0);
    } catch {
      setError("Không tải được giao dịch. Hãy kiểm tra quyền xem giao dịch của tài khoản admin.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(keyword.trim());
  };
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PrivateRoute permission="view_transactions">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Giao dịch</h1>
            <p className="mt-1 text-sm text-text-muted">Theo dõi giao dịch thanh toán và đơn hàng liên quan.</p>
          </div>
          <div className="rounded-xl bg-white px-5 py-3 shadow-sm"><span className="text-sm text-text-muted">Tổng giao dịch</span><p className="text-xl font-semibold text-text-primary">{total.toLocaleString("vi-VN")}</p></div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <form onSubmit={submitSearch} className="flex min-w-[260px] flex-1 gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3"><FiSearch className="text-gray-400" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm mã đơn, ngân hàng, nội dung chuyển khoản" className="w-full py-2.5 text-sm outline-none" /></div>
              <button className="rounded-lg bg-accent px-4 text-sm font-medium text-white">Tìm</button>
            </form>
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <option value="">Tất cả trạng thái</option><option value="success">Thành công</option><option value="pending">Đang chờ</option><option value="failed">Thất bại</option>
            </select>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {error && <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Mã đơn / Khách hàng</th><th className="px-5 py-3">Ngân hàng</th><th className="px-5 py-3">Nội dung chuyển khoản</th><th className="px-5 py-3">Số tiền</th><th className="px-5 py-3">Thời gian giao dịch</th><th className="px-5 py-3">Trạng thái</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">Đang tải giao dịch…</td></tr> : transactions.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">Không tìm thấy giao dịch.</td></tr> : transactions.map((transaction) => {
                  const isDemo = transaction.description?.startsWith("DEMO-SEED") || transaction.bankCode === "DEMO";
                  return <tr key={transaction._id} onClick={() => { window.location.href = `/admin/transactions/${transaction._id}`; }} className="align-top cursor-pointer hover:bg-gray-50/70">
                    <td className="px-5 py-4"><div className="font-semibold text-text-primary">{transaction.orderCode}</div><div className="mt-1 text-xs text-text-muted">{transaction.order?.userInfo?.fullName || "Không có đơn hàng"}</div>{transaction.order?.status && <div className="mt-1 text-xs text-text-muted">Đơn: {orderStatusLabels[transaction.order.status] || transaction.order.status}</div>}</td>
                    <td className="px-5 py-4"><div className="flex items-center gap-2 font-medium"><FiCreditCard className="text-gray-400" />{transaction.bankCode || "—"}</div><div className="mt-1 text-xs text-text-muted">TK •••• {transaction.accountNo?.slice(-4) || "—"}</div></td>
                    <td className="max-w-[300px] px-5 py-4"><div className="break-words text-text-primary">{transaction.description || "—"}</div>{isDemo && <span className="mt-1 inline-block rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">Dữ liệu demo</span>}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold">{money(transaction.amount)}</td><td className="whitespace-nowrap px-5 py-4">{dateTime(transaction.transactionDate || transaction.createdAt)}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${transaction.status === "success" ? "bg-green-50 text-green-700" : transaction.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{statusLabels[transaction.status] || transaction.status}</span>{transaction.verifiedAt && <div className="mt-1 text-xs text-text-muted">Xác minh: {dateTime(transaction.verifiedAt)}</div>}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-sm"><span className="text-text-muted">Trang {page} / {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Trước</button><button disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Sau</button></div></div>
        </div>
      </div>
    </PrivateRoute>
  );
}
