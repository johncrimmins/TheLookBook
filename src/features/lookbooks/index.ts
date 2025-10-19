// Types
export type {
  Lookbook,
  UserCanvasIndex,
  CreateLookbookData,
  UpdateLookbookData,
  Collaborator,
  Role,
  UserProfile,
} from './types';

// Store
export { useLookbooksStore } from './lib/lookbooksStore';

// Services
export {
  createLookbook,
  getLookbook,
  getUserLookbooks,
  subscribeToUserLookbooks,
  subscribeToUserLookbooksByRole,
  subscribeToLookbook,
  updateLookbook,
  renameLookbook,
  updateLookbookThumbnail,
  touchLookbook,
  deleteLookbook,
  lookbookNameExists,
} from './services/lookbooksService';

// Feature 9: Collaboration services
export {
  getCollaborators,
  subscribeToCollaborators,
  addCollaborator,
  removeCollaborator,
  transferOwnership,
  searchUsers,
  getUserProfile,
  isOwner,
  isCollaborator,
  permissions,
} from './services/collaboratorService';

// Utilities
export { generateRandomName, generateUniqueName, validateLookbookName } from './lib/nameGenerator';

// Components
export { default as EmptyState } from './components/EmptyState';
export { default as CreateButton } from './components/CreateButton';
export { default as LookbookCard } from './components/LookbookCard';
export { default as LookbookGrid } from './components/LookbookGrid';
export { default as LookbookContextMenu } from './components/LookbookContextMenu';

// Feature 9: Collaboration components
export { ShareModal } from './components/ShareModal';
export { CollaboratorList } from './components/CollaboratorList';
export { UserSearch } from './components/UserSearch';
export { PresenceBadges } from './components/PresenceBadges';
export { TransferOwnershipDialog } from './components/TransferOwnershipDialog';
export { LeaveConfirmation } from './components/LeaveConfirmation';

// Hooks
export { useLookbooks, useLookbooksByRole } from './hooks/useLookbooks';
export { useLookbookOperations } from './hooks/useLookbookOperations';

// Feature 9: Collaboration hooks
export { useCollaborators } from './hooks/useCollaborators';
export { useIsOwner } from './hooks/useIsOwner';
export { useUserSearch } from './hooks/useUserSearch';

