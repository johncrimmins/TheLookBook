// Online users component - displays list of users on canvas
'use client';

import { PresenceUser, generateUserColor, formatTimestamp } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface OnlineUsersProps {
  presence: Record<string, PresenceUser>;
  currentUserId?: string;
}

export function OnlineUsers({ presence, currentUserId }: OnlineUsersProps) {
  const users = Object.values(presence);
  
  if (users.length === 0) {
    return null;
  }
  
  return (
    <Card className="max-w-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Online ({users.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const color = generateUserColor(user.id);
          
          return (
            <div
              key={user.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user.photoURL || undefined} 
                  alt={user.displayName}
                />
                <AvatarFallback
                  className="text-white font-medium text-sm"
                  style={{ backgroundColor: color }}
                >
                  {user.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.displayName}
                  {isCurrentUser && (
                    <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(user.joinedAt)}
                </p>
              </div>
              
              <Badge 
                variant="outline" 
                className="h-2 w-2 p-0 bg-green-500 border-green-500"
                title="Online"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

