import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 404 처럼 다시 시도해도 결과가 같은 요청은 재시도하지 않습니다
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status && error.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
