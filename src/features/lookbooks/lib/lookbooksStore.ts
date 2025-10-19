import { create } from 'zustand';
import { Lookbook } from '../types';

interface LookbooksState {
  // State
  lookbooks: Lookbook[];
  currentLookbook: Lookbook | null;
  loading: boolean;
  error: string | null;

  // Actions
  setLookbooks: (lookbooks: Lookbook[]) => void;
  setCurrentLookbook: (lookbook: Lookbook | null) => void;
  addLookbook: (lookbook: Lookbook) => void;
  updateLookbook: (id: string, updates: Partial<Lookbook>) => void;
  removeLookbook: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLookbooksStore = create<LookbooksState>((set) => ({
  // Initial state
  lookbooks: [],
  currentLookbook: null,
  loading: false,
  error: null,

  // Actions
  setLookbooks: (lookbooks) => set({ lookbooks }),
  
  setCurrentLookbook: (lookbook) => set({ currentLookbook: lookbook }),
  
  addLookbook: (lookbook) =>
    set((state) => ({ lookbooks: [lookbook, ...state.lookbooks] })),
  
  updateLookbook: (id, updates) =>
    set((state) => ({
      lookbooks: state.lookbooks.map((lb) =>
        lb.id === id ? { ...lb, ...updates } : lb
      ),
      currentLookbook:
        state.currentLookbook?.id === id
          ? { ...state.currentLookbook, ...updates }
          : state.currentLookbook,
    })),
  
  removeLookbook: (id) =>
    set((state) => ({
      lookbooks: state.lookbooks.filter((lb) => lb.id !== id),
      currentLookbook:
        state.currentLookbook?.id === id ? null : state.currentLookbook,
    })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}));

