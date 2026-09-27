export function ageFromBirthDate(value: string, today = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900) return null;
  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day ||
    birth > today
  )
    return null;
  let age = today.getFullYear() - year;
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day))
    age--;
  return age;
}
export function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join('-');
}

export function petAgeLabel(age: number, birthDate?: string | null, today = new Date()): string {
  if (!birthDate || ageFromBirthDate(birthDate, today) === null)
    return age === 0 ? '1세 미만' : age + '세';
  const years = ageFromBirthDate(birthDate, today)!;
  if (years > 0) return years + '세';
  const [year, month, day] = birthDate.split('-').map(Number);
  const months =
    (today.getFullYear() - year) * 12 +
    today.getMonth() -
    (month - 1) -
    (today.getDate() < day ? 1 : 0);
  return months <= 0 ? '1개월 미만' : months + '개월';
}
