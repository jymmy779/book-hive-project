"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import { useParams, useRouter } from "next/navigation";
import PermissionForm from "@/app/components/Form/PermissionForm/PermissionForm";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditPermission() {
  const [form, setForm] = useState({
    key: "",
    label: "",
    group: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<any>({});
  let groupNames: string[] = [];

  const params = useParams();
  const router = useRouter();
  const { slug } = params as { slug: string };

  useEffect(() => {
    axios
      .get(`${API_URL}/api/v1/${ADMIN_PREFIX}/roles/permissions`, {
        headers: {
        },
        
      })
      .then((res) => {
        setAllPermissions(res.data.permissionGroups);
      });
  }, []);

  if (allPermissions) {
    groupNames = Object.keys(allPermissions);
  }

  useEffect(() => {
    if (!slug) return;
    axios
      .get(
        `${API_URL}/api/v1/${ADMIN_PREFIX}/roles/permissions/detail/${slug}`,
        {
          headers: {
          },
          
        },
      )
      .then((res) => {
        const perm = res.data.perm;
        setForm({
          key: perm.key,
          label: perm.label,
          group: perm.group,
          slug: perm.slug,
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Không tìm thấy quyền!");
        router.back();
      });
  }, [slug, router]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      key: form.key,
      label: form.label,
      group: form.group,
      slug: form.slug,
    };

    toast
      .promise(
        axios.patch(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/roles/permissions/edit/${slug}`,
          data,
          {
            headers: {
            },
            
          },
        ),
        {
          pending: "Đang cập nhật quyền...",
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
              return "Cập nhật quyền thất bại";
            },
          },
        },
      )
      .finally(() => setLoading(false));
  };

  return (
    <PrivateRoute permission="edit_permission">
      <div>
        <div className="max-w-xl mx-auto mt-8 bg-white p-4 sm:p-8 rounded-xl shadow relative">
          <BackButton className="absolute -top-10 left-0 lg:-left-70 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />
          <h1 className="text-2xl font-bold mb-6 text-primary">
            Chỉnh sửa quyền
          </h1>
          <div>
            <PermissionForm
              form={form}
              loading={loading}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              buttonLabel="Lưu thay đổi"
              groupOptions={groupNames}
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
  );
}
