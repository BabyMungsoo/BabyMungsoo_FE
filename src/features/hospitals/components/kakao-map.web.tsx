import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import {
  KAKAO_JS_KEY,
  KAKAO_MAP_SCRIPT,
  kakaoSdkUrl,
  type KakaoMapMessage,
  type MapMarker,
} from '@/features/hospitals/kakao-map-script';

import type { KakaoMapProps } from './kakao-map.types';

declare global {
  interface Window {
    __initMap?: (config: { lat: number; lng: number; level?: number }) => void;
    __renderHospitals?: (list: MapMarker[], selectedId: number | null) => void;
    __moveTo?: (lat: number, lng: number) => void;
    __postMapMessage?: (json: string) => void;
  }
}

const SDK_SCRIPT_ID = 'kakao-maps-sdk';
const MAP_SCRIPT_ID = 'kakao-maps-babymungsoo';

/**
 * Expo 웹용 카카오맵.
 *
 * react-native-webview 는 웹에서 동작하지 않아서, 앱과 같은 지도 로직
 * (KAKAO_MAP_SCRIPT)을 WebView 대신 페이지에 직접 넣습니다.
 * 지도 로직이 한 벌이라 앱과 웹이 어긋날 일이 없습니다.
 *
 * 웹은 실제 도메인(기본 http://localhost:8081)으로 SDK 를 부르므로,
 * 카카오 developers 에 그 도메인이 Web 플랫폼으로 등록되어 있어야 합니다.
 */
export function KakaoMap({
  center,
  markers,
  selectedId,
  onSelect,
  onDeselect,
  onMoved,
  onError,
}: KakaoMapProps) {
  // 지도 스크립트는 한 번만 붙기 때문에, 콜백은 ref 로 최신 것을 따라가게 합니다.
  // (렌더 중에 ref 를 건드리면 안 되므로 매 렌더 뒤에 갱신합니다)
  const handlersRef = useRef({ onSelect, onDeselect, onMoved, onError });
  useEffect(() => {
    handlersRef.current = { onSelect, onDeselect, onMoved, onError };
  });

  // 지도가 준비되기 전에 온 마커는 스크립트 쪽에서 대기시켰다가 그립니다
  useEffect(() => {
    let alive = true;

    window.__postMapMessage = (json: string) => {
      let message: KakaoMapMessage;
      try {
        message = JSON.parse(json);
      } catch {
        return;
      }

      const handlers = handlersRef.current;
      if (message.type === 'select') handlers.onSelect(message.hospitalId);
      else if (message.type === 'deselect') handlers.onDeselect();
      else if (message.type === 'moved') handlers.onMoved({ lat: message.lat, lng: message.lng });
      else if (message.type === 'error') handlers.onError?.();
    };

    async function start() {
      try {
        await loadSdkScript(KAKAO_JS_KEY);
        if (!alive) return;
        ensureMapScript();
        window.__initMap?.({ lat: center.lat, lng: center.lng, level: 5 });
      } catch {
        if (alive) handlersRef.current.onError?.();
      }
    }

    start();

    return () => {
      alive = false;
    };
    // 최초 1회만 — 이후 중심 이동은 아래 __moveTo 가 맡습니다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.__renderHospitals?.(markers, selectedId);
  }, [markers, selectedId]);

  useEffect(() => {
    window.__moveTo?.(center.lat, center.lng);
  }, [center.lat, center.lng]);

  return <View nativeID="map" style={{ flex: 1, backgroundColor: '#faf8f3' }} />;
}

/** 카카오 SDK <script> 를 한 번만 붙이고, 로드가 끝나면 resolve 합니다 */
function loadSdkScript(jsKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SDK_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      // 이미 실려 있으면(다른 화면에서 먼저 띄웠다면) kakao 전역이 있는지로 판단합니다
      if ('kakao' in window) resolve();
      else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('SDK_NOT_LOADED')));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = SDK_SCRIPT_ID;
    script.src = kakaoSdkUrl(jsKey);
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('SDK_NOT_LOADED')));
    document.head.appendChild(script);
  });
}

/** 앱과 공유하는 지도 로직을 페이지에 한 번만 심습니다 (인라인이라 붙이는 즉시 실행됩니다) */
function ensureMapScript() {
  if (document.getElementById(MAP_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = MAP_SCRIPT_ID;
  script.textContent = KAKAO_MAP_SCRIPT;
  document.head.appendChild(script);
}
