import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoStrip } from '@/components/ui/photo-strip';
import { TriageBadge } from '@/components/ui/triage-badge';
import { toTriageLevel } from '@/constants/triage';
import type { TriageAnalyzeResult, TriageLevel } from '@/types';

/** 등급 배너 색. 배경은 옅게, 글자는 진하게 — 같은 계열이라 뱃지(bg-triage-*)와 어울립니다. */
const LEVEL_STYLE: Record<TriageLevel, { bg: string; fg: string; border: string }> = {
  IMMEDIATE: { bg: '#fdecec', fg: '#b02525', border: '#e03131' },
  WATCH: { bg: '#fdf4e0', fg: '#8a6800', border: '#e0a800' },
  NORMAL: { bg: '#eef7ea', fg: '#3f6b31', border: '#74b85a' },
};

/** '왜'의 제목. 등급마다 묻는 말이 달라서 서버 문구가 아니라 화면에 둡니다. */
const WHY_TITLE: Record<TriageLevel, string> = {
  IMMEDIATE: '왜 지금 가야 하나요',
  WATCH: '왜 진료가 필요한가요',
  NORMAL: '왜 괜찮은가요',
};

interface ResultViewProps {
  result: TriageAnalyzeResult;
  /** 문진 세션의 initialSymptom — 사용자가 처음 입력한 증상 원문 */
  initialSymptom: string;
  /**
   * 문진에 첨부해 분석에 함께 쓰인 사진들 (절대 URL).
   * 세션의 media 를 라우트가 변환해서 넘깁니다. 사진 없이 분석했으면 빈 배열입니다.
   */
  photoUrls?: string[];
  onPressRetry: () => void;
  /** 9번 지도로 이동. 결과의 응급도를 함께 넘겨 그 등급에 맞는 병원을 받습니다 */
  onPressFindHospital: () => void;
  /**
   * 맨 아래 '가까운 동물병원' 영역. 이 컴포넌트는 서버를 모르므로 라우트가
   * NearbyHospitalList 를 만들어 넘깁니다 (멘토 피드백: 결과 화면에서 바로 전화).
   */
  nearbyHospitals?: ReactNode;
}

/**
 * 4번 — 응급 상황 판단 결과. 서버 호출을 모르는 순수 표현 컴포넌트입니다.
 *
 * 위에서 아래로 읽으면 결론 → 소견 → 이유 → 조건 → 주의 순입니다. 보호자가 첫 화면에서
 * 알아야 하는 건 "지금 병원에 가야 하나" 하나라, 그 답(result.title)을 등급 색 배너로
 * 맨 위에 두고 나머지는 그 근거로 내려갑니다. 방금 입력한 증상은 결과가 아니라 접어서
 * 맨 아래로 보냈습니다.
 *
 * result.title 은 서버가 등급에서 만든 고정 문구입니다(예: '지금 바로 동물병원에 가세요').
 * 예전엔 모델이 쓴 병명 추정이 들어와 숨겼는데, 이제는 시급성 결론이라 맨 위에 둡니다.
 */
export function ResultView({
  result,
  initialSymptom,
  photoUrls = [],
  onPressRetry,
  onPressFindHospital,
  nearbyHospitals,
}: ResultViewProps) {
  const level = toTriageLevel(result.level) ?? 'NORMAL';
  const style = LEVEL_STYLE[level];
  const isImmediate = level === 'IMMEDIATE';

  const [showInput, setShowInput] = useState(false);
  const symptomItems = splitSymptoms(initialSymptom);

  return (
    <SafeAreaView className="flex-1 bg-brand-400" edges={['top']}>
      <View className="items-center bg-brand-400 px-5 pb-4 pt-2">
        <Text className="text-xl font-bold text-brand-900">응급 상황 판단 결과</Text>
      </View>

      <View className="flex-1 bg-paper">
        <ScrollView contentContainerClassName="gap-4 px-5 pb-8 pt-5">
          {/* 결론 배너 — 이 화면에서 유일하게 큰 글씨입니다 */}
          <View
            className="gap-3 rounded-2xl border-2 p-4"
            style={{ backgroundColor: style.bg, borderColor: style.border }}
          >
            <View className="flex-row items-center">
              <TriageBadge level={level} variant="long" />
            </View>
            <Text className="text-xl font-bold leading-7" style={{ color: style.fg }}>
              {result.title}
            </Text>

            {/*
              IMMEDIATE 는 스크롤 없이 첫 화면에서 병원으로 가는 길이 보여야 해서
              버튼을 배너 안에 둡니다. 다른 등급은 아래 행동 카드에 있습니다.
            */}
            {isImmediate && (
              <Pressable
                onPress={onPressFindHospital}
                accessibilityRole="button"
                className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-triage-immediate py-4 active:opacity-70"
              >
                <Ionicons name="location" size={18} color="#ffffff" />
                <Text className="text-base font-bold text-white">병원 찾기</Text>
              </Pressable>
            )}
          </View>

          {result.findings.length > 0 && (
            <Section title="확인된 소견">
              <BulletList items={result.findings} />
            </Section>
          )}

          {!!result.urgencyReason && (
            <Section title={WHY_TITLE[level]}>
              <Text className="text-sm leading-6 text-ink">{result.urgencyReason}</Text>
            </Section>
          )}

          {/*
            "지금은 이 등급이지만 이게 보이면 즉시" 라는 조건이라 등급과 무관하게 빨강입니다.
            WATCH 의 노란 카드 안에 노란 불릿이면 본문과 구분이 안 됩니다.
            IMMEDIATE 는 서버가 항상 빈 배열로 주므로 이 섹션이 나오지 않습니다.
          */}
          {result.escalationSigns.length > 0 && (
            <View
              className="gap-2.5 rounded-2xl border p-4"
              style={{
                backgroundColor: LEVEL_STYLE.IMMEDIATE.bg,
                borderColor: LEVEL_STYLE.IMMEDIATE.border,
              }}
            >
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="alert-circle" size={18} color={LEVEL_STYLE.IMMEDIATE.fg} />
                <Text className="text-base font-bold" style={{ color: LEVEL_STYLE.IMMEDIATE.fg }}>
                  이럴 땐 바로 병원으로
                </Text>
              </View>
              <BulletList items={result.escalationSigns} color={LEVEL_STYLE.IMMEDIATE.fg} />
            </View>
          )}

          {result.precautions.length > 0 && (
            <Section title="병원 가기 전까지" muted>
              <BulletList items={result.precautions} muted />
            </Section>
          )}

          {/*
            행동 카드. 전화는 아래 '가까운 동물병원' 목록에서 병원별로 걸므로
            여기엔 두지 않습니다 (예전의 '응급모드 전화' 자리표시는 뺐습니다).
          */}
          <View className="gap-3 rounded-2xl bg-paper-card p-4">
            {!isImmediate && (
              <Pressable
                onPress={onPressFindHospital}
                accessibilityRole="button"
                className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-brand-400 py-4 active:opacity-70"
              >
                <Ionicons name="location" size={18} color="#5c4408" />
                <Text className="text-base font-bold text-brand-900">병원 찾기</Text>
              </Pressable>
            )}

            <Pressable
              onPress={onPressRetry}
              accessibilityRole="button"
              className="items-center justify-center rounded-2xl bg-paper-chip py-3.5 active:opacity-70"
            >
              <Text className="text-sm font-bold text-ink-muted">다시 진단하기</Text>
            </Pressable>
          </View>

          {/* 입력한 증상 — 결과가 아니라 접어 둡니다. 사진은 여기서만 보입니다. */}
          <View className="rounded-2xl border border-brand-300 bg-paper-card">
            <Pressable
              onPress={() => setShowInput((prev) => !prev)}
              accessibilityRole="button"
              accessibilityState={{ expanded: showInput }}
              className="flex-row items-center justify-between p-4 active:opacity-70"
            >
              <Text className="text-sm font-semibold text-ink-muted">
                입력한 증상{photoUrls.length > 0 ? ` · 사진 ${photoUrls.length}장` : ''}
              </Text>
              <Ionicons
                name={showInput ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#8c867a"
              />
            </Pressable>

            {showInput && (
              <View className="gap-3 px-4 pb-4">
                <PhotoStrip photoUrls={photoUrls} />
                <Text className="text-sm leading-6 text-ink">{initialSymptom}</Text>
                {symptomItems.length > 1 && <BulletList items={symptomItems} />}
              </View>
            )}
          </View>

          {/* 결과를 본 직후가 병원에 전화하는 순간이라 가까운 병원 3곳을 여기 둡니다. */}
          {nearbyHospitals}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Section({
  title,
  muted = false,
  children,
}: {
  title: string;
  /** 주의 사항처럼 가장 약하게 보여야 하는 섹션 */
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <View className="gap-2.5 rounded-2xl bg-paper-card p-4">
      <Text className={`text-base font-bold ${muted ? 'text-ink-muted' : 'text-ink'}`}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function BulletList({
  items,
  color,
  muted = false,
}: {
  items: string[];
  /** 불릿과 글자 색을 함께 바꿀 때 (악화 신호) */
  color?: string;
  muted?: boolean;
}) {
  const textClass = muted ? 'text-ink-muted' : 'text-ink';
  return (
    <View className="gap-1.5">
      {items.map((item) => (
        <View key={item} className="flex-row gap-2">
          <Text className={`text-sm leading-6 ${textClass}`} style={color ? { color } : undefined}>
            •
          </Text>
          <Text
            className={`flex-1 text-sm leading-6 ${textClass}`}
            style={color ? { color } : undefined}
          >
            {item}
          </Text>
        </View>
      ))}
    </View>
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
