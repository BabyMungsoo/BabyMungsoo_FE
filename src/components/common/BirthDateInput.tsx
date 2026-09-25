import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ageFromBirthDate, formatBirthDate } from '@/lib/pet-age';
export default function BirthDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [years, setYears] = useState(false);
  const year = month.getFullYear(),
    m = month.getMonth();
  const offset = new Date(year, m, 1).getDay();
  const days = new Date(year, m + 1, 0).getDate();
  const launch = () => {
    if (ageFromBirthDate(value) !== null) {
      const [y, mon] = value.split('-').map(Number);
      setMonth(new Date(y, mon - 1, 1));
    }
    setYears(false);
    setOpen(true);
  };
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-slate-700">생년월일</Text>
      <View className="h-12 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
        <TextInput
          accessibilityLabel="생년월일"
          value={value}
          onChangeText={(text) => onChange(formatBirthDate(text))}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#64748b"
          keyboardType="number-pad"
          maxLength={10}
          className="h-full flex-1 text-sm text-slate-900"
        />
        <Pressable
          accessibilityLabel="달력에서 생년월일 선택"
          onPress={launch}
          className="h-11 w-11 items-center justify-center"
        >
          <Ionicons name="calendar-outline" size={22} color="#334155" />
        </Pressable>
      </View>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/30 px-5">
          <Pressable
            style={{ position: 'absolute', inset: 0 }}
            accessibilityLabel="달력 닫기"
            onPress={() => setOpen(false)}
          />
          <View className="w-full max-w-[360px] rounded-2xl bg-white p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-bold text-slate-900">생년월일 선택</Text>
              <Pressable
                accessibilityLabel="닫기"
                onPress={() => setOpen(false)}
                className="h-10 w-10 items-center justify-center"
              >
                <Ionicons name="close" size={22} color="#334155" />
              </Pressable>
            </View>
            <View className="mb-3 flex-row items-center justify-between">
              <Pressable
                accessibilityLabel="이전 달"
                onPress={() => setMonth(new Date(year, m - 1, 1))}
                className="h-11 w-11 items-center justify-center"
              >
                <Ionicons name="chevron-back" size={20} />
              </Pressable>
              <Pressable
                accessibilityLabel="연도 선택"
                onPress={() => setYears(!years)}
                className="p-3"
              >
                <Text className="font-semibold text-slate-900">
                  {year}년 {m + 1}월 ▾
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="다음 달"
                disabled={year === today.getFullYear() && m >= today.getMonth()}
                onPress={() => setMonth(new Date(year, m + 1, 1))}
                className="h-11 w-11 items-center justify-center"
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    year === today.getFullYear() && m >= today.getMonth() ? '#cbd5e1' : '#334155'
                  }
                />
              </Pressable>
            </View>
            {years ? (
              <ScrollView style={{ height: 280 }}>
                <View className="flex-row flex-wrap">
                  {Array.from(
                    { length: today.getFullYear() - 1899 },
                    (_, i) => today.getFullYear() - i,
                  ).map((y) => (
                    <Pressable
                      key={y}
                      onPress={() => {
                        setMonth(
                          new Date(
                            y,
                            y === today.getFullYear() ? Math.min(m, today.getMonth()) : m,
                            1,
                          ),
                        );
                        setYears(false);
                      }}
                      style={{ width: '33.333%' }}
                      className="items-center p-4"
                    >
                      <Text className="text-slate-800">{y}년</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <>
                <View className="flex-row">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <Text
                      key={day}
                      style={{ width: '14.285%' }}
                      className="py-2 text-center text-xs text-slate-500"
                    >
                      {day}
                    </Text>
                  ))}
                </View>
                <View className="flex-row flex-wrap">
                  {Array.from({ length: offset + days }, (_, i) => {
                    const day = i - offset + 1;
                    const date =
                      year +
                      '-' +
                      String(m + 1).padStart(2, '0') +
                      '-' +
                      String(day).padStart(2, '0');
                    const disabled = day < 1 || new Date(year, m, day) > today;
                    return (
                      <Pressable
                        key={i}
                        accessibilityLabel={day > 0 ? date : undefined}
                        disabled={disabled}
                        onPress={() => {
                          onChange(date);
                          setOpen(false);
                        }}
                        style={{
                          width: '14.285%',
                          height: 42,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 10,
                          backgroundColor: value === date ? '#334155' : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            color: value === date ? '#fff' : disabled ? '#cbd5e1' : '#1e293b',
                          }}
                        >
                          {day > 0 ? day : ''}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
