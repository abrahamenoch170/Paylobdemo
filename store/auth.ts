import { create } from 'zustand';

type Role = 'client' | 'freelancer' | null;

type AuthState = {
  role: Role;
  setRole: (role: Role) => void;
  clearRole: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  clearRole: () => set({ role: null }),
}));
