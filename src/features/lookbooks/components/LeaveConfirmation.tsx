'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import { removeCollaborator } from '../services/collaboratorService';

interface LeaveConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasId: string;
  canvasName: string;
  userId: string;
}

/**
 * Confirmation dialog for leaving a shared Lookbook
 */
export function LeaveConfirmation({
  open,
  onOpenChange,
  canvasId,
  canvasName,
  userId,
}: LeaveConfirmationProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await removeCollaborator(canvasId, userId);
      onOpenChange(false);
      router.push('/mylookbooks');
    } catch (error) {
      console.error('Failed to leave Lookbook:', error);
      setIsLeaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave Lookbook?</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave &ldquo;{canvasName}&rdquo;? You will no longer have access to this Lookbook.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLeaving}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLeave} disabled={isLeaving}>
            {isLeaving ? 'Leaving...' : 'Leave Lookbook'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

