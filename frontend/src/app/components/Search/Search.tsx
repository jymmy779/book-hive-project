interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export default function Search({ value, onChange, label }: SearchProps) {
  return (
    <>
      <div className="relative w-full min-w-0 max-w-xs">
        <input
          type="text"
          placeholder={`Tìm kiếm ${label}...`}
          className="min-h-11 w-full min-w-0 border hover:border-secondary1 bg-[#ffff] border-gray-300 rounded-lg px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-secondary1 focus:border-secondary1 transition shadow-sm pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
        </span>
      </div>
    </>
  );
}
