import { Text, View } from 'react-native';
import { passwordRules } from '@/lib/password';
export default function PasswordRequirements({
  password,
  confirmation,
}: {
  password: string;
  confirmation?: string;
}) {
  const rules = passwordRules(password);
  if (confirmation !== undefined)
    rules.push({
      label: '비밀번호 확인 일치',
      valid: password.length > 0 && password === confirmation,
    });
  return (
    <View className="gap-1">
      {rules.map((rule) => (
        <Text
          key={rule.label}
          accessibilityLabel={rule.label + (rule.valid ? ': 충족' : ': 미충족')}
          className={rule.valid ? 'text-xs text-green-600' : 'text-xs text-gray-300'}
        >
          {rule.valid ? '✓' : '○'} {rule.label}
        </Text>
      ))}
    </View>
  );
}
