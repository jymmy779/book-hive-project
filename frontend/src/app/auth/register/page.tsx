"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  FiHome,
  FiEye,
  FiEyeOff,
  FiUserPlus,
  FiLoader,
  FiMail,
  FiLock,
  FiUser,
  FiBookOpen,
  FiStar,
  FiHeart,
} from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Vui lòng nhập họ tên"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu tối thiểu 6 ký tự"),
    accept: z.literal(true, { message: "Bạn phải đồng ý với điều khoản" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const FEATURES = [
  { icon: FiBookOpen, text: "Truy cập 10,000+ đầu sách độc quyền" },
  { icon: FiStar, text: "Gợi ý cá nhân hóa từ AI BookHive" },
  { icon: FiHeart, text: "Lưu danh sách yêu thích & Theo dõi đơn hàng" },
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/v1/auth/register`, {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => router.push("/auth/login"), 1600);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex bg-surface-cream">
        {/* Left panel – branding */}
        <div className="hidden lg:flex lg:w-[42%] bg-primary flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/3 right-0 w-32 h-64 bg-white/5 rounded-l-full" />

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center p-2">
                <Image
                  src="/book-hive.webp"
                  alt="BookHive logo"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">BookHive</span>
            </Link>
          </div>

          {/* Hero content */}
          <div className="relative z-10 space-y-8">
            <div>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-snug mb-3">
                Tham Gia Cộng Đồng
                <br />
                <span className="text-accent-light opacity-90">Tri Thức BookHive</span>
              </h2>
              <p className="text-primary-light/70 text-base leading-relaxed">
                Tạo tài khoản miễn phí và mở khóa thế giới sách không giới hạn.
              </p>
            </div>

            <div className="space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <blockquote className="text-white/50 text-xs italic border-l-2 border-white/20 pl-3">
              &quot;Đọc sách là cách tốt nhất để du hành mà không cần rời khỏi ghế.&quot;
            </blockquote>
          </div>
        </div>

        {/* Right panel – form */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-8 relative overflow-y-auto">
          {/* Back to home */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg shadow-sm hover:bg-surface-secondary text-text-secondary font-medium text-sm transition"
            >
              <FiHome size={14} />
              <span>Trang chủ</span>
            </Link>
          </div>

          <div className="w-full max-w-sm md:max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 p-1.5 flex items-center justify-center">
                <Image src="/book-hive.webp" alt="logo" width={100} height={100} className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-extrabold text-primary tracking-tight">BookHive</span>
            </div>

            <div className="mb-7">
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Tạo tài khoản</h1>
              <p className="text-text-muted text-sm">
                Đã có tài khoản?{" "}
                <Link href="/auth/login" className="text-accent font-semibold hover:text-accent-hover">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Họ và Tên
                </label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    {...register("fullName")}
                    placeholder="Nhập họ tên đầy đủ"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary bg-surface-secondary transition text-sm"
                    disabled={loading}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-error text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Nhập địa chỉ email"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary bg-surface-secondary transition text-sm"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-11 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary bg-surface-secondary transition text-sm"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary p-1"
                  >
                    {showPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Xác Nhận Mật Khẩu
                </label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-10 pr-11 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary bg-surface-secondary transition text-sm"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary p-1"
                  >
                    {showConfirmPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("accept")}
                  className="w-4 h-4 rounded border-border mt-0.5 focus:ring-2 focus:ring-primary shrink-0 accent-primary"
                  disabled={loading}
                />
                <span className="text-xs text-text-secondary leading-relaxed">
                  Tôi đồng ý với{" "}
                  <Link href="/terms" className="text-primary hover:underline font-medium">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">
                    Chính sách bảo mật
                  </Link>{" "}
                  của BookHive
                </span>
              </label>
              {errors.accept && (
                <p className="text-error text-xs -mt-2">{errors.accept.message}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-md"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={16} />
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    <FiUserPlus size={15} />
                    Tạo Tài Khoản
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
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
