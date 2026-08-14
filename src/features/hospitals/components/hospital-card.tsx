import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Linking, Pressable, Text, View } from 'react-native';

import { isMissing, type Hospital } from '@/types';

interface HospitalCardProps {
  hospital: Hospital;
  onClose: () => void;
}

/**
 * 9번 지도 화면에서 마커를 눌렀을 때 아래에 뜨는 병원 카드.
 *
 * 시안에는 썸네일 사진 / 별점 4.8 (256) / '현재 영업 중' 이 있지만
 * 백엔드에 아직 그 데이터가 없습니다 (사진은 필드 자체가 없고, rating·openHours 는 전부 null).
 * 없는 값을 지어내는 대신 값이 있을 때만 그리도록 해서, 나중에 채워지면 그대로 나타납니다.
 */
export function HospitalCard({ hospital, onClose }: HospitalCardProps) {
  const phone = isMissing(hospital.phone) ? null : hospital.phone!;

  function handleCall() {
    if (!phone) return;
    // 하이픈·공백이 섞여 있어도 걸리도록 숫자와 + 만 남깁니다
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  }

  function handleDirections() {
    // 카카오맵 길찾기 링크 — 앱이 깔려 있으면 앱으로, 아니면 웹으로 열립니다
    const name = encodeURIComponent(hospital.hospitalName);
    Linking.openURL(
      `https://map.kakao.com/link/to/${name},${hospital.latitude},${hospital.longitude}`,
    );
  }

  return (
    <View
      className="rounded-2xl bg-paper-card p-4"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      <Pressable
        onPress={onClose}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="병원 정보 닫기"
        className="absolute -top-3 left-3 z-10 h-7 w-7 items-center justify-center rounded-full bg-ink active:opacity-70"
      >
        <Ionicons name="close" size={16} color="#ffffff" />
      </Pressable>

      <View className="flex-row gap-3">
        {/* 사진이 아직 없는 병원이 대부분이라, 없으면 발바닥 자리표시로 대신합니다 */}
        {hospital.imageUrl ? (
          <Image
            source={{ uri: hospital.imageUrl }}
            style={{ height: 72, width: 72, borderRadius: 12 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="h-[72px] w-[72px] items-center justify-center rounded-xl bg-brand-100">
            <Ionicons name="paw" size={28} color="#d9a50f" />
          </View>
        )}

        <View className="flex-1 gap-1">
          <Text className="text-base font-bold text-ink" numberOfLines={2}>
            {hospital.hospitalName}
          </Text>

          {hospital.rating != null && (
            <RatingRow rating={hospital.rating} reviewCount={hospital.reviewCount} />
          )}

          {hospital.is24hour ? (
            <Text className="text-sm font-semibold text-triage-normal">24시간 진료</Text>
          ) : (
            !!hospital.openHours && (
              <Text className="text-sm text-ink-muted" numberOfLines={1}>
                {hospital.openHours}
              </Text>
            )
          )}
        </View>
      </View>

      <View className="my-3 h-px bg-ink-line" />

      <View className="gap-1">
        <InfoRow label="전화" value={phone ?? '정보 없음'} muted={!phone} />
        <InfoRow label="주소" value={hospital.address} />
      </View>

      <View className="mt-4 flex-row gap-2">
        <Pressable
          onPress={handleCall}
          disabled={!phone}
          accessibilityRole="button"
          className={`flex-1 items-center justify-center rounded-xl py-3.5 ${
            phone ? 'bg-brand-400 active:opacity-70' : 'bg-paper-chip'
          }`}
        >
          <Text className={`text-base font-bold ${phone ? 'text-brand-900' : 'text-ink-soft'}`}>
            전화 걸기
          </Text>
        </Pressable>

        <Pressable
          onPress={handleDirections}
          accessibilityRole="button"
          accessibilityLabel="길찾기"
          className="items-center justify-center rounded-xl border border-ink-line bg-paper-card px-4 py-2 active:opacity-70"
        >
          <Ionicons name="navigate" size={18} color="#2e2a24" />
          <Text className="mt-0.5 text-xs font-bold text-ink">길찾기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <View className="flex-row">
      <Text className="w-10 text-sm text-ink-muted">{label}</Text>
      <Text className={`flex-1 text-sm ${muted ? 'text-ink-soft' : 'text-ink'}`}>{value}</Text>
    </View>
  );
}

/** 별 5개를 평점만큼 채웁니다 (4.8 이면 4개는 꽉, 1개는 반) */
function RatingRow({ rating, reviewCount }: { rating: number; reviewCount: number | null }) {
  return (
    <View className="flex-row items-center gap-1">
      <Text className="text-sm font-bold text-ink">{rating.toFixed(1)}</Text>
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((position) => {
          const name =
            rating >= position ? 'star' : rating >= position - 0.5 ? 'star-half' : 'star-outline';
          return <Ionicons key={position} name={name} size={13} color="#f4cb4a" />;
        })}
      </View>
      {reviewCount != null && <Text className="text-xs text-ink-soft">({reviewCount})</Text>}
    </View>
  );
}
