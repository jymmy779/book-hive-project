"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { Order } from "@/app/interfaces/order.interface";
import OrderDetailSkeleton from "@/app/components/Skeleton/OrderDetailSkeleton";
import { FiClock, FiCheckCircle, FiXCircle, FiTruck, FiInfo, FiRefreshCw, FiArrowLeft } from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusMap: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: FiClock,
  },
  processing: {
    label: "Đang xử lý",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: FiRefreshCw,
  },
  shipped: {
    label: "Đã gửi",
    color: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: FiTruck,
  },
  delivered: {
    label: "Đã giao",
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: FiCheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: FiXCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] || {
    label: status,
    color: "bg-gray-100 text-gray-700 border border-gray-200",
    icon: FiInfo,
  };
  const IconComponent = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${s.color}`}
    >
      <IconComponent className="text-sm" />
      <span>{s.label}</span>
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
        const res = await axios.get(`${API_URL}/api/v1/orders/detail/${code}`);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 sm:p-8 text-center">
          <div className="text-lg font-bold mb-2">Không tìm thấy đơn hàng</div>
          <Link
            href="/orders"
            className="inline-block mt-4 px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 transition"
          >
            <FiArrowLeft className="inline mr-1" /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="container mx-auto px-2 sm:px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 md:p-10">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
              Chi tiết đơn hàng
            </h1>
            <span className="text-xs sm:text-sm text-gray-500">
              Mã đơn:{" "}
              <span className="font-semibold break-all">{order.orderCode}</span>
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              Thông tin người nhận
            </h2>
            <div className="text-xs sm:text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-medium min-w-[80px]">Họ tên:</span>
                <span>{order.userInfo.fullName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-medium min-w-[80px]">Email:</span>
                <span className="break-all">{order.userInfo.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-medium min-w-[80px]">Điện thoại:</span>
                <span>{order.userInfo.phone}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-medium min-w-[80px]">Địa chỉ:</span>
                <span>{order.userInfo.address}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              Sản phẩm
            </h2>
            <div className="divide-y border-t border-b">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 py-4 items-start sm:items-center"
                >
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={80}
                        height={120}
                        className="w-16 h-24 object-cover rounded border border-gray-100"
                      />
                    </div>
                    <div className="flex-1 min-w-0 sm:hidden">
                      <div className="font-semibold text-sm truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        x{item.quantity}
                      </div>
                      <div className="text-sm font-bold text-primary mt-1">
                        {(item.price * item.quantity).toLocaleString()}₫
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base truncate">
                      {item.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Đơn giá: {item.price.toLocaleString()}₫
                    </div>
                  </div>
                  <div className="hidden sm:block font-bold text-primary text-right min-w-[100px] text-sm sm:text-base">
                    {(item.price * item.quantity).toLocaleString()}₫
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="w-full sm:w-auto flex justify-between sm:block">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                Phương thức thanh toán
              </div>
              <div className="font-semibold text-sm sm:text-base">
                {order.paymentMethod === "transfer" ? "Chuyển khoản" : "COD"}
              </div>
            </div>
            <div className="w-full sm:w-auto flex justify-between sm:block text-right sm:text-left">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                Trạng thái
              </div>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center border-t pt-6 gap-3">
            <div className="text-base sm:text-lg font-bold">Tổng cộng</div>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {order.totalAmount.toLocaleString()}₫
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href="/orders"
              className="w-full sm:w-auto text-center px-4 py-3 sm:py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
            >
              <FiArrowLeft className="inline mr-1" /> Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
