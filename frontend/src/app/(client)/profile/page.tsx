"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Logout from "@/app/components/Auth/Logout/Logout";
import { ToastContainer, toast } from "react-toastify";
import ProfileSkeleton from "@/app/components/Skeleton/ProfileSkeleton";
import { ScrollReveal } from "@/app/components/Animation/ScrollReveal";
import {
  FiUser,
  FiPackage,
  FiHeart,
  FiEdit3,
  FiMail,
  FiPhone,
  FiChevronRight,
  FiShield,
  FiBookOpen,
  FiLock,
} from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [favCount, setFavCount] = useState<number>(0);
  const [editingInfo, setEditingInfo] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`${API_URL}/api/v1/users/me`, {
          
        });
        const userData = userRes.data.user;
        setUser(userData);
        setProfileName(userData.fullName || "");
        setProfilePhone(userData.phone || "");

        // Fetch counts for orders and favorites in parallel
        const [ordersRes, favsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/v1/orders/user/${userData.email}?limit=1`, {
          }),
          axios.get(`${API_URL}/api/v1/favorites?limit=1`, {
          }),
        ]);

        if (ordersRes.status === "fulfilled") {
          setOrderCount(ordersRes.value.data.total || 0);
        }
        if (favsRes.status === "fulfilled") {
          setFavCount(favsRes.value.data.total || 0);
        }
      } catch {
        setUser(null);
        toast.error("Không lấy được thông tin người dùng, vui lòng đăng nhập lại!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const profileChanged = !!user && (profileName !== user.fullName || profilePhone !== (user.phone || ""));

  const saveProfile = async () => {
    if (!user || !profileChanged) return;
    setSavingInfo(true);
    try {
      const response = await axios.patch(`${API_URL}/api/v1/users/edit`, { fullName: profileName, phone: profilePhone }, {
        
      });
      const updatedUser = response.data.user || { ...user, fullName: profileName, phone: profilePhone };
      setUser(updatedUser);
      setEditingInfo(false);
      toast.success("Đã lưu thông tin cá nhân.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không lưu được thông tin cá nhân.");
    } finally { setSavingInfo(false); }
  };

  const savePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPasswordError(""); setPasswordMessage("");
    if (newPassword.length < 8) return setPasswordError("Mật khẩu mới cần có ít nhất 8 ký tự.");
    if (newPassword !== confirmPassword) return setPasswordError("Mật khẩu xác nhận không khớp.");
    setSavingPassword(true);
    try {
      await axios.patch(`${API_URL}/api/v1/auth/change-password`, { currentPassword, newPassword, confirmPassword }, {
      });
      setPasswordMessage("Đã lưu mật khẩu mới."); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || "Không đổi được mật khẩu. Vui lòng thử lại.");
    } finally { setSavingPassword(false); }
  };

  if (isLoading) return <ProfileSkeleton />;

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-[#faf8f5]">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-[#e7e2d9] shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-[#064e3b]/10 flex items-center justify-center mx-auto mb-5">
            <FiUser size={36} className="text-[#064e3b]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1c1917] mb-2">
            Bạn chưa đăng nhập
          </h1>
          <p className="text-[#78716c] text-sm mb-6">
            Vui lòng đăng nhập để xem thông tin cá nhân và quản lý đơn hàng
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/login"
              className="px-6 py-2.5 bg-[#064e3b] text-white rounded-xl font-semibold hover:bg-[#065f46] transition-all shadow-sm text-sm"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2.5 bg-white border border-[#e7e2d9] text-[#1c1917] rounded-xl font-semibold hover:bg-[#faf8f5] transition-all text-sm"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get initials for avatar
  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "BH";

  return (
    <>
      <div className="min-h-screen bg-[#faf8f5] py-6 md:py-10 px-4">
        <div className="container mx-auto max-w-3xl space-y-6">

          {/* Main Profile Header Card */}
          <ScrollReveal direction="down" distance={16} duration={0.4}>
            <div className="bg-white rounded-3xl border border-[#e7e2d9] shadow-sm overflow-hidden">
            {/* Header banner */}
            <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] h-32 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, #d97706 0%, transparent 60%), radial-gradient(circle at 80% 20%, #10b981 0%, transparent 60%)",
                }}
              />
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-amber-300 border border-white/20">
                  <FiShield size={14} />
                  Độc giả BookHive
                </span>
              </div>
            </div>

            {/* Avatar & User Details */}
            <div className="px-6 md:px-8 pb-6 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  {/* Chỉ duy nhất Avatar có negative margin để nổi lên banner */}
                  <div className="-mt-12 w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-white flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
                    {initials}
                  </div>
                  <div className="pb-1">
                    <h1 className="text-xl md:text-2xl md:mt-2 font-extrabold text-[#1c1917] tracking-tight">
                      {user.fullName}
                    </h1>
                    <p className="text-sm text-[#78716c] font-medium mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pb-1">
                  <button
                    onClick={() => { setEditingInfo((value) => !value); setProfileName(user.fullName); setProfilePhone(user.phone || ""); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#064e3b] hover:bg-[#065f46] text-white font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <FiEdit3 size={15} />
                    {editingInfo ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
                  </button>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#f2ede4]">
                <Link
                  href="/orders"
                  className="bg-[#faf8f5] hover:bg-[#f5f0ea] border border-[#e7e2d9]/60 p-2.5 sm:p-3.5 rounded-2xl text-center transition-all group"
                >
                  <p className="text-2xl font-extrabold text-[#064e3b] group-hover:scale-105 transition-transform">
                    {orderCount}
                  </p>
                  <p className="text-xs font-medium text-[#78716c] mt-0.5">
                    Đơn hàng
                  </p>
                </Link>

                <Link
                  href="/favorites"
                  className="bg-[#faf8f5] hover:bg-[#f5f0ea] border border-[#e7e2d9]/60 p-2.5 sm:p-3.5 rounded-2xl text-center transition-all group"
                >
                  <p className="text-2xl font-extrabold text-[#d97706] group-hover:scale-105 transition-transform">
                    {favCount}
                  </p>
                  <p className="text-xs font-medium text-[#78716c] mt-0.5">
                    Sách yêu thích
                  </p>
                </Link>

                <div className="bg-[#faf8f5] border border-[#e7e2d9]/60 p-2.5 sm:p-3.5 rounded-2xl text-center">
                  <p className="text-xs font-medium text-[#78716c] mb-1">
                    Trạng thái
                  </p>
                  <div className="flex items-center justify-center gap-1 text-sm font-bold text-emerald-600 mt-1 sm:text-base">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Hoạt động
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

          {/* Account Information Details Grid */}
          <ScrollReveal direction="up" distance={20} duration={0.4}>
            <div className="bg-white rounded-3xl border border-[#e7e2d9] shadow-sm p-6 md:p-8">
            <h2 className="text-base font-bold text-[#1c1917] mb-4 flex items-center gap-2">
              <FiUser className="text-[#064e3b]" size={18} />
              Thông tin chi tiết
            </h2>

            {editingInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e7e2d9]/60 text-sm font-medium text-[#57534e]">Họ và tên<input value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-2 w-full rounded-lg border border-[#e7e2d9] bg-white px-3 py-2.5 text-[#1c1917] outline-none focus:border-[#064e3b]" /></label>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e7e2d9]/60"><p className="text-xs text-[#78716c] font-medium">Email đăng nhập</p><p className="mt-2 text-sm font-semibold text-[#1c1917] break-all">{user.email}</p><p className="mt-1 text-xs text-[#a8a29e]">Email không thể chỉnh sửa.</p></div>
                <label className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e7e2d9]/60 text-sm font-medium text-[#57534e]">Số điện thoại<input type="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} placeholder="Nhập số điện thoại" className="mt-2 w-full rounded-lg border border-[#e7e2d9] bg-white px-3 py-2.5 text-[#1c1917] outline-none focus:border-[#064e3b]" /></label>
                <div className="flex items-end gap-2 p-4">
                  {profileChanged && <button disabled={savingInfo} onClick={saveProfile} className="rounded-xl bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{savingInfo ? "Đang lưu…" : "Lưu thay đổi"}</button>}
                  <button onClick={() => { setEditingInfo(false); setProfileName(user.fullName); setProfilePhone(user.phone || ""); }} className="rounded-xl border border-[#e7e2d9] bg-white px-5 py-2.5 text-sm font-semibold text-[#57534e]">Hủy</button>
                </div>
              </div>
            ) : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e7e2d9]/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e7e2d9] flex items-center justify-center text-[#064e3b]">
                    <FiPhone size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-[#78716c] font-medium">Số điện thoại</p>
                    <p className="text-sm font-semibold text-[#1c1917]">
                      {user.phone || (
                        <span className="text-[#a8a29e] font-normal italic">
                          Chưa cập nhật
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-2xl border border-[#e7e2d9]/60 bg-[#faf8f5] p-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-3 sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e7e2d9] bg-white text-[#064e3b]">
                    <FiMail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#78716c]">Email đăng nhập</p>
                    <p className="break-words text-sm font-semibold text-[#1c1917]">
                      {user.email}
                    </p>
                  </div>
                <span className="col-start-2 row-start-2 w-fit shrink-0 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 sm:col-auto sm:row-auto">
                  Đã xác thực
                </span>
              </div>
            </div>}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" distance={20} duration={0.4} delay={0.05}>
          <section className="rounded-3xl border border-[#e7e2d9] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#064e3b]"><FiLock size={18} /></span><div><h2 className="font-bold text-[#1c1917]">Mật khẩu</h2><p className="text-xs text-[#78716c]">Cập nhật mật khẩu đăng nhập của bạn</p></div></div>
              <button onClick={() => { setShowPasswordForm((value) => !value); setPasswordError(""); setPasswordMessage(""); }} className="rounded-xl border border-[#e7e2d9] px-4 py-2 text-sm font-semibold text-[#064e3b] hover:bg-[#faf8f5]">{showPasswordForm ? "Đóng" : "Đổi mật khẩu"}</button>
            </div>
            {showPasswordForm && <form onSubmit={savePassword} className="mt-6 grid gap-4 border-t border-[#f2ede4] pt-6 md:grid-cols-2">
              <label className="text-sm font-medium text-[#57534e]">Mật khẩu hiện tại<input type="password" required autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e7e2d9] px-3 py-2.5 outline-none focus:border-[#064e3b]" /></label>
              <label className="text-sm font-medium text-[#57534e]">Mật khẩu mới<input type="password" required minLength={8} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e7e2d9] px-3 py-2.5 outline-none focus:border-[#064e3b]" /><span className="mt-1 block text-xs text-[#a8a29e]">Tối thiểu 8 ký tự</span></label>
              <label className="text-sm font-medium text-[#57534e]">Xác nhận mật khẩu mới<input type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e7e2d9] px-3 py-2.5 outline-none focus:border-[#064e3b]" /></label>
              <div className="flex items-end"><button disabled={savingPassword} className="rounded-xl bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{savingPassword ? "Đang lưu…" : "Lưu mật khẩu mới"}</button></div>
              {passwordError && <p role="alert" className="md:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{passwordError}</p>}
              {passwordMessage && <p role="status" className="md:col-span-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{passwordMessage}</p>}
            </form>}
          </section>
        </ScrollReveal>

        {/* Quick Navigation Cards */}
        <ScrollReveal direction="up" distance={20} duration={0.4} delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/orders"
              className="group bg-white rounded-3xl border border-[#e7e2d9] p-5 shadow-sm hover:border-[#064e3b]/30 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#064e3b] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FiPackage size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#1c1917] text-sm">
                    Đơn hàng của tôi
                  </h3>
                  <span className="text-xs font-bold bg-[#faf8f5] border border-[#e7e2d9] text-[#064e3b] px-2 py-0.5 rounded-full">
                    {orderCount}
                  </span>
                </div>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Theo dõi trạng thái và lịch sử đơn hàng
                </p>
              </div>
              <FiChevronRight size={18} className="text-[#a8a29e] group-hover:text-[#064e3b] transition-colors shrink-0" />
            </Link>

            <Link
              href="/favorites"
              className="group bg-white rounded-3xl border border-[#e7e2d9] p-5 shadow-sm hover:border-amber-500/30 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#d97706] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FiHeart size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#1c1917] text-sm">
                    Sách yêu thích
                  </h3>
                  <span className="text-xs font-bold bg-[#faf8f5] border border-[#e7e2d9] text-[#d97706] px-2 py-0.5 rounded-full">
                    {favCount}
                  </span>
                </div>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Bộ sưu tập những cuốn sách đã lưu
                </p>
              </div>
              <FiChevronRight size={18} className="text-[#a8a29e] group-hover:text-[#d97706] transition-colors shrink-0" />
            </Link>
          </div>
        </ScrollReveal>

          {/* Logout Section */}
          <div className="pt-2 flex justify-end">
            <Logout
              href={"/"}
              className="cursor-pointer inline-flex items-center justify-center gap-2 text-[#b91c1c] hover:text-[#991b1b] bg-white hover:bg-red-50 border border-red-200/80 font-semibold py-2.5 px-5 rounded-2xl transition-all text-sm shadow-xs"
              side="client"
              icon={true}
            />
          </div>

        </div>
      </div>

      <ToastContainer autoClose={1500} hideProgressBar={true} pauseOnHover={false} />
    </>
  );
}
