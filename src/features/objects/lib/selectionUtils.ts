// Selection utilities for multi-select feature
import { CanvasObject, BoundingBox } from '../types';

/**
 * Check if an object is selectable
 * An object is selectable if it's visible and not hidden
 * Note: Locked objects can be selected but not modified
 * 
 * @param object - Canvas object to check
 * @returns true if object can be selected, false otherwise
 */
export function isObjectSelectable(object: CanvasObject): boolean {
  // Object is selectable if visible is undefined or true
  // visible === false means hidden (not selectable)
  return object.visible !== false;
}

/**
 * Get bounding box for a canvas object
 * Calculates the axis-aligned bounding box (AABB) for intersection testing
 * 
 * @param object - Canvas object
 * @returns Bounding box with x, y, width, height
 */
export function getBoundingBox(object: CanvasObject): BoundingBox {
  return {
    x: object.position.x,
    y: object.position.y,
    width: object.width,
    height: object.height,
  };
}

/**
 * Check if two bounding boxes intersect
 * Uses axis-aligned bounding box (AABB) intersection test
 * 
 * @param box1 - First bounding box
 * @param box2 - Second bounding box
 * @returns true if boxes intersect (including edge touching), false otherwise
 */
export function doBoxesIntersect(box1: BoundingBox, box2: BoundingBox): boolean {
  // Check if one box is completely to the left, right, above, or below the other
  // If any of these conditions is true, there's no intersection
  const noOverlap =
    box1.x > box2.x + box2.width ||  // box1 is to the right of box2
    box1.x + box1.width < box2.x ||  // box1 is to the left of box2
    box1.y > box2.y + box2.height || // box1 is below box2
    box1.y + box1.height < box2.y;   // box1 is above box2

  return !noOverlap;
}

/**
 * Get all objects that intersect with a selection box
 * Filters objects to only include visible ones, then checks intersection
 * 
 * @param objects - Record of all canvas objects
 * @param selectionBox - The marquee selection box
 * @returns Array of object IDs that intersect the selection box
 */
export function getObjectsInBox(
  objects: Record<string, CanvasObject>,
  selectionBox: BoundingBox
): string[] {
  const selectedIds: string[] = [];

  for (const [id, object] of Object.entries(objects)) {
    // Check if object is selectable (visible, not hidden)
    if (!isObjectSelectable(object)) {
      continue;
    }

    // Get object bounding box
    const objectBox = getBoundingBox(object);

    // Check if object intersects selection box
    if (doBoxesIntersect(objectBox, selectionBox)) {
      selectedIds.push(id);
    }
  }

  return selectedIds;
}

