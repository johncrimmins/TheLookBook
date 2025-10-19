import { useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { useLookbooksStore } from '../lib/lookbooksStore';
import { subscribeToUserLookbooks } from '../services/lookbooksService';

/**
 * Hook to subscribe to user's Lookbooks
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

