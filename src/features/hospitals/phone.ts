import { Linking } from 'react-native';

import { isMissing } from '@/types';

/**
 * 병원 전화번호로 전화를 겁니다. 하이픈·공백이 섞여 있어도 걸리도록 숫자와 + 만 남깁니다.
 *
 * 시뮬레이터나 셀룰러 없는 기기에서는 tel: 을 못 열어 거부되는데, 그때 unhandled rejection 이
 * 뜨지 않게 삼킵니다. 버튼 쪽에서 phone 이 비었으면 아예 비활성화하므로 여기서는 검사만 합니다.
 */
export function callHospital(phone: string | null | undefined): void {
  if (isMissing(phone)) return;
  Linking.openURL(`tel:${phone!.replace(/[^0-9+]/g, '')}`).catch(() => {});
}
