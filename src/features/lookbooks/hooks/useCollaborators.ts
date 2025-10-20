import { useEffect, useState } from 'react';
import { subscribeToCollaborators } from '../services/collaboratorService';
import { useLookbooksStore } from '../lib/lookbooksStore';

/**
 * Hook to subscribe to collaborators for a canvas
 * Fix #2: Canvas-specific state to prevent global pollution
 */
export function useCollaborators(canvasId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { collaboratorsByCanvas, setCollaborators } = useLookbooksStore();
  
  // Get collaborators for this specific canvas
  const collaborators = canvasId ? (collaboratorsByCanvas[canvasId] ?? []) : [];

  useEffect(() => {
    if (!canvasId) {
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollaborators(
      canvasId,
      (newCollaborators) => {
        setCollaborators(canvasId, newCollaborators);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      // Clear only this canvas's collaborators on cleanup
      if (canvasId) {
        setCollaborators(canvasId, []);
      }
    };
  }, [canvasId, setCollaborators]);

  return {
    collaborators,
    loading,
    error,
  };
}

