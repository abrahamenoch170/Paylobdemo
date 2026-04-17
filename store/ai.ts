import { create } from 'zustand';

interface AiStore {
  isOpen: boolean;
  openAi: () => void;
  closeAi: () => void;
}

export const useAiStore = create<AiStore>((set) => ({
  isOpen: false,
  openAi: () => set({ isOpen: true }),
  closeAi: () => set({ isOpen: false }),
}));
