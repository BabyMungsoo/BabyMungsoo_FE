import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';

import { ProgressRing } from './progress-ring';

interface AnalyzingViewProps {
  /** 0~100. 실제 분석률이 아니라 연출값입니다 (use-fake-progress 참고) */
  percent: number;
}

const STEPS = ['증상 분석 중', '질병 가능성 예측 중', '결과 정리 중'] as const;

type StepState = 'done' | 'active' | 'pending';

const STEP_STYLE: Record<StepState, { dot: string; icon: keyof typeof Ionicons.glyphMap }> = {
  done: { dot: '#74b85a', icon: 'checkmark' },
  active: { dot: '#efbe24', icon: 'chevron-down' },
  pending: { dot: '#d5d0c6', icon: 'remove' },
};

const TRAILING_ICON: Record<StepState, keyof typeof Ionicons.glyphMap> = {
  done: 'checkmark',
  active: 'chevron-down',
  pending: 'chevron-forward',
};

/**
 * 진행률을 단계로 나눕니다. 백엔드가 단계를 알려주지 않으므로 퍼센트에서 역산합니다.
 * 100% 면 모든 단계를 완료로 표시합니다.
 */
function stepStateOf(index: number, percent: number): StepState {
  const activeIndex = percent >= 100 ? STEPS.length : Math.floor(percent / (100 / STEPS.length));
  if (index < activeIndex) return 'done';
  if (index === activeIndex) return 'active';
  return 'pending';
}

/** 8번 — AI 분석 중. 서버 호출을 모르는 순수 표현 컴포넌트입니다. */
export function AnalyzingView({ percent }: AnalyzingViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="AI 분석 중" />

      <ScrollView contentContainerClassName="items-center gap-6 px-5 pb-8 pt-6">
        <ProgressRing percent={percent} />

        <View className="items-center gap-1">
          <Text className="text-base font-bold text-ink">증상을 분석하고 있어요.</Text>
          <Text className="text-sm text-ink-muted">잠시만 기다려주세요.</Text>
        </View>

        <View className="w-full rounded-2xl bg-paper-card px-4">
          {STEPS.map((label, index) => {
            const state = stepStateOf(index, percent);
            const isLast = index === STEPS.length - 1;

            return (
              <View key={label} className="h-16 flex-row items-center">
                <View className="w-10 items-center justify-center self-stretch">
                  {/* 아래 단계로 이어지는 세로 연결선 */}
                  {!isLast && <View className="absolute bottom-0 top-1/2 w-px bg-ink-line" />}
                  <View
                    className="h-7 w-7 items-center justify-center rounded-full"
                    style={{ backgroundColor: STEP_STYLE[state].dot }}
                  >
                    <Ionicons name={STEP_STYLE[state].icon} size={16} color="#ffffff" />
                  </View>
                </View>

                <Text
                  className={`flex-1 pl-2 text-sm ${
                    state === 'pending' ? 'text-ink-soft' : 'font-bold text-ink'
                  }`}
                >
                  {label}
                </Text>

                <Ionicons name={TRAILING_ICON[state]} size={18} color="#b5afa3" />
              </View>
            );
          })}
        </View>

        <View className="w-full flex-row items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
          {/* TODO: 시안의 강아지 일러스트 자산이 들어오면 교체합니다 */}
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-brand-100">
            <Ionicons name="paw" size={26} color="#d9a50f" />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-sm font-bold text-brand-800">TIP</Text>
            <Text className="text-sm leading-5 text-ink-muted">
              정확한 분석을 위해 자세한 증상을 입력할수록 좋아요!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
