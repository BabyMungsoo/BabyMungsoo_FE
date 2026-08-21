import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { TRIAGE_LEVEL_META, toTriageLevel } from '@/constants/triage';
import { useRecord, useUpdateRecord } from '@/hooks/queries/use-records';
import { confirm } from '@/lib/confirm';
import { TRIAGE_LEVELS, type AnalysisRecord, type TriageLevel } from '@/types';

/**
 * 분석기록 수정 (PATCH /records/{recordId}).
 *
 * aiResult / aiGuide 는 AI 가 만든 값이라 여기서 고치지 않습니다.
 * 사용자가 직접 적었거나 정정할 수 있는 증상·응급도·의심 질환만 수정합니다.
 */
export default function RecordEditScreen() {
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const parsedId = Number(recordId);
  const { data: record, isPending } = useRecord(Number.isFinite(parsedId) ? parsedId : undefined);

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="기록 수정" showBack />

      {isPending || !record ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#efbe24" />
        </View>
      ) : (
        // 조회가 끝난 뒤에 폼을 마운트해서, 초기값을 useState 로 한 번만 심습니다
        <EditForm record={record} />
      )}
    </SafeAreaView>
  );
}

function EditForm({ record }: { record: AnalysisRecord }) {
  const router = useRouter();
  const updateRecord = useUpdateRecord(record.recordId);

  const [symptomText, setSymptomText] = useState(record.symptomText);
  const [level, setLevel] = useState<TriageLevel | null>(toTriageLevel(record.emergencyLevel));
  const [suspectedDisease, setSuspectedDisease] = useState(record.suspectedDisease ?? '');

  const trimmedSymptom = symptomText.trim();
  const canSave = trimmedSymptom.length > 0 && level != null && !updateRecord.isPending;

  async function handleSave() {
    if (!canSave) return;

    try {
      await updateRecord.mutateAsync({
        symptomText: trimmedSymptom,
        emergencyLevel: level!,
        // 비워 두면 '값 없음'으로 보냅니다
        suspectedDisease: suspectedDisease.trim() || null,
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
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="gap-6 px-5 pb-8" keyboardShouldPersistTaps="handled">
        <Field label="증상" required>
          <TextInput
            value={symptomText}
            onChangeText={setSymptomText}
            placeholder="예: 구토, 식욕 부진, 무기력"
            placeholderTextColor="#a9a296"
            multiline
            className="min-h-24 rounded-2xl bg-paper-card p-4 text-base leading-6 text-ink"
            style={{ textAlignVertical: 'top' }}
          />
          <Text className="mt-1.5 text-xs text-ink-soft">
            쉼표로 구분하면 상세 화면에서 증상별로 나뉘어 보입니다.
          </Text>
        </Field>

        <Field label="응급도" required>
          <View className="flex-row gap-2">
            {TRIAGE_LEVELS.map((value) => {
              const selected = value === level;
              return (
                <Pressable
                  key={value}
                  onPress={() => setLevel(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    selected ? 'bg-brand-400' : 'bg-paper-chip'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${selected ? 'text-brand-900' : 'text-ink-muted'}`}
                  >
                    {TRIAGE_LEVEL_META[value].shortLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="의심 질환">
          <TextInput
            value={suspectedDisease}
            onChangeText={setSuspectedDisease}
            placeholder="예: 급성 위장염 (선택)"
            placeholderTextColor="#a9a296"
            className="rounded-2xl bg-paper-card p-4 text-base text-ink"
          />
        </Field>

        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          accessibilityRole="button"
          className={`items-center rounded-2xl py-4 ${
            canSave ? 'bg-brand-400 active:opacity-70' : 'bg-paper-chip'
          }`}
        >
          {updateRecord.isPending ? (
            <ActivityIndicator color="#5c4408" />
          ) : (
            <Text className={`text-base font-bold ${canSave ? 'text-brand-900' : 'text-ink-soft'}`}>
              저장하기
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text className="mb-2 text-sm font-bold text-ink">
        {label}
        {required && <Text className="text-triage-immediate"> *</Text>}
      </Text>
      {children}
    </View>
  );
}
