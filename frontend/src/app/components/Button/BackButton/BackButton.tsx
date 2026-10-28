import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className = "" }: BackButtonProps) => {
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 transition-colors hover:text-primary-dark ${className}`}
        onClick={() => router.back()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="text-primary font-medium text-[15px]">Quay lại</span>
      </button>
    </>
  );
};
