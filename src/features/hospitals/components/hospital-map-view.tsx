import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HospitalCard } from '@/features/hospitals/components/hospital-card';
import { KakaoMap } from '@/features/hospitals/components/kakao-map';
import type { MapMarker } from '@/features/hospitals/kakao-map-script';
import type { Hospital, LatLng } from '@/types';

interface HospitalMapViewProps {
  center: LatLng;
  markers: MapMarker[];
  selected: Hospital | null;
  onSelect: (hospitalId: number) => void;
  onDeselect: () => void;
  onMoved: (center: LatLng) => void;
  onPressBack: () => void;

  /** 지도를 옮겨서 '이 지역에서 재검색' 을 띄울 수 있는 상태인지 */
  canResearch: boolean;
  onResearch: () => void;

  isPending: boolean;
  error: Error | null;
  onRetry: () => void;

  /** 병원이 0곳일 때 안내를 띄우기 위해 (필터 적용 후) 목록 길이를 따로 받습니다 */
  hospitalCount: number;
  /** '24시간 병원만' 필터가 켜져 있는지 */
  only24h: boolean;
  onToggle24h: () => void;
  /** 24시간 병원이 없어 반경 전체 결과로 대체했는지 */
  fellBackToNormal: boolean;
  /** 위치 권한을 못 받아 기본 좌표(서울시청)를 쓰고 있는지 */
  isFallbackLocation: boolean;
  /** 카카오 JS 키가 비었거나 SDK 를 못 불러왔는지 */
  mapUnavailable: boolean;
  onMapError: () => void;
}

/**
 * 9번 — 지도 / 병원 찾기. 서버 호출을 모르는 순수 표현 컴포넌트입니다.
 *
 * 지도가 화면을 꽉 채우고, 그 위에 타이틀과 안내 문구가 뜨고,
 * 마커를 고르면 아래에서 병원 카드가 올라옵니다.
 */
export function HospitalMapView({
  center,
  markers,
  selected,
  onSelect,
  onDeselect,
  onMoved,
  onPressBack,
  canResearch,
  onResearch,
  isPending,
  error,
  onRetry,
  hospitalCount,
  only24h,
  onToggle24h,
  fellBackToNormal,
  isFallbackLocation,
  mapUnavailable,
  onMapError,
}: HospitalMapViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-paper">
      <KakaoMap
        center={center}
        markers={markers}
        selectedId={selected?.hospitalId ?? null}
        onSelect={onSelect}
        onDeselect={onDeselect}
        onMoved={onMoved}
        onError={onMapError}
      />

      {mapUnavailable && <MapUnavailable />}

      {/* box-none 이라야 이 층이 지도 조작을 가로막지 않습니다 (자식 버튼만 눌립니다) */}
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 top-0 gap-2 px-4"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View pointerEvents="box-none" className="flex-row items-center">
          <Pressable
            onPress={onPressBack}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            className="h-10 w-10 items-center justify-center rounded-full bg-paper-card active:opacity-70"
            style={FLOATING_SHADOW}
          >
            <Ionicons name="arrow-back" size={20} color="#2e2a24" />
          </Pressable>

          <View
            pointerEvents="none"
            className="flex-1 items-center"
            // 뒤로가기 버튼(40) 만큼 오른쪽에 여백을 둬서 타이틀이 화면 정중앙에 옵니다
            style={{ marginRight: 40 }}
          >
            <View className="rounded-full bg-paper-card px-4 py-2" style={FLOATING_SHADOW}>
              <Text className="text-base font-bold text-ink">주변 동물병원</Text>
            </View>
          </View>
        </View>

        {canResearch && (
          <View pointerEvents="box-none" className="items-center">
            <Pressable
              onPress={onResearch}
              accessibilityRole="button"
              className="flex-row items-center gap-1.5 rounded-full bg-brand-400 px-4 py-2.5 active:opacity-70"
              style={FLOATING_SHADOW}
            >
              <Ionicons name="refresh" size={15} color="#5c4408" />
              <Text className="text-sm font-bold text-brand-900">이 지역에서 재검색</Text>
            </Pressable>
          </View>
        )}

        {/* 권한 거부와 응답 없음(타임아웃)을 한 문구로 묶습니다 — 사용자가 할 일은 같습니다 */}
        {isFallbackLocation && (
          <Notice text="위치를 확인하지 못해 서울시청 주변을 보여드리고 있어요." />
        )}
        {fellBackToNormal && (
          <Notice text="24시간 병원 정보가 아직 없어 주변 병원을 모두 보여드려요." />
        )}
        {!isPending && !error && hospitalCount === 0 && (
          <Notice
            text={
              only24h
                ? '주변에 24시간 진료 병원이 없어요. 필터를 끄면 전체 병원이 보여요.'
                : '주변 5km 안에 등록된 동물병원이 없어요.'
            }
          />
        )}
        {error && <Notice text={error.message} onRetry={onRetry} />}
      </View>

      {isPending && (
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <View className="rounded-2xl bg-paper-card px-5 py-4" style={FLOATING_SHADOW}>
            <ActivityIndicator color="#efbe24" />
          </View>
        </View>
      )}

      {/* 하단 층 — 필터 칩과 병원 카드를 함께 둡니다.
          상단에 타이틀·필터·재검색이 겹쳐 있으면 지도가 가려지고 복잡해 보여서,
          자주 누르는 필터는 엄지가 닿는 아래쪽으로 내렸습니다.
          카드가 열리면 칩이 그 위로 밀려 올라가 서로 가리지 않습니다. */}
      <View
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0 gap-4 px-4"
        style={{ paddingBottom: 16 }}
      >
        <View pointerEvents="box-none" className="items-center">
          <FilterChip label="24시간 병원만" active={only24h} onPress={onToggle24h} />
        </View>

        {selected && <HospitalCard hospital={selected} onClose={onDeselect} />}
      </View>
    </View>
  );
}

const FLOATING_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
} as const;

/**
 * 지도 아래에 뜨는 필터 칩.
 *
 * 켜지면 브랜드색으로 채우고 아이콘이 체크로 바뀝니다. 색만으로 구분하기 어려운 분도
 * 모양으로 켜짐 여부를 알 수 있게 하려는 것입니다.
 */
function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`24시간 진료 병원만 보기, ${active ? '켜짐' : '꺼짐'}`}
      className={`flex-row items-center gap-1.5 rounded-full px-4 py-2.5 active:opacity-70 ${
        active ? 'bg-brand-400' : 'bg-paper-card'
      }`}
      style={FLOATING_SHADOW}
    >
      <Ionicons
        name={active ? 'checkmark-circle' : 'time-outline'}
        size={15}
        color={active ? '#5c4408' : '#8c867a'}
      />
      <Text className={`text-sm font-bold ${active ? 'text-brand-900' : 'text-ink-muted'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function Notice({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-xl bg-paper-card px-4 py-2.5"
      style={FLOATING_SHADOW}
    >
      <Text className="flex-1 text-xs text-ink-muted">{text}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8}>
          <Text className="text-xs font-bold text-brand-600">다시 시도</Text>
        </Pressable>
      )}
    </View>
  );
}

/** 키가 없거나 도메인이 등록되지 않으면 지도가 통째로 빈 화면이 되어서, 원인을 적어 둡니다 */
function MapUnavailable() {
  return (
    <View className="absolute inset-0 items-center justify-center gap-2 bg-paper px-10">
      <Ionicons name="map-outline" size={36} color="#b5afa3" />
      <Text className="text-center text-sm font-bold text-ink">지도를 불러오지 못했어요</Text>
      <Text className="text-center text-xs leading-5 text-ink-muted">
        .env.local 의 EXPO_PUBLIC_KAKAO_JS_KEY 를 확인하고, 카카오 developers 에 이 도메인이 Web
        플랫폼으로 등록되어 있는지 확인해 주세요.
      </Text>
    </View>
  );
}
