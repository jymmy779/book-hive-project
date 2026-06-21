"use client";

import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiBook2Line } from "react-icons/ri";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { FiLock, FiLoader } from "react-icons/fi";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputClass =
    "border bg-[#ffff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition duration-200 w-full";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    setLoading(true);

    toast
      .promise(
        axios.post(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/auth/login`,
          {
            email: data.email,
            password: data.password,
          },
          { withCredentials: true },
        ),
        {
          pending: "Đang đăng nhập...",
          success: {
            render({ data }) {
              localStorage.setItem(
                "accessToken_admin",
                data?.data?.accessToken,
              );
              localStorage.setItem(
                "admin_user",
                JSON.stringify(data?.data?.user),
              );
              reset();
              router.push("/admin/dashboard");
              return data?.data?.message;
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return data.response?.data?.message;
              }
              return "Đăng nhập thất bại";
            },
          },
        },
      )
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center py-8 px-4">
        <form
          className="bg-surface px-10 py-12 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex gap-3 items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
              <RiBook2Line size={24} />
            </div>
            <div>
              <h1 className="m-0 text-2xl font-bold text-slate-800" title="BookHive">
                BookHive
              </h1>
              <p className="text-sm text-text-muted">Admin System</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="mb-1 font-medium text-text-primary">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Nhập email"
              className={inputClass}
              {...register("email")}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-error text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="mb-1 font-medium text-text-primary">Mật khẩu</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                className={inputClass + " pr-16"}
                {...register("password")}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-sm text-primary font-semibold focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full transition-colors duration-200 bg-primary cursor-pointer hover:bg-primary-dark text-white py-2 rounded font-semibold mt-4"
            disabled={loading}
          >
            {loading ? (
              <><FiLoader className="animate-spin" size={18} /> Đang xử lý...</>
            ) : (
              <><FiLock size={16} /> Đăng nhập</>
            )}
          </button>
        </form>
      </div>
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
        position="top-center"
      />
    </>
  );
}
