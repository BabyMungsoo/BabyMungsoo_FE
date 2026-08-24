import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { TriageBadge } from '@/components/ui/triage-badge';
import { TRIAGE_LEVEL_META, toTriageLevel } from '@/constants/triage';
import { formatDateTime } from '@/lib/format';
import type { AnalysisRecord } from '@/types';

interface RecordDetailViewProps {
  record: AnalysisRecord;
  /** record.mediaId 로 받아온 media 를 절대 경로로 바꾼 값. 컨테이너(라우트)가 조회해서 넘깁니다 */
  photoUrl?: string;
  onPressEdit: () => void;
  onPressShare: () => void;
  onPressFindHospital: () => void;
}

/**
 * 7번 — 분석 결과 상세. 서버 호출을 모르는 순수 표현 컴포넌트입니다.
 * (media 조회는 라우트가 하고, 결과만 photoUrl 로 받습니다)
 *
 * 백엔드 필드 대응 (features/records/to-record-create-request.ts 의 저장 규칙과 짝):
 *   제목        suspectedDisease  ← AI 의 title
 *   주요 증상   symptomText 를 쉼표로 분리
 *   AI 분석 요약 aiResult          ← AI 의 reason 배열을 합친 것
 *   권장 조치   aiGuide 를 줄바꿈으로 분리  ← AI 의 guide
 */
export function RecordDetailView({
  record,
  photoUrl,
  onPressEdit,
  onPressShare,
  onPressFindHospital,
}: RecordDetailViewProps) {
  const level = toTriageLevel(record.emergencyLevel);

  // suspectedDisease 에는 AI 가 만든 결론 문구가 그대로 들어옵니다
  // (예: '위장염(급성) 가능성 높음'). 비어 있으면 응급도 라벨로 대신합니다.
  const title = record.suspectedDisease || (level && TRIAGE_LEVEL_META[level].label) || '분석 결과';

  const symptoms = splitLines(record.symptomText, ',');
  const guides = splitLines(record.aiGuide, '\n');

  return (
    <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
      <View
        className="rounded-2xl bg-paper-card p-5"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        {!!photoUrl && (
          <Image
            source={{ uri: photoUrl }}
            style={{ height: 180, width: '100%', borderRadius: 16 }}
            contentFit="cover"
            transition={150}
          />
        )}

        <View className={`flex-row items-center gap-2 ${photoUrl ? 'mt-4' : ''}`}>
          {level && <TriageBadge level={level} />}
          <Text className="flex-1 text-lg font-bold text-ink">{title}</Text>
        </View>

        <Text className="mt-2 text-xs text-ink-soft">
          분석일 {formatDateTime(record.createdAt)}
        </Text>

        {symptoms.length > 0 && (
          <Section title="주요 증상">
            <View className="flex-row flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <View key={symptom} className="rounded-lg bg-brand-100 px-3 py-1.5">
                  <Text className="text-sm font-semibold text-brand-900">{symptom}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {!!record.aiResult && (
          <Section title="AI 분석 요약">
            <Text className="text-sm leading-6 text-ink">{record.aiResult}</Text>
          </Section>
        )}

        {guides.length > 0 && (
          <Section title="권장 조치">
            <View className="gap-1.5">
              {guides.map((guide) => (
                <View key={guide} className="flex-row gap-2">
                  <Text className="text-sm leading-6 text-ink-muted">•</Text>
                  <Text className="flex-1 text-sm leading-6 text-ink">{guide}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}
      </View>

      <View className="mt-4 flex-row gap-3">
        <SecondaryButton label="기록 수정" onPress={onPressEdit} />
        <SecondaryButton label="공유하기" onPress={onPressShare} />
      </View>

      <Pressable
        onPress={onPressFindHospital}
        accessibilityRole="button"
        className="mt-3 items-center rounded-2xl bg-brand-400 py-4 active:opacity-70"
      >
        <Text className="text-base font-bold text-brand-900">병원 찾기</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <View className="my-4 h-px bg-ink-line" />
      <Text className="mb-3 text-base font-bold text-ink">{title}</Text>
      {children}
    </View>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-1 items-center rounded-2xl border border-ink-line bg-paper-card py-3.5 active:opacity-70"
    >
      <Text className="text-sm font-bold text-ink-muted">{label}</Text>
    </Pressable>
  );
}

/** 구분자로 자르고 공백·빈 항목을 걸러냅니다 */
function splitLines(value: string | null | undefined, separator: string): string[] {
  if (!value) return [];
  return value
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);
}
