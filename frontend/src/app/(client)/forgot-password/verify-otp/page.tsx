"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP phải là 6 chữ số")
    .regex(/^\d+$/, "OTP chỉ chứa các chữ số"),
});

type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimeLeft, setResendTimeLeft] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const timeLeftRef = useRef(0);
  const resendTimeLeftRef = useRef(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otpValue = watch("otp");

  useEffect(() => {
    const storedEmail = localStorage.getItem("forgotPasswordEmail");
    const storedExpiresAt = localStorage.getItem("otpExpiresAt");

    if (!storedEmail || !storedExpiresAt) {
      router.push("/forgot-password");
      return;
    }

    setEmail(storedEmail);

    const calculateTimeLeft = () => {
      const expiresAt = new Date(storedExpiresAt).getTime();
      const now = new Date().getTime();
      const secondsLeft = Math.floor((expiresAt - now) / 1000);

      if (secondsLeft <= 0) {
        timeLeftRef.current = 0;
        setResendTimeLeft(0);
        return 0;
      }

      timeLeftRef.current = secondsLeft;
      return secondsLeft;
    };

    calculateTimeLeft();
    setResendTimeLeft(60);
    resendTimeLeftRef.current = 60;
    setIsInitialized(true);

    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    if (resendTimeLeftRef.current <= 0) return;

    const timer = setInterval(() => {
      resendTimeLeftRef.current -= 1;
      setResendTimeLeft(Math.max(0, resendTimeLeftRef.current));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOtp = async (formData: VerifyOtpForm) => {
    if (!email) {
      toast.error("Email không hợp lệ");
      return;
    }

    if (timeLeftRef.current <= 0) {
      toast.error("OTP đã hết hạn. Vui lòng gửi lại OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/forgot-password/verify-otp`,
        {
          email,
          otp: formData.otp,
        },
      );

      if (response.data.success) {
        toast.success("OTP xác nhận thành công");
        localStorage.removeItem("otpExpiresAt");

        setTimeout(() => {
          router.push("/reset-password");
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Xác nhận OTP thất bại!";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/forgot-password/send-otp`,
        {
          email,
        },
      );

      if (response.data.success) {
        const newExpiresAt = response.data.expiresAt;
        localStorage.setItem("otpExpiresAt", newExpiresAt);

        const expiresAtTime = new Date(newExpiresAt).getTime();
        const nowTime = new Date().getTime();
        const secondsLeft = Math.floor((expiresAtTime - nowTime) / 1000);

        timeLeftRef.current = secondsLeft;
        resendTimeLeftRef.current = 60;
        setResendTimeLeft(60);

        toast.success("OTP mới đã được gửi");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Gửi lại OTP thất bại!";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendMinutes = Math.floor(resendTimeLeft / 60);
  const resendSeconds = resendTimeLeft % 60;

  if (!isInitialized) {
    return null;
  }

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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Xác Nhận OTP
            </h1>
            <p className="text-sm md:text-base text-slate-600">
              Nhập mã OTP 6 chữ số được gửi tới email của bạn
            </p>
            {email && (
              <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                {email}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mã OTP
              </label>
              <input
                type="text"
                {...register("otp")}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-center text-2xl md:text-3xl tracking-[0.25em] md:tracking-[0.5em] font-mono placeholder:tracking-normal text-slate-800"
                disabled={isLoading}
              />
              {errors.otp && (
                <p className="text-red-500 text-xs md:text-sm mt-1.5 font-medium text-center">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpValue.length !== 6}
              className="w-full cursor-pointer py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm md:text-base shadow-md"
            >
              {isLoading ? "Đang xác nhận..." : "Xác Nhận OTP"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs md:text-sm text-slate-600 text-center mb-3">
              Không nhận được mã?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={
                isLoading || (resendTimeLeft > 0 && timeLeftRef.current > 0)
              }
              className="w-full py-2.5 cursor-pointer border-2 border-primary text-primary font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base active:scale-[0.98]"
            >
              {resendTimeLeft > 0 && timeLeftRef.current > 0
                ? `Gửi lại OTP (${resendMinutes}:${resendSeconds.toString().padStart(2, "0")})`
                : "Gửi lại OTP"}
            </button>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-2.5">
              <span className="text-base flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </span>
              <p className="text-xs md:text-sm text-amber-800 leading-snug">
                <strong>Lưu ý:</strong> OTP sẽ hết hạn sau 3 phút. Nếu bạn không
                nhận được, vui lòng yêu cầu gửi lại.
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
