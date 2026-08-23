import { useEffect, useRef, useState } from 'react';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import {
  buildKakaoMapHtml,
  KAKAO_JS_KEY,
  KAKAO_WEB_ORIGIN,
  type KakaoMapMessage,
  type MapMarker,
} from '@/features/hospitals/kakao-map-script';

import type { KakaoMapProps } from './kakao-map.types';

/**
 * 앱(iOS/Android)용 카카오맵. 카카오는 RN SDK 를 내주지 않아서
 * WebView 에 JS SDK 를 띄우고 injectJavaScript 로 마커만 갈아 끼웁니다.
 *
 * 웹은 WebView 가 동작하지 않아 kakao-map.web.tsx 가 대신 쓰입니다.
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
  const webViewRef = useRef<WebView>(null);

  // HTML 은 처음 한 번만 만듭니다. 중심이 바뀌어도 지도를 새로 만들지 않고 __moveTo 로 옮깁니다.
  const [html] = useState(() => buildKakaoMapHtml(KAKAO_JS_KEY, center));

  function renderMarkers(list: MapMarker[], id: number | null) {
    // 끝의 true 가 없으면 iOS 에서 injectJavaScript 가 경고를 냅니다
    webViewRef.current?.injectJavaScript(
      `window.__renderHospitals(${JSON.stringify(list)}, ${id ?? 'null'}); true;`,
    );
  }

  useEffect(() => {
    renderMarkers(markers, selectedId);
  }, [markers, selectedId]);

  useEffect(() => {
    webViewRef.current?.injectJavaScript(`window.__moveTo(${center.lat}, ${center.lng}); true;`);
  }, [center.lat, center.lng]);

  function handleMessage(event: WebViewMessageEvent) {
    let message: KakaoMapMessage;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    switch (message.type) {
      case 'select':
        onSelect(message.hospitalId);
        break;
      case 'deselect':
        onDeselect();
        break;
      case 'moved':
        onMoved({ lat: message.lat, lng: message.lng });
        break;
      case 'error':
        onError?.();
        break;
      case 'ready':
        // 페이지가 뜨기 전에 injectJavaScript 한 건 그냥 사라집니다.
        // 지도가 준비됐다고 알려 오면 지금 가진 마커로 한 번 더 그립니다.
        renderMarkers(markers, selectedId);
        break;
    }
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ html, baseUrl: KAKAO_WEB_ORIGIN }}
      originWhitelist={['*']}
      onMessage={handleMessage}
      // SDK 를 받아오지 못하면(네트워크 차단 등) HTML 의 onerror 가 못 잡는 경우가 있어 함께 봅니다
      onError={() => onError?.()}
      javaScriptEnabled
      domStorageEnabled
      // 개발 중엔 Safari 웹 인스펙터로 WebView 내부 콘솔·네트워크를 볼 수 있게 켭니다
      webviewDebuggingEnabled={__DEV__}
      // 지도가 자체적으로 스크롤·확대를 처리하므로 WebView 쪽 스크롤은 끕니다
      scrollEnabled={false}
      bounces={false}
      style={{ flex: 1, backgroundColor: '#faf8f3' }}
    />
  );
}
