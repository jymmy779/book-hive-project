import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

type RoleFormData = {
  title: string;
  description: string;
};

type RoleFormProps = {
  form: RoleFormData;
  loading: boolean;
  handleSubmit: (e: unknown) => void;
  handleChange: (e: unknown) => void;
  buttonLabel: string;
};

export default function RoleForm({
  form,
  loading,
  handleSubmit,
  handleChange,
  buttonLabel,
}: RoleFormProps) {
  const editorHtmlRef = useRef(form.description || "");
  const inputClass =
    "border bg-[#ffff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition duration-200 w-full";

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Tên vai trò <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          className={inputClass}
          value={form.title}
          onChange={handleChange}
          placeholder="Nhập tên vai trò"
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
