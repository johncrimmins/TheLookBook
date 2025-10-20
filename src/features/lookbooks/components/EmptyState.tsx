'use client';

import { Image, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
            <Image className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Your First Lookbook
          </h2>
          <p className="text-gray-600">
            Lookbooks are your creative canvases. Start organizing your designs,
            collaborate with others, and bring your ideas to life.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onCreateClick}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Your First Lookbook
        </Button>
      </div>
    </div>
  );
}

