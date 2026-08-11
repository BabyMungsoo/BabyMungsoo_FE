import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { recordsApi } from '@/api';
import { queryKeys } from '@/lib/query-keys';
import type { AnalysisRecordCreateRequest } from '@/types';

/** GET /records?userId= — 서버가 createdAt 내림차순으로 내려줍니다 */
export function useRecords(userId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.records.list(userId!),
    queryFn: () => recordsApi.list(userId!),
    enabled: userId != null,
  });
}

/** GET /records/{recordId} */
export function useRecord(recordId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.records.detail(recordId!),
    queryFn: () => recordsApi.detail(recordId!),
    enabled: recordId != null,
  });
}

/** POST /records */
export function useCreateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AnalysisRecordCreateRequest) => recordsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.records.all }),
  });
}

/** DELETE /records/{recordId} */
export function useDeleteRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: number) => recordsApi.remove(recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.records.all }),
  });
}
