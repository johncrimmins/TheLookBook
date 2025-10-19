'use client';

import { Avatar } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { X } from 'lucide-react';
import { Collaborator } from '../types';

interface CollaboratorListProps {
  collaborators: Collaborator[];
  currentUserId: string;
  isOwner: boolean;
  onRemove?: (userId: string) => void;
}

/**
 * List of collaborators with remove functionality
 */
export function CollaboratorList({
  collaborators,
  currentUserId,
  isOwner,
  onRemove,
}: CollaboratorListProps) {
  // Sort: Owner first, then alphabetical
  const sortedCollaborators = [...collaborators].sort((a, b) => {
    if (a.role === 'owner' && b.role !== 'owner') return -1;
    if (b.role === 'owner' && a.role !== 'owner') return 1;
    return (a.displayName || a.email).localeCompare(b.displayName || b.email);
  });

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Current Access</h3>
      <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
        {sortedCollaborators.map((collaborator) => {
          const isCurrentUser = collaborator.userId === currentUserId;
          const canRemove = isOwner && !isCurrentUser && collaborator.role !== 'owner';

          return (
            <div
              key={collaborator.userId}
              className="flex items-center gap-3 p-3"
            >
              <Avatar className="h-8 w-8">
                {collaborator.photoURL ? (
                  <img src={collaborator.photoURL} alt={collaborator.displayName || collaborator.email} />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary text-xs font-medium">
                    {(collaborator.displayName || collaborator.email).charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {collaborator.displayName || collaborator.email}
                  {isCurrentUser && <span className="text-muted-foreground"> (You)</span>}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {collaborator.email}
                </div>
              </div>

              <Badge variant={collaborator.role === 'owner' ? 'default' : 'secondary'}>
                {collaborator.role === 'owner' ? 'Owner' : 'Designer'}
              </Badge>

              {canRemove && onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(collaborator.userId)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

