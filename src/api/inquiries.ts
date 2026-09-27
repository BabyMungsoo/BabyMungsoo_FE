import AsyncStorage from '@react-native-async-storage/async-storage';

import { createLocalInquiryRepository } from '@/lib/inquiry-repository';
import { useSessionStore } from '@/stores/use-session-store';
import type { Inquiry, InquiryRepository } from '@/types/inquiry';

import { api } from './client';

// Explicit opt-in: missing API endpoints must not break the current app.
// TODO: align DTOs with docs/inquiries.md, then set EXPO_PUBLIC_INQUIRY_MODE=server.
// Never fall back to local data after a server authorization/network failure.
export const isInquiryMock = process.env.EXPO_PUBLIC_INQUIRY_MODE !== 'server';

const serverRepository: InquiryRepository = {
  async create(body) {
    return (await api.post<Inquiry>('/inquiries', body)).data;
  },
  async list() {
    return (await api.get<Inquiry[]>('/inquiries')).data;
  },
  async get(id) {
    return (await api.get<Inquiry>(`/inquiries/${encodeURIComponent(id)}`)).data;
  },
  async adminList() {
    return (await api.get<Inquiry[]>('/admin/inquiries')).data;
  },
  async adminGet(id) {
    return (await api.get<Inquiry>(`/admin/inquiries/${encodeURIComponent(id)}`)).data;
  },
  async answer(id, answer) {
    return (
      await api.patch<Inquiry>(`/admin/inquiries/${encodeURIComponent(id)}/answer`, { answer })
    ).data;
  },
};

export const inquiriesApi: InquiryRepository = isInquiryMock
  ? createLocalInquiryRepository(AsyncStorage, useSessionStore.getState)
  : serverRepository;
