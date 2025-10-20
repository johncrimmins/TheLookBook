'use client';

import { LoadingButton } from '@/shared/components/LoadingButton';
import { Plus } from 'lucide-react';

interface CreateButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export default function CreateButton({ onClick, loading = false }: CreateButtonProps) {
  return (
    <LoadingButton
      onClick={onClick}
      loading={loading}
      loadingText="Creating..."
      className="bg-blue-600 hover:bg-blue-700"
    >
      <Plus className="h-4 w-4 mr-2" />
      New Lookbook
    </LoadingButton>
  );
}

