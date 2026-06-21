import { Role } from "@/app/interfaces/role.interface";
import { useState } from "react";

type AccountFormData = {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  status: string;
  role_id: string;
};

type AccountFormProps = {
  form: AccountFormData;
  loading: boolean;
  preview: string | null;
  setPreview?: unknown;
  imageFile?: File | null;
  setImageFile?: any;
  fileInputRef: any;
  handleSubmit: (e: unknown) => void;
  handleChange: (e: unknown) => void;
  handleImageChange: (e: unknown) => void;
  handleRemoveImage: () => void;
  buttonLabel: string;
  roles: Role[];
  showPasswordField: boolean;
};

const inputClass =
  "border bg-[#ffff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition duration-200 w-full";

export default function AccountForm({
  form,
  loading,
  preview,
  fileInputRef,
  handleSubmit,
  handleChange,
  handleImageChange,
  handleRemoveImage,
  buttonLabel,
  roles,
  showPasswordField,
}: AccountFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Họ tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          className={inputClass}
          value={form.fullName}
          onChange={handleChange}
          placeholder="Nhập họ tên"
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          className={inputClass}
          value={form.email}
          onChange={handleChange}
          placeholder="Nhập email"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="phone"
          className={inputClass}
          value={form.phone || ""}
          onChange={handleChange}
          placeholder="Nhập số điện thoại"
        />
      </div>
      {showPasswordField && (
        <div className="mb-4">
          <label className="mb-1 font-medium text-primary">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={inputClass}
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>
      )}
      <div className="mb-4">
        <div>
          <label className="mb-1 font-medium text-primary flex justify-between">
            Avatar
            {preview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mb-0.5 text-red-500 font-bold cursor-pointer"
                aria-label="Xóa ảnh"
              >
                ×
              </button>
            )}
          </label>
        </div>
        <input
          type="file"
          name="image"
          ref={fileInputRef}
          accept="image/*"
          className={inputClass}
          onChange={handleImageChange}
        />
        <img
          id="blah"
          src={preview || "#"}
          alt="your image"
          className={`w-full mt-[5px] rounded-lg ${preview ? "" : "hidden"}`}
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">Vai trò</label>
        <select
          name="role_id"
          className={inputClass}
          value={form.role_id}
          onChange={handleChange}
        >
          <option value="">Chọn vai trò</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.title}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">Trạng thái</label>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2 text-primary">
            <input
              type="radio"
              name="status"
              value="active"
              className="accent-secondary1 transition duration-200"
              checked={form.status === "active"}
              onChange={handleChange}
            />
            Hoạt động
          </label>
          <label className="flex items-center gap-2 text-primary">
            <input
              type="radio"
              name="status"
              value="inactive"
              className="accent-secondary1 transition duration-200"
              checked={form.status === "inactive"}
              onChange={handleChange}
            />
            Dừng hoạt động
          </label>
        </div>
      </div>
      <button
        type="submit"
        className="w-full transition-colors duration-200 bg-primary cursor-pointer hover:bg-primary-dark text-white py-2 rounded font-semibold mt-4"
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : buttonLabel}
      </button>
    </form>
  );
}
