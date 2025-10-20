'use client';

import { Avatar } from './ui/avatar';
import { cn } from '@/shared/lib/utils';

export interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  email: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable user avatar component with automatic fallback to initials
 * Handles photo URLs and generates initials from displayName or email
 */
export function UserAvatar({
  photoURL,
  displayName,
  email,
  size = 'md',
  className,
}: UserAvatarProps) {
  // Generate initials from displayName or email
  const initials = (displayName || email)
    .charAt(0)
    .toUpperCase();

  // Size variants
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {photoURL ? (
        <img
          src={photoURL}
          alt={displayName || email}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-medium">
          {initials}
        </div>
      )}
    </Avatar>
  );
}

