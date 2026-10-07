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
import { TriageBadge } from '@/components/ui/triage-badge';
import { TRIAGE_LEVEL_META, toTriageLevel } from '@/constants/triage';
import { useRecord, useUpdateRecord } from '@/hooks/queries/use-records';
import { confirm } from '@/lib/confirm';
import { type AnalysisRecord } from '@/types';

/**
 * 분석기록 수정 (PATCH /records/{recordId}).
 *
 * 고칠 수 있는 값은 보호자가 직접 적은 증상뿐입니다. 응급도·판단 결과는 AI 가 내린
 * 판정이라 읽기 전용으로만 보여 줍니다 — 보호자가 바꿀 수 있으면 '응급' 으로 판정된
 * 기록을 '경미' 로 바꿔 둘 수 있고, 그 기록을 근거로 다음 판단을 하게 되어 위험합니다.
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

  const level = toTriageLevel(record.emergencyLevel);
  const trimmedSymptom = symptomText.trim();
  const canSave = trimmedSymptom.length > 0 && !updateRecord.isPending;

  async function handleSave() {
    if (!canSave) return;

    try {
      await updateRecord.mutateAsync({ symptomText: trimmedSymptom });
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

        {/*
          AI 판정 결과. 고치지는 못하지만 화면에서 빼지 않고 보여 줍니다 —
          증상을 다듬을 때 '이 기록이 어떤 판정이었는지'가 함께 보여야 맥락이 맞습니다.
        */}
        <Field label="AI 판단 결과">
          <View className="gap-3 rounded-2xl bg-paper-card p-4">
            <View className="flex-row items-center gap-2">
              {level && <TriageBadge level={level} />}
              <Text className="flex-1 text-sm text-ink" numberOfLines={2}>
                {record.suspectedDisease ||
                  (level && TRIAGE_LEVEL_META[level].label) ||
                  '분석 결과'}
              </Text>
            </View>
            <Text className="text-xs leading-5 text-ink-soft">
              응급도와 판단 결과는 AI가 분석한 값이라 수정할 수 없어요. 증상이 달라졌다면 증상을
              고쳐 다시 분석해 주세요.
            </Text>
          </View>
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
