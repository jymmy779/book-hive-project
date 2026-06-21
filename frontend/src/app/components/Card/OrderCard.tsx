import { Order } from "@/app/interfaces/order.interface";
import Image from "next/image";
import Link from "next/link";
import { FiPackage } from "react-icons/fi";

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    case "processing":
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
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: "Chờ xác nhận",
    processing: "Đang xử lý",
    shipped: "Đã gửi",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    paid: "Đã thanh toán",
  };
  return statusMap[status] || status;
}

export const OrderCard = ({ order }: { order: Order }) => (
  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
    <Link
      href={`/orders/detail/${order.orderCode}`}
      className="block p-4 md:p-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-6 gap-x-2 gap-y-4 md:gap-4 mb-4">
        <div className="md:col-span-2">
          <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-1">
            Mã đơn hàng
          </p>
          <p className="font-mono text-xs md:text-sm font-bold text-slate-900 break-all">
            {order.orderCode}
          </p>
        </div>

        <div>
          <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-1">
            Ngày đặt hàng
          </p>
          <p className="text-xs md:text-sm font-medium text-slate-900">
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div>
          <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-1">
            Số lượng
          </p>
          <p className="text-xs md:text-sm font-medium text-slate-900">
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
          </p>
        </div>

        <div>
          <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-1">
            Tổng tiền
          </p>
          <p className="text-xs md:text-sm font-bold text-primary">
            {order.totalAmount.toLocaleString("vi-VN")} đ
          </p>
        </div>

        <div className="col-span-2 md:col-span-1">
          <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-1">
            Trạng thái
          </p>
          <span
            className={`inline-block px-2 py-1 md:px-3 rounded text-[10px] md:text-xs font-semibold ${getStatusColor(
              order.status,
            )}`}
          >
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      {order.items.length > 0 && (
        <div className="pt-3 md:pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 overflow-hidden">
            {order.items.slice(0, 2).map((item, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-12 h-14 md:w-14 md:h-16 bg-gray-100 rounded overflow-hidden"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    width={400}
                    height={400}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-base md:text-lg">
                    <FiPackage />
                  </div>
                )}
              </div>
            ))}

            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-slate-900 truncate">
                {order.items[0]?.title}
              </p>
              {order.items.length > 2 && (
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
                  + {order.items.length - 2} sản phẩm khác
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Link>

    <Link
      href={`/orders/detail/${order.orderCode}`}
      className="flex items-center justify-between px-4 py-2.5 md:px-6 md:py-3 bg-gray-50 hover:bg-blue-50 border-t border-gray-200 transition-colors duration-200 group"
    >
      <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-primary">
        Xem chi tiết
      </span>
      <svg
        className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-primary transition-colors duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  </div>
);
