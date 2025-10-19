'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lookbook } from '../types';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import LookbookContextMenu from './LookbookContextMenu';

interface LookbookCardProps {
  lookbook: Lookbook;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function LookbookCard({
  lookbook,
  onRename,
  onDelete,
}: LookbookCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(lookbook.name);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Format relative time
  const getRelativeTime = (timestamp: { seconds: number }) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp.seconds;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
  };

  // Get initials for placeholder
  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Handle card click (open canvas)
  const handleCardClick = () => {
    if (!isEditing && !isContextMenuOpen) {
      router.push(`/canvas/${lookbook.id}`);
    }
  };

  // Handle double-click (start editing)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  // Handle rename save
  const handleSave = async () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== lookbook.name) {
      try {
        await onRename(lookbook.id, trimmedName);
      } catch (error) {
        console.error('Failed to rename:', error);
        setEditName(lookbook.name);
      }
    } else {
      setEditName(lookbook.name);
    }
    setIsEditing(false);
  };

  // Handle rename cancel
  const handleCancel = () => {
    setEditName(lookbook.name);
    setIsEditing(false);
  };

  // Keyboard handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <LookbookContextMenu
      onDelete={() => onDelete(lookbook.id)}
      onOpenChange={setIsContextMenuOpen}
    >
      <Card
        className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
        onClick={handleCardClick}
      >
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          {lookbook.thumbnail ? (
            <img
              src={lookbook.thumbnail}
              alt={lookbook.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl font-bold text-purple-400">
              {getInitials(lookbook.name)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="text-lg font-semibold"
              maxLength={50}
            />
          ) : (
            <h3
              className="text-lg font-semibold text-gray-900 truncate"
              onDoubleClick={handleDoubleClick}
            >
              {lookbook.name}
            </h3>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {getRelativeTime(lookbook.updatedAt)}
          </p>
        </div>
      </Card>
    </LookbookContextMenu>
  );
}

