import { useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type UseFetchDataAdminParams = {
  status?: string;
  keyword?: string;
  page: number;
  sort?: any;
  limit: number;
  accessToken: unknown;
  ADMIN_PREFIX: unknown;
  onSuccess: (data: { items: any[]; total: number }) => void;
  setTotal: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setIsFirstLoad?: (isFirstLoad: boolean) => void;
  source: string;
};

export function useFetchDataAdmin({
  status,
  keyword,
  page,
  sort,
  limit,
  accessToken,
  ADMIN_PREFIX,
  onSuccess,
  setTotal,
  setLoading,
  setIsFirstLoad,
  source,
}: UseFetchDataAdminParams): (() => void) & { cancel: () => void } {
  
  // Lưu tất cả các callbacks động vào ref để không bao giờ làm thay đổi identity của fetcher
  const callbacksRef = useRef({ onSuccess, setTotal, setLoading, setIsFirstLoad });
  callbacksRef.current = { onSuccess, setTotal, setLoading, setIsFirstLoad };

  const lastParamsRef = useRef({ status, keyword, page, sort, limit });

  const fetchImmediately = useCallback(() => {
    callbacksRef.current.setLoading(true);
    axios
      .get(`${API_URL}/api/v1/${ADMIN_PREFIX}/${source}`, {
        params: {
          ...(status && { status }),
          ...(keyword && { keyWord: keyword }),
          ...(sort && { sortKey: sort.key, sortValue: sort.value }),
          page,
          limit,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      })
      .then((res) => {
        callbacksRef.current.onSuccess({
          items: res.data[source] || [],
          total: res.data.total || 0,
        });
        callbacksRef.current.setTotal(res.data.total || 0);
      })
      .catch(() => {
        callbacksRef.current.onSuccess({ items: [], total: 0 });
      })
      .finally(() => {
        callbacksRef.current.setLoading(false);
        callbacksRef.current.setIsFirstLoad?.(false);
      });
  }, [status, keyword, page, sort, limit, accessToken, ADMIN_PREFIX, source]);

  // Debounced version of fetch
  const debouncedFetch = useCallback(
    debounce(fetchImmediately, 400),
    [fetchImmediately]
  );

  const fetcher = useCallback(() => {
    const prev = lastParamsRef.current;
    const current = { status, keyword, page, sort, limit };
    lastParamsRef.current = current;

    // Nếu chỉ có keyword thay đổi (đang gõ tìm kiếm) -> dùng debounce 400ms bảo vệ server
    if (
      prev.keyword !== current.keyword &&
      prev.status === current.status &&
      prev.page === current.page &&
      prev.sort === current.sort &&
      prev.limit === current.limit
    ) {
      debouncedFetch();
    } else {
      // Hủy mọi debounce đang chờ và tải dữ liệu INSTANTLY
      debouncedFetch.cancel();
      fetchImmediately();
    }
  }, [debouncedFetch, fetchImmediately, status, keyword, page, sort, limit]);

  // Hỗ trợ cancel debounce khi component unmount
  const cancel = useCallback(() => {
    debouncedFetch.cancel();
  }, [debouncedFetch]);

  // Trả về hàm fetcher và đính kèm thuộc tính cancel để dọn dẹp trong useEffect
  const result = fetcher as any;
  result.cancel = cancel;

  return result;
}
