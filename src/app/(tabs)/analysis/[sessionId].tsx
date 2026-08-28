import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toAbsoluteUrl } from '@/api';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AnalyzingView } from '@/features/analysis/components/analyzing-view';
import { ResultView, type QuickGuideKey } from '@/features/analysis/components/result-view';
import { useFakeProgress } from '@/features/analysis/use-fake-progress';
import { toRecordCreateRequest } from '@/features/records/to-record-create-request';
import { useCreateRecord } from '@/hooks/queries/use-records';
import { useTriageAnalysis, useTriageSession } from '@/hooks/queries/use-triage';
import { confirm } from '@/lib/confirm';
import { useCurrentUserId } from '@/stores/use-session-store';

/** 게이지가 100% 를 채우는 걸 보여준 뒤 결과로 넘깁니다 */
const COMPLETE_HOLD_MS = 500;

/**
 * 8번(분석 중) + 4번(결과).
 *
 * 두 시안을 라우트 하나의 두 상태로 둡니다. 라우트를 나누면 결과에서 뒤로가기를 눌렀을 때
 * 이미 끝난 분석의 로딩 화면으로 되돌아가게 됩니다.
 */
export default function AnalysisScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const parsedId = Number(sessionId);
  const validId = Number.isFinite(parsedId) ? parsedId : undefined;

  const analysis = useTriageAnalysis(validId);
  // 결과 화면의 '증상 요약'은 AI 응답이 아니라 사용자가 처음 입력한 증상이라 따로 받아옵니다.
  const session = useTriageSession(validId);

  const result = analysis.data;
  const initialSymptom = session.data?.initialSymptom;

  // 홈에서 첨부한 사진은 세션 응답에 함께 들어옵니다(media). 분석기록(7번)처럼
  // mediaId 로 다시 조회할 필요가 없어, 상대 경로만 절대 URL 로 바꿔 넘깁니다.
  const photoUrls = (session.data?.media ?? [])
    .map((media) => toAbsoluteUrl(media.fileUrl))
    .filter((url) => url != null);

  const isReady = result != null && initialSymptom != null;
  const error = analysis.error ?? session.error;

  const percent = useFakeProgress(isReady);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => setShowResult(true), COMPLETE_HOLD_MS);
    return () => clearTimeout(timer);
  }, [isReady]);

  // 분석 결과를 기록으로 남깁니다 (분석기록 6·7번 화면에 나타나려면 필요).
  // 세션당 한 번만 저장하도록 ref 로 막습니다 — 멱등 분석 API 특성상
  // 재렌더/재조회로 result 가 다시 와도 같은 세션이면 다시 저장하지 않습니다.
  const userId = useCurrentUserId();
  const { mutate: createRecord } = useCreateRecord();
  const savedSessionRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const sessionData = session.data;
    if (result == null || sessionData == null || userId == null) return;
    if (savedSessionRef.current === validId) return;
    savedSessionRef.current = validId;

    createRecord(
      toRecordCreateRequest({
        result,
        userId,
        dogId: sessionData.petId,
        symptomText: sessionData.initialSymptom,
        mediaIds: sessionData.media.map((media) => media.mediaId),
      }),
    );
  }, [result, session.data, userId, validId, createRecord]);

  // isReady 를 함께 확인해, 아직 안 끝났는데 결과로 넘어가는 일이 없게 합니다.
  // (effect 안에서 setShowResult(false) 를 호출하면 렌더가 연쇄로 다시 돕니다)
  const canShowResult = isReady && showResult;

  async function handleQuickGuide(_key: QuickGuideKey) {
    // TODO: 건강 가이드 화면(피그마 5번)이 생기면 해당 상세로 연결합니다.
    await confirm({
      title: '준비 중인 기능입니다',
      message: '가이드 화면은 곧 추가될 예정이에요.',
    });
  }

  if (validId == null) {
    return <ErrorScreen message="잘못된 접근입니다. 홈에서 다시 시작해 주세요." />;
  }

  if (error) {
    return (
      <ErrorScreen
        message={error.message}
        onRetry={() => {
          void analysis.refetch();
          void session.refetch();
        }}
      />
    );
  }

  if (canShowResult) {
    return (
      <ResultView
        result={result}
        initialSymptom={initialSymptom}
        photoUrls={photoUrls}
        // 증상부터 다시 입력해야 새 세션이 만들어지므로 홈으로 보냅니다.
        onPressRetry={() => router.replace('/')}
        onPressQuickGuide={handleQuickGuide}
        // 응급도를 넘겨야 9번에서 그 등급에 맞는 병원을 추천받습니다(7번 상세와 같은 방식).
        onPressFindHospital={() =>
          router.push({ pathname: '/hospitals', params: { level: result.level } })
        }
      />
    );
  }

  return <AnalyzingView percent={percent} />;
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="AI 분석" showBack backFallback="/" />
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <Text className="text-center text-sm text-ink-muted">{message}</Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            className="rounded-full bg-brand-400 px-6 py-2.5 active:opacity-70"
          >
            <Text className="text-sm font-bold text-brand-900">다시 시도</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
