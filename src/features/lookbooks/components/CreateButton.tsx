'use client';

import { Button } from '@/shared/components/ui/button';

interface CreateButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export default function CreateButton({ onClick, loading = false }: CreateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      {loading ? 'Creating...' : 'New Lookbook'}
    </Button>
  );
}

