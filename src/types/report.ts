import type { IsoDateTime } from './common';

/** ReportResponseDto */
export interface Report {
  reportId: number;
  recordId: number;
  hospitalId: number;
  reportContent: string;
  emergencyLevel: string;
  createdAt: IsoDateTime;
}

/** POST /api/v1/reports */
export interface ReportCreateRequest {
  recordId: number;
  hospitalId: number;
  reportContent: string;
  emergencyLevel: string;
}
