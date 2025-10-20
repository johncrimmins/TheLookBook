import { create } from 'zustand';
import { Lookbook, Collaborator, Role } from '../types';

interface LookbooksState {
  // State
  lookbooks: Lookbook[];
  currentLookbook: Lookbook | null;
  loading: boolean;
  error: string | null;
  
  // Feature 9: Collaboration state (canvas-keyed to prevent global pollution - Fix #2)
  collaboratorsByCanvas: Record<string, Collaborator[]>;
  currentUserRole: Role | null;

  // Actions
  setLookbooks: (lookbooks: Lookbook[]) => void;
  setCurrentLookbook: (lookbook: Lookbook | null) => void;
  addLookbook: (lookbook: Lookbook) => void;
  updateLookbook: (id: string, updates: Partial<Lookbook>) => void;
  removeLookbook: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Feature 9: Collaboration actions (canvas-specific - Fix #2)
  setCollaborators: (canvasId: string, collaborators: Collaborator[]) => void;
  addCollaboratorToState: (canvasId: string, collaborator: Collaborator) => void;
  removeCollaboratorFromState: (canvasId: string, userId: string) => void;
  setCurrentUserRole: (role: Role | null) => void;
}

export const useLookbooksStore = create<LookbooksState>((set) => ({
  // Initial state
  lookbooks: [],
  currentLookbook: null,
  loading: false,
  error: null,
  collaboratorsByCanvas: {},
  currentUserRole: null,

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
  
  // Feature 9: Collaboration actions (canvas-specific to prevent state pollution - Fix #2)
  setCollaborators: (canvasId, collaborators) =>
    set((state) => ({
      collaboratorsByCanvas: {
        ...state.collaboratorsByCanvas,
        [canvasId]: collaborators,
      },
    })),
  
  addCollaboratorToState: (canvasId, collaborator) =>
    set((state) => ({
      collaboratorsByCanvas: {
        ...state.collaboratorsByCanvas,
        [canvasId]: [...(state.collaboratorsByCanvas[canvasId] || []), collaborator],
      },
    })),
  
  removeCollaboratorFromState: (canvasId, userId) =>
    set((state) => ({
      collaboratorsByCanvas: {
        ...state.collaboratorsByCanvas,
        [canvasId]: (state.collaboratorsByCanvas[canvasId] || []).filter(
          (c) => c.userId !== userId
        ),
      },
    })),
  
  setCurrentUserRole: (role) => set({ currentUserRole: role }),
}));

