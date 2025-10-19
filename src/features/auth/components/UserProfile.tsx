// User profile component - displays user info and sign out
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../services/authService';
import { generateUserColor } from '@/features/presence/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

export function UserProfile() {
  const { user } = useAuth();
  const router = useRouter();
  
  if (!user) return null;
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
  
  const userColor = generateUserColor(user.id);
  
  return (
    <Card className="flex items-center gap-3 p-2">
      <Avatar>
        <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
        <AvatarFallback 
          className="text-white font-medium text-sm"
          style={{ backgroundColor: userColor }}
        >
          {user.displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {user.displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {user.email}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        Sign Out
      </Button>
    </Card>
  );
}

