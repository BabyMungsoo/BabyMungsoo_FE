import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/common/PrimaryButton';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useAnswerInquiry, useInquiry } from '@/hooks/queries/use-inquiries';
import { InquiryStatusBadge, inquiryDate } from './inquiry-list';

export function InquiryDetail({ admin = false }: { admin?: boolean }) {
  const params = useLocalSearchParams<{ inquiryId: string }>();
  const id = typeof params.inquiryId === 'string' ? params.inquiryId : '';
  const query = useInquiry(id, admin);
  const mutation = useAnswerInquiry(id);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const busy = useRef(false);
  const item = query.data;
  const submit = async () => {
    if (busy.current || !answer.trim()) return;
    busy.current = true;
    setError('');
    try {
      await mutation.mutateAsync(answer.trim());
      setAnswer('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '답변 등록에 실패했습니다.');
    } finally {
      busy.current = false;
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader
        title="문의 상세"
        showBack
        backFallback={admin ? '/admin/inquiries' : '/customer-center'}
      />
      <ScrollView
        contentContainerClassName="gap-4 px-5 pb-8"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {!id ? (
          <Text className="text-red-600">잘못된 문의 주소입니다.</Text>
        ) : query.isPending ? (
          <ActivityIndicator accessibilityLabel="문의 불러오는 중" />
        ) : query.isError ? (
          <View className="gap-4">
            <Text accessibilityRole="alert" className="text-red-600">
              {query.error.message}
            </Text>
            <PrimaryButton title="다시 시도" onPress={() => void query.refetch()} />
          </View>
        ) : (
          item && (
            <>
              <View className="gap-3 rounded-2xl bg-paper-card p-5">
                <View className="self-start">
                  <InquiryStatusBadge status={item.status} />
                </View>
                <Text className="text-lg font-bold leading-7 text-ink">{item.title}</Text>
                <Text className="text-sm text-ink-muted">작성자: {item.authorName}</Text>
                <Text className="text-xs text-ink-muted">{inquiryDate(item.createdAt)}</Text>
                <View className="my-1 h-px bg-ink-line" />
                <Text selectable className="text-base leading-7 text-ink">
                  {item.content}
                </Text>
              </View>
              {item.status === 'ANSWERED' ? (
                <View className="gap-3 rounded-2xl bg-paper-card p-5">
                  <Text className="font-bold text-ink">관리자 답변</Text>
                  <Text selectable className="leading-7 text-ink">
                    {item.answer}
                  </Text>
                  {item.answeredAt && (
                    <Text className="text-xs text-ink-muted">
                      답변일: {inquiryDate(item.answeredAt)}
                    </Text>
                  )}
                </View>
              ) : admin ? (
                <View className="gap-3 rounded-2xl bg-paper-card p-5">
                  <Text className="font-bold text-ink">관리자 답변</Text>
                  <TextInput
                    accessibilityLabel="관리자 답변"
                    value={answer}
                    onChangeText={setAnswer}
                    editable={!mutation.isPending}
                    multiline
                    maxLength={5000}
                    textAlignVertical="top"
                    placeholder="보호자에게 전달할 답변을 입력해 주세요"
                    className="min-h-48 rounded-xl border border-ink-line p-4 text-base text-ink"
                  />
                  <Text className="text-right text-xs text-ink-muted">{answer.length}/5,000</Text>
                  {error ? (
                    <Text accessibilityRole="alert" className="text-sm text-red-600">
                      {error}
                    </Text>
                  ) : null}
                  <PrimaryButton
                    title={mutation.isPending ? '등록 중...' : '답변 등록'}
                    disabled={!answer.trim() || mutation.isPending}
                    onPress={() => void submit()}
                  />
                </View>
              ) : (
                <Text className="text-sm leading-6 text-ink-muted">
                  관리자가 문의를 확인하고 있어요. 답변이 등록되면 여기에서 확인할 수 있어요.
                </Text>
              )}
            </>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
