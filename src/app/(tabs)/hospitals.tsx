import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { toTriageLevel } from '@/constants/triage';
import { HospitalMapView } from '@/features/hospitals/components/hospital-map-view';
import { KAKAO_JS_KEY, toMapMarkers } from '@/features/hospitals/kakao-map-script';
import { toHospitalLevel } from '@/features/hospitals/to-hospital-level';
import { useRecommendedHospitals } from '@/hooks/queries/use-hospitals';
import { useCurrentLocation } from '@/hooks/use-current-location';
import type { HospitalRecommendParams, LatLng } from '@/types';

/**
 * 9번 — 지도 / 병원 찾기 (GET /hospitals/recommend?lat=&lng=&level=)
 *
 * 7번 상세의 '병원 찾기' 에서 분석기록의 응급도를 level 로 넘겨 받습니다.
 * 탭에서 바로 들어오면 응급도가 없으니 반경 전체(NORMAL)를 보여줍니다.
 */
export default function HospitalsScreen() {
  const router = useRouter();
  const { level } = useLocalSearchParams<{ level?: string }>();

  const { center, isRealLocation, status, retry: retryLocation } = useCurrentLocation();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mapErrored, setMapErrored] = useState(false);
  // '24시간' 필터. 켜면 24시간 진료 병원만 지도에 남깁니다.
  const [only24h, setOnly24h] = useState(false);

  // 조회 기준점. 지도를 옮겨 재검색하기 전까지는 현재 위치를 씁니다.
  const [searchCenter, setSearchCenter] = useState<LatLng | null>(null);
  // 사용자가 지도를 끌어다 놓은 지점. 값이 있으면 '이 지역에서 재검색' 이 뜹니다.
  const [pannedCenter, setPannedCenter] = useState<LatLng | null>(null);

  const origin = searchCenter ?? center;

  // 위치를 받기 전에 기본 좌표로 한 번, 받은 뒤에 다시 — 이렇게 두 번 부르지 않도록 기다립니다
  const params = useMemo<HospitalRecommendParams | undefined>(() => {
    if (status === 'loading') return undefined;
    return { lat: origin.lat, lng: origin.lng, level: toHospitalLevel(toTriageLevel(level)) };
  }, [status, origin.lat, origin.lng, level]);

  const { data, isPending, error, refetch } = useRecommendedHospitals(params);

  const hospitals = data?.hospitals;

  /**
   * IMMEDIATE 로 요청하면 백엔드가 이미 24시간 병원만 주지만, 탭에서 바로 들어오면
   * 반경 전체가 옵니다. 그때도 필터가 동작하도록 화면에서 한 번 더 걸러 줍니다.
   */
  const visibleHospitals = useMemo(() => {
    const list = hospitals ?? [];
    return only24h ? list.filter((hospital) => hospital.is24hour) : list;
  }, [hospitals, only24h]);

  const markers = useMemo(() => toMapMarkers(visibleHospitals), [visibleHospitals]);
  // 걸러진 목록에서 찾으므로, 고른 병원이 필터에 걸리면 카드가 저절로 닫힙니다
  const selected = visibleHospitals.find((hospital) => hospital.hospitalId === selectedId) ?? null;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/records');
  }

  function handleResearch() {
    if (!pannedCenter) return;
    setSearchCenter(pannedCenter);
    setPannedCenter(null);
  }

  function handleRetry() {
    // 위치를 못 받아 기본 좌표를 쓰는 중이면 위치부터 다시 시도합니다
    if (!isRealLocation) retryLocation();
    refetch();
  }

  return (
    <HospitalMapView
      center={center}
      markers={markers}
      selected={selected}
      onSelect={setSelectedId}
      onDeselect={() => setSelectedId(null)}
      onMoved={setPannedCenter}
      onPressBack={handleBack}
      canResearch={pannedCenter != null}
      onResearch={handleResearch}
      isPending={isPending}
      error={error}
      onRetry={handleRetry}
      hospitalCount={visibleHospitals.length}
      only24h={only24h}
      onToggle24h={() => setOnly24h((previous) => !previous)}
      fellBackToNormal={data?.fellBackToNormal ?? false}
      isFallbackLocation={status !== 'loading' && !isRealLocation}
      mapUnavailable={!KAKAO_JS_KEY || mapErrored}
      onMapError={() => setMapErrored(true)}
    />
  );
}
