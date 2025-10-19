import { useMemo } from 'react';
import { useAuth } from '@/features/auth';
import { useCollaborators } from './useCollaborators';
import { Collaborator } from '../types';

/**
 * Hook to check if current user is owner of a canvas
 * Can accept pre-fetched collaborators to avoid duplicate subscriptions
 */
export function useIsOwner(
  canvasId: string | null,
  collaboratorsOverride?: Collaborator[]
): boolean {
  const { user } = useAuth();
  const { collaborators: fetchedCollaborators } = useCollaborators(
    collaboratorsOverride ? null : canvasId
  );

  const collaborators = collaboratorsOverride || fetchedCollaborators;

  const isOwner = useMemo(() => {
    if (!user || !canvasId || collaborators.length === 0) {
      return false;
    }

    const currentUserCollaborator = collaborators.find(
      (c) => c.userId === user.id
    );

    return currentUserCollaborator?.role === 'owner';
  }, [user, canvasId, collaborators]);

  return isOwner;
}

