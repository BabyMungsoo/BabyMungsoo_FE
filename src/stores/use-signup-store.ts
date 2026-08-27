import { create } from 'zustand';

interface SignupDraft {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface SignupDraftState {
  signupDraft: SignupDraft | null;
  setSignupDraft: (draft: SignupDraft) => void;
  clearSignupDraft: () => void;
}

export const useSignupStore = create<SignupDraftState>((set) => ({
  signupDraft: null,

  setSignupDraft: (draft) =>
    set({
      signupDraft: draft,
    }),

  clearSignupDraft: () =>
    set({
      signupDraft: null,
    }),
}));
