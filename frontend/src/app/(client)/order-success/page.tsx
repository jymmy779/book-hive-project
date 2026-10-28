"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import { FiCheckCircle, FiClipboard, FiHome, FiBookOpen, FiAlertCircle, FiCheck } from "react-icons/fi";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      const singleCode = searchParams.get("code");
      const multipleCodes = searchParams.get("codes");
      const displayCode = multipleCodes || singleCode;

      if (displayCode) {
        setOrderCode(displayCode);
        setIsLoaded(true);
        toast.success("Đặt hàng thành công!");

        await clearCart();

        sessionStorage.removeItem("orderCode");
        sessionStorage.removeItem("codes");
        sessionStorage.removeItem("paymentMethod");
        sessionStorage.removeItem("totalAmount");

        localStorage.removeItem("guest_cart");
      } else {
        toast.error("Không tìm thấy thông tin đơn hàng!");
        router.replace("/");
      }
    };
    run();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-cream flex items-center justify-center py-8 px-4 md:py-12">
      <div className="container max-w-2xl mx-auto">
        <div className="bg-surface rounded-3xl border border-border shadow-xl p-6 md:p-10 text-center">
          <div className="text-5xl md:text-7xl mb-4 md:mb-6 animate-bounce text-primary">
            <FiCheckCircle />
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2 md:mb-4">
            Đặt Hàng Thành Công!
          </h1>

          <p className="text-base md:text-xl text-text-secondary mb-6 md:mb-8 flex items-center justify-center gap-2">
            Cảm ơn bạn đã mua sắm tại BookHive <FiBookOpen className="inline" />
          </p>

          {orderCode && (
            <div className="bg-primary-light border border-primary/20 rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
              <p className="text-xs md:text-sm text-text-secondary mb-2 md:mb-3">
                Mã đơn hàng của bạn:
              </p>
              <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                <p className="text-xl md:text-3xl font-bold text-primary font-mono break-all">
                  {orderCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(orderCode.toString());
                    toast.success("Đã sao chép mã đơn hàng!");
                  }}
                  className="text-primary cursor-pointer hover:text-primary-dark text-xl md:text-2xl transition-colors flex-shrink-0"
                  title="Sao chép"
                >
                  <FiClipboard />
                </button>
              </div>
            </div>
          )}

          <div className="bg-surface-secondary border border-border p-4 md:p-6 rounded-2xl mb-6 md:mb-8 text-left">
            <h3 className="font-bold text-primary mb-3 md:mb-4 text-base md:text-lg flex items-center gap-2">
              <FiClipboard className="shrink-0" /> Thông tin đơn hàng:
            </h3>
            <ul className="text-sm text-text-secondary space-y-2 md:space-y-3">
              <li className="flex items-start gap-2 md:gap-3">
                <span className="text-base md:text-lg shrink-0 text-success"><FiCheck /></span>
                <span>Đơn hàng đã được tạo và thanh toán thành công</span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <span className="text-base md:text-lg shrink-0 text-success"><FiCheck /></span>
                <span>Chúng tôi sẽ xác nhận đơn hàng trong 24 giờ</span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <span className="text-base md:text-lg shrink-0 text-success"><FiCheck /></span>
                <span>Hàng sẽ được gửi trong 3-5 ngày làm việc</span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <span className="text-base md:text-lg shrink-0 text-success"><FiCheck /></span>
                <span>Bạn sẽ nhận email xác nhận và mã vận chuyển</span>
              </li>
            </ul>
          </div>

          <div className="bg-accent-light border border-accent/20 p-4 md:p-6 rounded-2xl mb-6 md:mb-8">
            <p className="text-sm text-text-primary text-left md:text-center">
              <span className="font-bold"><FiAlertCircle className="inline mr-1" /> Tip:</span> Lưu mã đơn hàng để theo
              dõi đơn hàng của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <Link
              href="/"
              className="py-2.5 md:py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors text-center text-sm md:text-base"
            >
              <FiHome className="inline" /> Quay về trang chủ
            </Link>
            <Link
              href="/books"
              className="py-2.5 md:py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors text-center text-sm md:text-base"
            >
              <FiBookOpen className="inline" /> Tiếp tục mua sắm
            </Link>
          </div>

          <p className="text-xs text-text-muted mt-6 p-3 bg-surface-secondary rounded-xl break-all">
            Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ:
            bookhivestore161@gmail.com
          </p>
        </div>
      </div>

      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </div>
  );
}
