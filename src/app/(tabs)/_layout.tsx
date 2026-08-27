import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE = '#2e2a24';
const INACTIVE = '#b5afa3';

/** 아이콘 + 라벨이 눌리지 않고 들어가는 최소 높이. 여기에 하단 인셋을 더해 씁니다. */
const TAB_BAR_CONTENT_HEIGHT = 62;

// 피그마에서 내보낸 탭 아이콘(단색 실루엣). tintColor 로 활성/비활성 색을 입힌다.
const HOME_ICON = require('../../../assets/images/tab-bar/home.png');
const RECORDS_ICON = require('../../../assets/images/tab-bar/document.png');
const MY_PAGE_ICON = require('../../../assets/images/tab-bar/profile.png');

export default function TabLayout() {
  // 높이를 직접 지정하면 react-navigation 이 넣어 주던 하단 인셋이 사라져서
  // 홈 인디케이터가 있는 기기에서 라벨이 가려집니다. 그래서 직접 더해 줍니다.
  const insets = useSafeAreaInsets();
  // 웹은 하단 인셋이 0이라 라벨이 화면 끝에 붙어 잘린다. 최소 12px를 보장한다.
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e8e4db',
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
          tabBarIcon: ({ color }) => (
            <Image
              source={HOME_ICON}
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '분석기록',
          tabBarIcon: ({ color }) => (
            <Image
              source={RECORDS_ICON}
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          ),
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

      {/* 5번 건강 가이드/AI 진단 — 탭이 아니라 홈에서 들어오는 화면 (담당: 윤선) */}
      <Tabs.Screen name="health-guide" options={{ href: null }} />

      <Tabs.Screen
        name="my-page"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ color }) => (
            <Image
              source={MY_PAGE_ICON}
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* 11·12번 알림 설정 / 고객센터는 마이페이지에서 들어가는 화면이라 탭 목록에는 안 띄웁니다. */}
      <Tabs.Screen name="notification-settings" options={{ href: null }} />
      <Tabs.Screen name="customer-center" options={{ href: null }} />
      <Tabs.Screen name="pet-profile" options={{ href: null }} />
      <Tabs.Screen name="my-info" options={{ href: null }} />
    </Tabs>
  );
}
