import type { Hospital, LatLng } from '@/types';

/** 카카오 developers > 앱 키 > JavaScript 키 (REST 키와 다릅니다) */
export const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY?.trim() ?? '';

/**
 * 카카오맵 JS SDK 는 요청 도메인을 카카오에 등록된 플랫폼 목록과 대조합니다.
 * 앱(WebView)은 로컬 HTML 이라 원래 도메인이 없어서, baseUrl 로 등록된 도메인을
 * 알려 줘야 지도가 뜹니다. Expo 웹 개발 서버와 같은 값을 쓰면 등록이 한 번으로 끝납니다.
 */
export const KAKAO_WEB_ORIGIN =
  process.env.EXPO_PUBLIC_KAKAO_WEB_ORIGIN?.trim() || 'http://localhost:8081';

/** autoload=false 로 받아 kakao.maps.load() 안에서 지도를 만듭니다 */
export function kakaoSdkUrl(jsKey: string): string {
  return `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(jsKey)}&autoload=false`;
}

/** 지도 → 화면으로 올라오는 메시지 */
export type KakaoMapMessage =
  | { type: 'ready' }
  | { type: 'select'; hospitalId: number }
  | { type: 'deselect' }
  /** 사용자가 지도를 끌거나 확대·축소해서 중심이 바뀌었을 때 (프로그램 이동은 제외) */
  | { type: 'moved'; lat: number; lng: number }
  | { type: 'error'; message: string };

/** 지도에 넘기는 최소 정보 — Hospital 전체를 WebView 로 보낼 필요는 없습니다 */
export interface MapMarker {
  hospitalId: number;
  hospitalName: string;
  latitude: number;
  longitude: number;
}

export function toMapMarkers(hospitals: Hospital[]): MapMarker[] {
  return hospitals.map(({ hospitalId, hospitalName, latitude, longitude }) => ({
    hospitalId,
    hospitalName,
    latitude,
    longitude,
  }));
}

/**
 * 앱(WebView)과 웹이 똑같이 쓰는 지도 로직입니다.
 *
 * 이 스크립트는 전역 함수 세 개만 만들어 두고, 바깥에서 호출해 쓰게 되어 있습니다.
 *   __initMap({ lat, lng, level })      지도 생성
 *   __renderHospitals(markers, id)      마커 다시 그리기 (선택된 마커는 큰 핀)
 *   __moveTo(lat, lng)                  중심 이동
 *
 * 바깥으로 나가는 연락은 __postMapMessage(json) 하나로 통일했습니다.
 * 앱은 이걸 ReactNativeWebView.postMessage 에, 웹은 콜백에 연결합니다.
 *
 * ES5 문법으로 쓴 이유: 구형 안드로이드 WebView 에서도 그대로 돌아야 합니다.
 */
export const KAKAO_MAP_SCRIPT = `
(function () {
  var map = null;
  var markers = [];
  var selectedId = null;
  // 지도가 만들어지기 전에 도착한 마커를 담아 뒀다가 생성 직후 그립니다
  var pending = null;

  // __moveTo 로 옮긴 직후에도 idle 이 울립니다. 그걸 사용자가 옮긴 걸로 착각하면
  // '이 지역에서 재검색' 이 저절로 떠 버려서, 방금 옮겼는지를 시각으로 걸러냅니다.
  // (플래그 대신 시각을 쓰는 이유: 이동 거리가 0 이면 idle 이 아예 안 울려서
  //  플래그가 켜진 채 남고, 다음 진짜 이동을 삼켜 버립니다)
  var movedProgrammaticallyAt = 0;
  var PROGRAMMATIC_MOVE_WINDOW_MS = 1000;

  function post(message) {
    if (window.__postMapMessage) window.__postMapMessage(JSON.stringify(message));
  }

  function svgUrl(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // 카카오 지도 바탕에는 색색의 POI 아이콘이 빽빽해서, 연한 마커는 그대로 묻힙니다.
  // 그래서 둘 다 진한 먹색 외곽선을 두르고, 선택된 쪽은 크기와 채도로 한 번 더 벌립니다.
  //   기본   흰 바탕 + 노란 발바닥 (작음)
  //   선택   노란 바탕 + 흰 발바닥 (큼)

  var SELECTED_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="64" viewBox="0 0 52 64">' +
    '<path d="M26 62.5C26 62.5 49 41 49 25A23 23 0 1 0 3 25C3 41 26 62.5 26 62.5Z" ' +
    'fill="#EFBE24" stroke="#2E2A24" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<g fill="#FFFFFF">' +
    '<ellipse cx="18" cy="21" rx="3.4" ry="4.6"/>' +
    '<ellipse cx="26" cy="18.6" rx="3.4" ry="4.8"/>' +
    '<ellipse cx="34" cy="21" rx="3.4" ry="4.6"/>' +
    '<path d="M26 28c4.9 0 8.6 3.4 8.6 6.8 0 2.9-2.7 4.4-5.6 4.4h-6c-2.9 0-5.6-1.5-5.6-4.4C17.4 31.4 21.1 28 26 28z"/>' +
    '</g></svg>';

  var DEFAULT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">' +
    '<path d="M17 42.5C17 42.5 32 27.5 32 16.5A15 15 0 1 0 2 16.5C2 27.5 17 42.5 17 42.5Z" ' +
    'fill="#FFFFFF" stroke="#2E2A24" stroke-width="2" stroke-linejoin="round"/>' +
    // 흰 바탕에 얹히므로 밝은 노랑(#EFBE24)은 34px 로 줄면 뭉갭니다 — 진한 호박색으로 낮춥니다
    '<g fill="#B0830C">' +
    '<ellipse cx="11.8" cy="13.8" rx="2.3" ry="3.1"/>' +
    '<ellipse cx="17" cy="12.2" rx="2.3" ry="3.2"/>' +
    '<ellipse cx="22.2" cy="13.8" rx="2.3" ry="3.1"/>' +
    '<path d="M17 18.4c3.3 0 5.8 2.3 5.8 4.6 0 2-1.8 3-3.8 3h-4c-2 0-3.8-1-3.8-3 0-2.3 2.5-4.6 5.8-4.6z"/>' +
    '</g></svg>';

  function imageFor(isSelected) {
    // offset 은 이미지에서 좌표에 붙일 지점 — 핀이라 뾰족한 아래 끝을 찍습니다
    if (isSelected) {
      return new kakao.maps.MarkerImage(svgUrl(SELECTED_SVG), new kakao.maps.Size(52, 64), {
        offset: new kakao.maps.Point(26, 63)
      });
    }
    return new kakao.maps.MarkerImage(svgUrl(DEFAULT_SVG), new kakao.maps.Size(34, 44), {
      offset: new kakao.maps.Point(17, 43)
    });
  }

  function clearMarkers() {
    for (var i = 0; i < markers.length; i++) markers[i].setMap(null);
    markers = [];
  }

  window.__renderHospitals = function (list, nextSelectedId) {
    if (!map) {
      pending = { list: list, selectedId: nextSelectedId };
      return;
    }
    selectedId = nextSelectedId == null ? null : nextSelectedId;
    clearMarkers();

    for (var i = 0; i < list.length; i++) {
      // 클로저로 감싸야 click 콜백이 마지막 항목만 붙잡지 않습니다
      (function (hospital) {
        var isSelected = hospital.hospitalId === selectedId;
        var marker = new kakao.maps.Marker({
          map: map,
          position: new kakao.maps.LatLng(hospital.latitude, hospital.longitude),
          image: imageFor(isSelected),
          zIndex: isSelected ? 10 : 1,
          title: hospital.hospitalName
        });
        kakao.maps.event.addListener(marker, 'click', function () {
          post({ type: 'select', hospitalId: hospital.hospitalId });
        });
        markers.push(marker);
      })(list[i]);
    }
  };

  window.__moveTo = function (lat, lng) {
    if (!map) return;
    movedProgrammaticallyAt = Date.now();
    map.panTo(new kakao.maps.LatLng(lat, lng));
  };

  window.__initMap = function (config) {
    // 키가 틀리거나 도메인이 등록되지 않으면 SDK 자체가 안 실려서 kakao 가 없습니다.
    // 지도가 그냥 빈 화면이 되면 원인을 알 수 없으니 밖으로 알려 줍니다.
    if (typeof kakao === 'undefined' || !kakao.maps) {
      post({ type: 'error', message: 'SDK_NOT_LOADED' });
      return;
    }

    kakao.maps.load(function () {
      // 지도를 만들면서도 idle 이 한 번 울리므로 그것도 걸러냅니다
      movedProgrammaticallyAt = Date.now();

      map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(config.lat, config.lng),
        level: config.level || 5
      });

      kakao.maps.event.addListener(map, 'click', function () {
        post({ type: 'deselect' });
      });

      // idle 은 끌기·확대가 끝나고 지도가 멎었을 때 한 번 울립니다
      kakao.maps.event.addListener(map, 'idle', function () {
        if (Date.now() - movedProgrammaticallyAt < PROGRAMMATIC_MOVE_WINDOW_MS) return;
        var next = map.getCenter();
        post({ type: 'moved', lat: next.getLat(), lng: next.getLng() });
      });

      var initial = pending || { list: [], selectedId: null };
      pending = null;
      window.__renderHospitals(initial.list, initial.selectedId);

      post({ type: 'ready' });
    });
  };
})();
`;

/** 앱(WebView)에 통째로 밀어 넣을 HTML */
export function buildKakaoMapHtml(jsKey: string, center: LatLng): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
  body { background: #faf8f3; overflow: hidden; }
</style>
<script>
  window.__postMapMessage = function (message) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(message);
  };
</script>
<script src="${kakaoSdkUrl(jsKey)}" onerror="window.__postMapMessage(JSON.stringify({ type: 'error', message: 'SDK_NOT_LOADED' }))"></script>
</head>
<body>
<div id="map"></div>
<script>${KAKAO_MAP_SCRIPT}</script>
<script>window.__initMap({ lat: ${center.lat}, lng: ${center.lng}, level: 5 });</script>
</body>
</html>`;
}
