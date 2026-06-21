"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import { FiLock } from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu tối thiểu 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem("forgotPasswordEmail");

    if (!storedEmail) {
      router.push("/forgot-password");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  const handleResetPassword = async (formData: ResetPasswordForm) => {
    setIsLoading(true);

    try {
      const response = await axios.patch(
        `${API_URL}/api/v1/auth/reset-password`,
        {
          email: email,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
      );

      if (response.data.success) {
        toast.success("Đặt lại mật khẩu thành công");
        setIsSuccess(true);
        localStorage.removeItem("forgotPasswordEmail");
        localStorage.removeItem("otpExpiresAt");

        setTimeout(() => {
          router.push("/auth/login");
        }, 6000);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Đặt lại mật khẩu thất bại!";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-surface-secondary py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-lg shadow-lg p-8 md:p-10 max-w-[440px] w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
            Thành Công!
          </h1>
          <p className="text-slate-600 mb-6 text-sm md:text-base leading-relaxed">
            Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập với
            mật khẩu mới.
          </p>
          <p className="text-sm text-slate-500 animate-pulse">
            Đang chuyển hướng đến trang đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center bg-surface-secondary py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="flex justify-start">
          <BackButton className="flex items-center gap-2 hover:opacity-80 transition-opacity text-slate-600" />
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Đặt Lại Mật Khẩu
            </h1>
            <p className="text-sm md:text-base text-slate-600">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
            {email && (
              <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                {email}
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit(handleResetPassword)}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mật Khẩu Mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-4 py-3 md:py-3.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm md:text-base placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs md:text-sm mt-1.5 font-medium">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-3 md:py-3.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm md:text-base placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs md:text-sm mt-1.5 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm md:text-base shadow-md"
            >
              {isLoading ? "Đang cập nhật..." : <><FiLock className="inline" /> Cập Nhật Mật Khẩu</>}
            </button>
          </form>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2.5">
              <span className="text-base flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>
              </span>
              <p className="text-xs md:text-sm text-blue-800 leading-snug">
                <strong>Gợi ý:</strong> Sử dụng mật khẩu mạnh kết hợp chữ hoa,
                chữ thường, số và ký tự đặc biệt.
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
