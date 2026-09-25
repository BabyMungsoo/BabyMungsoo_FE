import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '@/api';
import { queryClient } from '@/lib/query-client';
import { useSessionStore } from '@/stores/use-session-store';
import { usePetStore } from '@/stores/use-pet-store';
import { useSignupStore } from '@/stores/use-signup-store';
export async function clearLocalSession() {
  await AsyncStorage.multiRemove(['accessToken', 'userId', 'email', 'name']);
  setAuthToken(null);
  useSessionStore.getState().clearSession();
  usePetStore.getState().selectPet(null);
  useSignupStore.getState().clearSignupDraft();
  await queryClient.cancelQueries();
  queryClient.clear();
}
