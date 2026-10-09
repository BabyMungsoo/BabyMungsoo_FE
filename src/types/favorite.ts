import type { IsoDateTime } from './common';
import type { Hospital } from './hospital';

/**
 * 즐겨찾는 병원 한 건.
 *
 * 목록 화면이 병원 상세를 다시 조회하지 않고 바로 그리도록 병원 정보를 함께 담습니다.
 * 백엔드 API 가 생기면 응답도 같은 모양(병원 + 등록 시각)으로 맞추는 것을 전제로 합니다.
 */
export interface FavoriteHospital {
  hospital: Hospital;
  createdAt: IsoDateTime;
}

export interface FavoriteHospitalRepository {
  /** 최근에 추가한 순 */
  list(): Promise<FavoriteHospital[]>;
  /** 이미 있으면 그대로 둡니다 */
  add(hospital: Hospital): Promise<void>;
  remove(hospitalId: number): Promise<void>;
}
