import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE = '#2e2a24';
const INACTIVE = '#b5afa3';

/** 아이콘 + 라벨이 눌리지 않고 들어가는 최소 높이. 여기에 하단 인셋을 더해 씁니다. */
const TAB_BAR_CONTENT_HEIGHT = 56;

export default function TabLayout() {
  // 높이를 직접 지정하면 react-navigation 이 넣어 주던 하단 인셋이 사라져서
  // 홈 인디케이터가 있는 기기에서 라벨이 가려집니다. 그래서 직접 더해 줍니다.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e8e4db',
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
        },
        // 한글은 라틴보다 글자 상자가 커서 lineHeight 를 안 주면 받침이 잘립니다.
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', lineHeight: 15 },
        tabBarIconStyle: { marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '분석기록',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      {/*
        분석 진행·결과(8·4번)는 홈에서 넘어가는 화면이라 탭바에는 띄우지 않습니다.
        href 를 null 로 두지 않으면 expo-router 가 폴더를 보고 탭을 하나 더 만듭니다.
      */}
      <Tabs.Screen name="analysis" options={{ href: null }} />
      <Tabs.Screen
        name="my-page"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
