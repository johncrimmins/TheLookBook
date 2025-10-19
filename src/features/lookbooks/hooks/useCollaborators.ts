import { useEffect, useState } from 'react';
import { subscribeToCollaborators } from '../services/collaboratorService';
import { useLookbooksStore } from '../lib/lookbooksStore';

/**
 * Hook to subscribe to collaborators for a canvas
 */
export function useCollaborators(canvasId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { collaborators, setCollaborators } = useLookbooksStore();

  useEffect(() => {
    if (!canvasId) {
      setCollaborators([]);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollaborators(
      canvasId,
      (newCollaborators) => {
        setCollaborators(newCollaborators);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      setCollaborators([]);
    };
  }, [canvasId, setCollaborators]);

  return {
    collaborators,
    loading,
    error,
  };
}

