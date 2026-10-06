import type { LatLng } from '@/types';

const EARTH_RADIUS_KM = 6371;

/**
 * 두 좌표 사이 직선 거리(km). 하버사인 공식.
 *
 * 백엔드 /hospitals/recommend 는 위경도 박스로 거르기만 하고 거리순 정렬을 해 주지 않아서,
 * 화면에서 직접 거리를 재서 정렬합니다. 도로 거리가 아니라 직선이지만 5km 반경 안에서
 * '어디가 더 가까운가'를 고르는 데는 충분합니다.
 */
export function distanceKm(from: LatLng, to: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** 1km 미만은 m 로, 그 이상은 소수 첫째 자리 km 로 (예: 850m, 1.2km) */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(10, Math.round(km * 100) * 10)}m`;
  return `${km.toFixed(1)}km`;
}
