import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import BrandLogo from '@/components/common/BrandLogo';

/** 스플래시를 보여주는 시간(ms) — 로고·문구가 다 뜨고 읽을 시간까지 포함합니다 */
const SPLASH_DURATION = 2600;

/**
 * 앱 첫 화면 — 노란 배경에 로고가 뜨고, 이어서 소개 문구가 뜬 뒤 로그인으로 넘깁니다.
 */
export default function Index() {
  const router = useRouter();
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [taglineOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => router.replace('/login'), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [logoOpacity, taglineOpacity, router]);

  return (
    <View className="flex-1 items-center justify-center bg-brand-500 pb-16">
      <Animated.View className="items-center gap-6" style={{ opacity: logoOpacity }}>
        {/* 배지 때문에 로고 박스 중심이 강아지 얼굴보다 오른쪽이라, 얼굴이 화면 중앙에 오도록 옮깁니다 */}
        <View style={{ transform: [{ translateX: 10 }] }}>
          <BrandLogo size={160} />
        </View>
        <Text className="ml-5 text-[34px] font-extrabold tracking-tight text-[#2e2a24]">
          이멍전시
        </Text>
      </Animated.View>

      <Animated.View className="items-center" style={{ marginTop: 60, opacity: taglineOpacity }}>
        <Text className="text-center text-[24px] font-bold leading-[34px] text-[#2e2a24]">
          우리 아이{'\n'}
          건강을 지켜주세요!
        </Text>
        <Text className="mt-3 text-center text-sm text-brand-900">
          반려견 응급 상황, AI가 함께합니다.
        </Text>
      </Animated.View>
    </View>
  );
}
