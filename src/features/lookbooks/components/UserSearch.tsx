'use client';

import { Input } from '@/shared/components/ui/input';
import { Avatar } from '@/shared/components/ui/avatar';
import { UserProfile } from '../types';

interface UserSearchProps {
  searchTerm: string;
  results: UserProfile[];
  loading: boolean;
  error: string | null;
  onSearchChange: (term: string) => void;
  onSelectUser: (user: UserProfile) => void;
}

/**
 * User search component for finding collaborators
 */
export function UserSearch({
  searchTerm,
  results,
  loading,
  error,
  onSearchChange,
  onSelectUser,
}: UserSearchProps) {
  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Search by email or username..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full"
      />

      {/* Loading state */}
      {loading && (
        <div className="text-sm text-muted-foreground py-2">
          Searching...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-sm text-destructive py-2">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="border rounded-md max-h-64 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
            >
              <Avatar className="h-8 w-8">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || user.email} />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary text-xs font-medium">
                    {(user.displayName || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user.displayName || user.email}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && !error && searchTerm && results.length === 0 && (
        <div className="text-sm text-muted-foreground py-2">
          No users found
        </div>
      )}
    </div>
  );
}

