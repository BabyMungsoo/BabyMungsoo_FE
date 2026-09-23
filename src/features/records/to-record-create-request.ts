import type { AnalysisRecordCreateRequest, TriageAnalyzeResult } from '@/types';

/**
 * AI 분석 결과(TriageAnalyzeResult) → 분석 기록 저장 요청(POST /records).
 *
 * 두 테이블이 서로 연결돼 있지 않아서(triage_results / analysis_record),
 * 분석이 끝나면 이 변환을 거쳐 기록으로 남겨야 6·7번 화면에 나타납니다.
 *
 * 결과는 필드 6개(title/findings/urgencyReason/escalationSigns/precautions/level)인데
 * 기록은 3개(aiResult/suspectedDisease/aiGuide)라 아래처럼 접습니다.
 * 7번 상세 화면이 이 배치를 전제로 그립니다.
 *
 *   title                         → suspectedDisease  상세 화면의 제목 (등급별 결론 문구)
 *   findings                      → aiResult          'AI 분석 요약' (줄바꿈으로 합침)
 *   urgencyReason + escalationSigns
 *                 + precautions   → aiGuide           '권장 조치' (줄바꿈으로 나눠 불릿 표시)
 *   level                         → emergencyLevel    두 도메인 모두 IMMEDIATE/WATCH/NORMAL
 *
 * symptomText 는 분석 결과에 없어서 문진 세션의 초기 증상을 그대로 받습니다.
 * 주인(userId)은 보내지 않습니다 — 서버가 토큰에서 채웁니다.
 */
export function toRecordCreateRequest({
  result,
  dogId,
  symptomText,
  mediaIds,
}: {
  result: TriageAnalyzeResult;
  dogId: number;
  /** 문진 세션의 initialSymptom */
  symptomText: string;
  /** 세션에 연결된 사진(TriageSession.media)의 mediaId 목록 */
  mediaIds?: number[];
}): AnalysisRecordCreateRequest {
  return {
    dogId,
    symptomText,
    // aiResult 는 not-null 이라 소견이 비어 있으면 제목이라도 넣습니다
    aiResult: result.findings.join('\n') || result.title,
    emergencyLevel: result.level,
    suspectedDisease: result.title,
    // 시급성 → 악화 신호 → 주의 순서. 7번은 줄 단위 불릿이라 순서가 곧 읽는 순서입니다.
    aiGuide: [result.urgencyReason, ...result.escalationSigns, ...result.precautions]
      .filter(Boolean)
      .join('\n'),
    mediaIds,
  };
}
