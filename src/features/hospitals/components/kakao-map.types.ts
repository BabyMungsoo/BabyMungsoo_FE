import type { MapMarker } from '@/features/hospitals/kakao-map-script';
import type { LatLng } from '@/types';

/**
 * 앱(kakao-map.tsx)과 웹(kakao-map.web.tsx)이 같은 props 를 받도록 여기에 모아 둡니다.
 * 한쪽만 고치면 다른 플랫폼에서 조용히 어긋나기 때문에 타입을 공유합니다.
 */
export interface KakaoMapProps {
  /** 지도 중심. 값이 바뀌면 부드럽게 이동합니다 */
  center: LatLng;
  markers: MapMarker[];
  selectedId: number | null;
  onSelect: (hospitalId: number) => void;
  /** 지도 빈 곳을 탭했을 때 — 하단 카드를 닫습니다 */
  onDeselect: () => void;
  /** 사용자가 지도를 옮겼을 때 — '이 지역에서 재검색' 을 띄웁니다 */
  onMoved: (center: LatLng) => void;
  /** SDK 를 못 불러왔을 때 (키 오류·도메인 미등록 등) */
  onError?: () => void;
}
