// Selection utilities for multi-select feature
import { CanvasObject, BoundingBox, Layer } from '../types';

/**
 * Check if an object is selectable
 * An object is selectable if it's visible (both object and layer)
 * Uses AND logic: object.visible !== false AND layer.visible !== false
 * Note: Locked objects can be selected but not modified
 * 
 * @param object - Canvas object to check
 * @param layer - Optional layer the object belongs to
 * @returns true if object can be selected, false otherwise
 */
export function isObjectSelectable(object: CanvasObject, layer?: Layer): boolean {
  // Check object visibility
  const objectVisible = object.visible !== false;
  
  // Check layer visibility (if layer provided)
  const layerVisible = layer ? layer.visible !== false : true;
  
  // AND logic: both must be visible
  return objectVisible && layerVisible;
}

/**
 * Check if an object is editable (can be modified)
 * Uses AND logic: object.locked !== true AND layer.locked !== true
 * 
 * @param object - Canvas object to check
 * @param layer - Optional layer the object belongs to
 * @returns true if object can be edited, false otherwise
 */
export function isObjectEditable(object: CanvasObject, layer?: Layer): boolean {
  // Check object lock state
  const objectUnlocked = object.locked !== true;
  
  // Check layer lock state (if layer provided)
  const layerUnlocked = layer ? layer.locked !== true : true;
  
  // AND logic: both must be unlocked
  return objectUnlocked && layerUnlocked;
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
 * @param layers - Optional record of layers for layer-aware filtering
 * @returns Array of object IDs that intersect the selection box
 */
export function getObjectsInBox(
  objects: Record<string, CanvasObject>,
  selectionBox: BoundingBox,
  layers?: Record<string, Layer>
): string[] {
  const selectedIds: string[] = [];

  for (const [id, object] of Object.entries(objects)) {
    // Get layer if available
    const layer = layers && object.layerId ? layers[object.layerId] : undefined;
    
    // Check if object is selectable (visible, not hidden, considering layer)
    if (!isObjectSelectable(object, layer)) {
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

