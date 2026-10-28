"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  FiHome,
  FiEye,
  FiEyeOff,
  FiLock,
  FiLoader,
  FiMail,
  FiBookOpen,
  FiStar,
} from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: FiBookOpen, text: "Hơn 500+ đầu sách chất lượng" },
  { icon: FiStar, text: "Gợi ý sách thông minh bởi AI" },
  { icon: FiLock, text: "Bảo mật tuyệt đối cho tài khoản" },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/v1/auth/loginWithPassword`,
        data,
        {},
      );
      toast.success("Đăng nhập thành công!");
      setTimeout(() => router.push("/"), 1600);
    } catch (err: any) {
      toast.error(err.response?.data?.message, { autoClose: 1600 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const token = credentialResponse.credential;
      await axios.post(
        `${API_URL}/api/v1/auth/loginWithGoogle`,
        { token },
        {},
      );
      toast.success("Đăng nhập với Google thành công!");
      setTimeout(() => router.push("/"), 1600);
    } catch (err: any) {
      toast.error(err.response?.data?.message, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Đăng nhập Google thất bại", { autoClose: 2000 });
  };

  return (
    <>
      <div className="min-h-screen flex bg-surface-cream">
        {/* Left panel – branding */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-primary flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/3 right-0 w-32 h-64 bg-white/5 rounded-l-full" />

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center p-2">
                <Image
                  src="/book-hive.webp"
                  alt="BookHive logo"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                BookHive
              </span>
            </Link>
          </div>

          {/* Hero content */}
          <div className="relative z-10 space-y-8">
            <div>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-snug mb-3">
                Chào mừng trở lại,
                <br />
                <span className="text-accent-light opacity-90">Bạn Đọc Thân Mến</span>
              </h2>
              <p className="text-primary-light/70 text-base leading-relaxed">
                Đăng nhập để tiếp tục hành trình khám phá tri thức cùng BookHive.
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

          {/* Footer quote */}
          <div className="relative z-10">
            <blockquote className="text-white/50 text-xs italic border-l-2 border-white/20 pl-3">
              &quot;Một cuốn sách tốt là người bạn đồng hành không bao giờ phản bội.&quot;
            </blockquote>
          </div>
        </div>

        {/* Right panel – form */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-8 relative">
          {/* Back to home (mobile & desktop) */}
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
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Đăng nhập</h1>
              <p className="text-text-muted text-sm">
                Chưa có tài khoản?{" "}
                <Link href="/auth/register" className="text-accent font-semibold hover:text-accent-hover">
                  Đăng ký miễn phí
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Nhập email của bạn"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-sm font-semibold text-text-primary">
                    Mật Khẩu
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-accent hover:text-accent-hover font-medium"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Nhập mật khẩu"
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md mt-1"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={16} />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <FiLock size={15} />
                    Đăng Nhập
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-surface-cream text-text-muted font-medium">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Google */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="100%"
              />
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-text-muted mt-6">
              Bằng cách đăng nhập, bạn đồng ý với{" "}
              <Link href="/terms" className="text-primary hover:underline">Điều khoản dịch vụ</Link>
              {" "}và{" "}
              <Link href="/privacy" className="text-primary hover:underline">Chính sách bảo mật</Link>
            </p>
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
