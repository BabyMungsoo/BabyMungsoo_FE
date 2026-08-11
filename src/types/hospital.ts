import type { IsoDateTime } from './common';

/** HospitalResponseDto */
export interface Hospital {
  hospitalId: number;
  hospitalName: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  is24hour: boolean;
  openHours: string | null;
  rating: number | null;
  lastUpdated: IsoDateTime | null;
}

/** GET /api/v1/hospitals/recommend 쿼리 파라미터 */
export interface HospitalRecommendParams {
  lat: number;
  lng: number;
  /** 응급도 (IMMEDIATE / WATCH / NORMAL) */
  level: string;
}
