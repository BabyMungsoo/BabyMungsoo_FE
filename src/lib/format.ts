/**
 * 백엔드 LocalDateTime 은 타임존 없이 '2024-05-21T14:30:00' 형태로 옵니다.
 * new Date() 로 파싱하면 기기 타임존에 따라 시간이 밀 수 있어서 문자열을 그대로 잘라 씁니다.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const matched = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(iso);
  if (!matched) return iso;
  const [, year, month, day, hour, minute] = matched;
  return `${year}.${month}.${day} ${hour}:${minute}`;
}
