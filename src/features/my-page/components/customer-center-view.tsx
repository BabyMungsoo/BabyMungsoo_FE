import { Redirect, useFocusEffect } from 'expo-router';
import { useCreateInquiry } from '@/hooks/queries/use-inquiries';
import { useSessionStore } from '@/stores/use-session-store';
import { InquiryList } from './inquiry-list';
import PrimaryButton from '@/components/common/PrimaryButton';
import { isInquiryMock } from '@/api/inquiries';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ScreenHeader } from '@/components/ui/screen-header';
import { MenuDivider, MenuRow } from '@/features/my-page/components/menu-row';
import { useThemeColors } from '@/stores/use-theme-store';

type Screen = 'menu' | 'faq' | 'inquiry' | 'history' | 'guide' | 'privacy' | 'terms';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

const FAQS = [
  [
    'AI 증상 분석 결과는 진단 결과인가요?',
    '아니요. 이멍전시의 AI 분석은 보호자가 반려동물의 상태를 파악하는 데 도움을 주는 참고 정보이며 수의사의 진단을 대신하지 않습니다. 이상 증상이 지속되거나 응급 상황이 의심되면 동물병원에 방문해 주세요.',
  ],
  [
    '사진이나 영상을 올리면 어디에 사용되나요?',
    '업로드한 미디어는 요청한 증상 분석과 서비스 제공을 위해 사용됩니다. 민감한 개인정보가 포함된 사진은 업로드하지 않는 것을 권장합니다.',
  ],
  [
    '등록한 반려동물 정보를 수정할 수 있나요?',
    '마이페이지의 반려동물 프로필에서 이름, 품종, 생년월일 등 등록 정보를 확인하고 수정할 수 있습니다.',
  ],
  [
    '병원 추천은 어떤 기준인가요?',
    '현재 위치와 서비스에서 제공되는 병원 정보를 바탕으로 주변 병원을 확인할 수 있습니다. 실제 진료 가능 여부와 운영 시간은 방문 전에 병원에 확인해 주세요.',
  ],
  [
    '분석 기록은 어디에서 확인하나요?',
    '하단의 진료기록 메뉴에서 이전 분석 및 기록을 확인할 수 있습니다.',
  ],
];

const GUIDE = `이멍전시 앱 사용 가이드\n\n1. 반려동물 등록\n처음 로그인한 뒤 반려동물의 기본 정보를 등록해 주세요.\n\n2. 증상 기록\n홈에서 반려동물의 증상을 입력하고 필요한 경우 사진 또는 영상을 첨부할 수 있어요.\n\n3. AI 분석 확인\n입력한 정보를 바탕으로 제공되는 분석 결과와 안내사항을 확인해 주세요. AI 결과는 참고용이며 의료 진단을 대신하지 않아요.\n\n4. 주변 병원 확인\n병원 메뉴에서 주변 동물병원 정보를 확인할 수 있어요.\n\n5. 기록 관리\n진료기록에서 이전 증상과 분석 기록을 다시 확인할 수 있어요.`;

const PRIVACY = `개인정보 처리방침 (서비스 화면용 예시)\n\n이멍전시는 서비스 제공을 위해 회원정보, 반려동물 정보, 사용자가 직접 입력한 증상 및 첨부 미디어 등을 처리할 수 있습니다. 수집된 정보는 회원 관리, 서비스 제공, 문의 처리 및 서비스 품질 개선 목적으로 이용됩니다.\n\n개인정보는 관련 법령 및 내부 정책에 따라 필요한 기간 동안 보관하며, 보관 목적이 달성된 정보는 지체 없이 파기하는 것을 원칙으로 합니다.\n\n사용자는 자신의 개인정보에 대해 열람, 정정, 삭제 등을 요청할 수 있습니다.\n\n※ 현재 문구는 개발/시연을 위한 예시이며 실제 서비스 출시 전 법률 검토 및 실제 개인정보 처리 구조에 맞춘 정책으로 교체해야 합니다.`;

const TERMS = `서비스 이용약관 (서비스 화면용 예시)\n\n제1조 목적\n본 약관은 이멍전시 서비스 이용에 관한 기본적인 사항을 정하는 것을 목적으로 합니다.\n\n제2조 서비스\n서비스는 반려동물 정보 관리, 증상 기록, AI 기반 참고 정보, 주변 동물병원 정보 등의 기능을 제공합니다.\n\n제3조 의료 관련 안내\n서비스가 제공하는 AI 분석 및 정보는 참고용이며 수의사의 전문적인 진단이나 치료를 대체하지 않습니다. 응급 상황에서는 즉시 동물병원 등 전문기관의 도움을 받아야 합니다.\n\n제4조 이용자의 의무\n이용자는 정확한 정보를 입력하고 타인의 권리를 침해하거나 서비스를 부정한 목적으로 이용해서는 안 됩니다.\n\n※ 현재 약관은 개발/시연을 위한 예시이며 실제 출시 전 서비스 정책 및 법률 검토에 따라 수정되어야 합니다.`;

function DetailHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center px-5 py-4">
      <Pressable onPress={onBack} className="mr-3 p-1">
        <Ionicons name="chevron-back" size={24} color={colors.ink} />
      </Pressable>
      <Text className="text-xl font-bold text-ink">{title}</Text>
    </View>
  );
}

export function CustomerCenterView() {
  const colors = useThemeColors();
  const [screen, setScreen] = useState<Screen>('menu');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const mutation = useCreateInquiry();
  const busy = useRef(false);
  const { accessToken, isHydrated } = useSessionStore();
  const goMenu = () => setScreen('menu');
  // 탭 화면은 떠나도 언마운트되지 않아서, 다시 들어오면 보던 하위 화면(가이드 등)이 그대로 남습니다
  useFocusEffect(useCallback(() => setScreen('menu'), []));

  const submitInquiry = async () => {
    if (busy.current) return;
    if (!title.trim() || !content.trim()) {
      setError('문의 제목과 내용을 모두 입력해 주세요.');
      return;
    }
    busy.current = true;
    setError('');
    try {
      await mutation.mutateAsync({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
      setScreen('history');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : '문의를 저장하지 못했습니다. 다시 시도해 주세요.',
      );
    } finally {
      busy.current = false;
    }
  };
  if (!isHydrated) return <ActivityIndicator />;
  if (!accessToken) return <Redirect href="/login" />;

  if (screen === 'menu')
    return (
      <>
        <ScreenHeader title="고객센터" showBack backTo="/my-page" />
        <ScrollView contentContainerClassName="gap-4 px-5 pb-8">
          <View className="rounded-2xl bg-paper-card" style={CARD_SHADOW}>
            <MenuRow
              icon="help-circle-outline"
              label="자주 묻는 질문"
              onPress={() => setScreen('faq')}
            />
            <MenuDivider />
            <MenuRow
              icon="chatbubble-ellipses-outline"
              label="1:1 문의하기"
              onPress={() => setScreen('inquiry')}
            />
            <MenuDivider />
            <MenuRow
              icon="document-text-outline"
              label="문의 내역"
              onPress={() => setScreen('history')}
            />
          </View>
          <View className="rounded-2xl bg-paper-card" style={CARD_SHADOW}>
            <MenuRow
              icon="book-outline"
              label="앱 사용 가이드"
              onPress={() => setScreen('guide')}
            />
            <MenuDivider />
            <MenuRow
              icon="document-lock-outline"
              label="개인정보 처리방침"
              onPress={() => setScreen('privacy')}
            />
            <MenuDivider />
            <MenuRow
              icon="document-outline"
              label="서비스 이용약관"
              onPress={() => setScreen('terms')}
            />
          </View>
        </ScrollView>
      </>
    );

  if (screen === 'faq')
    return (
      <>
        <DetailHeader title="자주 묻는 질문" onBack={goMenu} />
        <ScrollView contentContainerClassName="gap-3 px-5 pb-8">
          {FAQS.map(([q, a], i) => (
            <Pressable
              key={q}
              onPress={() => setOpenFaq(openFaq === i ? null : i)}
              className="rounded-2xl bg-paper-card p-4"
              style={CARD_SHADOW}
            >
              <View className="flex-row items-center justify-between">
                <Text className="mr-3 flex-1 font-semibold text-ink">Q. {q}</Text>
                <Ionicons
                  name={openFaq === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.inkMuted}
                />
              </View>
              {openFaq === i && <Text className="mt-3 leading-6 text-ink-muted">A. {a}</Text>}
            </Pressable>
          ))}
        </ScrollView>
      </>
    );

  if (screen === 'inquiry')
    return (
      <>
        <DetailHeader title="1:1 문의하기" onBack={goMenu} />
        <ScrollView
          contentContainerClassName="px-5 pb-8"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <Text className="mb-2 font-semibold text-ink">문의 제목</Text>
          <TextInput
            accessibilityLabel="문의 제목"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            editable={!mutation.isPending}
            placeholder="문의 제목을 입력해 주세요"
            className="mb-5 rounded-2xl bg-paper-card px-4 py-4 text-base text-ink"
            placeholderTextColor={colors.inkSoft}
          />
          <Text className="mb-2 font-semibold text-ink">문의 내용</Text>
          <TextInput
            accessibilityLabel="문의 내용"
            value={content}
            onChangeText={setContent}
            maxLength={5000}
            editable={!mutation.isPending}
            placeholder="문의 내용을 자세히 입력해 주세요"
            multiline
            textAlignVertical="top"
            className="min-h-48 rounded-2xl bg-paper-card px-4 py-4 text-base text-ink"
            placeholderTextColor={colors.inkSoft}
          />
          {isInquiryMock && (
            <Text className="mt-3 text-xs leading-5 text-ink-muted">
              체험 모드 · 문의와 답변은 이 기기에만 저장됩니다.
            </Text>
          )}
          {error ? (
            <Text accessibilityRole="alert" className="mt-3 text-sm text-red-600">
              {error}
            </Text>
          ) : null}
          <View className="mt-6">
            <PrimaryButton
              title={mutation.isPending ? '등록 중...' : '문의 등록'}
              disabled={mutation.isPending || !title.trim() || !content.trim()}
              onPress={() => void submitInquiry()}
            />
          </View>
        </ScrollView>
      </>
    );

  if (screen === 'history')
    return (
      <>
        <DetailHeader title="문의 내역" onBack={goMenu} />
        <InquiryList />
      </>
    );

  const page =
    screen === 'guide'
      ? ['앱 사용 가이드', GUIDE]
      : screen === 'privacy'
        ? ['개인정보 처리방침', PRIVACY]
        : ['서비스 이용약관', TERMS];
  return (
    <>
      <DetailHeader title={page[0]} onBack={goMenu} />
      <ScrollView contentContainerClassName="px-5 pb-10">
        <View className="rounded-2xl bg-paper-card p-5" style={CARD_SHADOW}>
          <Text className="leading-7 text-ink">{page[1]}</Text>
        </View>
      </ScrollView>
    </>
  );
}
