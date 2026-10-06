import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * 화면 5 재구성 — 제휴 병원이 보유한 반려견 진료·처방 기록 화면 (담당: 윤선)
 *
 * 제휴 병원 실데이터가 아직 없어 목(mock) 데이터로 구성한다.
 * 추후 제휴 병원 연동 API가 생기면 이 정적 데이터를 API 응답으로 교체한다.
 * 진입 경로(어디서 들어올지)는 팀 논의 후 결정 예정.
 */

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

type IoniconName = keyof typeof Ionicons.glyphMap;

const MOCK_PET = { name: '뭉수', breed: '푸들', age: 5, weight: 4.2, hospital: '행복동물병원' };

type VaccineStatus = 'DONE' | 'UPCOMING';
type Vaccination = { id: string; name: string; date: string; status: VaccineStatus };

const VACCINATIONS: Vaccination[] = [
  { id: 'dhppl', name: '종합백신 (DHPPL)', date: '2025.03.15 접종 · 다음 2026.03', status: 'DONE' },
  { id: 'rabies', name: '광견병', date: '2025.04.02 접종 · 다음 2026.04', status: 'DONE' },
  { id: 'kennel', name: '켄넬코프', date: '2025.10.01 접종 예정', status: 'UPCOMING' },
];

type Prescription = { id: string; name: string; type: string; detail: string; icon: IoniconName };

const PRESCRIPTIONS: Prescription[] = [
  {
    id: 'amox',
    name: '아목시실린',
    type: '항생제',
    detail: '2025.08.10 · 1일 2회, 5일분',
    icon: 'medkit-outline',
  },
  {
    id: 'advocate',
    name: '애드보킷',
    type: '구충제',
    detail: '2025.08.01 · 월 1회 정기',
    icon: 'calendar-outline',
  },
  {
    id: 'ointment',
    name: '피부 연고',
    type: '외용',
    detail: '2025.07.22 · 환부 1일 2회 도포',
    icon: 'bandage-outline',
  },
];

export default function MedicalRecordsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <Header title="병원 기록" />

      <ScrollView contentContainerClassName="gap-4 px-5 pt-2 pb-8">
        {/* 반려견 프로필 + 담당(제휴) 병원 */}
        <View
          className="flex-row items-center gap-3 rounded-2xl bg-paper-card p-4"
          style={CARD_SHADOW}
        >
          <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <Ionicons name="paw" size={26} color="#d9a50f" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-ink">{MOCK_PET.name}</Text>
            <Text className="text-xs text-ink-muted">
              {MOCK_PET.breed} · {MOCK_PET.age}세 · {MOCK_PET.weight}kg
            </Text>
          </View>
          <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1.5">
            <Ionicons name="business-outline" size={13} color="#854f0b" />
            <Text className="text-xs font-semibold text-[#854f0b]">{MOCK_PET.hospital}</Text>
          </View>
        </View>

        {/* 예방접종 기록 */}
        <View className="gap-2.5">
          <Text className="pl-0.5 text-sm font-semibold text-ink">예방접종 기록</Text>
          <View className="rounded-2xl bg-paper-card px-4" style={CARD_SHADOW}>
            {VACCINATIONS.map((vaccine, index) => {
              const done = vaccine.status === 'DONE';
              return (
                <View key={vaccine.id}>
                  {index > 0 && <Divider />}
                  <View className="flex-row items-center gap-3 py-3">
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${done ? 'bg-green-50' : 'bg-amber-50'}`}
                    >
                      <Ionicons name="medical" size={18} color={done ? '#3b6d11' : '#854f0b'} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-ink">{vaccine.name}</Text>
                      <Text className="text-xs text-ink-muted">{vaccine.date}</Text>
                    </View>
                    <View
                      className={`rounded-full px-2 py-0.5 ${done ? 'bg-green-50' : 'bg-amber-50'}`}
                    >
                      <Text
                        className={`text-xs font-semibold ${done ? 'text-green-700' : 'text-amber-700'}`}
                      >
                        {done ? '완료' : '예정'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 처방 · 투약 기록 */}
        <View className="gap-2.5">
          <Text className="pl-0.5 text-sm font-semibold text-ink">처방 · 투약 기록</Text>
          <View className="rounded-2xl bg-paper-card px-4" style={CARD_SHADOW}>
            {PRESCRIPTIONS.map((item, index) => (
              <View key={item.id}>
                {index > 0 && <Divider />}
                <Pressable
                  className="flex-row items-center gap-3 py-3"
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-50">
                    <Ionicons name={item.icon} size={18} color="#d9a50f" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-ink">
                      {item.name} <Text className="text-xs text-ink-muted">{item.type}</Text>
                    </Text>
                    <Text className="text-xs text-ink-muted">{item.detail}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#c3bcae" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title }: { title: string }) {
  return (
    <View className="relative h-14 flex-row items-center justify-center px-5">
      <Pressable
        onPress={() => router.back()}
        className="absolute left-5 h-10 w-10 items-center justify-center rounded-full active:bg-black/5"
        hitSlop={8}
      >
        <Text className="text-2xl text-ink">‹</Text>
      </Pressable>
      <Text className="text-lg font-bold text-ink">{title}</Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-ink-line" />;
}
