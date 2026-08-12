import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import type { AnalysisRecord, Page, Report } from '@/types';

import { MOCK_HOSPITALS, MOCK_PETS, MOCK_RECORDS, MOCK_REPORTS } from './fixtures';

/**
 * 백엔드 없이 화면을 보기 위한 가짜 axios 어댑터입니다.
 *
 * 어댑터 자리에서 갈아끼우기 때문에 화면·훅·api 모듈은 전혀 손대지 않아도 되고,
 * 연동이 끝나면 EXPO_PUBLIC_USE_MOCK 만 끄면(또는 이 폴더를 지우면) 원래대로 돌아갑니다.
 */

/** 목록은 서버와 같게 createdAt 내림차순으로 돌려줍니다 */
const records: AnalysisRecord[] = [...MOCK_RECORDS].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);
const reports: Report[] = [...MOCK_REPORTS];

/** 새로 만든 기록에 붙일 다음 id */
let nextRecordId = Math.max(...records.map((record) => record.recordId)) + 1;
let nextReportId = Math.max(...reports.map((report) => report.reportId)) + 1;

interface MockResult {
  status: number;
  data: unknown;
}

function ok(data: unknown): MockResult {
  return { status: 200, data };
}

function notFound(message: string): MockResult {
  return { status: 404, data: { message } };
}

function page<T>(content: T[]): Page<T> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    size: content.length,
    number: 0,
    numberOfElements: content.length,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

/** '2026-08-12T00:05:35' 형태 — 백엔드 LocalDateTime 과 같은 모양 */
function now(): string {
  return new Date().toISOString().slice(0, 19);
}

function handle(method: string, path: string, body: unknown): MockResult {
  // ---- 분석 기록 ----
  if (method === 'get' && path === '/records') {
    return ok(records);
  }

  if (method === 'post' && path === '/records') {
    const input = (body ?? {}) as Partial<AnalysisRecord>;
    const created: AnalysisRecord = {
      recordId: nextRecordId++,
      userId: input.userId ?? 1,
      dogId: input.dogId ?? 1,
      symptomText: input.symptomText ?? '',
      aiResult: input.aiResult ?? '',
      emergencyLevel: input.emergencyLevel ?? 'NORMAL',
      suspectedDisease: input.suspectedDisease ?? null,
      aiGuide: input.aiGuide ?? null,
      createdAt: now(),
    };
    records.unshift(created);
    return { status: 201, data: created };
  }

  const recordIdMatch = /^\/records\/(\d+)$/.exec(path);
  if (recordIdMatch) {
    const recordId = Number(recordIdMatch[1]);
    const index = records.findIndex((record) => record.recordId === recordId);
    if (index === -1) return notFound('존재하지 않는 분석 기록입니다.');

    if (method === 'delete') {
      records.splice(index, 1);
      return { status: 204, data: null };
    }
    return ok(records[index]);
  }

  // ---- 리포트 ----
  if (method === 'post' && path === '/reports') {
    const input = (body ?? {}) as Partial<Report>;
    if (reports.some((report) => report.recordId === input.recordId)) {
      return { status: 409, data: { message: '이미 리포트가 생성된 기록입니다.' } };
    }
    const created: Report = {
      reportId: nextReportId++,
      recordId: input.recordId ?? 0,
      hospitalId: input.hospitalId ?? 0,
      reportContent: input.reportContent ?? '',
      emergencyLevel: input.emergencyLevel ?? 'NORMAL',
      createdAt: now(),
    };
    reports.push(created);
    return { status: 201, data: created };
  }

  const reportByRecord = /^\/reports\/record\/(\d+)$/.exec(path);
  if (method === 'get' && reportByRecord) {
    const found = reports.find((report) => report.recordId === Number(reportByRecord[1]));
    return found ? ok(found) : notFound('해당 기록의 리포트가 없습니다.');
  }

  const reportByHospital = /^\/reports\/hospital\/(\d+)$/.exec(path);
  if (method === 'get' && reportByHospital) {
    const hospitalId = Number(reportByHospital[1]);
    return ok(page(reports.filter((report) => report.hospitalId === hospitalId)));
  }

  const reportById = /^\/reports\/(\d+)$/.exec(path);
  if (method === 'get' && reportById) {
    const found = reports.find((report) => report.reportId === Number(reportById[1]));
    return found ? ok(found) : notFound('존재하지 않는 리포트입니다.');
  }

  // ---- 병원 ----
  if (method === 'get' && path === '/hospitals') return ok(MOCK_HOSPITALS);

  if (method === 'get' && path === '/hospitals/recommend') {
    // 실제 서버는 거리·응급도로 정렬하지만, 목에서는 평점 높은 순으로 돌려줍니다
    return ok([...MOCK_HOSPITALS].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)));
  }

  const hospitalById = /^\/hospitals\/(\d+)$/.exec(path);
  if (method === 'get' && hospitalById) {
    const found = MOCK_HOSPITALS.find((h) => h.hospitalId === Number(hospitalById[1]));
    return found ? ok(found) : notFound('존재하지 않는 병원입니다.');
  }

  // ---- 반려동물 (홈 화면 확인용) ----
  if (method === 'get' && path === '/pets') return ok(MOCK_PETS);

  const petById = /^\/pets\/(\d+)$/.exec(path);
  if (method === 'get' && petById) {
    const found = MOCK_PETS.find((pet) => pet.petId === Number(petById[1]));
    return found ? ok(found) : notFound('존재하지 않는 반려동물입니다.');
  }

  return notFound(`목 데이터에 없는 요청입니다: ${method.toUpperCase()} ${path}`);
}

/** 로딩 상태가 보이도록 살짝 지연시킵니다 */
const DELAY_MS = 300;

export const mockAdapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? 'get').toLowerCase();
  const path = (config.url ?? '').split('?')[0].replace(/\/$/, '') || '/';
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;

  const result = handle(method, path, body);

  const response: AxiosResponse = {
    data: result.data,
    status: result.status,
    statusText: '',
    headers: {},
    config,
  };

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (result.status >= 400) {
        const error = new Error(
          (result.data as { message?: string })?.message ?? '요청을 처리하지 못했습니다.',
        ) as Error & { response?: AxiosResponse; isAxiosError?: boolean };
        error.isAxiosError = true;
        error.response = response;
        reject(error);
        return;
      }
      resolve(response);
    }, DELAY_MS);
  });
};
