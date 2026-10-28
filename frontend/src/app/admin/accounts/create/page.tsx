"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import AccountForm from "@/app/components/Form/AccountForm/AccountForm";
import { Role } from "@/app/interfaces/role.interface";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateAccount() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    status: "active",
    role_id: "",
  });
  const [loading, setLoading] = useState(false);
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
        axios.post(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/accounts/create`,
          formData,
          {
            headers: {
            },
            
          },
        ),
        {
          pending: "Đang tạo tài khoản...",
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
              return "Tạo tài khoản thất bại";
            },
          },
        },
      )
      .then(() => {
        setForm({
          fullName: "",
          email: "",
          password: "",
          phone: "",
          status: "active",
          role_id: "",
        });
        setPreview(null);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <PrivateRoute permission="create_account">
        <div>
          <div className="max-w-xl mx-auto mt-8 bg-white p-4 sm:p-8 rounded-xl shadow relative">
            <BackButton className="absolute -top-10 left-0 lg:-left-70 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />
            <h1 className="text-2xl font-bold mb-6 text-primary">
              Tạo mới tài khoản
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
                buttonLabel="Tạo mới"
                roles={roles}
                showPasswordField={true}
              />
            </div>
            <ToastContainer
              autoClose={1500}
              hideProgressBar={true}
              pauseOnHover={false}
            />
          </div>
        </div>
      </PrivateRoute>
    </>
  );
}
