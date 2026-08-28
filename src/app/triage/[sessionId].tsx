import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import {
  useCompleteTriageSession,
  useNextQuestion,
  useSaveAnswer,
  useTriageQuestionSet,
  useTriageSession,
} from '@/hooks/queries/use-triage';
import { notify } from '@/lib/confirm';

/**
 * 맞춤형 추가 문진.
 *
 * 서버가 초기 증상과 사진을 보고 질문을 만든 경우에만 들어옵니다. "다음에 물어볼 질문"도
 * 서버가 하나씩 돌려주므로 화면은 그걸 그대로 따라가기만 하면 됩니다
 * (질문 순서를 프론트가 관리하지 않습니다).
 * 질문이 떨어지면 세션을 완료하고 분석 화면으로 넘깁니다.
 */
export default function TriageQuestionScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const parsedId = Number(sessionId);
  const validId = Number.isFinite(parsedId) ? parsedId : undefined;

  const session = useTriageSession(validId);
  const nextQuestion = useNextQuestion(validId);
  const saveAnswer = useSaveAnswer(validId);
  const completeSession = useCompleteTriageSession();

  // 진행률 표시와 답변 목록 라벨에만 씁니다. 답변 수는 세션에, 전체 문항 수는 질문 목록에 있습니다.
  const { data: questionSet } = useTriageQuestionSet(validId);
  const questions = questionSet?.questions;

  const [answer, setAnswer] = useState('');

  const question = nextQuestion.data ?? null;
  const answeredCount = session.data?.answers.length ?? 0;
  const totalCount = questions?.length ?? 0;
  const isBusy = saveAnswer.isPending || completeSession.isPending;

  const goToAnalysis = async () => {
    if (validId == null) return;

    try {
      await completeSession.mutateAsync(validId);
      // replace 로 넘겨야 결과 화면에서 뒤로가기를 눌렀을 때 이미 끝난 문진으로 돌아가지 않습니다.
      router.replace(`/analysis/${validId}`);
    } catch (err) {
      await notify(
        '분석을 시작하지 못했어요',
        err instanceof Error ? err.message : '잠시 후 다시 시도해주세요.',
      );
    }
  };

  const handleNext = async () => {
    const content = answer.trim();

    if (!content) {
      await notify('답변을 입력해주세요', '모르는 내용이면 "잘 모르겠어요"라고 적어도 괜찮아요.');
      return;
    }
    if (question == null || validId == null) return;

    try {
      await saveAnswer.mutateAsync({ questionId: question.id, content });
      setAnswer('');
    } catch (err) {
      await notify(
        '답변을 저장하지 못했어요',
        err instanceof Error ? err.message : '잠시 후 다시 시도해주세요.',
      );
    }
  };

  const isLoading = session.isPending || nextQuestion.isPending;
  const error = session.error ?? nextQuestion.error;

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'bottom']}>
      <ScreenHeader title="추가 문진" showBack backFallback="/(tabs)" />

      <ScrollView contentContainerClassName="gap-4 px-5 pb-8" keyboardShouldPersistTaps="handled">
        {isLoading && (
          <View className="items-center rounded-2xl bg-paper-card p-6">
            <ActivityIndicator />
          </View>
        )}

        {error && (
          <View className="gap-2 rounded-2xl bg-red-50 p-4">
            <Text className="text-sm text-red-700">{error.message}</Text>
            <Pressable onPress={() => nextQuestion.refetch()} accessibilityRole="button">
              <Text className="text-xs font-semibold text-red-500">다시 시도</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !error && (
          <>
            {/* 진행 상황 */}
            <View className="gap-2 rounded-2xl bg-paper-card p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-ink">몇 가지만 더 여쭤볼게요</Text>
                <Text className="text-xs text-ink-muted">
                  {Math.min(answeredCount + (question ? 1 : 0), totalCount)} / {totalCount}
                </Text>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-paper-chip">
                <View
                  className="h-full rounded-full bg-brand-400"
                  style={{
                    width: totalCount > 0 ? `${(answeredCount / totalCount) * 100}%` : '0%',
                  }}
                />
              </View>
            </View>

            {question ? (
              <>
                <View className="rounded-2xl border-2 border-brand-300 bg-paper-card p-4">
                  <Text className="text-base font-bold leading-6 text-ink">{question.content}</Text>
                  <TextInput
                    value={answer}
                    onChangeText={setAnswer}
                    placeholder="편하게 적어주세요"
                    placeholderTextColor="#a9a296"
                    multiline
                    textAlignVertical="top"
                    className="mt-3 h-20 text-sm text-ink"
                  />
                </View>

                <Pressable
                  onPress={handleNext}
                  disabled={isBusy}
                  accessibilityRole="button"
                  className="rounded-2xl bg-brand-400 py-4 active:opacity-70 disabled:opacity-50"
                >
                  <Text className="text-center text-base font-bold text-ink">
                    {saveAnswer.isPending ? '저장 중...' : '다음'}
                  </Text>
                </Pressable>

                <Pressable onPress={goToAnalysis} disabled={isBusy} accessibilityRole="button">
                  <Text className="text-center text-sm text-ink-muted">
                    남은 질문 건너뛰고 바로 분석하기
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View className="gap-1 rounded-2xl bg-paper-card p-5">
                  <Text className="text-base font-semibold text-ink">문진이 끝났어요</Text>
                  <Text className="text-sm text-ink-muted">
                    답해주신 내용까지 함께 살펴보고 응급도를 판단할게요.
                  </Text>
                </View>

                <Pressable
                  onPress={goToAnalysis}
                  disabled={isBusy}
                  accessibilityRole="button"
                  className="rounded-2xl bg-brand-400 py-4 active:opacity-70 disabled:opacity-50"
                >
                  <Text className="text-center text-base font-bold text-ink">
                    {completeSession.isPending ? '분석 준비 중...' : 'AI 분석 시작하기'}
                  </Text>
                </Pressable>
              </>
            )}

            {/* 지금까지 답한 내용 — 되돌아보며 확인할 수 있게 */}
            {answeredCount > 0 && (
              <View className="gap-3 rounded-2xl bg-paper-card p-4">
                <Text className="text-sm font-semibold text-ink-muted">지금까지 답한 내용</Text>
                {session.data?.answers.map((item) => (
                  <View key={item.id} className="gap-1">
                    <Text className="text-xs text-ink-soft">
                      {questions?.find((q) => q.id === item.questionId)?.content ?? '추가 설명'}
                    </Text>
                    <Text className="text-sm text-ink">{item.content}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
