/**
 * 이름 뒤에 붙일 주제 조사 '은/는' 을 돌려줍니다. (몽수 → 는, 콩떡 → 은)
 * 한글이 아닌 글자로 끝나면 받침을 알 수 없어 '는' 을 씁니다.
 */
export function topicParticle(name: string): '은' | '는' {
  const code = name.charCodeAt(name.length - 1);
  const isHangul = code >= 0xac00 && code <= 0xd7a3;
  const hasFinalConsonant = isHangul && (code - 0xac00) % 28 !== 0;
  return hasFinalConsonant ? '은' : '는';
}

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
