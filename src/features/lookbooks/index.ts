// Types
export type { Lookbook, UserCanvasIndex, CreateLookbookData, UpdateLookbookData } from './types';

// Store
export { useLookbooksStore } from './lib/lookbooksStore';

// Services
export {
  createLookbook,
  getLookbook,
  getUserLookbooks,
  subscribeToUserLookbooks,
  subscribeToLookbook,
  updateLookbook,
  renameLookbook,
  updateLookbookThumbnail,
  touchLookbook,
  deleteLookbook,
  lookbookNameExists,
} from './services/lookbooksService';

// Utilities
export { generateRandomName, generateUniqueName, validateLookbookName } from './lib/nameGenerator';

// Components (will be added as we create them)
export { default as EmptyState } from './components/EmptyState';
export { default as CreateButton } from './components/CreateButton';
export { default as LookbookCard } from './components/LookbookCard';
export { default as LookbookGrid } from './components/LookbookGrid';
export { default as LookbookContextMenu } from './components/LookbookContextMenu';

// Hooks
export { useLookbooks } from './hooks/useLookbooks';
export { useLookbookOperations } from './hooks/useLookbookOperations';

