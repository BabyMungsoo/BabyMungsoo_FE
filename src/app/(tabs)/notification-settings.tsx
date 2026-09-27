import { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  NotificationSettingsView,
  type NotificationSettings,
} from '@/features/my-page/components/notification-settings-view';
import { useThemeStore } from '@/stores/use-theme-store';

const DEFAULT_SETTINGS: Omit<NotificationSettings, 'darkMode'> = {
  pushEnabled: true,
  analysisResult: true,
  hospitalRecommend: true,
  preventionInfo: true,
  eventBenefit: false,
};

/**
 * 11번 — 알림 설정.
 * 다크 모드는 누르는 즉시 적용되고 기기에 저장됩니다.
 * 알림 항목은 저장 API 가 없어 화면 안 상태만 바뀝니다.
 */
export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const isDark = useThemeStore((state) => state.isDark);
  const setDark = useThemeStore((state) => state.setDark);

  function handleChange({ darkMode, ...rest }: NotificationSettings) {
    setSettings(rest);
    if (darkMode !== isDark) setDark(darkMode);
  }

  function handleSave() {
    Alert.alert(
      '저장했어요',
      '다크 모드는 바로 적용돼요. 알림 항목은 아직 저장 API 연동 전이라 화면에만 반영돼요.',
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <NotificationSettingsView
        settings={{ ...settings, darkMode: isDark }}
        onChange={handleChange}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}
