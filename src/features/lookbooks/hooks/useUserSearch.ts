import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { searchUsers } from '../services/collaboratorService';
import { UserProfile } from '../types';

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 300;

/**
 * Hook for debounced user search
 */
export function useUserSearch(excludeUserIds: string[] = []) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        // Exclude current user and provided list
        const excludeIds = user ? [...excludeUserIds, user.id] : excludeUserIds;
        const searchResults = await searchUsers(searchTerm, excludeIds);
        setResults(searchResults);
      } catch (err) {
        console.error('User search error:', err);
        setError('Failed to search users');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, excludeUserIds, user]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setError(null);
  }, []);

  return {
    searchTerm,
    results,
    loading,
    error,
    handleSearchChange,
    clearSearch,
  };
}

