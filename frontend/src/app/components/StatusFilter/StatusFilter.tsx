interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <>
      <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
        <label className="shrink-0 font-medium text-primary text-[15px]">
          Trạng thái:
        </label>
        <select
          className="min-h-11 w-full min-w-0 border bg-white border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 focus:border-secondary1 transition shadow-sm hover:border-secondary1 cursor-pointer sm:w-auto"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Dừng hoạt động</option>
        </select>
      </div>
    </>
  );
}
