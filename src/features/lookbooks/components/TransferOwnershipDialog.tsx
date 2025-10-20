'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { transferOwnership } from '../services/collaboratorService';
import { Collaborator } from '../types';

interface TransferOwnershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasId: string;
  canvasName: string;
  collaborators: Collaborator[];
  currentOwnerId: string;
}

/**
 * Dialog for transferring ownership to another collaborator
 */
export function TransferOwnershipDialog({
  open,
  onOpenChange,
  canvasId,
  canvasName,
  collaborators,
  currentOwnerId,
}: TransferOwnershipDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  // Filter out the current owner
  const designers = collaborators.filter(
    (c) => c.role === 'designer' && c.userId !== currentOwnerId
  );

  const handleTransfer = async () => {
    if (!selectedUserId) return;

    setIsTransferring(true);
    try {
      await transferOwnership(canvasId, currentOwnerId, selectedUserId);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to transfer ownership:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Transfer Ownership</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Transfer ownership of &ldquo;{canvasName}&rdquo; to another designer. You will become a designer after the transfer.
          </p>

          {designers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No designers available for transfer. Add designers first.
            </p>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select new owner:</h3>
              <div className="border rounded-md divide-y">
                {designers.map((designer) => (
                  <button
                    key={designer.userId}
                    onClick={() => setSelectedUserId(designer.userId)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left ${
                      selectedUserId === designer.userId ? 'bg-accent' : ''
                    }`}
                  >
                    <UserAvatar
                      photoURL={designer.photoURL}
                      displayName={designer.displayName}
                      email={designer.email}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {designer.displayName || designer.email}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {designer.email}
                      </div>
                    </div>
                    {selectedUserId === designer.userId && (
                      <div className="h-4 w-4 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isTransferring}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedUserId || isTransferring || designers.length === 0}
          >
            {isTransferring ? 'Transferring...' : 'Transfer Ownership'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

