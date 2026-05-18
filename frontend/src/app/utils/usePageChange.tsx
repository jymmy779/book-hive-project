import { useRouter, useSearchParams } from "next/navigation";

export function usePageChange(
  source: string,
  setPage: (page: number) => void,
  side: string,
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    const newUrl = side === "admin"
      ? `/admin/${source}?${params.toString()}`
      : `/${source}?${params.toString()}`;
    window.history.pushState(null, "", newUrl);
  };
}
