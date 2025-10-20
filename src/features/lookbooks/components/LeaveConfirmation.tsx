'use client';

import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog';
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

  const handleLeave = async () => {
    await removeCollaborator(canvasId, userId);
    router.push('/mylookbooks');
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Leave Lookbook?"
      description={`Are you sure you want to leave "${canvasName}"? You will no longer have access to this Lookbook.`}
      confirmText="Leave Lookbook"
      cancelText="Cancel"
      onConfirm={handleLeave}
      variant="destructive"
    />
  );
}
