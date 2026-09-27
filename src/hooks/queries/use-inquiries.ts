import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { inquiriesApi } from '@/api/inquiries';
import { useSessionStore } from '@/stores/use-session-store';
import type { CreateInquiryRequest } from '@/types/inquiry';

export function useInquiries(admin = false) {
  const { userId, accessToken, role } = useSessionStore();
  const enabled = userId != null && !!accessToken && (!admin || role === 'ADMIN');
  const query = useQuery({
    queryKey: ['inquiries', userId, role, admin ? 'admin' : 'mine'],
    queryFn: () => (admin ? inquiriesApi.adminList() : inquiriesApi.list()),
    enabled,
    retry: false,
  });
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (enabled) void refetch();
    }, [enabled, refetch]),
  );
  return query;
}

export function useInquiry(id: string, admin = false) {
  const { userId, accessToken, role } = useSessionStore();
  return useQuery({
    queryKey: ['inquiries', userId, role, admin ? 'admin' : 'mine', id],
    queryFn: () => (admin ? inquiriesApi.adminGet(id) : inquiriesApi.get(id)),
    enabled: !!id && userId != null && !!accessToken && (!admin || role === 'ADMIN'),
    retry: false,
  });
}

export function useCreateInquiry() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInquiryRequest) => inquiriesApi.create(body),
    onSuccess: () => client.invalidateQueries({ queryKey: ['inquiries'] }),
  });
}

export function useAnswerInquiry(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (answer: string) => inquiriesApi.answer(id, answer),
    onSuccess: async (item) => {
      const { userId, role } = useSessionStore.getState();
      client.setQueryData(['inquiries', userId, role, 'admin', id], item);
      await client.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });
}
