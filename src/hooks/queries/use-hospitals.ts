import { useQuery } from '@tanstack/react-query';

import { hospitalsApi } from '@/api';
import { recommendHospitals } from '@/features/hospitals/recommend-hospitals';
import { queryKeys } from '@/lib/query-keys';
import type { HospitalRecommendParams } from '@/types';

/**
 * GET /hospitals/recommend — 현재 위치 반경 약 5km 병원.
 * params 가 없으면(위치를 아직 못 받았으면) 요청하지 않습니다.
 */
export function useRecommendedHospitals(params: HospitalRecommendParams | undefined) {
  return useQuery({
    queryKey: queryKeys.hospitals.recommend(params!),
    queryFn: () => recommendHospitals(params!),
    enabled: params != null,
  });
}

/** GET /hospitals/{hospitalId} */
export function useHospital(hospitalId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.hospitals.detail(hospitalId!),
    queryFn: () => hospitalsApi.detail(hospitalId!),
    enabled: hospitalId != null,
  });
}
