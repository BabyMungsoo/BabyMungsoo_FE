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
  name: string;
}
export interface PasswordResetTokenResponse {
  /** 이메일·이름이 일치하면 바로 받는 일회용 토큰 (15분 유효, 1회용) */
  resetToken: string;
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
  async requestReset(body: PasswordResetRequest): Promise<string> {
    const { data } = await api.post<PasswordResetTokenResponse>(
      '/auth/password-reset/request',
      body,
    );
    return data.resetToken;
  },
  async confirmReset(body: PasswordResetConfirmRequest): Promise<void> {
    await api.post('/auth/password-reset/confirm', body);
  },
};
