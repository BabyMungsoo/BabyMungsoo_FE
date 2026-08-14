import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import type { LatLng } from '@/types';

/**
 * 위치를 못 받았을 때 지도에 쓸 기본 좌표 (서울시청).
 * 권한을 거부해도 지도가 빈 화면이 되지 않도록 여기를 중심으로 보여줍니다.
 */
export const FALLBACK_CENTER: LatLng = { lat: 37.5665, lng: 126.978 };

/**
 * 개발용 위치 고정 (.env.local 의 EXPO_PUBLIC_DEV_LOCATION, 예: '37.5665,126.978').
 *
 * 병원 데이터가 서울에만 있어서 서울 밖에서는 실제 위치로 열면 결과가 늘 비어 있습니다.
 * 이 값이 있으면 기기 위치를 묻지 않고 여기를 현재 위치로 씁니다.
 */
const DEV_LOCATION = parseDevLocation();

function parseDevLocation(): LatLng | null {
  const raw = process.env.EXPO_PUBLIC_DEV_LOCATION?.trim();
  if (!raw) return null;

  const [lat, lng] = raw.split(',').map((part) => Number(part.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

export type LocationStatus = 'loading' | 'granted' | 'denied' | 'error';

/**
 * 위치를 기다려 주는 한도.
 *
 * 브라우저 navigator.geolocation 은 사용자가 권한 팝업을 그냥 두거나 브라우저가
 * 조용히 막으면 응답을 아예 주지 않습니다. expo-location 에는 타임아웃 옵션이 없어서
 * 직접 끊어 주지 않으면 화면이 로딩에서 멈춥니다.
 */
const LOCATION_TIMEOUT_MS = 6000;

/** ms 안에 끝나지 않으면 거부되는 약속으로 감쌉니다 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('LOCATION_TIMEOUT')), ms);
    }),
  ]).finally(() => clearTimeout(timer)) as Promise<T>;
}

interface UseCurrentLocationResult {
  /** 권한이 없거나 실패하면 FALLBACK_CENTER 가 들어옵니다 — 항상 값이 있습니다 */
  center: LatLng;
  /** 실제 사용자 위치를 받아왔는지. false 면 center 는 기본 좌표입니다 */
  isRealLocation: boolean;
  status: LocationStatus;
  retry: () => void;
}

/**
 * 현재 위치를 한 번만 받아옵니다 (추적 아님).
 * 병원 추천 API 의 lat/lng 와 지도 중심에 같이 씁니다.
 */
export function useCurrentLocation(): UseCurrentLocationResult {
  const [center, setCenter] = useState<LatLng>(DEV_LOCATION ?? FALLBACK_CENTER);
  const [isRealLocation, setIsRealLocation] = useState(DEV_LOCATION != null);
  const [status, setStatus] = useState<LocationStatus>(DEV_LOCATION ? 'granted' : 'loading');
  // retry() 로 값을 바꿔 아래 effect 를 다시 돌립니다
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    // 응답이 늦게 온 뒤 화면이 이미 사라졌다면 setState 를 하지 않습니다
    let alive = true;

    async function load() {
      // 위치를 고정해 뒀으면 기기에 묻지 않습니다 (권한 팝업도 뜨지 않습니다)
      if (DEV_LOCATION) return;

      setStatus('loading');
      try {
        const { granted } = await withTimeout(
          Location.requestForegroundPermissionsAsync(),
          LOCATION_TIMEOUT_MS,
        );
        if (!alive) return;

        if (!granted) {
          setStatus('denied');
          return;
        }

        const position = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          LOCATION_TIMEOUT_MS,
        );
        if (!alive) return;

        setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsRealLocation(true);
        setStatus('granted');
      } catch {
        if (!alive) return;
        // 타임아웃, 실내라 GPS 를 못 잡는 경우 등 권한과 무관한 실패도 있어서 denied 와 구분합니다.
        // 어느 쪽이든 center 는 FALLBACK_CENTER 로 남아 지도는 그대로 뜹니다.
        setStatus('error');
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [attempt]);

  return { center, isRealLocation, status, retry };
}
