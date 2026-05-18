import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

type CategoryFormData = {
  title: string;
  description: string;
  position?: number | string;
  status: string;
};

type CategoryFormProps = {
  form: CategoryFormData;
  loading: boolean;
  handleSubmit: (e: unknown) => void;
  handleChange: (e: unknown) => void;
  buttonLabel: string;
};

const inputClass =
  "border bg-[#ffff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition duration-200 w-full";

export default function CategoryForm({
  form,
  loading,
  handleSubmit,
  handleChange,
  buttonLabel,
}: CategoryFormProps) {
  const editorHtmlRef = useRef(form.description || "");
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Tên thể loại <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          className={inputClass}
          value={form.title}
          onChange={handleChange}
          placeholder="Nhập tên thể loại"
        />
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
