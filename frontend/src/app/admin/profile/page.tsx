"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { FiLock, FiUser } from "react-icons/fi";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type AdminProfile = {
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role_id?: { title?: string };
};

export default function Profile() {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/api/v1/${ADMIN_PREFIX}/accounts/profile`, {
    }).then((response) => {
      const account = response.data.account;
      setUser(account);
      setProfileName(account.fullName || "");
      setProfilePhone(account.phone || "");
    }).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setSavingProfile(true);
    try {
      const response = await axios.patch(
        `${API_URL}/api/v1/${ADMIN_PREFIX}/accounts/profile`,
        { fullName: profileName, phone: profilePhone },
      );
      setUser(response.data.account);
      setProfileName(response.data.account.fullName || "");
      setProfilePhone(response.data.account.phone || "");
      setProfileMessage("Đã lưu thông tin cá nhân.");
    } catch (error: any) {
      setProfileError(error.response?.data?.message || "Không lưu được thông tin. Vui lòng thử lại.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    if (newPassword.length < 8) return setPasswordError("Mật khẩu mới cần có ít nhất 8 ký tự.");
    if (newPassword !== confirmPassword) return setPasswordError("Mật khẩu xác nhận không khớp.");

    setChangingPassword(true);
    try {
      await axios.patch(
        `${API_URL}/api/v1/${ADMIN_PREFIX}/auth/change-password`,
        { currentPassword, newPassword, confirmPassword },
        {
          
        },
      );
      setPasswordMessage("Đã lưu mật khẩu mới.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || "Không đổi được mật khẩu. Vui lòng thử lại.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="mt-40 text-center text-gray-500">Đang tải hồ sơ…</div>;
  if (!user) return <div className="mt-40 text-center text-red-500">Không tìm thấy thông tin cá nhân.</div>;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="h-fit rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-7 flex items-center gap-3"><span className="rounded-lg bg-accent/10 p-2 text-accent"><FiUser size={20} /></span><h1 className="text-xl font-bold text-text-primary">Hồ sơ quản trị</h1></div>
        <div className="mb-7 flex items-center gap-5">
          {user.avatar ? <Image src={user.avatar} alt={`Ảnh đại diện ${user.fullName}`} width={96} height={96} className="h-24 w-24 rounded-full border-2 border-primary object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-3xl font-semibold text-gray-500">{user.fullName?.charAt(0)?.toUpperCase() || "A"}</div>}
          <div><h2 className="text-2xl font-bold text-primary">{user.fullName}</h2><span className="mt-1 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{user.role_id?.title || "Quản trị viên"}</span></div>
        </div>
        <form onSubmit={saveProfile} className="space-y-4 border-t border-gray-100 pt-5">
          <label className="block text-sm font-medium text-text-secondary">Họ và tên<input required minLength={2} value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" /></label>
          <div><span className="block text-sm font-medium text-text-secondary">Email</span><div className="mt-1.5 rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600">{user.email}</div><span className="mt-1 block text-xs text-text-muted">Email đăng nhập không chỉnh sửa tại đây.</span></div>
          <label className="block text-sm font-medium text-text-secondary">Số điện thoại<input type="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} placeholder="Nhập số điện thoại" className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" /></label>
          {profileError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{profileError}</p>}
          {profileMessage && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{profileMessage}</p>}
          <button type="submit" disabled={savingProfile} className="w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{savingProfile ? "Đang lưu…" : "Lưu thông tin"}</button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-2 flex items-center gap-3"><span className="rounded-lg bg-accent/10 p-2 text-accent"><FiLock size={20} /></span><h2 className="text-xl font-bold text-text-primary">Đổi mật khẩu</h2></div>
        <p className="mb-6 text-sm text-text-muted">Nhập mật khẩu hiện tại để xác nhận trước khi đặt mật khẩu mới.</p>
        <form onSubmit={savePassword} className="space-y-4">
          <label className="block text-sm font-medium text-text-secondary">Mật khẩu hiện tại<input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" /></label>
          <label className="block text-sm font-medium text-text-secondary">Mật khẩu mới<input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" /><span className="mt-1 block text-xs text-text-muted">Ít nhất 8 ký tự.</span></label>
          <label className="block text-sm font-medium text-text-secondary">Xác nhận mật khẩu mới<input type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" /></label>
          {passwordError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{passwordError}</p>}
          {passwordMessage && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{passwordMessage}</p>}
          <button type="submit" disabled={changingPassword} className="w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{changingPassword ? "Đang lưu…" : "Lưu mật khẩu mới"}</button>
        </form>
      </section>
    </div>
  );
}
