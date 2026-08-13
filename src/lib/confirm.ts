import { Alert, Platform } from 'react-native';

interface ConfirmOptions {
  title: string;
  message?: string;
  /** 확인 버튼 문구 */
  confirmLabel?: string;
  /** 삭제처럼 되돌릴 수 없는 동작이면 true — 확인 버튼이 빨갛게 표시됩니다 */
  destructive?: boolean;
}

/**
 * 확인 다이얼로그. 사용자가 확인을 누르면 true 를 돌려줍니다.
 *
 * react-native 의 Alert 는 웹에서 동작하지 않아서(react-native-web 미구현),
 * 웹에서는 브라우저 confirm 을 씁니다.
 */
export function confirm({
  title,
  message,
  confirmLabel = '확인',
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(window.confirm(text));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: '취소', style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
