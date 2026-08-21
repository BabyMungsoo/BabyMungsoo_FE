import { useQuery } from '@tanstack/react-query';

import { triageApi } from '@/api';
import { queryKeys } from '@/lib/query-keys';

/**
 * GET /triage/sessions/{sessionId}
 *
 * 결과 화면(4번)의 '증상 요약'은 AI 응답이 아니라 사용자가 처음 입력한 증상이라
 * 분석 결과와 별개로 세션을 한 번 더 조회해야 합니다.
 */
export function useTriageSession(sessionId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.triage.session(sessionId!),
    queryFn: () => triageApi.getSession(sessionId!),
    enabled: sessionId != null,
  });
}

/**
 * POST /triage/analyze 를 useMutation 이 아니라 useQuery 로 감쌉니다.
 *
 * 메서드는 POST 지만 같은 세션을 다시 호출하면 서버가 저장된 결과를 그대로 돌려주는
 * 멱등 API 입니다. 결과 화면은 '들어가면 알아서 불러와야' 하는 조회 성격이라
 * useQuery 쪽이 자연스럽고, 로딩·에러·재시도 상태를 그대로 쓸 수 있습니다.
 */
export function useTriageAnalysis(sessionId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.triage.analysis(sessionId!),
    queryFn: () => triageApi.analyze({ sessionId: sessionId! }),
    enabled: sessionId != null,
    // 분석 1회가 최대 60초다. 기본값(3회)대로 두면 실패했을 때 4분 넘게 로딩에 갇힌다.
    retry: false,
    // 결과는 서버에서 고정(멱등)이라 다시 받을 이유가 없다.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
