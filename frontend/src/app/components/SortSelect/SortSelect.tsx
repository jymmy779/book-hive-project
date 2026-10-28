interface SortOption {
  label: string;
  value: string;
}

interface SortSelectProps {
  onChange: (e: any) => void;
  options: SortOption[];
  sortValue: string;
}

export default function SortSelect({
  onChange,
  options,
  sortValue,
}: SortSelectProps) {
  return (
    <select
      value={sortValue}
      onChange={onChange}
      className="min-h-11 w-full min-w-0 border bg-white border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 focus:border-secondary1 transition shadow-sm hover:border-secondary1 cursor-pointer sm:w-auto"
    >
      {options.map((opt, index) => (
        <option key={index} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
