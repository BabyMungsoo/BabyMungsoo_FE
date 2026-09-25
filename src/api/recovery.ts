import { api } from './client';

export interface FindIdRequest {
  name: string;
  phone: string;
}
export interface FindIdResponse {
  maskedEmails: string[];
}
export interface PasswordResetRequest {
  email: string;
}
export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export const recoveryApi = {
  async findId(body: FindIdRequest): Promise<FindIdResponse> {
    const { data } = await api.post<FindIdResponse>('/auth/find-id', body);
    return data;
  },
  async requestReset(body: PasswordResetRequest): Promise<void> {
    await api.post('/auth/password-reset/request', body);
  },
  async confirmReset(body: PasswordResetConfirmRequest): Promise<void> {
    await api.post('/auth/password-reset/confirm', body);
  },
};
