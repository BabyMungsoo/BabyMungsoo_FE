import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api';
import type { LoginRequest, SignupRequest } from '@/types';

export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupRequest) => authApi.signup(body),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
  });
}
