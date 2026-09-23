import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { TREATMENT_LABELS } from '@/constants/visit';
import { useCreateVisit } from '@/hooks/queries/use-visits';
import { confirm } from '@/lib/confirm';
import { TREATMENT_TAGS, type TreatmentTag } from '@/types';

/**
 * 진료 기록 남기기 (POST /records/{recordId}/visits, visitStatus = VISITED).
 *
 * 필수는 방문일과 병원 이름뿐입니다. 진단·처치·메모를 강제하면 보호자가 답을 남기지 않게
 * 되고, 다녀왔다는 사실 자체가 이미 지표입니다.
 *
 * 병원은 지금 직접 입력만 받습니다. 지도(9번)를 '선택 모드' 로 여는 건 그 화면을 함께
 * 고쳐야 해서 후속으로 미뤘습니다. 서버는 hospitalId 도 받습니다.
 */
export default function VisitCreateScreen() {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const parsedId = Number(recordId);
  const validId = Number.isFinite(parsedId) ? parsedId : undefined;

  const createVisit = useCreateVisit(validId ?? 0);

  const [visitedAt, setVisitedAt] = useState(today());
  const [hospitalName, setHospitalName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatments, setTreatments] = useState<TreatmentTag[]>([]);
  const [memo, setMemo] = useState('');
  const [nextVisitAt, setNextVisitAt] = useState('');

  const canSubmit =
    validId != null &&
    isValidDate(visitedAt) &&
    hospitalName.trim().length > 0 &&
    !createVisit.isPending;

  const toggleTreatment = (tag: TreatmentTag) =>
    setTreatments((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  async function handleSave() {
    if (!canSubmit) return;

    try {
      await createVisit.mutateAsync({
        visitStatus: 'VISITED',
        visitedAt,
        hospitalName: hospitalName.trim(),
        // 빈 문자열을 보내면 서버에 빈 값이 그대로 남습니다. 안 적었으면 아예 빼서 보냅니다.
        diagnosis: diagnosis.trim() || undefined,
        treatments: treatments.length > 0 ? treatments : undefined,
        memo: memo.trim() || undefined,
        nextVisitAt: isValidDate(nextVisitAt) ? nextVisitAt : undefined,
      });
      router.back();
    } catch (e) {
      await confirm({
        title: '저장하지 못했습니다',
        message: e instanceof Error ? e.message : undefined,
      });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="진료 기록 남기기" showBack />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="gap-5 px-5 pb-8 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          <Field label="방문일" required>
            <View className="flex-row gap-2">
              <DateChip label="오늘" value={today()} selected={visitedAt} onPress={setVisitedAt} />
              <DateChip
                label="어제"
                value={daysAgo(1)}
                selected={visitedAt}
                onPress={setVisitedAt}
              />
            </View>
            <TextInput
              value={visitedAt}
              onChangeText={setVisitedAt}
              placeholder="2026-09-23"
              placeholderTextColor="#a9a296"
              className="mt-2 rounded-xl bg-paper-card px-4 py-3 text-sm text-ink"
            />
          </Field>

          <Field label="병원" required>
            <TextInput
              value={hospitalName}
              onChangeText={setHospitalName}
              placeholder="다녀온 병원 이름"
              placeholderTextColor="#a9a296"
              className="rounded-xl bg-paper-card px-4 py-3 text-sm text-ink"
            />
          </Field>

          <Field label="수의사 진단·소견" hint="들은 내용을 한 줄로 적어 주세요 (선택)">
            <TextInput
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="예: 급성 위장염, 탈수 초기"
              placeholderTextColor="#a9a296"
              multiline
              textAlignVertical="top"
              className="min-h-[72px] rounded-xl bg-paper-card px-4 py-3 text-sm text-ink"
            />
          </Field>

          <Field label="받은 처치" hint="해당하는 것을 모두 골라 주세요 (선택)">
            <View className="flex-row flex-wrap gap-2">
              {TREATMENT_TAGS.map((tag) => {
                const selected = treatments.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTreatment(tag)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    className={`min-h-[44px] justify-center rounded-xl border-2 px-4 active:opacity-70 ${
                      selected ? 'border-brand-400 bg-brand-50' : 'border-ink-line bg-paper-card'
                    }`}
                  >
                    <Text
                      className={`text-sm ${selected ? 'font-bold text-ink' : 'text-ink-muted'}`}
                    >
                      {TREATMENT_LABELS[tag]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="메모" hint="선택">
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder="예: 사료는 처방식으로 3일"
              placeholderTextColor="#a9a296"
              multiline
              textAlignVertical="top"
              className="min-h-[64px] rounded-xl bg-paper-card px-4 py-3 text-sm text-ink"
            />
          </Field>

          <Field label="다음 방문 예정일" hint="선택">
            <TextInput
              value={nextVisitAt}
              onChangeText={setNextVisitAt}
              placeholder="2026-09-25"
              placeholderTextColor="#a9a296"
              className="rounded-xl bg-paper-card px-4 py-3 text-sm text-ink"
            />
          </Field>

          <Pressable
            onPress={handleSave}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            className="rounded-2xl bg-brand-400 py-4 active:opacity-70 disabled:opacity-40"
          >
            <Text className="text-center text-base font-bold text-ink">
              {createVisit.isPending ? '저장 중...' : '저장'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-1.5">
        <Text className="text-sm font-bold text-ink">{label}</Text>
        {required && <Text className="text-xs text-triage-immediate">필수</Text>}
      </View>
      {hint && <Text className="text-xs text-ink-soft">{hint}</Text>}
      {children}
    </View>
  );
}

function DateChip({
  label,
  value,
  selected,
  onPress,
}: {
  label: string;
  value: string;
  selected: string;
  onPress: (value: string) => void;
}) {
  const isSelected = selected === value;
  return (
    <Pressable
      onPress={() => onPress(value)}
      accessibilityRole="button"
      className={`min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 active:opacity-70 ${
        isSelected ? 'border-brand-400 bg-brand-50' : 'border-ink-line bg-paper-card'
      }`}
    >
      <Text className={`text-sm ${isSelected ? 'font-bold text-ink' : 'text-ink-muted'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

/** 'YYYY-MM-DD'. 날짜 선택기 의존성을 더하지 않으려고 문자열로 다룹니다 */
function today(): string {
  return toIsoDate(new Date());
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toIsoDate(date);
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
