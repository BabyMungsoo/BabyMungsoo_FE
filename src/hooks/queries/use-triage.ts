import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { triageApi } from '@/api';
import { queryKeys } from '@/lib/query-keys';
import type { AnswerCreateRequest, Question, TriageSessionCreateRequest } from '@/types';

/** POST /triage/sessions — 문진 세션 시작 */
export function useCreateTriageSession() {
  return useMutation({
    mutationFn: (body: TriageSessionCreateRequest) => triageApi.createSession(body),
  });
}

/** POST /triage/sessions/{sessionId}/complete — 문진 종료(AI 분석 준비 완료) */
export function useCompleteTriageSession() {
  return useMutation({
    mutationFn: (sessionId: number) => triageApi.completeSession(sessionId),
  });
}

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
 * POST /triage/sessions/{sessionId}/questions — 추가 질문 생성 (홈에서 호출)
 *
 * 세션을 만든 직후 한 번 부르고, 응답의 needsAdditionalQuestions 로 다음 화면을 정합니다.
 * 서버가 생성 실패를 오류로 올리지 않고 '질문 없음'으로 내려주므로, 호출부는
 * 성공/실패가 아니라 이 플래그만 보면 됩니다.
 */
export function useGenerateTriageQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => triageApi.generateQuestions(sessionId),
    onSuccess: (questionSet, sessionId) => {
      // 받은 질문을 아래 useTriageQuestionSet 과 같은 키에 심어 둡니다.
      // 이게 없으면 추가 문진 화면에 들어가는 순간 같은 POST 를 한 번 더 보냅니다.
      queryClient.setQueryData(queryKeys.triage.questionSet(sessionId), questionSet);
    },
  });
}

/**
 * 추가 문진 화면이 질문 목록을 읽는 통로. 백엔드에 질문 조회 전용 GET 이 없어
 * 생성 API 를 그대로 씁니다.
 *
 * 보통은 홈에서 이미 캐시에 심어 둔 값을 그대로 읽어 요청이 나가지 않습니다.
 * 실제로 호출되는 건 문진 화면으로 바로 들어온 경우(딥링크·새로고침)뿐이고,
 * 그때도 서버가 이미 만들어 둔 질문을 그대로 돌려주므로 질문이 다시 생성되거나
 * Claude 가 다시 호출되지는 않습니다.
 *
 * 진행률(2/3)과 답변 목록의 질문 라벨에만 씁니다. 다음에 물어볼 질문은
 * 서버의 next-question 이 정하므로 화면이 이 목록을 훑어 순서를 정하지 않습니다.
 */
export function useTriageQuestionSet(sessionId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.triage.questionSet(sessionId!),
    queryFn: () => triageApi.generateQuestions(sessionId!),
    enabled: sessionId != null,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

/**
 * GET /triage/sessions/{sessionId}/next-question
 *
 * 아직 답하지 않은 질문 중 첫 번째를 돌려주고, 다 답했으면 본문 없이 200 을 돌려줍니다.
 * 이때 axios 의 data 는 null 이 아니라 빈 문자열('')이라 그대로 쓰면 질문 객체와 구분이 안 됩니다.
 * 여기서 null 로 normalize 해, 화면은 "질문이 있으면 객체 / 끝났으면 null" 만 보면 되게 합니다.
 */
export function useNextQuestion(sessionId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.triage.nextQuestion(sessionId!),
    queryFn: async (): Promise<Question | null> => {
      const question = await triageApi.getNextQuestion(sessionId!);
      return question && typeof question === 'object' && 'id' in question ? question : null;
    },
    enabled: sessionId != null,
  });
}

/**
 * POST /triage/sessions/{sessionId}/answers
 *
 * 답변을 저장하면 다음 질문이 바뀌므로 next-question 캐시를 무효화합니다.
 * 세션 자체도 answers 를 포함하고 있어 함께 무효화합니다.
 */
export function useSaveAnswer(sessionId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AnswerCreateRequest) => triageApi.saveAnswer(sessionId!, body),
    onSuccess: () => {
      if (sessionId == null) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.triage.nextQuestion(sessionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.triage.session(sessionId) });
    },
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
