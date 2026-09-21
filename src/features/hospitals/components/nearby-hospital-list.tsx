import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { distanceKm, formatDistance } from '@/features/hospitals/distance';
import { callHospital } from '@/features/hospitals/phone';
import { toHospitalLevel } from '@/features/hospitals/to-hospital-level';
import { useNearestHospitals } from '@/hooks/queries/use-hospitals';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { isMissing, type Hospital, type TriageLevel } from '@/types';

/** 결과 화면에 몇 곳까지 보여줄지. 응급 상황에서 고르는 데 셋이면 충분하고, 더는 지도로 갑니다. */
const MAX_ITEMS = 3;

interface NearbyHospitalListProps {
  /** 판정 결과의 응급도. IMMEDIATE 면 24시간 병원만 받아옵니다. 모르면 반경 전체 */
  level: TriageLevel | null;
  /** 항목을 눌렀을 때 — 지도(9번)를 그 병원이 선택된 채로 엽니다 */
  onPressHospital: (hospitalId: number) => void;
  /** '지도에서 보기' — 3곳 밖의 병원까지 보고 싶을 때 */
  onPressMore: () => void;
}

/**
 * 응급 판단 결과(4번) 아래에 붙는 '가까운 동물병원' 3곳.
 *
 * 멘토 피드백: 결과를 본 직후가 병원에 전화하는 순간인데, 지도까지 들어가서 핀을 눌러야
 * 번호가 보였다. 여기서 바로 걸 수 있게 전화 버튼을 항목마다 둡니다.
 *
 * 위치와 응급도로 /hospitals/nearest 를 받습니다. recommend(5km 박스)와 달리 반경이 없어
 * 교외에서도 늘 가까운 순 3곳이 나옵니다 — 멀어도 "가장 가까운 곳"이 응급엔 필요합니다.
 * 서버가 이미 거리순으로 주지만 표시할 거리(850m 같은)는 화면에서 잽니다.
 */
export function NearbyHospitalList({
  level,
  onPressHospital,
  onPressMore,
}: NearbyHospitalListProps) {
  const { center, status, isRealLocation } = useCurrentLocation();

  // 위치를 받기 전에 기본 좌표로 한 번, 받은 뒤에 다시 — 두 번 부르지 않도록 기다립니다 (9번과 같은 규칙)
  const params = useMemo(
    () =>
      status === 'loading'
        ? undefined
        : { lat: center.lat, lng: center.lng, level: toHospitalLevel(level), limit: MAX_ITEMS },
    [status, center.lat, center.lng, level],
  );

  const { data, isPending, error, refetch } = useNearestHospitals(params);

  // 서버가 가까운 순으로 주므로 순서는 믿고, 표시용 거리만 붙입니다
  const nearest = useMemo(
    () =>
      (data ?? []).map((hospital) => ({
        hospital,
        km: distanceKm(center, { lat: hospital.latitude, lng: hospital.longitude }),
      })),
    [data, center],
  );

  // IMMEDIATE 로 물었는데 24시간 병원이 하나도 안 왔으면 서버가 전체로 폴백한 것입니다
  const fellBackToNormal =
    level === 'IMMEDIATE' && nearest.length > 0 && !nearest.some((item) => item.hospital.is24hour);

  return (
    <View className="gap-2">
      <View className="flex-row items-end justify-between">
        <Text className="text-base font-bold text-ink">가까운 동물병원</Text>
        <Pressable onPress={onPressMore} accessibilityRole="button" hitSlop={8}>
          <Text className="text-sm font-semibold text-brand-700">지도에서 보기 ›</Text>
        </Pressable>
      </View>

      {/* 위치 권한을 거부했거나 못 받았으면 서울시청 기준이라 알려줍니다 — 거리가 엉뚱해 보이니까요 */}
      {status !== 'loading' && !isRealLocation && (
        <Text className="text-xs text-ink-soft">
          위치를 확인하지 못해 서울시청 주변을 보여드려요.
        </Text>
      )}
      {fellBackToNormal && (
        <Text className="text-xs text-ink-soft">
          24시간 병원 정보가 아직 없어 주변 병원을 보여드려요.
        </Text>
      )}

      {(status === 'loading' || isPending) && !error && (
        <View className="items-center rounded-2xl bg-paper-card p-5">
          <ActivityIndicator color="#efbe24" />
        </View>
      )}

      {error && (
        <View className="flex-row items-center gap-3 rounded-2xl bg-paper-card px-4 py-3">
          <Text className="flex-1 text-sm text-ink-muted">{error.message}</Text>
          <Pressable onPress={() => refetch()} accessibilityRole="button" hitSlop={8}>
            <Text className="text-sm font-bold text-brand-600">다시 시도</Text>
          </Pressable>
        </View>
      )}

      {!isPending && !error && nearest.length === 0 && (
        <View className="rounded-2xl bg-paper-card px-4 py-4">
          <Text className="text-sm text-ink-muted">등록된 동물병원이 아직 없어요.</Text>
        </View>
      )}

      {nearest.length > 0 && (
        <View className="overflow-hidden rounded-2xl bg-paper-card">
          {nearest.map(({ hospital, km }, index) => (
            <View key={hospital.hospitalId}>
              {index > 0 && <View className="mx-4 h-px bg-ink-line" />}
              <HospitalRow
                hospital={hospital}
                distance={formatDistance(km)}
                onPress={() => onPressHospital(hospital.hospitalId)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function HospitalRow({
  hospital,
  distance,
  onPress,
}: {
  hospital: Hospital;
  distance: string;
  onPress: () => void;
}) {
  const canCall = !isMissing(hospital.phone);

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className="flex-1 gap-0.5 active:opacity-70"
      >
        <Text className="text-sm font-bold text-ink" numberOfLines={1}>
          {hospital.hospitalName}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-xs font-semibold text-ink-muted">{distance}</Text>
          {hospital.is24hour && (
            <>
              <Text className="text-xs text-ink-soft">·</Text>
              <Text className="text-xs font-semibold text-triage-normal">24시간 진료</Text>
            </>
          )}
        </View>
        <Text className="text-xs text-ink-soft" numberOfLines={1}>
          {hospital.address}
        </Text>
      </Pressable>

      {/* 전화가 '정보 없음'인 병원은 버튼을 회색으로 두어 눌러도 되는지 헷갈리지 않게 합니다 */}
      <Pressable
        onPress={() => callHospital(hospital.phone)}
        disabled={!canCall}
        accessibilityRole="button"
        accessibilityLabel={canCall ? `${hospital.hospitalName}에 전화 걸기` : '전화번호 없음'}
        accessibilityState={{ disabled: !canCall }}
        hitSlop={6}
        className={`h-11 w-11 items-center justify-center rounded-full ${
          canCall ? 'bg-brand-400 active:opacity-70' : 'bg-paper-chip'
        }`}
      >
        <Ionicons name="call" size={18} color={canCall ? '#5c4408' : '#a9a296'} />
      </Pressable>
    </View>
  );
}
