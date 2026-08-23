import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HealthTipsSection } from '@/features/home/health-tips-section';
import { MediaUploadGrid } from '@/features/home/media-upload-grid';
import { PetSelector } from '@/features/home/pet-selector';
import { SymptomInput } from '@/features/home/symptom-input';
import { usePets } from '@/hooks/queries/use-pets';
import { useCompleteTriageSession, useCreateTriageSession } from '@/hooks/queries/use-triage';
import { notify } from '@/lib/confirm';
import { usePetStore } from '@/stores/use-pet-store';
import type { UploadFile } from '@/types';

/** 1번 — 홈. 반려동물·증상을 받아 문진 세션을 만들고 곧바로 분석 화면(8·4번)으로 넘깁니다. */
export default function HomeScreen() {
  const router = useRouter();
  const { data: pets, isPending, error, refetch } = usePets();
  const { selectedPetId, selectPet } = usePetStore();
  const [symptom, setSymptom] = useState('');
  const [photos, setPhotos] = useState<UploadFile[]>([]);

  const createSession = useCreateTriageSession();
  const completeSession = useCompleteTriageSession();
  const isStarting = createSession.isPending || completeSession.isPending;

  useEffect(() => {
    if (pets && pets.length > 0 && !pets.some((pet) => pet.petId === selectedPetId)) {
      selectPet(pets[0].petId);
    }
  }, [pets, selectedPetId, selectPet]);

  const hasPets = !!pets && pets.length > 0;

  const handleStartAnalysis = async () => {
    if (!hasPets || selectedPetId == null) {
      await notify('반려동물 등록이 필요해요', '분석을 시작하려면 먼저 반려동물을 등록해주세요.');
      return;
    }
    const initialSymptom = symptom.trim();
    if (!initialSymptom) {
      await notify(
        '증상을 입력해주세요',
        '아이의 증상을 간단히 적어주시면 분석을 시작할 수 있어요.',
      );
      return;
    }

    try {
      // 홈에서는 카테고리별 추가 질문 없이 바로 분석하므로 symptomCategory 는 비워 둡니다.
      const session = await createSession.mutateAsync({
        petId: selectedPetId,
        initialSymptom,
        symptomCategory: '',
      });
      await completeSession.mutateAsync(session.sessionId);
      router.push(`/analysis/${session.sessionId}`);
    } catch (err) {
      await notify(
        '분석을 시작하지 못했어요',
        err instanceof Error ? err.message : '잠시 후 다시 시도해주세요.',
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[32px] bg-brand-400 px-5 pb-10 pt-4">
          <View className="flex-row items-start justify-between">
            <Text className="text-2xl font-extrabold leading-tight text-ink">
              우리 아이{'\n'}어디가 아프세요?
            </Text>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-paper-card">
              <Text className="text-2xl">🐶</Text>
            </View>
          </View>
        </View>

        <View className="-mt-6 gap-4 px-5">
          {isPending && (
            <View className="items-center rounded-2xl bg-paper-card p-6">
              <ActivityIndicator />
            </View>
          )}

          {error && (
            <View className="gap-2 rounded-2xl bg-red-50 p-4">
              <Text className="text-sm text-red-700">{error.message}</Text>
              <Text className="text-xs font-semibold text-red-500" onPress={() => refetch()}>
                다시 시도
              </Text>
            </View>
          )}

          {!isPending && !error && !hasPets && (
            <View className="gap-1 rounded-2xl bg-paper-card p-5">
              <Text className="text-base font-semibold text-ink">등록된 반려동물이 없어요</Text>
              <Text className="text-sm text-ink-muted">
                반려동물을 먼저 등록하면 증상을 분석할 수 있어요.
              </Text>
            </View>
          )}

          {hasPets && (
            <PetSelector pets={pets} selectedPetId={selectedPetId} onSelect={selectPet} />
          )}

          <SymptomInput value={symptom} onChangeText={setSymptom} />

          <MediaUploadGrid photos={photos} onChange={setPhotos} />

          <Text
            onPress={isStarting ? undefined : handleStartAnalysis}
            className="rounded-2xl bg-brand-400 py-4 text-center text-base font-bold text-ink"
          >
            {isStarting ? '분석 준비 중...' : 'AI 분석 시작하기'}
          </Text>

          <HealthTipsSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
