import { hospitalsApi } from '@/api';
import type { Hospital, HospitalRecommendParams } from '@/types';

export interface RecommendHospitalsResult {
  hospitals: Hospital[];
  /**
   * IMMEDIATE(24시간 병원)로 요청했는데 결과가 없어 NORMAL 로 다시 받아왔는지.
   * 화면에서 "24시간 병원 정보가 아직 없어 주변 병원을 보여드려요" 안내에 씁니다.
   */
  fellBackToNormal: boolean;
}

/**
 * 주변 병원 추천. IMMEDIATE 는 24시간 병원만 걸러 주는데 백엔드에 아직 그 데이터가
 * 없어서 항상 빈 배열이 옵니다(2026-08-14 기준). 응급 상황에서 지도가 텅 비면
 * 곤란하니, 빈 결과면 반경 전체(NORMAL)로 한 번 더 받아옵니다.
 *
 * 백엔드에 24시간 병원 데이터가 채워지면 첫 요청에서 결과가 나오므로
 * 이 폴백은 저절로 동작하지 않게 됩니다 — 그때 지워도 됩니다.
 */
export async function recommendHospitals(
  params: HospitalRecommendParams,
): Promise<RecommendHospitalsResult> {
  const hospitals = await hospitalsApi.recommend(params);

  if (params.level !== 'IMMEDIATE' || hospitals.length > 0) {
    return { hospitals, fellBackToNormal: false };
  }

  const fallback = await hospitalsApi.recommend({ ...params, level: 'NORMAL' });
  // 폴백까지 비었다면 그냥 주변에 병원이 없는 것이라 안내를 띄우지 않습니다
  return { hospitals: fallback, fellBackToNormal: fallback.length > 0 };
}
