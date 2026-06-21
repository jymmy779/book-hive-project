type PermissionFormData = {
  key: string;
  label: string;
  group: string;
};

type PermissionFormProps = {
  form: PermissionFormData;
  loading: boolean;
  handleSubmit: (e: unknown) => void;
  handleChange: (e: unknown) => void;
  buttonLabel: string;
  groupOptions: string[];
};

export default function PermissionForm({
  form,
  loading,
  handleSubmit,
  handleChange,
  buttonLabel,
  groupOptions,
}: PermissionFormProps) {
  const inputClass =
    "border bg-[#ffff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition duration-200 w-full";

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Key <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="key"
          className={inputClass}
          value={form.key}
          onChange={handleChange}
          placeholder="Nhập key, ví dụ: view_reports"
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Tên hiển thị <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="label"
          className={inputClass}
          value={form.label}
          onChange={handleChange}
          placeholder="Nhập tên hiển thị, ví dụ: Xem báo cáo"
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 font-medium text-primary">
          Chức năng <span className="text-red-500">*</span>
        </label>
        <select
          name="group"
          className={inputClass}
          value={form.group}
          onChange={handleChange}
        >
          <option value="">Chọn chức năng</option>
          {groupOptions.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
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
