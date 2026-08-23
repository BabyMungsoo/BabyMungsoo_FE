import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toTriageLevel } from '@/constants/triage';
import type { TriageAnalyzeResult, TriageLevel } from '@/types';

const QUICK_GUIDES = [
  {
    key: 'transport',
    label: '긴급 이송\n가이드',
    icon: 'car-outline',
    bg: '#fdecec',
    fg: '#c92a2a',
  },
  {
    key: 'firstAid',
    label: '응급 처치\n방법',
    icon: 'medkit-outline',
    bg: '#ecedf4',
    fg: '#4c5a86',
  },
  {
    key: 'checklist',
    label: '자가 체크\n리스트',
    icon: 'clipboard-outline',
    bg: '#eef7ea',
    fg: '#4a7c39',
  },
] as const;

export type QuickGuideKey = (typeof QUICK_GUIDES)[number]['key'];

/** 경고 박스는 응급도에 따라 색만 바뀌고 문구는 서버의 guide 를 그대로 씁니다. */
const WARNING_STYLE: Record<TriageLevel, { bg: string; fg: string }> = {
  IMMEDIATE: { bg: '#fdecec', fg: '#b02525' },
  WATCH: { bg: '#fdf4e0', fg: '#8a6800' },
  NORMAL: { bg: '#eef7ea', fg: '#3f6b31' },
};

/** 범례는 서버 데이터가 아니라 항상 같은 설명이라 화면에 고정합니다. */
const LEGEND: { level: TriageLevel; color: string; text: string }[] = [
  { level: 'IMMEDIATE', color: '#e03131', text: '응급 상황 (즉시 병원 방문 필요)' },
  { level: 'WATCH', color: '#e0a800', text: '주의 상황 (검사·관찰 필요)' },
  { level: 'NORMAL', color: '#74b85a', text: '경미한 상황' },
];

interface ResultViewProps {
  result: TriageAnalyzeResult;
  /** 문진 세션의 initialSymptom — 사용자가 처음 입력한 증상 원문 */
  initialSymptom: string;
  onPressRetry: () => void;
  onPressQuickGuide: (key: QuickGuideKey) => void;
}

/**
 * 4번 — 응급 상황 판단 결과. 서버 호출을 모르는 순수 표현 컴포넌트입니다.
 *
 * 결론(result.title, 예: '위장염(급성) 가능성 높음')은 의도적으로 표시하지 않습니다.
 * 4번은 '지금 뭘 해야 하나', 7번(분석기록 상세)은 '뭐였더라' 로 목적이 나뉘어 있고,
 * 병명 추정을 응급 화면 맨 위에 두면 병원에 가는 판단보다 병명에 주의가 쏠립니다.
 * 결론은 7번에서 응급도 뱃지와 함께 보여 줍니다.
 */
export function ResultView({
  result,
  initialSymptom,
  onPressRetry,
  onPressQuickGuide,
}: ResultViewProps) {
  const level = toTriageLevel(result.level);
  const warning = level ? WARNING_STYLE[level] : WARNING_STYLE.NORMAL;

  // 시안의 요약 불릿에 대응하는 데이터가 서버에 따로 없어, 사용자가 쉼표로 나눠 적은
  // 증상을 그대로 항목화합니다. 쉼표가 없으면 본문만 보여 줍니다.
  const symptomItems = splitSymptoms(initialSymptom);

  return (
    <SafeAreaView className="flex-1 bg-brand-400" edges={['top']}>
      <View className="items-center bg-brand-400 px-5 pb-4 pt-2">
        <Text className="text-xl font-bold text-brand-900">응급 상황 판단 결과</Text>
      </View>

      <View className="flex-1 bg-paper">
        <ScrollView contentContainerClassName="gap-5 px-5 pb-8 pt-5">
          <View className="gap-2">
            <Text className="text-base font-bold text-ink">증상 요약</Text>
            <View className="gap-3 rounded-2xl border border-brand-300 bg-paper-card p-4">
              <Text className="text-sm leading-6 text-ink">{initialSymptom}</Text>

              {symptomItems.length > 1 && (
                <View className="gap-1.5">
                  {symptomItems.map((item) => (
                    <View key={item} className="flex-row gap-2">
                      <Text className="text-sm leading-5 text-ink-muted">•</Text>
                      <Text className="flex-1 text-sm leading-5 text-ink">{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {!!result.guide && (
            <View className="rounded-2xl p-4" style={{ backgroundColor: warning.bg }}>
              <Text className="text-sm font-bold leading-6" style={{ color: warning.fg }}>
                {result.guide}
              </Text>
            </View>
          )}

          <View className="gap-4 rounded-2xl bg-paper-card p-4">
            <View className="gap-2.5">
              <Text className="text-base font-bold text-ink">가이드</Text>
              {LEGEND.map((item) => (
                <View key={item.level} className="flex-row items-center gap-2.5">
                  <View
                    className="h-3.5 w-3.5 rounded-full border-2"
                    style={{ borderColor: item.color }}
                  />
                  <Text
                    className={`text-sm ${level === item.level ? 'font-bold text-ink' : 'text-ink-muted'}`}
                  >
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>

            <View className="flex-row gap-3">
              {/*
                이번 이슈(#5)는 UI 까지만 만듭니다. 걸 번호와 연결 방식(119 / 병원 직통 /
                보호자가 등록한 번호)이 정해지지 않아 동작을 붙이지 않았습니다.
                정해지면 여기에 onPress 를 다시 넣으면 됩니다.
              */}
              <Pressable
                disabled
                accessibilityRole="button"
                accessibilityState={{ disabled: true }}
                className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-triage-immediate py-3.5"
              >
                <Ionicons name="call" size={16} color="#ffffff" />
                <Text className="text-sm font-bold text-white">응급모드 전화</Text>
              </Pressable>

              <Pressable
                onPress={onPressRetry}
                accessibilityRole="button"
                className="flex-1 items-center justify-center rounded-2xl bg-paper-chip py-3.5 active:opacity-70"
              >
                <Text className="text-sm font-bold text-ink-muted">다시 진단하기</Text>
              </Pressable>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-base font-bold text-ink">빠른 행동 가이드</Text>
            <View className="flex-row gap-3">
              {QUICK_GUIDES.map((guide) => (
                <Pressable
                  key={guide.key}
                  onPress={() => onPressQuickGuide(guide.key)}
                  accessibilityRole="button"
                  className="flex-1 items-center gap-2 rounded-2xl py-4 active:opacity-70"
                  style={{ backgroundColor: guide.bg }}
                >
                  <Ionicons name={guide.icon} size={28} color={guide.fg} />
                  <Text className="text-center text-xs font-bold leading-4 text-ink">
                    {guide.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/** 쉼표로 나누고 공백·빈 항목을 걸러냅니다 (7번 상세의 '주요 증상' 과 같은 규칙) */
function splitSymptoms(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}
