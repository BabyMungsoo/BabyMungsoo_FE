import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessionStore } from '@/stores/use-session-store';
import { useThemeColors } from '@/stores/use-theme-store';

/** 아이콘 + 라벨이 눌리지 않고 들어가는 최소 높이. 여기에 하단 인셋을 더해 씁니다. */
const TAB_BAR_CONTENT_HEIGHT = 62;

/**
 * 탭 아이콘은 벡터(Ionicons)로 그립니다. 예전 PNG 는 20px 남짓이라 고밀도 화면에서 흐려졌습니다.
 * 선택된 탭은 채운 아이콘, 나머지는 외곽선 아이콘으로 구분합니다.
 */
type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IconName, inactive: IconName) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? active : inactive} size={24} color={color} />;
  }
  return TabIcon;
}

export default function TabLayout() {
  // 높이를 직접 지정하면 react-navigation 이 넣어 주던 하단 인셋이 사라져서
  // 홈 인디케이터가 있는 기기에서 라벨이 가려집니다. 그래서 직접 더해 줍니다.
  const insets = useSafeAreaInsets();
  // 웹은 하단 인셋이 0이라 라벨이 화면 끝에 붙어 잘린다. 최소 12px를 보장한다.
  const bottomInset = Math.max(insets.bottom, 12);
  const colors = useThemeColors();
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  // 새로고침하면 루트 레이아웃이 저장된 세션을 비동기로 복원합니다. 그 전에 탭 화면을 그리면
  // 토큰 없이 API 를 불러 401 이 나서 로그인이 풀린 것처럼 보이므로, 복원이 끝날 때까지 기다립니다.
  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator />
      </View>
    );
  }
  // '로그인 상태 유지'를 안 했거나 로그아웃한 상태로 탭 주소에 바로 들어오면 로그인으로 보냅니다.
  if (!accessToken) return <Redirect href="/login" />;

  return (
    <Tabs
      /**
       * 기본값(firstRoute)이면 탭 화면에서 뒤로가기를 누를 때 무조건 첫 탭(홈)으로 튑니다.
       * 병원 찾기·추가 문진처럼 href: null 로 숨겨 둔 화면은 다른 탭에서 밀고 들어오는데,
       * 거기서 뒤로가기를 누르면 왔던 화면(예: 분석기록 상세)이 아니라 홈이 나옵니다.
       * history 로 두면 직전에 있던 탭의, 그 탭이 보고 있던 화면으로 돌아갑니다.
       */
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkSoft,
        // 탭 화면 사이 전환 때 비치는 배경도 테마를 따라가게 합니다
        sceneStyle: { backgroundColor: colors.paper },
        tabBarStyle: {
          backgroundColor: colors.paperCard,
          borderTopColor: colors.inkLine,
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
        },
        // 한글은 라틴보다 글자 상자가 커서 lineHeight 를 안 주면 받침이 잘립니다.
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', lineHeight: 17 },
        tabBarIconStyle: { marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: tabIcon('home', 'home-outline'),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '분석기록',
          tabBarIcon: tabIcon('document-text', 'document-text-outline'),
        }}
      />
      {/* 9번 병원 찾기는 탭이 아니라 7번 상세에서 들어오는 화면입니다.
          (tabs) 안에 둬야 하단 탭바가 그대로 남고, href: null 로 탭 목록에서만 뺍니다. */}
      <Tabs.Screen name="hospitals" options={{ href: null }} />

      {/*
        분석 진행·결과(8·4번)는 홈에서 넘어가는 화면이라 탭바에는 띄우지 않습니다.
        href 를 null 로 두지 않으면 expo-router 가 폴더를 보고 탭을 하나 더 만듭니다.
      */}
      <Tabs.Screen name="analysis" options={{ href: null }} />

      {/* 5번 재구성 — 제휴 병원 진료·처방 기록 화면. 탭이 아니라 다른 화면에서 들어옵니다 (담당: 윤선) */}
      <Tabs.Screen name="medical-records" options={{ href: null }} />

      <Tabs.Screen
        name="my-page"
        options={{
          title: '마이페이지',
          tabBarIcon: tabIcon('person', 'person-outline'),
        }}
      />

      {/* 11·12번 알림 설정 / 고객센터는 마이페이지에서 들어가는 화면이라 탭 목록에는 안 띄웁니다. */}
      <Tabs.Screen name="notification-settings" options={{ href: null }} />
      <Tabs.Screen name="customer-center" options={{ href: null }} />
      <Tabs.Screen name="pet-profile" options={{ href: null }} />
      <Tabs.Screen name="my-info" options={{ href: null }} />
      <Tabs.Screen name="app-info" options={{ href: null }} />
      <Tabs.Screen name="favorite-hospitals" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="inquiries" options={{ href: null }} />
    </Tabs>
  );
}
