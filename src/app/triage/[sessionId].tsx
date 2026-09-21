import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { OptionCardList } from '@/features/triage/components/option-card-list';
import {
  useCompleteTriageSession,
  useNextQuestion,
  useSaveAnswer,
  useTriageQuestionSet,
  useTriageSession,
} from '@/hooks/queries/use-triage';
import { notify } from '@/lib/confirm';
import type { Question } from '@/types';

/**
 * 맞춤형 추가 문진.
 *
 * 서버가 초기 증상과 사진을 보고 질문을 만든 경우에만 들어옵니다. "다음에 물어볼 질문"도
 * 서버가 하나씩 돌려주므로 화면은 그걸 그대로 따라가기만 하면 됩니다
 * (질문 순서를 프론트가 관리하지 않습니다).
 * 질문이 떨어지면 세션을 완료하고 분석 화면으로 넘깁니다.
 *
 * 답변은 선택지 카드가 기본입니다(answerType = CHOICE). 응급 상황에서 문장을 칠 수 없어서
 * 서버가 질문마다 선택지를 함께 만들어 줍니다. 선택지가 상황에 안 맞을 때를 위해
 * '직접 입력' 을 작게 남겨 두고, 선택지가 없는 질문(TEXT)은 예전처럼 입력창만 보입니다.
 *
 * '선택 → 다음' 두 번 누르게 한 이유: 답변 수정 API 가 없어 잘못 누른 답을 되돌릴 수 없고,
 * 그 답이 그대로 응급도 판단에 들어갑니다. 탭 한 번에 전송하는 쪽이 빠르긴 하지만
 * 수정 API 가 생긴 뒤에 바꾸는 게 맞습니다.
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
  const questionSetQuery = useTriageQuestionSet(validId);
  const questions = questionSetQuery.data?.questions;

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

  const submitAnswer = async (content: string) => {
    if (question == null || validId == null) return;

    try {
      // 선택지는 문구 그대로 보냅니다. 서버가 이 문자열을 '- 질문: 답변' 으로 분석 입력에 씁니다.
      await saveAnswer.mutateAsync({ questionId: question.id, content });
    } catch (err) {
      await notify(
        '답변을 저장하지 못했어요',
        err instanceof Error ? err.message : '잠시 후 다시 시도해주세요.',
      );
    }
  };

  const isLoading = session.isPending || nextQuestion.isPending;

  // 질문 목록 조회가 실패하면 진행률이 0/0 으로 보일 뿐 이유가 드러나지 않아 함께 묶습니다.
  const error = session.error ?? nextQuestion.error ?? questionSetQuery.error;

  /** 실패한 쿼리만 골라 다시 부릅니다. 하나만 재시도하면 다른 쪽 에러에서 못 빠져나옵니다. */
  const handleRetry = () => {
    if (session.error) session.refetch();
    if (nextQuestion.error) nextQuestion.refetch();
    if (questionSetQuery.error) questionSetQuery.refetch();
  };

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
            <Pressable onPress={handleRetry} accessibilityRole="button">
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
                {/*
                  key 로 질문이 바뀔 때마다 새로 마운트합니다. 고른 선택지·적던 글이
                  다음 질문에 딸려 가지 않게 하는 가장 단순한 방법입니다(effect 로 초기화하면
                  렌더가 연쇄로 돕니다).
                */}
                <AnswerForm
                  key={question.id}
                  question={question}
                  isBusy={isBusy}
                  isSaving={saveAnswer.isPending}
                  onSubmit={submitAnswer}
                />

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

            {/* 지금까지 답한 내용 — 답이 짧아졌으니 질문과 답을 한 줄에 둡니다 */}
            {answeredCount > 0 && (
              <View className="gap-2.5 rounded-2xl bg-paper-card p-4">
                <Text className="text-sm font-semibold text-ink-muted">지금까지 답한 내용</Text>
                {session.data?.answers.map((item) => (
                  <View key={item.id} className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 text-xs leading-5 text-ink-soft">
                      {questions?.find((q) => q.id === item.questionId)?.content ?? '추가 설명'}
                    </Text>
                    <Text className="max-w-[45%] shrink text-right text-sm font-semibold leading-5 text-ink">
                      {item.content}
                    </Text>
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

interface AnswerFormProps {
  question: Question;
  isBusy: boolean;
  isSaving: boolean;
  onSubmit: (content: string) => void;
}

/**
 * 질문 하나의 답변 폼. 선택지 카드가 기본이고, '직접 입력' 을 열면 카드 선택은 버립니다.
 * 둘 다 있으면 무엇을 보낼지 애매해지기 때문입니다.
 */
function AnswerForm({ question, isBusy, isSaving, onSubmit }: AnswerFormProps) {
  const isChoice = question.answerType === 'CHOICE' && question.options.length > 0;

  const [selected, setSelected] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  // CHOICE 질문에서 '직접 입력' 을 펼쳤는지. TEXT 질문은 이 값과 무관하게 항상 입력창입니다.
  const [showFreeText, setShowFreeText] = useState(false);

  const useFreeText = !isChoice || showFreeText;
  const content = useFreeText ? freeText.trim() : (selected ?? '');
  const canSubmit = content.length > 0 && !isBusy;

  const openFreeText = () => {
    setSelected(null);
    setShowFreeText(true);
  };

  const closeFreeText = () => {
    setFreeText('');
    setShowFreeText(false);
  };

  return (
    <>
      <View className="gap-4 rounded-2xl border-2 border-brand-300 bg-paper-card p-4">
        <Text className="text-lg font-bold leading-7 text-ink">{question.content}</Text>

        {isChoice && (
          <OptionCardList
            options={question.options}
            selected={selected}
            onSelect={(option) => {
              setSelected(option);
              // 카드를 골랐으면 직접 입력은 접습니다.
              if (showFreeText) closeFreeText();
            }}
            disabled={isBusy}
          />
        )}

        {useFreeText && (
          <TextInput
            value={freeText}
            onChangeText={setFreeText}
            placeholder={isChoice ? '상황을 직접 적어주세요' : '편하게 적어주세요'}
            placeholderTextColor="#a9a296"
            multiline
            textAlignVertical="top"
            autoFocus={isChoice}
            className="min-h-[80px] rounded-xl bg-paper px-3 py-2 text-sm text-ink"
          />
        )}

        {isChoice && (
          <Pressable
            onPress={showFreeText ? closeFreeText : openFreeText}
            disabled={isBusy}
            accessibilityRole="button"
            className="self-start"
          >
            <Text className="text-xs text-ink-muted underline">
              {showFreeText ? '선택지에서 고를래요' : '해당하는 게 없어요 · 직접 입력할래요'}
            </Text>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={() => onSubmit(content)}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
        className="rounded-2xl bg-brand-400 py-4 active:opacity-70 disabled:opacity-40"
      >
        <Text className="text-center text-base font-bold text-ink">
          {isSaving ? '저장 중...' : '다음'}
        </Text>
      </Pressable>
    </>
  );
}
