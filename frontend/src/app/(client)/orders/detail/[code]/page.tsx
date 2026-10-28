"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { Order } from "@/app/interfaces/order.interface";
import OrderDetailSkeleton from "@/app/components/Skeleton/OrderDetailSkeleton";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiInfo,
  FiRefreshCw,
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusMap: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "Chờ xác nhận",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: FiClock,
  },
  processing: {
    label: "Đang xử lý",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: FiRefreshCw,
  },
  shipped: {
    label: "Đã gửi",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: FiTruck,
  },
  delivered: {
    label: "Đã giao",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: FiCheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: FiXCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] || {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: FiInfo,
  };
  const IconComponent = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <IconComponent className="text-sm" />
      {s.label}
    </span>
  );
}

export default function OrderDetailPage() {
  const { code } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/v1/orders/detail/${code}`, {
          headers: {
          },
        });
        setOrder(res.data.order);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Không tìm thấy đơn hàng!",
        );
        router.replace("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [code, router]);

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#faf8f5] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#064e3b]/10 flex items-center justify-center mx-auto mb-4">
            <FiInfo className="text-[#064e3b]" size={28} />
          </div>
          <div className="text-lg font-bold text-[#1f2937] mb-1">
            Không tìm thấy đơn hàng
          </div>
          <p className="text-sm text-[#6b7280] mb-6">
            Đơn hàng không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#064e3b] text-white text-sm font-semibold hover:bg-[#065f46] transition-all"
          >
            <FiArrowLeft size={15} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5]">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] py-8 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #d97706 0%, transparent 60%), radial-gradient(circle at 80% 20%, #10b981 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 container mx-auto max-w-2xl">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors mb-4"
          >
            <FiArrowLeft size={15} />
            Quay lại danh sách đơn hàng
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Chi tiết đơn hàng
              </h1>
              <p className="text-white/70 text-sm mt-0.5">
                Mã đơn:{" "}
                <span className="font-semibold text-amber-300 break-all">
                  {order.orderCode}
                </span>
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-4">
        {/* Recipient Info */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f3f4f6]">
            <h2 className="text-sm font-bold text-[#374151] uppercase tracking-wider">
              Thông tin người nhận
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { icon: FiUser, label: "Họ tên", value: order.userInfo.fullName },
              { icon: FiMail, label: "Email", value: order.userInfo.email },
              { icon: FiPhone, label: "Điện thoại", value: order.userInfo.phone },
              { icon: FiMapPin, label: "Địa chỉ", value: order.userInfo.address },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#064e3b]/8 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="text-[#064e3b]" size={14} />
                </div>
                <div>
                  <p className="text-xs text-[#9ca3af] font-medium">{label}</p>
                  <p className="text-sm text-[#1f2937] font-medium break-all">
                    {value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#374151] uppercase tracking-wider">
              Sản phẩm
            </h2>
            <span className="text-xs text-[#6b7280]">
              {order.items.length} cuốn
            </span>
          </div>
          <div className="divide-y divide-[#f3f4f6]">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 sm:p-5 items-start">
                <div className="shrink-0 rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#f9fafb]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={80}
                    height={112}
                    className="w-16 h-[88px] sm:w-20 sm:h-[112px] object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1f2937] line-clamp-2 mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    Đơn giá:{" "}
                    <span className="text-[#6b7280]">
                      {item.price.toLocaleString("vi-VN")}₫
                    </span>
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    Số lượng:{" "}
                    <span className="text-[#6b7280]">x{item.quantity}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-[#064e3b]">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Total */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f3f4f6]">
            <h2 className="text-sm font-bold text-[#374151] uppercase tracking-wider">
              Thanh toán
            </h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <FiCreditCard size={15} />
                Phương thức
              </div>
              <span className="text-sm font-semibold text-[#1f2937]">
                {order.paymentMethod === "transfer"
                  ? "Chuyển khoản"
                  : "Thanh toán khi nhận hàng (COD)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6b7280]">Trạng thái đơn</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="pt-3 border-t border-[#f3f4f6] flex items-center justify-between">
              <span className="text-base font-bold text-[#1f2937]">
                Tổng cộng
              </span>
              <span className="text-xl font-extrabold text-[#064e3b]">
                {order.totalAmount.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-end pb-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#064e3b] text-white text-sm font-semibold hover:bg-[#065f46] transition-all shadow-sm"
          >
            <FiArrowLeft size={15} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}
