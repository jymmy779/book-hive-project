"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import axios from "axios";
import { useParams } from "next/navigation";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AccountResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkedMatch, setCheckedMatch] = useState(true);
  const [loading, setLoading] = useState(false);

  const accessToken = localStorage.getItem("accessToken_admin");

  const params = useParams();
  const slug = params.slug;

  useEffect(() => {
    if (confirmPassword !== "" && !(newPassword === confirmPassword)) {
      setCheckedMatch(false);
    } else {
      setCheckedMatch(true);
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!checkedMatch || !newPassword) {
      toast.error("Mật khẩu không hợp lệ hoặc không khớp!");
      return;
    }
    setLoading(true);

    toast
      .promise(
        axios.patch(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/accounts/reset-password/${slug}`,
          { newPassword },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          },
        ),
        {
          pending: "Đang cập nhật...",
          success: {
            render({ data }) {
              return data?.data?.message;
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return data.response?.data?.message;
              }
              return "Cập nhật mật khẩu thất bại";
            },
          },
        },
      )
      .then(() => {
        setNewPassword("");
        setConfirmPassword("");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <PrivateRoute permission="reset_password">
        <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow relative">
          <BackButton className="absolute -top-10 -left-80 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />

          <h1 className="text-2xl font-bold mb-6 text-primary">
            Đặt lại mật khẩu tài khoản
          </h1>

          <form className="space-y-5">
            <div>
              <label className="block mb-1 font-medium text-primary">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="border bg-[#fff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition duration-200 w-full"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium text-primary">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="border bg-[#fff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition duration-200 w-full"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {!checkedMatch && (
                <span className="text-red-500 text-[12px] italic">
                  Mật khẩu không khớp
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="showPassword"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((v) => !v)}
              />
              <label
                htmlFor="showPassword"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Hiện mật khẩu
              </label>
            </div>
            <button
              type="submit"
              className="w-full transition-colors duration-200 bg-primary cursor-pointer hover:bg-primary-dark text-white py-2 rounded font-semibold mt-1"
              onClick={handleSubmit}
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
          <ToastContainer
            autoClose={1500}
            hideProgressBar={true}
            pauseOnHover={false}
          />
        </div>
      </PrivateRoute>
    </>
  );
}
