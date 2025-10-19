import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { useLookbooksStore } from '../lib/lookbooksStore';
import {
  createLookbook as createLookbookService,
  renameLookbook as renameLookbookService,
  deleteLookbook as deleteLookbookService,
  lookbookNameExists,
} from '../services/lookbooksService';
import { generateUniqueName, validateLookbookName } from '../lib/nameGenerator';
import { createDefaultLayer } from '@/features/objects/services/objectsService';

/**
 * Hook for Lookbook operations (create, rename, delete)
 */
export function useLookbookOperations() {
  const router = useRouter();
  const { user } = useAuth();
  const { addLookbook, updateLookbook, removeLookbook } = useLookbooksStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create a new Lookbook with auto-generated name
   */
  const createLookbook = async (): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsCreating(true);

    try {
      // Generate unique name
      const name = await generateUniqueName((name) =>
        lookbookNameExists(user.id, name)
      );

      // Create Lookbook
      const lookbook = await createLookbookService({
        name,
        ownerId: user.id,
      });

      // Add to store (optimistic)
      addLookbook(lookbook);

      // Create default layer
      await createDefaultLayer(lookbook.id);

      // Navigate to canvas
      router.push(`/canvas/${lookbook.id}`);
    } catch (error) {
      console.error('Failed to create Lookbook:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Rename a Lookbook
   */
  const renameLookbook = async (
    canvasId: string,
    newName: string
  ): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate name
    const validation = validateLookbookName(newName);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const trimmedName = newName.trim();

    try {
      // Optimistic update
      updateLookbook(canvasId, { name: trimmedName });

      // Update in Firestore
      await renameLookbookService(canvasId, trimmedName);
    } catch (error) {
      console.error('Failed to rename Lookbook:', error);
      throw error;
    }
  };

  /**
   * Delete a Lookbook
   */
  const deleteLookbook = async (canvasId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsDeleting(true);

    try {
      // Optimistic removal
      removeLookbook(canvasId);

      // Delete from Firestore
      await deleteLookbookService(canvasId, user.id);
    } catch (error) {
      console.error('Failed to delete Lookbook:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    createLookbook,
    renameLookbook,
    deleteLookbook,
    isCreating,
    isDeleting,
  };
}

