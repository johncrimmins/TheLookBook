import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { useLookbooksStore } from '../lib/lookbooksStore';
import {
  subscribeToUserLookbooks,
  subscribeToUserLookbooksByRole,
} from '../services/lookbooksService';
import { Lookbook } from '../types';

/**
 * Hook to subscribe to user's Lookbooks (all)
 */
export function useLookbooks() {
  const { user } = useAuth();
  const { lookbooks, loading, error, setLookbooks, setLoading, setError } = useLookbooksStore();

  useEffect(() => {
    if (!user) {
      setLookbooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToUserLookbooks(
        user.id,
        (lookbooks) => {
          setLookbooks(lookbooks);
          setLoading(false);
        },
        (err) => {
          console.error('Failed to load Lookbooks:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Failed to subscribe to Lookbooks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Lookbooks');
      setLoading(false);
    }
  }, [user, setLookbooks, setLoading, setError]);

  return { lookbooks, loading, error };
}

/**
 * Hook to subscribe to user's Lookbooks split by role (Feature 9)
 */
export function useLookbooksByRole() {
  const { user } = useAuth();
  const [ownedLookbooks, setOwnedLookbooks] = useState<Lookbook[]>([]);
  const [sharedLookbooks, setSharedLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOwnedLookbooks([]);
      setSharedLookbooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Subscribe to owned lookbooks
      const unsubscribeOwned = subscribeToUserLookbooksByRole(
        user.id,
        'owner',
        (lookbooks) => {
          setOwnedLookbooks(lookbooks);
        },
        (err) => {
          console.error('Failed to load owned Lookbooks:', err);
          setError(err.message);
        }
      );

      // Subscribe to shared lookbooks
      const unsubscribeShared = subscribeToUserLookbooksByRole(
        user.id,
        'designer',
        (lookbooks) => {
          setSharedLookbooks(lookbooks);
        },
        (err) => {
          console.error('Failed to load shared Lookbooks:', err);
          setError(err.message);
        }
      );

      setLoading(false);

      return () => {
        unsubscribeOwned();
        unsubscribeShared();
      };
    } catch (err) {
      console.error('Failed to subscribe to Lookbooks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Lookbooks');
      setLoading(false);
    }
  }, [user]);

  return {
    ownedLookbooks,
    sharedLookbooks,
    loading,
    error,
  };
}

