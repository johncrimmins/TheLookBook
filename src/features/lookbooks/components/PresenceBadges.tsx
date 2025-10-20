'use client';

import { useMemo } from 'react';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { Badge } from '@/shared/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { Collaborator } from '../types';

interface PresenceBadgesProps {
  collaborators: Collaborator[];
  activeUserIds?: string[]; // User IDs currently active (from presence system)
  maxVisible?: number;
}

/**
 * Google Docs-style overlapping avatar badges with presence indicators
 */
export function PresenceBadges({
  collaborators,
  activeUserIds = [],
  maxVisible = 5,
}: PresenceBadgesProps) {
  // Sort: Owner first, then alphabetical (memoized to prevent re-sorting on every render)
  const sortedCollaborators = useMemo(() => {
    return [...collaborators].sort((a, b) => {
      if (a.role === 'owner' && b.role !== 'owner') return -1;
      if (b.role === 'owner' && a.role !== 'owner') return 1;
      return (a.displayName || a.email).localeCompare(b.displayName || b.email);
    });
  }, [collaborators]);

  const visibleCollaborators = useMemo(
    () => sortedCollaborators.slice(0, maxVisible),
    [sortedCollaborators, maxVisible]
  );
  
  const remainingCount = Math.max(0, sortedCollaborators.length - maxVisible);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center -space-x-2">
        {visibleCollaborators.map((collaborator) => {
          const isActive = activeUserIds.includes(collaborator.userId);
          
          return (
            <Tooltip key={collaborator.userId}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <UserAvatar
                    photoURL={collaborator.photoURL}
                    displayName={collaborator.displayName}
                    email={collaborator.email}
                    size="md"
                    className="border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                  />
                  {isActive && (
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div className="font-medium">{collaborator.displayName || collaborator.email}</div>
                  <div className="text-muted-foreground capitalize">{collaborator.role}</div>
                  <div className="text-muted-foreground">
                    {isActive ? '🟢 Online' : '⚪ Offline'}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              >
                <span className="text-xs">+{remainingCount}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                {sortedCollaborators.slice(maxVisible).map((c) => (
                  <div key={c.userId}>{c.displayName || c.email}</div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

