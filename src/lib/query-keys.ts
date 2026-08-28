import type { HospitalRecommendParams, PageParams } from '@/types';

/**
 * 쿼리 키를 한곳에 모아 둡니다.
 * 무효화할 때 접두사만 쓰면 하위 키까지 함께 무효화됩니다.
 *   queryClient.invalidateQueries({ queryKey: queryKeys.pets.all })
 */
export const queryKeys = {
  users: {
    me: ['users', 'me'] as const,
  },
  pets: {
    all: ['pets'] as const,
    list: () => ['pets', 'list'] as const,
    detail: (petId: number) => ['pets', 'detail', petId] as const,
    profile: (petId: number) => ['pets', 'profile', petId] as const,
  },
  triage: {
    all: ['triage'] as const,
    session: (sessionId: number) => ['triage', 'session', sessionId] as const,
    /** 세션별로 생성된 추가 문진 질문 목록 */
    questionSet: (sessionId: number) => ['triage', 'session', sessionId, 'question-set'] as const,
    nextQuestion: (sessionId: number) => ['triage', 'session', sessionId, 'next-question'] as const,
    analysis: (sessionId: number) => ['triage', 'analysis', sessionId] as const,
  },
  media: {
    all: ['media'] as const,
    detail: (mediaId: number) => ['media', 'detail', mediaId] as const,
  },
  hospitals: {
    all: ['hospitals'] as const,
    list: () => ['hospitals', 'list'] as const,
    detail: (hospitalId: number) => ['hospitals', 'detail', hospitalId] as const,
    recommend: (params: HospitalRecommendParams) => ['hospitals', 'recommend', params] as const,
  },
  records: {
    all: ['records'] as const,
    list: (userId: number) => ['records', 'list', userId] as const,
    detail: (recordId: number) => ['records', 'detail', recordId] as const,
  },
  reports: {
    all: ['reports'] as const,
    detail: (reportId: number) => ['reports', 'detail', reportId] as const,
    byRecord: (recordId: number) => ['reports', 'by-record', recordId] as const,
    byHospital: (hospitalId: number, params: PageParams) =>
      ['reports', 'by-hospital', hospitalId, params] as const,
  },
} as const;
