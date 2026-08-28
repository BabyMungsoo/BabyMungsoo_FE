import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HealthTipsSection } from '@/features/home/health-tips-section';
import { MediaUploadGrid } from '@/features/home/media-upload-grid';
import { PetSelector } from '@/features/home/pet-selector';
import { SymptomInput } from '@/features/home/symptom-input';
import { usePets } from '@/hooks/queries/use-pets';
import {
  useCompleteTriageSession,
  useCreateTriageSession,
  useGenerateTriageQuestions,
} from '@/hooks/queries/use-triage';
import { notify } from '@/lib/confirm';
import { usePetStore } from '@/stores/use-pet-store';

/**
 * 1번 — 홈.
 *
 * 반려동물·증상·사진을 받아 문진 세션을 만든 뒤, 서버에 추가 질문 생성을 요청합니다.
 * 질문이 있으면 추가 문진 화면으로, 없으면 곧바로 분석 화면(8·4번)으로 넘깁니다.
 * 증상 분류는 보호자가 고르지 않습니다. 초기 증상을 보고 서버가 물어볼 것을 정합니다.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { data: pets, isPending, error, refetch } = usePets();
  const { selectedPetId, selectPet } = usePetStore();
  const [symptom, setSymptom] = useState('');
  const [mediaIds, setMediaIds] = useState<number[]>([]);

  const createSession = useCreateTriageSession();
  const generateQuestions = useGenerateTriageQuestions();
  const completeSession = useCompleteTriageSession();
  const isStarting =
    createSession.isPending || generateQuestions.isPending || completeSession.isPending;

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
      // 증상 분류는 보호자가 고르지 않습니다. 초기 증상을 보고 AI 가 물어볼 것을 정합니다.
      const session = await createSession.mutateAsync({
        petId: selectedPetId,
        initialSymptom,
        symptomCategory: '',
        mediaIds,
      });

      // 질문 생성이 실패해도 서버가 '질문 없음'으로 내려주므로, 여기서는 플래그만 봅니다.
      const questionSet = await generateQuestions.mutateAsync(session.sessionId);

      if (questionSet.needsAdditionalQuestions) {
        // 새로 추가한 라우트라 expo-router 의 타입이 아직 모릅니다.
        // `expo start` 로 .expo/types 가 재생성되면 캐스팅 없이도 통과합니다.
        router.push(`/triage/${session.sessionId}` as never);
        return;
      }

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
              <Pressable onPress={() => refetch()} accessibilityRole="button">
                <Text className="text-xs font-semibold text-red-500">다시 시도</Text>
              </Pressable>
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

          <MediaUploadGrid onMediaIdsChange={setMediaIds} />

          <Pressable
            onPress={handleStartAnalysis}
            disabled={isStarting}
            accessibilityRole="button"
            className="rounded-2xl bg-brand-400 py-4 active:opacity-70 disabled:opacity-50"
          >
            <Text className="text-center text-base font-bold text-ink">
              {generateQuestions.isPending
                ? '맞춤 질문을 준비하고 있어요...'
                : isStarting
                  ? '분석 준비 중...'
                  : 'AI 분석 시작하기'}
            </Text>
          </Pressable>

          <HealthTipsSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
