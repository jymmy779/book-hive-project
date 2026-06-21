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
          await axios.patch(`${API_URL}/api/v1/payment/cancel-payment/${code}`);
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
    <div className="min-h-screen py-6 md:py-12 bg-gray-50">
      <div className="container max-w-2xl px-4 mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-6 md:mb-8 text-center md:text-left">
          Thanh toán đơn hàng
        </h1>

        <div className="bg-white rounded-lg shadow p-4 md:p-8 mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">
            Thông tin đơn hàng
          </h2>

          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
            <div className="flex justify-between pb-3 border-b border-gray-200 text-sm md:text-base">
              <span className="text-slate-600">Số lượng đơn:</span>
              <span className="font-semibold text-slate-800">
                {codes.length}
              </span>
            </div>

            <div className="flex justify-between pb-3 border-b border-gray-200 text-sm md:text-base">
              <span className="text-slate-600">Mã đơn hàng:</span>
              <span className="font-semibold text-slate-800 text-right">
                {codes.join(", ")}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 md:pt-3 bg-blue-50 p-3 md:p-4 rounded-lg">
              <span className="text-base md:text-lg font-bold text-slate-800">
                Tổng thanh toán:
              </span>
              <span className="text-lg md:text-2xl font-bold text-primary">
                {totalAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-8 mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">
            Phương thức thanh toán
          </h2>

          <div className="bg-blue-50 border-2 border-primary rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <p className="text-base md:text-lg font-semibold text-slate-800 mb-2">
              <FiCreditCard className="inline mr-2" /> Chuyển khoản ngân hàng qua PayOS
            </p>
            <p className="text-sm md:text-base text-slate-600">
              Quét mã QR hoặc chuyển khoản thủ công. An toàn và nhanh chóng.
            </p>
          </div>

          {!paymentLink ? (
            <button
              onClick={() => handleCreatePaymentLink()}
              disabled={isCreatingLink}
              className="w-full py-3 md:py-4 bg-primary text-white font-bold text-base md:text-lg rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingLink ? <><FiClock className="inline mr-2 animate-spin" /> Đang tạo link...</> : <><FiCheck className="inline mr-2" /> Tạo link thanh toán</>}
            </button>
          ) : (
            <button
              onClick={handlePayment}
              className="w-full py-3 md:py-4 bg-green-600 text-white font-bold text-base md:text-lg rounded-lg hover:bg-green-700 transition-colors duration-200 animate-pulse"
            >
              <FiArrowRight className="inline mr-2" /> Tiến hành thanh toán
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-8">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4">
            <FiBook className="inline mr-2" /> Hướng dẫn thanh toán
          </h2>

          <ol className="space-y-2 md:space-y-3 text-slate-600 text-sm md:text-base">
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

          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
            <button
              onClick={handleBackClick}
              disabled={isCancelling}
              className="py-2 px-0 md:px-4 cursor-pointer text-primary font-semibold hover:text-blue-700 text-sm md:text-base flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
