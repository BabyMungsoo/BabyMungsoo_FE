import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import BrandLogo from '@/components/common/BrandLogo';

/** 스플래시를 보여주는 시간(ms) */
const SPLASH_DURATION = 1500;

/**
 * 앱 첫 화면 — 노란 배경에 로고를 잠깐 보여준 뒤 로그인으로 넘깁니다.
 */
export default function Index() {
  const router = useRouter();
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    const timer = setTimeout(() => router.replace('/login'), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [opacity, router]);

  return (
    <View className="flex-1 items-center justify-center bg-brand-500">
      <Animated.View className="items-center gap-6" style={{ opacity }}>
        <BrandLogo size={160} />
        <Text className="text-[34px] font-extrabold tracking-tight text-[#2e2a24]">이멍전시</Text>
      </Animated.View>
    </View>
  );
}
