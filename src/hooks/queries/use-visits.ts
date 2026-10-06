import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { recordsApi } from '@/api';
import { queryKeys } from '@/lib/query-keys';
import type { HospitalVisitCreateRequest } from '@/types';

/** GET /records/{recordId}/visits — 최근 방문일 순 */
export function useVisits(recordId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.records.visits(recordId!),
    queryFn: () => recordsApi.listVisits(recordId!),
    enabled: recordId != null,
  });
}

/**
 * POST /records/{recordId}/visits
 *
 * 성공하면 기록 상세·목록도 무효화합니다. followUpAnswered 와 visitCount 가 기록 응답에
 * 들어 있어서, 방문만 다시 받아오면 질문 카드가 그대로 남습니다.
 */
export function useCreateVisit(recordId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: HospitalVisitCreateRequest) => recordsApi.createVisit(recordId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all });
    },
  });
}

/** DELETE /visits/{visitId} */
export function useDeleteVisit(recordId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (visitId: number) => recordsApi.removeVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all });
    },
  });
}
