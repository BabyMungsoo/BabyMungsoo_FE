import { Pressable, ScrollView, Text, View } from 'react-native';

import { AiDisclaimer } from '@/components/ui/ai-disclaimer';
import { PhotoStrip } from '@/components/ui/photo-strip';
import { TriageBadge } from '@/components/ui/triage-badge';
import { TRIAGE_LEVEL_META, toTriageLevel } from '@/constants/triage';
import { formatDateTime } from '@/lib/format';
import type { AnalysisRecord, HospitalVisit } from '@/types';

import { VisitList } from './visit-list';

interface RecordDetailViewProps {
  record: AnalysisRecord;
  /** record.mediaIds 로 받아온 media 들을 절대 경로로 바꾼 값. 컨테이너(라우트)가 조회해서 넘깁니다 */
  photoUrls?: string[];
  onPressEdit: () => void;
  onPressShare: () => void;
  onPressFindHospital: () => void;
  /** 이 기록에 달린 팔로우업 답변들 */
  visits?: HospitalVisit[];
  /**
   * "병원에 다녀오셨나요?" 질문 카드. 띄울지 말지는 시간·스누즈에 달려 있어
   * 라우트가 판단해 넘깁니다(이 컴포넌트는 서버도 저장소도 모릅니다).
   */
  followUpCard?: React.ReactNode;
  onPressAddVisit?: () => void;
  onPressDeleteVisit?: (visitId: number) => void;
}

/**
 * 7번 — 분석 결과 상세. 서버 호출을 모르는 순수 표현 컴포넌트입니다.
 * (media 조회는 라우트가 하고, 결과만 photoUrls 로 받습니다)
 *
 * 백엔드 필드 대응 (features/records/to-record-create-request.ts 의 저장 규칙과 짝):
 *   제목        suspectedDisease  ← AI 의 title
 *   주요 증상   symptomText 를 쉼표로 분리
 *   AI 분석 요약 aiResult          ← AI 의 reason 배열을 합친 것
 *   권장 조치   aiGuide 를 줄바꿈으로 분리  ← AI 의 guide
 */
export function RecordDetailView({
  record,
  photoUrls = [],
  onPressEdit,
  onPressShare,
  onPressFindHospital,
  visits = [],
  followUpCard,
  onPressAddVisit,
  onPressDeleteVisit,
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
        <PhotoStrip photoUrls={photoUrls} />

        <View className={`flex-row items-center gap-2 ${photoUrls.length > 0 ? 'mt-4' : ''}`}>
          {level && <TriageBadge level={level} />}
          <Text className="flex-1 text-lg font-bold text-ink">{title}</Text>
        </View>

        <Text className="mt-2 text-xs text-ink-soft">
          분석일 {formatDateTime(record.createdAt)}
        </Text>

        <AiDisclaimer className="mt-3" />

        {symptoms.length > 0 && (
          <Section title="주요 증상">
            <View className="flex-row flex-wrap gap-2">
              {/*
                symptomText 에 쉼표가 없으면 문장 전체가 칩 하나가 됩니다. 최대 폭과 줄바꿈을
                주지 않으면 그 칩이 화면을 벗어납니다.
              */}
              {symptoms.map((symptom) => (
                <View key={symptom} className="max-w-full rounded-lg bg-brand-100 px-3 py-1.5">
                  <Text className="shrink text-sm font-semibold leading-5 text-brand-900">
                    {symptom}
                  </Text>
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

      {followUpCard && <View className="mt-4">{followUpCard}</View>}

      {(visits.length > 0 || onPressAddVisit) && (
        <View className="mt-4 gap-3 rounded-2xl bg-paper-card p-5">
          <Text className="text-base font-bold text-ink">진료 기록</Text>

          {visits.length > 0 ? (
            <VisitList visits={visits} onPressDelete={onPressDeleteVisit} />
          ) : (
            <Text className="text-sm text-ink-muted">아직 남긴 진료 기록이 없어요.</Text>
          )}

          {onPressAddVisit && (
            <Pressable
              onPress={onPressAddVisit}
              accessibilityRole="button"
              className="items-center rounded-xl border border-ink-line py-3 active:opacity-70"
            >
              <Text className="text-sm font-bold text-ink-muted">+ 진료 기록 추가</Text>
            </Pressable>
          )}
        </View>
      )}

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
