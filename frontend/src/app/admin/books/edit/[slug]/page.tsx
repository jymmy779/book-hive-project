"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import BookForm from "@/app/components/Form/BookForm/BookForm";
import PrivateRoute from "@/app/components/Auth/PrivateRoute/PrivateRoute";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditBook() {
  const params = useParams();
  const slug = params.slug;
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    author: "",
    category_id: "",
    description: "",
    priceBuy: "",
    inStock: 0,
    position: "",
    status: "active",
    image: "",
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const fileInputRef = useRef<any>(null);

  const handleMoneyChange = (e: any) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^0+/, "");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/api/v1/${ADMIN_PREFIX}/categories`, {
        headers: {
        },
        
      })
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
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
      [name]: type === "checkbox" ? value : value,
    }));
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/books/${params.slug}`,
          {
            headers: {
            },
            
          },
        );
        const book = res.data.book;
        setForm({
          title: book.title,
          author: book.author,
          category_id: book.category_id,
          description: book.description,
          priceBuy: book.priceBuy,
          inStock: book.inStock ?? 0,
          position: book.position,
          status: book.status,
          image: book.image,
          featured: book.featured,
        });
        setPreview(book.image || null);
      } catch (err) {
        toast.error("Không tìm thấy sách!");
        router.back();
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchBook();
  }, [params.slug]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    toast
      .promise(
        axios.patch(
          `${API_URL}/api/v1/${ADMIN_PREFIX}/books/edit/${slug}`,
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
      <PrivateRoute permission="edit_book">
        {isPageLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl text-gray-500">Đang tải...</div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mt-8 bg-white p-4 sm:p-8 rounded-xl shadow relative">
            <BackButton className="absolute -top-10 left-0 xl:-left-60 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />

            <h1 className="text-2xl font-bold mb-6 text-primary">
              Chỉnh sửa sách
            </h1>

            <div>
              <BookForm
                form={form}
                loading={loading}
                preview={preview}
                setPreview={setPreview}
                imageFile={imageFile}
                setImageFile={setImageFile}
                fileInputRef={fileInputRef}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                handleMoneyChange={handleMoneyChange}
                handleImageChange={handleImageChange}
                handleRemoveImage={handleRemoveImage}
                buttonLabel="Cập nhật"
                categories={categories}
              />
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
