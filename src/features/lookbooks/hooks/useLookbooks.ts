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
 * Fix #4: React state instead of closures to prevent stale state
 */
export function useLookbooksByRole() {
  const { user } = useAuth();
  const [ownedLookbooks, setOwnedLookbooks] = useState<Lookbook[]>([]);
  const [sharedLookbooks, setSharedLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fix #4: React state for tracking responses (prevents stale closures)
  const [loadingState, setLoadingState] = useState({
    ownedReceived: false,
    sharedReceived: false,
  });

  useEffect(() => {
    if (!user) {
      setOwnedLookbooks([]);
      setSharedLookbooks([]);
      setLoading(false);
      return;
    }

    console.log('[useLookbooksByRole] Setting up subscriptions for user:', user.id);
    setLoading(true);
    setError(null);
    setLoadingState({ ownedReceived: false, sharedReceived: false }); // Reset on user change

    try {
      // Subscribe to owned lookbooks
      const unsubscribeOwned = subscribeToUserLookbooksByRole(
        user.id,
        'owner',
        (lookbooks) => {
          setOwnedLookbooks(lookbooks);
          setLoadingState((prev) => ({ ...prev, ownedReceived: true }));
        },
        (err) => {
          console.error('[useLookbooksByRole] Failed to load owned lookbooks:', {
            userId: user.id,
            error: err.message,
            errorCode: (err as any).code,
            isPermissionError: err.message.includes('permission')
          });
          
          setOwnedLookbooks([]);
          setLoadingState((prev) => ({ ...prev, ownedReceived: true }));
          
          if (!err.message.includes('permission') && !err.message.includes('insufficient')) {
            setError(err.message);
          }
        }
      );

      // Subscribe to shared lookbooks
      const unsubscribeShared = subscribeToUserLookbooksByRole(
        user.id,
        'designer',
        (lookbooks) => {
          setSharedLookbooks(lookbooks);
          setLoadingState((prev) => ({ ...prev, sharedReceived: true }));
        },
        (err) => {
          console.error('[useLookbooksByRole] Failed to load shared lookbooks:', {
            userId: user.id,
            error: err.message,
            errorCode: (err as any).code,
            isPermissionError: err.message.includes('permission')
          });
          
          setSharedLookbooks([]);
          setLoadingState((prev) => ({ ...prev, sharedReceived: true }));
          
          if (!err.message.includes('permission') && !err.message.includes('insufficient')) {
            setError(err.message);
          }
        }
      );

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

  // Fix #4: Separate effect to check loading complete (avoids stale closure state)
  useEffect(() => {
    if (loadingState.ownedReceived && loadingState.sharedReceived) {
      setLoading(false);
    }
  }, [loadingState]);

  return {
    ownedLookbooks,
    sharedLookbooks,
    loading,
    error,
  };
}

