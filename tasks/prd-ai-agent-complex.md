# Feature PRD: AI Agent - Complex Commands

**Status:** Planned (Blocked by PRD 1 Complete)  
**Priority:** High  
**Estimated Effort:** 4-5 days  
**Dependencies:** PRD 1 Complete ✅

---

## 1. Overview

**Objective:** Extend AI agent with advanced manipulation, multi-step operations, semantic object understanding, and smart layouts to achieve production-ready canvas control.

**Approach:** Extend PRD 1's `manipulateCanvas` tool with more operations. Add semantic search to existing object memory. Build new service functions for manipulation operations.

**Why This Matters:** Unlocks full natural language canvas control. Users describe complex layouts, reference objects semantically, and perform batch operations conversationally.

**Success Criteria:**
- ✅ Tool supports 7 operations: create, move, resize, rotate, modify, delete, batch_create, layout
- ✅ Semantic references work: "Move the header I created"
- ✅ Multi-step commands: "Create a login form" produces 6+ elements
- ✅ Batch operations: "Create a 3x3 grid" produces 9 circles
- ✅ Smart layouts: "Arrange horizontally" spaces objects evenly
- ✅ Performance: Complex commands < 5 seconds

---

## 2. User Experience

### Enhanced Commands

**Object Manipulation:**
- "Move the blue circle to 500, 300"
- "Make the rectangle twice as big"
- "Rotate the text 45 degrees"
- "Change the red square to green"
- "Delete the small circle"

**Semantic References:**
- "Move the header I created to the top"
- "Make the button bigger"
- "Delete the circles on the left"
- "Change the title text color to blue"

**Multi-Step Operations:**
- "Create a login form" → Username field + Password field + Submit button (6 objects)
- "Build a card layout" → Title + Image placeholder + Description
- "Make a navigation bar with 4 items" → 4 text elements evenly spaced

**Batch Operations:**
- "Create a 3x3 grid of red circles"
- "Add 5 rectangles in a horizontal row"
- "Make 10 dots scattered around 400, 400"

**Smart Layouts:**
- "Arrange these shapes horizontally"
- "Space these elements evenly"
- "Align the objects to the left"
- "Center the text on the canvas"

### User Flow Example

```
User: "Create a login form"
  ↓
AI plans: username label + input, password label + input, submit label + button
  ↓
AI executes 6 create operations with labels:
  - username_label, username_input
  - password_label, password_input
  - submit_label, submit_button
  ↓
All 6 objects appear, properly positioned
  ↓
AI: "Created a login form with username, password, and submit button"
  ↓
Later: "Make the submit button green"
  ↓
AI finds "submit_button" in memory, changes color
```

---

## 3. Architecture Extensions

### Extended Tool Schema

**Extends `manipulateCanvas` from PRD 1:**

```typescript
{
  name: "manipulateCanvas",
  description: "Perform any canvas operation",
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: [
          "create",        // From PRD 1
          "move",          // NEW
          "resize",        // NEW
          "rotate",        // NEW
          "modify",        // NEW
          "delete",        // NEW
          "batch_create",  // NEW
          "layout"         // NEW
        ]
      },
      // createParams from PRD 1 (unchanged)
      createParams: { /* same as PRD 1 */ },
      
      // NEW: Move parameters
      targets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            objectId: {type: "string"},
            semanticRef: {type: "string"}  // "header", "the red rectangle"
          }
        },
        description: "Target objects (for move, resize, rotate, modify, delete)"
      },
      moveParams: {
        type: "object",
        properties: {
          x: {type: "number"},
          y: {type: "number"}
        }
      },
      resizeParams: {
        type: "object",
        properties: {
          width: {type: "number"},
          height: {type: "number"},
          radius: {type: "number"},
          scale: {type: "number", description: "Scale factor (e.g., 2 = twice as big)"}
        }
      },
      rotateParams: {
        type: "object",
        properties: {
          degrees: {type: "number"}
        }
      },
      modifyParams: {
        type: "object",
        properties: {
          color: {type: "string"},
          text: {type: "string"},
          fontSize: {type: "number"}
        }
      },
      batchParams: {
        type: "object",
        properties: {
          count: {type: "number"},
          shapeType: {type: "string", enum: ["rectangle", "circle", "text"]},
          layout: {type: "string", enum: ["grid", "horizontal", "vertical", "scattered"]},
          spacing: {type: "number"},
          startX: {type: "number"},
          startY: {type: "number"},
          color: {type: "string"}
        }
      },
      layoutParams: {
        type: "object",
        properties: {
          arrangement: {
            type: "string",
            enum: ["horizontal", "vertical", "align_left", "align_center", "align_right", "distribute"]
          },
          spacing: {type: "number"}
        }
      }
    },
    required: ["operation"]
  }
}
```

### Extended Object Memory

**Extends PRD 1's Map structure:**

```typescript
// PRD 1 stored: {objectId, label?, type, color, createdAt}
// PRD 2 adds: description field

objectMemory.set(objectId, {
  objectId: string,
  label?: string,
  type: string,
  color: string,
  createdAt: number,
  description: string  // NEW: "red rectangle", "large blue circle"
});
```

### Semantic Reference Resolution

**Algorithm:**

```typescript
function resolveSemanticRef(
  ref: string,  // "header", "the red rectangle", "submit button"
  objectMemory: Map<string, any>
): string | null {
  // 1. Check exact label match
  for (const [id, obj] of objectMemory) {
    if (obj.label === ref) return id;
  }
  
  // 2. Check description match (fuzzy)
  for (const [id, obj] of objectMemory) {
    if (obj.description.includes(ref) || ref.includes(obj.description)) {
      return id;
    }
  }
  
  // 3. Not found
  return null;
}
```

---

## 4. Technical Specifications

### Extended AI Service

**File:** `src/features/ai-agent/services/aiService.ts` (updated)

**New Functions:**

```typescript
// Move object(s)
export async function moveObjects(
  canvasId: string,
  objectIds: string[],
  x: number,
  y: number
): Promise<AIResult>

// Resize object(s)
export async function resizeObjects(
  canvasId: string,
  objectIds: string[],
  params: {width?, height?, radius?, scale?}
): Promise<AIResult>

// Rotate object(s)
export async function rotateObjects(
  canvasId: string,
  objectIds: string[],
  degrees: number
): Promise<AIResult>

// Modify properties
export async function modifyObjects(
  canvasId: string,
  objectIds: string[],
  updates: {color?, text?, fontSize?}
): Promise<AIResult>

// Delete object(s)
export async function deleteObjects(
  canvasId: string,
  objectIds: string[]
): Promise<AIResult>

// Batch create
export async function batchCreateShapes(
  canvasId: string,
  params: BatchCreateParams
): Promise<AIResult>

// Smart layout
export async function applyLayout(
  canvasId: string,
  objectIds: string[],
  arrangement: string,
  spacing?: number
): Promise<AIResult>
```

**Implementation:**
- Each function calls existing `objectsService` methods
- Returns AI-friendly messages
- Minimal error handling

### Multi-Step Planning

**How It Works:**

AI receives: "Create a login form"

AI plans (internally):
```typescript
[
  {operation: "create", createParams: {type: "text", text: "Username", x: 300, y: 200, label: "username_label"}},
  {operation: "create", createParams: {type: "rectangle", x: 300, y: 230, width: 200, height: 30, label: "username_input"}},
  {operation: "create", createParams: {type: "text", text: "Password", x: 300, y: 280, label: "password_label"}},
  {operation: "create", createParams: {type: "rectangle", x: 300, y: 310, width: 200, height: 30, label: "password_input"}},
  {operation: "create", createParams: {type: "text", text: "Submit", x: 350, y: 360, label: "submit_label"}},
  {operation: "create", createParams: {type: "rectangle", x: 325, y: 385, width: 100, height: 40, color: "blue", label: "submit_button"}}
]
```

AI executes sequentially, objects appear on canvas.

---

## 5. LangChain Enhancements

### Enhanced System Prompt

```
You are an AI assistant for CollabCanvas with advanced canvas manipulation.

You can perform ANY canvas operation through the manipulateCanvas tool:
- create: Create new shapes
- move: Change object positions
- resize: Scale or set dimensions
- rotate: Rotate objects
- modify: Change color, text, fontSize
- delete: Remove objects
- batch_create: Create multiple objects at once
- layout: Apply smart arrangements

Advanced capabilities:
- Multi-step: Break complex requests into sequential operations
- Semantic tracking: Track objects you create with labels
- Batch operations: Create grids, rows, patterns
- Smart layouts: Calculate spacing and alignment

When creating complex layouts:
1. Plan all objects needed
2. Calculate positions with proper spacing
3. Execute creation with semantic labels
4. Confirm what was created

Canvas context:
- Canvas ID: {canvasId}
- Visible objects: {visibleObjects.length}
- Your created objects: {objectMemory.size}

Use reasonable defaults and be specific in confirmations.
```

---

## 6. Implementation Plan

### Phase 1: Tool Extension (Day 1)

1. Update `canvas-tools.ts` with extended `manipulateCanvas` schema
2. Add operation router in tool implementation
3. Test that "create" operation still works (PRD 1 compatibility)

### Phase 2: Service Layer (Days 2-3)

4. Add all new functions to `aiService.ts`:
   - moveObjects, resizeObjects, rotateObjects
   - modifyObjects, deleteObjects
   - batchCreateShapes, applyLayout
5. Implement semantic reference resolution
6. Add description field to object memory

### Phase 3: Complex Operations (Days 4-5)

7. Update system prompt with multi-step guidance
8. Test multi-step: "Create a login form"
9. Test semantic refs: "Move the header to the top"
10. Test batch: "Create a 3x3 grid of circles"
11. Test layouts: "Arrange these shapes horizontally"

---

## 7. Complex Command Examples

### "Create a login form"

**Expected:**
- Username label at (300, 200)
- Username input (200x30) at (300, 230)
- Password label at (300, 280)
- Password input (200x30) at (300, 310)
- Submit label at (350, 360)
- Submit button (100x40, blue) at (325, 385)

**Labels:** username_label, username_input, password_label, password_input, submit_label, submit_button

### "Create a 3x3 grid of red circles"

**Algorithm:**
```typescript
const spacing = 100;
const startX = 200, startY = 200;

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    await createShape({
      type: "circle",
      x: startX + (col * spacing),
      y: startY + (row * spacing),
      radius: 30,
      color: "red"
    });
  }
}
```

### "Arrange these shapes horizontally"

**Algorithm:**
```typescript
// Get selected objects or recently created
const objects = getTargetObjects();
objects.sort((a, b) => a.x - b.x);

const spacing = 50;
let currentX = objects[0].x;

for (const obj of objects) {
  await moveObject(obj.id, currentX, obj.y);
  currentX += obj.width + spacing;
}
```

---

## 8. Success Criteria

✅ **Extended Tool:** manipulateCanvas supports all 7 operations  
✅ **Semantic Refs:** "Move the header" resolves correctly  
✅ **Multi-Step:** "Create login form" produces 6 elements  
✅ **Batch Ops:** "3x3 grid" creates 9 circles in grid  
✅ **Smart Layout:** "Arrange horizontally" spaces evenly  
✅ **Performance:** Complex commands < 5 seconds  
✅ **No Refactoring:** PRD 1 code unchanged

---

## 9. Files to Update (3)

**From PRD 1:**
- `app/api/ai/lib/canvas-tools.ts` - Extend tool schema with new operations
- `src/features/ai-agent/services/aiService.ts` - Add new manipulation functions
- `app/api/ai/lib/langchain-agent.ts` - Update system prompt

---

## 10. Files to Create (2)

**New Utilities:**
- `src/features/ai-agent/lib/semanticResolver.ts` - Reference resolution logic
- `src/features/ai-agent/lib/layoutAlgorithms.ts` - Grid, distribute, align functions

---

## 11. Foundation from PRD 1

**What PRD 1 Built:**
- ✅ `manipulateCanvas` tool with "create" operation
- ✅ Object memory Map with label storage
- ✅ AI service layer structure
- ✅ Auth & API infrastructure
- ✅ LangSmith tracing

**What PRD 2 Adds:**
- More operations (move, resize, delete, etc.)
- Semantic search on object memory
- Multi-step command capability
- Batch and layout algorithms

**Clean Extension:** Zero refactoring of PRD 1 code required.

---

*Last Updated: 2025-10-19 - Extends PRD 1 cleanly*
