import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toTriageLevel } from '@/constants/triage';
import { RecordListView } from '@/features/records/components/record-list-view';
import { useRecords } from '@/hooks/queries/use-records';
import { useCurrentUserId } from '@/stores/use-session-store';
import type { AnalysisRecord, TriageLevel } from '@/types';

/* --------------------------------------------------------------------------
 * 임시 데이터 — 백엔드 연동 전까지 화면을 보기 위한 것입니다.
 * 연동할 때 이 배열과 아래 `data ?? TEMP_RECORDS` 의 fallback 만 지우면 됩니다.
 * -------------------------------------------------------------------------- */
const TEMP_RECORDS: AnalysisRecord[] = [
  {
    recordId: 1,
    userId: 1,
    dogId: 1,
    symptomText: '구토, 식욕 부진, 무기력',
    aiResult: '위장염(급성) 가능성 높음',
    emergencyLevel: 'IMMEDIATE',
    suspectedDisease: '급성 위장염',
    aiGuide: '즉시 동물병원 방문을 권장합니다. 수분 섭취를 자주 시켜주세요.',
    createdAt: '2024-05-21T14:30:00',
  },
  {
    recordId: 2,
    userId: 1,
    dogId: 1,
    symptomText: '설사와 묽은 변',
    aiResult: '장 트러블 의심',
    emergencyLevel: 'WATCH',
    suspectedDisease: '식이성 설사',
    aiGuide: '하루 정도 상태를 지켜보고, 혈변이 보이면 바로 병원에 가세요.',
    createdAt: '2024-05-10T09:15:00',
  },
  {
    recordId: 3,
    userId: 1,
    dogId: 1,
    symptomText: '기침과 켁켁거림',
    aiResult: '경미한 기관지 자극',
    emergencyLevel: 'NORMAL',
    suspectedDisease: null,
    aiGuide: '실내 습도를 올려 주고 산책 시 목줄 대신 하네스를 써보세요.',
    createdAt: '2024-04-28T20:45:00',
  },
  {
    recordId: 4,
    userId: 1,
    dogId: 1,
    symptomText: '눈물 자주 흘림',
    aiResult: '눈물길 자극 가능성',
    emergencyLevel: 'NORMAL',
    suspectedDisease: null,
    aiGuide: '눈 주변을 깨끗이 닦아 주고 변화가 있으면 병원에 가세요.',
    createdAt: '2024-04-16T11:20:00',
  },
  {
    recordId: 5,
    userId: 1,
    dogId: 1,
    symptomText: '피부 가려움, 긁음',
    aiResult: '알레르기성 피부염 의심',
    emergencyLevel: 'WATCH',
    suspectedDisease: '알레르기성 피부염',
    aiGuide: '긁는 부위가 붉어지거나 진물이 나면 병원 진료가 필요합니다.',
    createdAt: '2024-04-05T18:10:00',
  },
];

/** 6번 — 분석기록 리스트 (GET /records?userId=) */
export default function RecordsScreen() {
  const router = useRouter();
  const userId = useCurrentUserId();
  const [filter, setFilter] = useState<TriageLevel | null>(null);

  const { data } = useRecords(userId ?? undefined);

  // 서버가 응답하면 그걸 쓰고, 아직 안 붙었으면 임시 데이터로 화면을 보여줍니다
  const source = data ?? TEMP_RECORDS;

  // 서버가 createdAt 내림차순으로 이미 정렬해서 내려주므로 필터링만 합니다
  const records = useMemo(() => {
    if (!filter) return source;
    return source.filter((record) => toTriageLevel(record.emergencyLevel) === filter);
  }, [source, filter]);

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <RecordListView
        records={records}
        filter={filter}
        onChangeFilter={setFilter}
        onPressRecord={(recordId) => router.push(`/records/${recordId}`)}
      />
    </SafeAreaView>
  );
}
