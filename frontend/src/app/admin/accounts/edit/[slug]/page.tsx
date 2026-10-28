"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "next/navigation";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import AccountForm from "@/app/components/Form/AccountForm/AccountForm";
import { Role } from "@/app/interfaces/role.interface";
import { useRouter } from "next/navigation";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";
import ConditionalRender from "@/app/components/Auth/ConditionalRender/ConditionalRender";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditBook() {
  const params = useParams();
  const slug = params.slug;
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "active",
    role_id: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/v1/${ADMIN_PREFIX}/roles`, {
        headers: {
        },
        
      })
      .then((res) => setRoles(res.data.roles || []))
      .catch(() => setRoles([]));
  }, []);

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setImageFile(file);
    } else {
      setPreview(null);
      setImageFile(null);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/accounts/detail/${params.slug}`,
          {
            headers: {
            },
            
          },
        );
        const account = res.data.account;
        setForm({
          fullName: account.fullName,
          email: account.email,
          phone: account.phone,
          status: account.status,
          role_id: account.role_id._id,
          avatar: account.avatar,
        });
        setPreview(account.avatar || null);
      } catch (err) {
        toast.error("Không tìm thấy tài khoản!");
        router.back();
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchAccount();
  }, [params.slug]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    toast
      .promise(
        axios.patch(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/accounts/edit/${slug}`,
          formData,
          {
            headers: {
            },
            
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
              return "Cập nhật sách thất bại";
            },
          },
        },
      )
      .finally(() => setLoading(false));
  };

  return (
    <>
      <PrivateRoute permission="edit_account">
        {isPageLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl text-gray-500">Đang tải...</div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mt-8 bg-white p-4 sm:p-8 rounded-xl shadow relative">
            <BackButton className="absolute -top-10 left-0 lg:-left-60 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />

            <h1 className="text-2xl font-bold mb-6 text-primary">
              Chỉnh sửa sách
            </h1>

            <div>
              <AccountForm
                form={form}
                loading={loading}
                preview={preview}
                setPreview={setPreview}
                imageFile={imageFile}
                setImageFile={setImageFile}
                fileInputRef={fileInputRef}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                handleImageChange={handleImageChange}
                handleRemoveImage={handleRemoveImage}
                buttonLabel="Cập nhật"
                roles={roles}
                showPasswordField={false}
              />
              <ConditionalRender permission="reset_password">
                <button
                  type="button"
                  className=" transition-colors duration-200 bg-[#979797] cursor-pointer hover:bg-[#676767] text-white px-2 py-2 rounded font-semibold mt-4"
                  onClick={() =>
                    router.push(`/admin/accounts/reset-password/${slug}`)
                  }
                >
                  Reset mật khẩu
                </button>
              </ConditionalRender>
            </div>

            <ToastContainer
              autoClose={1500}
              hideProgressBar={true}
              pauseOnHover={false}
            />
          </div>
        )}
      </PrivateRoute>
    </>
  );
}
