'use client';

import { Lookbook } from '../types';
import LookbookCard from './LookbookCard';

interface LookbookGridProps {
  lookbooks: Lookbook[];
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function LookbookGrid({
  lookbooks,
  onRename,
  onDelete,
}: LookbookGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {lookbooks.map((lookbook) => (
        <LookbookCard
          key={lookbook.id}
          lookbook={lookbook}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

