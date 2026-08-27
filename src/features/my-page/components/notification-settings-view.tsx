import type { ReactNode } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ui/screen-header';

export interface NotificationSettings {
  pushEnabled: boolean;
  analysisResult: boolean;
  hospitalRecommend: boolean;
  preventionInfo: boolean;
  eventBenefit: boolean;
  darkMode: boolean;
}

interface NotificationSettingsViewProps {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  onSave: () => void;
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};
const TRACK_COLOR = { false: '#e8e4db', true: '#f4cb4a' };
const THUMB_COLOR = '#ffffff';

/** 11번 — 알림 설정. 저장 API 가 없어 화면 안에서만 토글이 바뀌고, 저장하기는 안내만 띄웁니다. */
export function NotificationSettingsView({
  settings,
  onChange,
  onSave,
}: NotificationSettingsViewProps) {
  function toggle<K extends keyof NotificationSettings>(key: K) {
    onChange({ ...settings, [key]: !settings[key] });
  }

  return (
    <>
      <ScreenHeader title="알림 설정" showBack backFallback="/my-page" />

      <ScrollView contentContainerClassName="gap-6 px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Section title="알림 수신">
          <SettingRow
            label="알림 받기"
            value={settings.pushEnabled}
            onValueChange={() => toggle('pushEnabled')}
          />
        </Section>

        <Section title="알림 항목">
          <SettingRow
            label="분석 결과 알림"
            value={settings.analysisResult}
            onValueChange={() => toggle('analysisResult')}
          />
          <SettingRow
            label="병원 추천 알림"
            value={settings.hospitalRecommend}
            onValueChange={() => toggle('hospitalRecommend')}
          />
          <SettingRow
            label="예방 정보 알림"
            value={settings.preventionInfo}
            onValueChange={() => toggle('preventionInfo')}
          />
          <SettingRow
            label="이벤트/혜택 알림"
            value={settings.eventBenefit}
            onValueChange={() => toggle('eventBenefit')}
          />
        </Section>

        <Section title="기타 설정">
          <SettingRow
            label="다크 모드"
            value={settings.darkMode}
            onValueChange={() => toggle('darkMode')}
          />
        </Section>

        <Pressable
          onPress={onSave}
          accessibilityRole="button"
          className="items-center rounded-2xl bg-brand-400 py-4 active:opacity-70"
        >
          <Text className="text-base font-bold text-brand-900">저장하기</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-bold text-ink-soft">{title}</Text>
      {children}
    </View>
  );
}

function SettingRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: () => void;
}) {
  return (
    <View
      className="flex-row items-center justify-between rounded-2xl bg-paper-card px-4 py-4"
      style={CARD_SHADOW}
    >
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={TRACK_COLOR}
        thumbColor={THUMB_COLOR}
      />
    </View>
  );
}
