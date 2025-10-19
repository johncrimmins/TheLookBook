'use client';

import { ProtectedRoute, UserProfile } from '@/features/auth';
import { useLookbooks, useLookbookOperations } from '@/features/lookbooks';
import EmptyState from '@/features/lookbooks/components/EmptyState';
import CreateButton from '@/features/lookbooks/components/CreateButton';
import LookbookGrid from '@/features/lookbooks/components/LookbookGrid';

export default function MyLookbooksPage() {
  const { lookbooks, loading, error } = useLookbooks();
  const { createLookbook, renameLookbook, deleteLookbook, isCreating } =
    useLookbookOperations();

  const handleCreate = async () => {
    try {
      await createLookbook();
    } catch (error) {
      console.error('Failed to create Lookbook:', error);
    }
  };

  const handleRename = async (id: string, newName: string) => {
    try {
      await renameLookbook(id, newName);
    } catch (error) {
      console.error('Failed to rename Lookbook:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLookbook(id);
    } catch (error) {
      console.error('Failed to delete Lookbook:', error);
      throw error;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">CollabCanvas</h1>
                <span className="text-gray-400">|</span>
                <h2 className="text-xl text-gray-700">My Lookbooks</h2>
              </div>
              <div className="flex items-center gap-4">
                {!loading && lookbooks.length > 0 && (
                  <CreateButton onClick={handleCreate} loading={isCreating} />
                )}
                <UserProfile />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading your Lookbooks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Error loading Lookbooks</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            </div>
          ) : lookbooks.length === 0 ? (
            <EmptyState onCreateClick={handleCreate} />
          ) : (
            <LookbookGrid
              lookbooks={lookbooks}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

