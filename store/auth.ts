import { create } from 'zustand';

interface AuthStore {
  role: 'client' | 'freelancer' | 'admin' | null;
  setRole: (role: AuthStore['role']) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));
