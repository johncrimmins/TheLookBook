'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth';
import { UserSearch } from './UserSearch';
import { CollaboratorList } from './CollaboratorList';
import { TransferOwnershipDialog } from './TransferOwnershipDialog';
import { useUserSearch } from '../hooks/useUserSearch';
import { addCollaborator, removeCollaborator } from '../services/collaboratorService';
import { UserProfile, Collaborator } from '../types';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasId: string;
  canvasName: string;
  collaborators: Collaborator[];
}

/**
 * Share modal for managing collaborators
 * Note: Receives collaborators as prop to avoid duplicate Firestore subscription
 */
export function ShareModal({
  open,
  onOpenChange,
  canvasId,
  canvasName,
  collaborators,
}: ShareModalProps) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  // Get current user's role
  const currentUserRole = collaborators.find((c) => c.userId === user?.id)?.role;
  const isOwner = currentUserRole === 'owner';

  // User search with exclusion of existing collaborators
  const excludeUserIds = collaborators.map((c) => c.userId);
  const {
    searchTerm,
    results,
    loading: searchLoading,
    error: searchError,
    handleSearchChange,
    clearSearch,
  } = useUserSearch(excludeUserIds);

  const handleAddUser = async (selectedUser: UserProfile) => {
    if (!user || !isOwner) return;

    setIsAdding(true);
    try {
      await addCollaborator(
        canvasId,
        selectedUser.id,
        selectedUser.email,
        selectedUser.displayName,
        selectedUser.photoURL
      );
      clearSearch();
    } catch (error) {
      console.error('Failed to add collaborator:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!user || !isOwner) return;

    try {
      await removeCollaborator(canvasId, userId);
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share &ldquo;{canvasName}&rdquo;</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* User search (owner only) */}
            {isOwner && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Add designers</h3>
                <UserSearch
                  searchTerm={searchTerm}
                  results={results}
                  loading={searchLoading || isAdding}
                  error={searchError}
                  onSearchChange={handleSearchChange}
                  onSelectUser={handleAddUser}
                />
              </div>
            )}

            {/* Collaborator list */}
            {collaborators.length > 0 && (
              <CollaboratorList
                collaborators={collaborators}
                currentUserId={user.id}
                isOwner={isOwner}
                onRemove={isOwner ? handleRemoveUser : undefined}
              />
            )}

            {/* Transfer ownership button (owner only) */}
            {isOwner && collaborators.length > 1 && (
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTransferDialog(true)}
                >
                  Transfer Ownership
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer ownership dialog */}
      {isOwner && (
        <TransferOwnershipDialog
          open={showTransferDialog}
          onOpenChange={setShowTransferDialog}
          canvasId={canvasId}
          canvasName={canvasName}
          collaborators={collaborators}
          currentOwnerId={user.id}
        />
      )}
    </>
  );
}

