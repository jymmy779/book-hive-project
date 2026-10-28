"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import EditProfileSkeleton from "@/app/components/Skeleton/EditProfileSkeleton";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import { FiUser, FiMail, FiPhone, FiSave } from "react-icons/fi";
import { ScrollReveal } from "@/app/components/Animation/ScrollReveal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 3 ký tự"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^0\d{9,10}$/.test(val),
      "Số điện thoại không hợp lệ",
    ),
});

export default function EditProfilePage() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/v1/users/me`)
      .then((res) => {
        setForm({
          fullName: res.data.user.fullName || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
        });
      })
      .catch(() => {
        toast.error("Không lấy được thông tin người dùng");
        router.replace("/profile");
      })
      .finally(() => setIsPageLoading(false));
  }, [router]);

  const handleChange = (e: any) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors({});
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { [k: string]: string } = {};
      result.error.issues.forEach((err) => {
        if (typeof err.path[0] === "string")
          fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    toast
      .promise(
        axios.patch(
          `${API_URL}/api/v1/users/edit`,
          { fullName: form.fullName, phone: form.phone },
          {},
        ),
        {
          pending: "Đang cập nhật...",
          success: {
            render({ data }) {
              return data?.data?.message || "Cập nhật thành công!";
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return data.response?.data?.message || "Cập nhật thất bại";
              }
              return "Cập nhật thất bại";
            },
          },
        },
      )
      .finally(() => setLoading(false));
  };

  if (isPageLoading) {
    return <EditProfileSkeleton />;
  }

  const initials = form.fullName
    ? form.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5]">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] pt-10 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 20%, #10b981 0%, transparent 50%)" }} />
        <div className="relative z-10 container mx-auto max-w-xl">
          <BackButton className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-medium transition-all cursor-pointer border border-white/20" />        </div>
      </div>

      {/* Avatar overlap */}
      <div className="container mx-auto max-w-xl px-4 -mt-16 pb-12">
        <ScrollReveal direction="up" distance={20} duration={0.4}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
              {initials}
            </div>
            <p className="mt-3 text-sm text-[#6b7280] font-medium">
              Chỉnh sửa thông tin cá nhân
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden"
          >
          <div className="p-6 sm:p-8 space-y-5">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#374151] mb-2">
                <FiUser className="text-[#064e3b]" size={15} />
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl text-sm bg-[#faf8f5] transition-all outline-none
                  ${errors.fullName
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#d1d5db] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                  }`}
                disabled={loading}
                autoComplete="off"
                placeholder="Nhập họ và tên"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1.5">{errors.fullName}</p>
              )}
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#374151] mb-2">
                <FiMail className="text-[#064e3b]" size={15} />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-3 border border-[#d1d5db] rounded-xl text-sm bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                  autoComplete="off"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af] bg-[#e5e7eb] px-2 py-0.5 rounded-full">
                  Không thể đổi
                </span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#374151] mb-2">
                <FiPhone className="text-[#064e3b]" size={15} />
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl text-sm bg-[#faf8f5] transition-all outline-none
                  ${errors.phone
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#d1d5db] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                  }`}
                disabled={loading}
                autoComplete="off"
                placeholder="Nhập số điện thoại (nếu có)"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl border border-[#d1d5db] text-sm font-semibold text-[#374151] hover:bg-[#f3f4f6] transition-all cursor-pointer"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#064e3b] text-white text-sm font-semibold hover:bg-[#065f46] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <FiSave size={15} />
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
        </ScrollReveal>
      </div>

      <ToastContainer autoClose={1500} hideProgressBar pauseOnHover={false} />
    </div>
  );
}
