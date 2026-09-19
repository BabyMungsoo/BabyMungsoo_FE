import { HOSPITAL_TAGS, type HospitalTag } from '@/types';

/** 시설 태그의 화면 라벨. 백엔드 enum 이름 그대로 보여주면 안 되니 여기서 한글로 바꿉니다. */
export const HOSPITAL_TAG_LABEL: Record<HospitalTag, string> = {
  MRI: 'MRI 보유',
  EMERGENCY_CENTER: '응급의료센터',
};

/** 서버가 준 태그 문자열 중 화면이 아는 것만 골라냅니다. 모르는 값은 조용히 버립니다. */
export function toHospitalTags(values: string[] | null | undefined): HospitalTag[] {
  if (!values) return [];
  return values.filter((value): value is HospitalTag =>
    (HOSPITAL_TAGS as readonly string[]).includes(value),
  );
}
