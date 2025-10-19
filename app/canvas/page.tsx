// Canvas redirect page - redirects to My Lookbooks
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function CanvasRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to My Lookbooks repository
    router.push('/mylookbooks');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
