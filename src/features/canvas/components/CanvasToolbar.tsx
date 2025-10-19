// Canvas toolbar component - navigation, Lookbook name, and user info
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, useAuthStore } from '@/features/auth';
import { usePresenceStore } from '@/features/presence';
import {
  useLookbooksStore,
  useLookbookOperations,
  useCollaborators,
  useIsOwner,
  ShareModal,
  LeaveConfirmation,
  PresenceBadges,
} from '@/features/lookbooks';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui';

interface CanvasToolbarProps {
  canvasId: string;
}

export function CanvasToolbar({ canvasId }: CanvasToolbarProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const presence = usePresenceStore((state) => state.presence);
  const { currentLookbook } = useLookbooksStore();
  const { renameLookbook, deleteLookbook } = useLookbookOperations();
  
  // Feature 9: Collaboration hooks
  const { collaborators } = useCollaborators(canvasId);
  const isOwner = useIsOwner(canvasId, collaborators); // Pass collaborators to avoid duplicate subscription
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Feature 9: Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Update edit name when currentLookbook changes
  useEffect(() => {
    if (currentLookbook) {
      setEditName(currentLookbook.name);
    }
  }, [currentLookbook]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName || !currentLookbook || trimmedName === currentLookbook.name) {
      setIsEditing(false);
      setEditName(currentLookbook?.name || '');
      return;
    }

    setIsSaving(true);
    try {
      await renameLookbook(canvasId, trimmedName);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to rename Lookbook:', error);
      setEditName(currentLookbook.name);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(currentLookbook?.name || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = async () => {
    if (!canvasId) return;
    try {
      await deleteLookbook(canvasId);
      router.push('/mylookbooks');
    } catch (error) {
      console.error('Failed to delete Lookbook:', error);
    }
  };

  // Get active user IDs for presence badges
  const activeUserIds = presence.map(p => p.userId);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40">
      {/* Left: Back button */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/mylookbooks')}
          className="flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          My Lookbooks
        </Button>
      </div>

      {/* Center: Editable Lookbook name */}
      <div className="flex items-center justify-center flex-1">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className="text-lg font-semibold text-center max-w-md"
            maxLength={50}
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors group"
          >
            <span className="text-lg font-semibold text-gray-900">
              {currentLookbook?.name || 'Untitled'}
            </span>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Right: Presence badges, Share/Leave/Delete, and user profile */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Feature 9: Presence Badges */}
        {collaborators.length > 0 && (
          <PresenceBadges collaborators={collaborators} activeUserIds={activeUserIds} />
        )}
        
        {/* Feature 9: Share Button (Owner only) */}
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareModal(true)}
          >
            Share
          </Button>
        )}
        
        {/* Feature 9: Leave/Delete Button */}
        {isOwner ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            Delete Lookbook
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLeaveConfirmation(true)}
          >
            Leave
          </Button>
        )}
        
        <UserProfile />
      </div>
      
      {/* Feature 9: Share Modal */}
      {showShareModal && user && currentLookbook && (
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          canvasId={canvasId}
          canvasName={currentLookbook.name}
        />
      )}
      
      {/* Feature 9: Leave Confirmation */}
      {showLeaveConfirmation && user && currentLookbook && (
        <LeaveConfirmation
          open={showLeaveConfirmation}
          onOpenChange={setShowLeaveConfirmation}
          canvasId={canvasId}
          canvasName={currentLookbook.name}
          userId={user.id}
        />
      )}
      
      {/* Feature 9: Delete Confirmation */}
      {showDeleteConfirmation && currentLookbook && (
        <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Lookbook?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &ldquo;{currentLookbook.name}&rdquo;? This will remove the Lookbook for all collaborators. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </header>
  );
}
