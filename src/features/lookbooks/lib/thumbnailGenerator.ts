/**
 * Thumbnail generator for Lookbooks
 * Captures canvas state as an image
 */

/**
 * Generate a thumbnail from canvas element
 * @param canvasElement - The HTML canvas element to capture
 * @param width - Thumbnail width (default: 400px)
 * @param height - Thumbnail height (default: 225px for 16:9 ratio)
 * @returns Data URL of the thumbnail image
 */
export function generateThumbnailFromCanvas(
  canvasElement: HTMLCanvasElement,
  width: number = 400,
  height: number = 225
): string {
  // Create off-screen canvas for thumbnail
  const thumbnailCanvas = document.createElement('canvas');
  thumbnailCanvas.width = width;
  thumbnailCanvas.height = height;

  const ctx = thumbnailCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Draw source canvas to thumbnail canvas (scaled)
  ctx.drawImage(canvasElement, 0, 0, width, height);

  // Convert to data URL
  return thumbnailCanvas.toDataURL('image/png');
}

/**
 * Generate a placeholder thumbnail with gradient and initials
 * @param name - Lookbook name
 * @param width - Thumbnail width (default: 400px)
 * @param height - Thumbnail height (default: 225px for 16:9 ratio)
 * @returns Data URL of the placeholder image
 */
export function generatePlaceholderThumbnail(
  name: string,
  width: number = 400,
  height: number = 225
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#a855f7'); // purple-500
  gradient.addColorStop(1, '#3b82f6'); // blue-500

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw initials
  const initials = getInitials(name);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 80px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, width / 2, height / 2);

  return canvas.toDataURL('image/png');
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Debounced thumbnail generation
 * Waits for delay milliseconds after last call before executing
 */
export function debouncedThumbnailGeneration(
  callback: () => void,
  delay: number = 5000
): {
  trigger: () => void;
  cancel: () => void;
} {
  let timeoutId: NodeJS.Timeout | null = null;

  const trigger = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback();
      timeoutId = null;
    }, delay);
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { trigger, cancel };
}

