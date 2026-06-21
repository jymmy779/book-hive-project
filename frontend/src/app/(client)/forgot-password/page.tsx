"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        router.push("/forgot-password/verify-otp");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, router]);

  const handleSendOtp = async (formData: ForgotPasswordForm) => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/forgot-password/send-otp`,
        {
          email: formData.email,
        },
      );

      if (response.data.success) {
        localStorage.setItem("forgotPasswordEmail", formData.email);
        localStorage.setItem("otpExpiresAt", response.data.expiresAt);

        toast.success("OTP đã được gửi tới email của bạn");
        setShouldRedirect(true);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Gửi OTP thất bại!";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center bg-surface-secondary py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="flex justify-start">
          <BackButton className="flex cursor-pointer items-center gap-2 hover:opacity-80 transition-opacity text-slate-600" />
        </div>

        <div className="bg-surface rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 md:w-8 md:h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Quên Mật Khẩu?
            </h1>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed px-2">
              Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Địa chỉ Email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="Nhập email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm md:text-base placeholder:text-gray-400"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs md:text-sm mt-1.5 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm md:text-base shadow-md"
            >
              {isLoading ? "Đang gửi..." : "Gửi Mã OTP"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs md:text-sm text-slate-500 text-center">
              Bạn chưa nhận được email?
            </p>
            <p className="text-xs md:text-sm text-slate-500 text-center mt-1 flex flex-col sm:block">
              Kiểm tra thư mục spam hoặc liên hệ
              <a
                href="mailto:bookhivestore161@gmail.com"
                target="_blank"
                className="text-primary font-semibold hover:underline sm:ml-1 break-all"
              >
                bookhivestore161@gmail.com
              </a>
            </p>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2.5">
              <span className="text-base flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>
              </span>
              <p className="text-xs md:text-sm text-blue-800 leading-snug">
                <strong>Mẹo:</strong> Mã OTP sẽ hết hạn sau 5 phút. Vui lòng
                kiểm tra email ngay.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
        position="top-center"
      />
    </div>
  );
}
