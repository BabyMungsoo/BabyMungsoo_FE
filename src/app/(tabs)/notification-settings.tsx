import { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  NotificationSettingsView,
  type NotificationSettings,
} from '@/features/my-page/components/notification-settings-view';

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  analysisResult: true,
  hospitalRecommend: true,
  preventionInfo: true,
  eventBenefit: false,
  darkMode: false,
};

/** 11번 — 알림 설정. 저장 API 가 없어 화면 안 상태만 바뀝니다. */
export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  function handleSave() {
    Alert.alert('저장했어요', '아직 저장 API 연동 전이라 화면에만 반영돼요.');
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <NotificationSettingsView settings={settings} onChange={setSettings} onSave={handleSave} />
    </SafeAreaView>
  );
}
