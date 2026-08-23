import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';

/**
 * 5번 — AI 건강 가이드 / AI 진단 진입 화면 (담당: 윤선)
 *
 * 세 섹션(오늘의 케어 / AI 진단 / 인기 가이드)을 각각 하나의 카드로 묶고,
 * flexGrow(1.5 : 1.7 : 2)로 화면을 세로로 채운다.
 * 아이콘/일러스트는 피그마에서 내보낸 png 에셋(assets/images/health-guide)을 쓴다.
 * 가이드 콘텐츠 전용 백엔드가 아직 없어 카테고리·인기 가이드는 정적 데이터로 둔다.
 */

type ImageSource = ReturnType<typeof require>;

type CareCategory = {
  key: string;
  label: string;
  image: ImageSource;
  circleClass: string;
};

const CARE_CATEGORIES: CareCategory[] = [
  {
    key: 'emergency',
    label: '응급 체크',
    image: require('../../../assets/images/health-guide/emergency.png'),
    circleClass: 'bg-red-50',
  },
  {
    key: 'prevention',
    label: '예방 정보',
    image: require('../../../assets/images/health-guide/prevention.png'),
    circleClass: 'bg-indigo-50',
  },
  {
    key: 'tips',
    label: '건강 상식',
    image: require('../../../assets/images/health-guide/tips.png'),
    circleClass: 'bg-brand-50',
  },
];

type GuideArticle = {
  id: string;
  title: string;
  image: ImageSource;
};

const POPULAR_GUIDES: GuideArticle[] = [
  {
    id: 'heatstroke',
    title: '여름철 반려견 온열질환 예방법',
    image: require('../../../assets/images/health-guide/heatstroke.png'),
  },
  {
    id: 'patella',
    title: '슬개골 탈구, 조기 발견이 중요해요',
    image: require('../../../assets/images/health-guide/patella.png'),
  },
  {
    id: 'vomit',
    title: '강아지 구토, 왜 그럴까요?',
    image: require('../../../assets/images/health-guide/vomit.png'),
  },
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

      <ScrollView contentContainerClassName="grow gap-4 px-5 pt-2 pb-5">
        {/* 오늘의 케어 한눈에 보기 — 제목 + 아이콘 3개를 한 카드로 */}
        <View
          className="justify-center gap-4 rounded-2xl bg-paper-card px-5 py-5"
          style={{ flexGrow: 1.5 }}
        >
          <Text className="text-sm font-semibold text-ink">오늘의 케어 한눈에 보기</Text>
          <View className="flex-row justify-around">
            {CARE_CATEGORIES.map((category) => (
              <Pressable
                key={category.key}
                className="items-center gap-1.5"
                accessibilityRole="button"
                accessibilityLabel={category.label}
              >
                <View
                  className={`h-12 w-12 items-center justify-center rounded-full ${category.circleClass}`}
                >
                  <Image
                    source={category.image}
                    style={{ width: 28, height: 28 }}
                    contentFit="contain"
                  />
                </View>
                <Text className="text-xs font-medium text-ink">{category.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* AI 진단 서비스 — 은은한 하늘색 그라데이션 배경 + 강아지 일러스트 */}
        <View
          className="relative justify-center overflow-hidden rounded-2xl p-5"
          style={{ flexGrow: 1.7 }}
        >
          <LinearGradient
            colors={['#e9f1fb', '#fdfeff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View className="gap-1 pr-24">
            <Text className="text-base font-bold text-ink">AI 진단 서비스</Text>
            <Text className="text-xs leading-5 text-ink-muted">
              증상 입력만으로{'\n'}질병 가능성을 분석해드려요.
            </Text>
          </View>

          <Pressable
            onPress={handleStartAnalysis}
            className="mt-4 self-start rounded-xl bg-brand-500 px-9 py-3 active:bg-brand-600"
            accessibilityRole="button"
            accessibilityLabel="AI 분석 시작하기"
          >
            <Text className="text-sm font-bold text-ink">AI 분석 시작하기</Text>
          </Pressable>

          <View className="absolute bottom-2 right-4">
            <Image
              source={require('../../../assets/images/health-guide/doctor-dog.png')}
              style={{ width: 112, height: 112 }}
              contentFit="contain"
            />
          </View>
        </View>

        {/* 인기 건강 가이드 — 제목·더보기·목록을 한 카드에, 행은 구분선으로 */}
        <View className="gap-3 rounded-2xl bg-paper-card px-5 py-5" style={{ flexGrow: 2 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-ink">인기 건강 가이드</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="가이드 더보기">
              <Text className="text-xs text-ink-muted">더보기 ›</Text>
            </Pressable>
          </View>

          <View className="flex-1 justify-around">
            {POPULAR_GUIDES.map((guide, index) => (
              <View key={guide.id}>
                {index > 0 && <View className="h-px bg-ink-line" />}
                <Pressable
                  className="flex-row items-center gap-3 py-3"
                  accessibilityRole="button"
                  accessibilityLabel={guide.title}
                >
                  <Image
                    source={guide.image}
                    style={{ width: 26, height: 26 }}
                    contentFit="contain"
                  />
                  <Text className="flex-1 text-sm text-ink">{guide.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#a9a296" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
