import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';

/**
 * 5번 — AI 건강 가이드 / AI 진단 진입 화면 (담당: 윤선)
 *
 * 가이드 콘텐츠 전용 백엔드가 아직 없어 카테고리·인기 가이드는 정적 데이터로 둔다.
 * 'AI 분석 시작하기'는 문진(증상 입력) 플로우로 이동한다.
 */

type IoniconName = keyof typeof Ionicons.glyphMap;

type CareCategory = {
  key: string;
  label: string;
  icon: IoniconName;
  circleClass: string;
  iconColor: string;
};

const CARE_CATEGORIES: CareCategory[] = [
  { key: 'emergency', label: '응급 체크', icon: 'medkit', circleClass: 'bg-red-50', iconColor: '#e03131' },
  { key: 'prevention', label: '예방 정보', icon: 'shield-checkmark', circleClass: 'bg-indigo-50', iconColor: '#6b5ce0' },
  { key: 'tips', label: '건강 상식', icon: 'chatbubble-ellipses', circleClass: 'bg-brand-50', iconColor: '#d9a50f' },
];

type GuideArticle = {
  id: string;
  title: string;
  icon: IoniconName;
  iconColor: string;
};

const POPULAR_GUIDES: GuideArticle[] = [
  { id: 'heatstroke', title: '여름철 반려견 온열질환 예방법', icon: 'sunny', iconColor: '#f4cb4a' },
  { id: 'patella', title: '슬개골 탈구, 조기 발견이 중요해요', icon: 'fitness', iconColor: '#74b85a' },
  { id: 'vomit', title: '강아지 구토, 왜 그럴까요?', icon: 'medkit', iconColor: '#e0a800' },
];

export default function HealthGuideScreen() {
  const router = useRouter();

  function handleStartAnalysis() {
    // TODO: 증상 입력(문진 시작) 화면이 생기면 그 라우트로 교체
    router.push('/');
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="AI 건강 가이드" showBack backFallback="/" />

      <ScrollView contentContainerClassName="gap-6 px-5 pb-8">
        {/* 오늘의 케어 한눈에 보기 */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-ink">오늘의 케어 한눈에 보기</Text>
          <View className="flex-row gap-3">
            {CARE_CATEGORIES.map((category) => (
              <Pressable
                key={category.key}
                className="flex-1 items-center gap-2 rounded-2xl bg-paper-card p-4"
                accessibilityRole="button"
                accessibilityLabel={category.label}
              >
                <View
                  className={`h-12 w-12 items-center justify-center rounded-full ${category.circleClass}`}
                >
                  <Ionicons name={category.icon} size={22} color={category.iconColor} />
                </View>
                <Text className="text-xs font-medium text-ink">{category.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* AI 진단 서비스 */}
        <View className="flex-row items-center gap-3 rounded-2xl bg-paper-card p-5">
          <View className="flex-1 gap-3">
            <View className="gap-1">
              <Text className="text-base font-bold text-ink">AI 진단 서비스</Text>
              <Text className="text-xs text-ink-muted">
                증상 입력만으로 질병 가능성을 분석해드려요.
              </Text>
            </View>
            <Pressable
              onPress={handleStartAnalysis}
              className="items-center rounded-xl bg-brand-500 py-3 active:bg-brand-600"
              accessibilityRole="button"
              accessibilityLabel="AI 분석 시작하기"
            >
              <Text className="text-sm font-bold text-ink">AI 분석 시작하기</Text>
            </Pressable>
          </View>

          {/* TODO: 닥터독 일러스트 이미지 에셋(assets/)으로 교체 */}
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="paw" size={32} color="#d9a50f" />
          </View>
        </View>

        {/* 인기 건강 가이드 */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-ink">인기 건강 가이드</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="가이드 더보기">
              <Text className="text-xs text-ink-muted">더보기 ›</Text>
            </Pressable>
          </View>

          <View className="gap-2">
            {POPULAR_GUIDES.map((guide) => (
              <Pressable
                key={guide.id}
                className="flex-row items-center gap-3 rounded-2xl bg-paper-card p-4"
                accessibilityRole="button"
                accessibilityLabel={guide.title}
              >
                <Ionicons name={guide.icon} size={20} color={guide.iconColor} />
                <Text className="flex-1 text-sm text-ink">{guide.title}</Text>
                <Ionicons name="chevron-forward" size={18} color="#a9a296" />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
