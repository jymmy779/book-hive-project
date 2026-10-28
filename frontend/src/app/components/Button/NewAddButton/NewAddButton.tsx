"use client";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";

interface NewAddButtonProps {
  label: string;
  source: string;
  className?: string;
}

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function NewAddButton({ label, source, className = "" }: NewAddButtonProps) {
  const router = useRouter();
  return (
    <>
      <button
  className={`inline-flex min-h-11 items-center px-6 py-3 bg-primary transition-colors duration-200 text-white rounded-[8px] text-[16px] font-semibold cursor-pointer hover:bg-primary-dark ${className}`}
        onClick={() => router.push(`/${ADMIN_PREFIX}/${source}/create`)}
      >
        <FiPlus className="inline mr-1" /> {label}
      </button>
    </>
  );
}
