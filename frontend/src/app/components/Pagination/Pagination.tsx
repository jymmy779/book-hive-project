interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 3;

    if (totalPages <= maxPagesToShow + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 2) {
      for (let i = 1; i <= maxPagesToShow; i++) pages.push(i);
      pages.push("...", totalPages);
    } else if (page >= totalPages - 1) {
      pages.push(1, "...");
      for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, "...");
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push("...", totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-1 md:gap-2 mt-6 flex-wrap px-2">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`px-2 md:px-3 py-1 text-sm md:text-base rounded bg-gray-200 disabled:opacity-50 transition-colors duration-200 ${
          page === 1 ? "" : "hover:bg-secondary1/10 cursor-pointer"
        }`}
      >
        Trước
      </button>

      {pages.map((p, index) =>
        p === "..." ? (
          <span
            key={`dots-${index}`}
            className="px-1 md:px-2 py-1 text-sm md:text-base"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`px-2 md:px-3 py-1 text-sm md:text-base rounded transition-colors duration-200 font-medium
              ${
                page === p
                  ? "bg-primary text-white cursor-default"
                  : "bg-gray-100 hover:bg-secondary1/10 cursor-pointer"
              }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`px-2 md:px-3 py-1 text-sm md:text-base rounded bg-gray-200 disabled:opacity-50 transition-colors duration-200 ${
          page === totalPages ? "" : "hover:bg-secondary1/10 cursor-pointer"
        }`}
      >
        Sau
      </button>
    </div>
  );
}