import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { isInquiryMock } from '@/api/inquiries';
import { useInquiries } from '@/hooks/queries/use-inquiries';
import type { InquiryFilter, InquiryStatus } from '@/types/inquiry';

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <View
      className={
        status === 'ANSWERED'
          ? 'rounded-full bg-green-50 px-3 py-1'
          : 'rounded-full bg-orange-50 px-3 py-1'
      }
    >
      <Text
        className={
          status === 'ANSWERED'
            ? 'text-xs font-semibold text-green-700'
            : 'text-xs font-semibold text-orange-700'
        }
      >
        {status === 'ANSWERED' ? '답변 완료' : '답변 대기'}
      </Text>
    </View>
  );
}

export function inquiryDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ko-KR');
}

export function InquiryList({ admin = false }: { admin?: boolean }) {
  const query = useInquiries(admin);
  const [filter, setFilter] = useState<InquiryFilter>('ALL');
  const items = (query.data ?? []).filter((item) => filter === 'ALL' || item.status === filter);
  const filters: { value: InquiryFilter; label: string }[] = [
    { value: 'ALL', label: '전체' },
    { value: 'PENDING', label: '답변 대기' },
    { value: 'ANSWERED', label: '답변 완료' },
  ];
  return (
    <ScrollView contentContainerClassName="gap-3 px-5 pb-8">
      {isInquiryMock && (
        <Text className="text-xs leading-5 text-ink-muted">
          체험 모드 · 문의와 답변은 이 기기에만 저장됩니다.
        </Text>
      )}
      {admin && (
        <View className="flex-row gap-2 py-2">
          {filters.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === item.value }}
              onPress={() => setFilter(item.value)}
              className={
                filter === item.value
                  ? 'rounded-full bg-[#FFD83D] px-4 py-3'
                  : 'rounded-full bg-paper-card px-4 py-3'
              }
            >
              <Text
                className={`text-sm font-semibold ${
                  filter === item.value ? 'text-[#2e2a24]' : 'text-ink'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {query.isPending ? (
        <ActivityIndicator accessibilityLabel="문의 목록 불러오는 중" className="mt-10" />
      ) : query.isError ? (
        <View className="gap-3 py-8">
          <Text accessibilityRole="alert" className="text-sm text-red-600">
            {query.error.message}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => void query.refetch()}>
            <Text className="font-semibold text-ink">다시 시도</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View className="items-center py-16">
          <Ionicons name="chatbubble-outline" size={42} color="#aaa" />
          <Text className="mt-4 text-ink-muted">
            {filter === 'ALL' ? '아직 문의 내역이 없어요.' : '해당 상태의 문의가 없어요.'}
          </Text>
        </View>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: admin ? '/admin/inquiries/[inquiryId]' : '/inquiries/[inquiryId]',
                params: { inquiryId: item.id },
              })
            }
            className="gap-3 rounded-2xl bg-paper-card p-4 active:opacity-70"
          >
            <View className="flex-row items-start gap-2">
              <Text className="flex-1 font-bold leading-6 text-ink">{item.title}</Text>
              <InquiryStatusBadge status={item.status} />
            </View>
            <Text className="text-xs leading-5 text-ink-muted">
              {item.authorName} · {inquiryDate(item.createdAt)}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
