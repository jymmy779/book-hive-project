import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false },
);
import { input } from "framer-motion/client";
import { useRef } from "react";

type BookFormData = {
  title: string;
  category_id: string;
  author: string;
  description: string;
  priceBuy: number | string;
  position?: number | string;
  status: string;
  featured: boolean;
};

type BookFormProps = {
  form: BookFormData;
  loading: boolean;
  preview: string | null;
  setPreview?: unknown;
  imageFile?: File | null;
  setImageFile?: any;
  fileInputRef: any;
  handleSubmit: (e: unknown) => void;
  handleChange: (e: unknown) => void;
  handleMoneyChange: (e: unknown) => void;
  handleImageChange: (e: unknown) => void;
  handleRemoveImage: () => void;
  buttonLabel: string;
  categories: any[];
};

const inputClass =
  "border bg-[#ffff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition duration-200 w-full";

function formatVN(value: number | string) {
  if (typeof value === "string" && value === "") return "";
  const num = typeof value === "string" ? parseInt(value) : value;
  if (isNaN(num)) return "";
  return num.toLocaleString("vi-VN");
}

export default function BookForm({
  form,
  loading,
  preview,
  fileInputRef,
  handleSubmit,
  handleChange,
  handleMoneyChange,
  handleImageChange,
  handleRemoveImage,
  buttonLabel,
  categories,
}: BookFormProps) {
  const editorHtmlRef = useRef(form.description || "");
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Tên sách <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          className={inputClass}
          value={form.title}
          onChange={handleChange}
          placeholder="Nhập tên sách"
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Tác giả <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="author"
          className={inputClass}
          value={form.author}
          onChange={handleChange}
          placeholder="Nhập tên tác giả"
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Thể loại <span className="text-red-500">*</span>
        </label>
        <select
          name="category_id"
          className={inputClass}
          value={form.category_id}
          onChange={handleChange}
        >
          <option value="">-- Chọn thể loại --</option>
          {categories.map((cat: any) => (
            <option key={cat._id} value={cat._id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">Mô tả</label>
        <Editor
          apiKey="z12vc24iw6e1ht3foyt0xkidyqhcwmvqbpggablsetjz0fea"
          initialValue={editorHtmlRef.current}
          init={{
            height: 300,
            menubar: false,
            plugins: [
              "lists",
              "link",
              "image",
              "table",
              "wordcount",
              "searchreplace",
              "autolink",
              "fullscreen",
            ],
            toolbar: `
              undo redo | bold italic underline strikethrough |
              alignleft aligncenter alignright justify |
              bullist numlist outdent indent |
              link image table |
              removeformat fullscreen |
              forecolor backcolor
            `,
            content_style: "body { font-family: Arial; font-size: 14px; }",
            entity_encoding: "raw",
          }}
          onEditorChange={(content) => {
            editorHtmlRef.current = content;
          }}
          onBlur={() => {
            handleChange({
              target: {
                name: "description",
                value: editorHtmlRef.current,
              },
            });
          }}
        />
      </div>
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="mb-1 font-medium text-primary">Giá mua (VND)</label>
          <input
            type="text"
            name="priceBuy"
            className={inputClass}
            value={formatVN(form.priceBuy)}
            onChange={handleMoneyChange}
            placeholder="Nhập giá mua"
            min={0}
          />
        </div>
      </div>
      <div className="mb-4">
        <div>
          <label className="mb-1 font-medium text-primary flex justify-between">
            Ảnh sách
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
        <label className="mb-1 font-medium text-primary">Vị trí</label>
        <input
          type="number"
          name="position"
          className={inputClass}
          value={form.position}
          onChange={handleChange}
          placeholder="Nhập vị trí (Không bắt buộc)"
          min={1}
        />
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
      <div className="mb-4">
        <label className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            name="featured"
            className="accent-secondary1"
            checked={form.featured}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "featured",
                  value: e.target.checked,
                  type: "checkbox",
                },
              })
            }
          />
          <span className="text-primary font-medium">Nổi bật</span>
        </label>
      </div>
      <button
        type="submit"
        className="w-full transition-colors duration-200 bg-secondary1 cursor-pointer hover:bg-blue-600 text-white py-2 rounded font-semibold mt-4"
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : buttonLabel}
      </button>
    </form>
  );
}
