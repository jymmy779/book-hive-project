"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import ConditionalRender from "@/app/components/Auth/ConditionalRender/ConditionalRender";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AccountDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [account, setAccount] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/accounts/detail/${slug}`,
          {
            headers: {
            },
            
          },
        );
        setAccount(res.data.account);
      } catch (err) {
        toast.error("Không tìm thấy tài khoản!");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <>
      <PrivateRoute permission="view_accounts">
        <div className="max-w-xl mx-auto mt-8 bg-white p-4 sm:p-8 rounded-xl shadow relative">
          <BackButton className="absolute -top-10 left-0 lg:-left-80 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />
          <h1 className="text-2xl font-bold mb-6 text-primary">
            Chi tiết tài khoản
          </h1>
          <div className="flex flex-col items-center gap-4">
            {account.avatar && (
              <img
                src={account.avatar}
                alt="Avatar"
                className="w-45 h-45 rounded-full object-cover mb-4"
              />
            )}
            <div className="w-full">
              <span className="text-slate-800 font-semibold">Họ tên: </span>
              <span className="text-slate-500">{account.fullName}</span>
            </div>
            <div className="w-full">
              <span className="text-slate-800 font-semibold">Email: </span>
              <span className="text-slate-500">{account.email}</span>
            </div>
            <div className="w-full">
              <span className="text-slate-800 font-semibold">
                Số điện thoại:{" "}
              </span>
              <span className="text-slate-500">{account.phone}</span>
            </div>
            <div className="w-full">
              <span className="text-slate-800 font-semibold">Trạng thái: </span>
              <span className="text-slate-500">
                {account.status === "active" ? "Hoạt động" : "Dừng hoạt động"}
              </span>
            </div>
            <div className="w-full">
              <span className="text-slate-800 font-semibold">Vai trò: </span>
              <span className="text-slate-500">{account.role_id.title}</span>
            </div>
          </div>
          <ConditionalRender permission="edit_account">
            <div className="flex gap-4 mt-8">
              <button
                className="flex-1 py-4 font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer rounded-xl"
                onClick={() =>
                  router.push(`/${ADMIN_PREFIX}/accounts/edit/${account.slug}`)
                }
              >
                Chỉnh sửa
              </button>
            </div>
          </ConditionalRender>
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
