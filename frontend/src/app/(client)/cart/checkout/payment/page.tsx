"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { Loading } from "@/app/components/Loading/Loading";
import ConfirmModal from "@/app/components/ConfirmModal/ConfirmModal";
import { FiCreditCard, FiCheck, FiArrowRight, FiBook, FiArrowLeft, FiClock } from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const storedCodes = sessionStorage.getItem("codes");
        const paymentMethod = sessionStorage.getItem("paymentMethod");

        if (!storedCodes || paymentMethod !== "transfer") {
          toast.error("Không có thông tin thanh toán!");
          setTimeout(() => router.push("/cart"), 2000);
          return;
        }

        const parsedCodes = JSON.parse(storedCodes);
        setCodes(parsedCodes);

        const storedTotal = sessionStorage.getItem("totalAmount");
        if (!storedTotal) {
          toast.error("Không tìm thấy tổng tiền đơn hàng!");
          setTimeout(() => router.push("/cart"), 2000);
          return;
        }
        const parsedTotal = Number(storedTotal);
        setTotalAmount(parsedTotal);

        // Kích hoạt tự động tạo link và chuyển hướng ngay lập tức!
        // Giữ trạng thái isLoading = true để tránh nhấp nháy trang
        await handleCreatePaymentLink(parsedCodes, parsedTotal, true);
      } catch (error) {
        toast.error("Có lỗi xảy ra!");
        setTimeout(() => router.push("/cart"), 2000);
      }
    };

    initPayment();
  }, [router]);

  const handleCreatePaymentLink = async (
    targetCodes = codes,
    targetAmount = totalAmount,
    isAuto = false,
  ) => {
    if (targetCodes.length === 0) {
      toast.error("Không có đơn hàng để thanh toán!");
      return;
    }

    if (!isAuto) {
      setIsCreatingLink(true);
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/payment/create-combined`,
        {
          codes: targetCodes,
          amount: targetAmount,
          items: targetCodes.map((code) => ({
            name: code,
            quantity: 1,
            price: targetAmount,
          })),
        },
        {
          headers: {
          },
        },
      );

      if (response.data.error === 0 && response.data.data.checkoutUrl) {
        setPaymentLink(response.data.data.checkoutUrl);
        // Chuyển hướng người dùng trực tiếp sang PayOS ngay lập tức!
        window.location.href = response.data.data.checkoutUrl;
      } else {
        toast.error(response.data.message || "Tạo link thanh toán thất bại!");
        setIsLoading(false);
        setIsCreatingLink(false);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Lỗi tạo link thanh toán!";
      toast.error(errorMsg);
      setIsLoading(false);
      setIsCreatingLink(false);
    }
  };

  const handlePayment = () => {
    if (paymentLink) {
      window.location.href = paymentLink;
    }
  };

  const handleBackClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmBack = async () => {
    setShowConfirmModal(false);
    setIsCancelling(true);

    try {
      for (const code of codes) {
        try {
          await axios.patch(
            `${API_URL}/api/v1/payment/cancel-payment/${code}`,
            {},
            {
              headers: {
              },
            },
          );
        } catch (error) {
          console.error(`Lỗi hủy thanh toán ${code}:`, error);
        }
      }

      sessionStorage.removeItem("codes");
      sessionStorage.removeItem("paymentMethod");
      sessionStorage.removeItem("totalAmount");

      toast.success("Đã hủy đơn hàng");
      setTimeout(() => router.push("/cart"), 1500);
    } catch (error: any) {
      console.error("Lỗi:", error);
      toast.error("Lỗi hủy đơn hàng");
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <Loading
        fullScreen={true}
        size="lg"
        text="Đang kết nối cổng thanh toán PayOS và chuyển hướng..."
      />
    );
  }

  if (isCreatingLink) {
    return (
      <Loading
        fullScreen={true}
        size="lg"
        text="Đang kết nối cổng thanh toán PayOS và chuyển hướng..."
      />
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-12 bg-surface-cream">
      <div className="container max-w-2xl px-4 mx-auto">
        <div className="mb-6 flex items-center gap-3 md:mb-8">
          <div className="rounded-xl bg-primary-light p-2.5 text-primary"><FiCreditCard size={20} /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Thanh toán đơn hàng</h1>
            <p className="mt-1 text-sm text-text-muted">Đơn hàng của bạn đã sẵn sàng</p>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-2 md:mb-8 md:gap-4">
          {["Giỏ hàng", "Giao hàng", "Thanh toán"].map((step, index) => (
            <div key={step} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold md:px-4 md:text-sm ${index === 2 ? "border-primary/20 bg-primary-light text-primary" : "border-border bg-surface text-text-muted"}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${index === 2 ? "bg-primary text-white" : "bg-surface-secondary"}`}>{index + 1}</span>
              {step}
            </div>
          ))}
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 md:p-8 mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-text-primary mb-4 md:mb-6">
            Thông tin đơn hàng
          </h2>

          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
            <div className="flex justify-between pb-3 border-b border-border text-sm md:text-base">
              <span className="text-text-secondary">Số lượng đơn:</span>
              <span className="font-semibold text-text-primary">
                {codes.length}
              </span>
            </div>

            <div className="flex justify-between pb-3 border-b border-border text-sm md:text-base">
              <span className="text-text-secondary">Mã đơn hàng:</span>
              <span className="font-semibold text-text-primary text-right">
                {codes.join(", ")}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 md:pt-3 bg-primary-light p-3 md:p-4 rounded-xl">
              <span className="text-base md:text-lg font-bold text-text-primary">
                Tổng thanh toán:
              </span>
              <span className="text-lg md:text-2xl font-bold text-primary">
                {totalAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 md:p-8 mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-text-primary mb-4 md:mb-6">
            Phương thức thanh toán
          </h2>

          <div className="bg-primary-light border-2 border-primary rounded-xl p-4 md:p-6 mb-4 md:mb-6">
            <p className="text-base md:text-lg font-semibold text-text-primary mb-2">
              <FiCreditCard className="inline mr-2" /> Chuyển khoản ngân hàng qua PayOS
            </p>
            <p className="text-sm md:text-base text-text-secondary">
              Quét mã QR hoặc chuyển khoản thủ công. An toàn và nhanh chóng.
            </p>
          </div>

          {!paymentLink ? (
            <button
              onClick={() => handleCreatePaymentLink()}
              disabled={isCreatingLink}
              className="w-full py-3 md:py-4 bg-primary text-white font-bold text-base md:text-lg rounded-xl hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingLink ? <><FiClock className="inline mr-2 animate-spin" /> Đang tạo link...</> : <><FiCheck className="inline mr-2" /> Tạo link thanh toán</>}
            </button>
          ) : (
            <button
              onClick={handlePayment}
              className="w-full py-3 md:py-4 bg-primary text-white font-bold text-base md:text-lg rounded-xl hover:bg-primary-dark transition-colors duration-200 animate-pulse"
            >
              <FiArrowRight className="inline mr-2" /> Tiến hành thanh toán
            </button>
          )}
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 md:p-8">
          <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3 md:mb-4">
            <FiBook className="inline mr-2" /> Hướng dẫn thanh toán
          </h2>

          <ol className="space-y-2 md:space-y-3 text-text-secondary text-sm md:text-base">
            <li className="flex gap-2 md:gap-3 items-start">
              <span className="font-bold text-primary shrink-0">1.</span>
              <span>Nhấn nút "Tạo link thanh toán" để khởi tạo</span>
            </li>
            <li className="flex gap-2 md:gap-3 items-start">
              <span className="font-bold text-primary shrink-0">2.</span>
              <span>Sau khi tạo thành công, nhấn "Tiến hành thanh toán"</span>
            </li>
            <li className="flex gap-2 md:gap-3 items-start">
              <span className="font-bold text-primary shrink-0">3.</span>
              <span>Quét mã QR hoặc nhập thông tin chuyển khoản</span>
            </li>
            <li className="flex gap-2 md:gap-3 items-start">
              <span className="font-bold text-primary shrink-0">4.</span>
              <span>Sau khi thanh toán, bạn sẽ được chuyển hướng tự động</span>
            </li>
          </ol>

          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
            <button
              onClick={handleBackClick}
              disabled={isCancelling}
              className="py-2 px-0 md:px-4 cursor-pointer text-primary font-semibold hover:text-primary-dark text-sm md:text-base flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiArrowLeft className="inline mr-1" /> {isCancelling ? "Đang hủy..." : "Quay lại"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBack}
        message="Bạn có chắc muốn quay lại? Đơn hàng sẽ bị hủy."
        label="Quay lại"
        labelCancel="Tiếp tục"
      />

      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </div>
  );
}
