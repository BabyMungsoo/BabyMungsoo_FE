import type { AnalysisRecordCreateRequest, TriageAnalyzeResult } from '@/types';

/**
 * AI 분석 결과(TriageAnalyzeResult) → 분석 기록 저장 요청(POST /records).
 *
 * 두 테이블이 서로 연결돼 있지 않아서(triage_results / analysis_record),
 * 분석이 끝나면 이 변환을 거쳐 기록으로 남겨야 6·7번 화면에 나타납니다.
 *
 * 필드가 4개(title/reason/guide/level) → 3개(aiResult/suspectedDisease/aiGuide)로
 * 줄어들기 때문에 아래처럼 맞췄습니다. 7번 상세 화면이 이 배치를 전제로 그립니다.
 *
 *   title   → suspectedDisease  상세 화면의 제목
 *   reason  → aiResult          상세 화면의 'AI 분석 요약' (줄바꿈으로 합침)
 *   guide   → aiGuide           상세 화면의 '권장 조치' (줄바꿈으로 나눠 불릿 표시)
 *   level   → emergencyLevel    두 도메인 모두 IMMEDIATE/WATCH/NORMAL 로 값이 같습니다
 *
 * symptomText 는 분석 결과에 없어서 문진 세션의 초기 증상을 그대로 받습니다.
 */
export function toRecordCreateRequest({
  result,
  userId,
  dogId,
  symptomText,
  mediaId,
}: {
  result: TriageAnalyzeResult;
  userId: number;
  dogId: number;
  /** 문진 세션의 initialSymptom */
  symptomText: string;
  /** 세션에 연결된 사진(TriageSession.media) 중 첫 장의 mediaId */
  mediaId?: number;
}): AnalysisRecordCreateRequest {
  return {
    userId,
    dogId,
    symptomText,
    // aiResult 는 not-null 이라 근거가 비어 있으면 제목이라도 넣습니다
    aiResult: result.reason.join('\n') || result.title,
    emergencyLevel: result.level,
    suspectedDisease: result.title,
    aiGuide: result.guide,
    mediaId,
  };
}
