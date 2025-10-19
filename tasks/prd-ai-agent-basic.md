# Feature PRD: AI Agent - Basic Foundation

**Status:** Ready for Implementation  
**Priority:** High  
**Estimated Effort:** 3-4 days  
**Dependencies:** Core Platform (Complete ✅)

---

## 1. Overview

**Objective:** Build foundational AI agent infrastructure with secure authentication, LangSmith observability, and three simple shape creation commands. Establish extensible patterns for PRD 2 (complex commands).

**Approach:** AI-specific service layer wraps existing `objectsService`. Single unified tool (`manipulateCanvas`) with only "create" operation in Phase 1. Simple in-memory object tracking for labels (foundation for PRD 2 semantic references).

**Why This Matters:** Validates LangChain architecture, ensures security/observability foundations are solid, and establishes clean extension points for PRD 2 without refactoring.

**Success Criteria:**
- ✅ Only authenticated users can invoke AI
- ✅ API keys secure (server-side only)
- ✅ LangSmith traces all requests
- ✅ Three commands work: create rectangle, circle, text
- ✅ Chat persists during browser session
- ✅ Object labels stored (foundation for PRD 2)

---

## 2. User Experience

### UI Components

**1. AI Button**
- Location: Canvas header (next to "My Lookbooks" back button)
- Label: "AI" with sparkle icon
- Behavior: Toggle chat panel open/closed

**2. Chat Panel**
- Position: Slides in from right, overlays canvas
- Width: 400px, full viewport height
- Sections:
  - **Header:** "AI Assistant" + close button
  - **Messages:** Scrollable chat history
  - **Input:** Text area + Send button
  - **Loading:** Indicator during AI processing

### User Flow

```
User clicks "AI" → Panel slides in
  ↓
User: "Create a red rectangle at 200, 300"
  ↓
Message sent → Loading indicator
  ↓
AI processes (~1-2s)
  ↓
Rectangle appears on canvas (all users see it)
  ↓
AI: "Created a red rectangle at position 200, 300"
  ↓
User toggles panel closed → History preserved
```

### Persistence

**Simple Strategy:**
- **Storage:** `sessionStorage` only (cleared when tab closes)
- **Key:** `aiChat_${canvasId}`
- **Data:** Array of messages `{role: 'user' | 'assistant', content: string}`

No fallback, no TTL, no cleanup logic. Keep it simple.

---

## 3. Architecture

### File Structure (12 files, simplified)

```
src/features/ai-agent/              # Client-side
├── components/
│   └── AIChatPanel.tsx             # All UI (messages + input combined)
├── hooks/
│   └── useAIChat.ts                # Chat operations + persistence combined
├── services/
│   └── aiService.ts                # Canvas operations + API calls combined
├── lib/
│   └── aiChatStore.ts              # Zustand store
├── types/
│   └── index.ts
├── index.ts
└── README.md

app/api/ai/                         # Server-side
├── chat/
│   └── route.ts                    # POST /api/ai/chat
└── lib/
    ├── langchain-agent.ts          # Agent setup
    ├── canvas-tools.ts             # Tool definitions
    └── auth-utils.ts               # Firebase auth
```

**Files Combined:**
- ChatMessage + ChatInput → AIChatPanel (single component)
- aiCanvasService + aiApiService → aiService
- useAIChat + useAIChatPersistence → useAIChat

### Data Flow

```
User Input ("Create a red rectangle")
  ↓
aiChatStore.addMessage({role: 'user', content: ...})
  ↓
aiService.sendMessage() → POST /api/ai/chat
  Headers: Authorization: Bearer <firebase-token>
  Body: {canvasId, message, history}
  ↓
Verify Firebase token → Extract userId
  ↓
Load canvas context (objects, layers)
  ↓
Initialize LangChain agent with manipulateCanvas tool
  ↓
Agent executes: manipulateCanvas({operation: "create", createParams: {...}})
  ↓
Tool calls aiService.createShape()
  ↓
aiService → objectsService.createObject()
  ↓
Firestore + RTDB sync (existing flow)
  ↓
Store label in objectMemory if provided
  ↓
Return: {success: true, message: "Created rectangle", objectId: "..."}
  ↓
aiChatStore.addMessage({role: 'assistant', content: ...})
  ↓
UI updates
```

---

## 4. Technical Specifications

### Commands (Phase 1)

1. **Create Rectangle:** "Create a red rectangle at 200, 300"
2. **Create Circle:** "Make a blue circle with radius 50"
3. **Create Text:** "Add text 'Hello World' at 100, 100"

### Tool Schema: Unified from Day 1

**Tool Name:** `manipulateCanvas` (same in PRD 2)

```typescript
{
  name: "manipulateCanvas",
  description: "Perform canvas operations. In this phase, only 'create' operation is available.",
  schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["create"],  // PRD 2 adds: "move", "resize", "delete", etc.
        description: "The operation to perform"
      },
      createParams: {
        type: "object",
        description: "Parameters for create operation",
        properties: {
          shapeType: {
            type: "string",
            enum: ["rectangle", "circle", "text"],
            description: "Type of shape to create"
          },
          x: {type: "number", description: "X coordinate"},
          y: {type: "number", description: "Y coordinate"},
          width: {type: "number", description: "Width (rectangle, default 100)"},
          height: {type: "number", description: "Height (rectangle, default 100)"},
          radius: {type: "number", description: "Radius (circle, default 50)"},
          text: {type: "string", description: "Text content (text shapes)"},
          fontSize: {type: "number", description: "Font size (text, default 16)"},
          color: {type: "string", description: "Fill color (hex or CSS name)"},
          label: {
            type: "string",
            description: "Optional semantic label for future reference"
          }
        },
        required: ["shapeType", "x", "y"]
      }
    },
    required: ["operation"]
  }
}
```

### Canvas Context (Provided to AI)

```typescript
interface CanvasContext {
  canvasId: string;
  visibleObjects: CanvasObject[];  // Only unlocked & visible
  layers: Layer[];
  lockedLayers: string[];          // Layer IDs that are locked
  userId: string;
}
```

### Object Memory (Foundation for PRD 2)

**In-Memory Map at API Route Level:**

```typescript
// app/api/ai/chat/route.ts
// Simple Map stored in memory, cleared when API route restarts
const objectMemory = new Map<string, {
  objectId: string;
  label?: string;      // If user provided a label
  type: string;        // "rectangle" | "circle" | "text"
  color: string;
  createdAt: number;
}>();
```

**Usage:**
- When AI creates object with label, store in Map
- PRD 2 will query this Map for semantic references
- No Firestore persistence needed (session-only)

### AI Service Layer

**File:** `src/features/ai-agent/services/aiService.ts`

```typescript
// Client-side wrapper
export async function createShape(
  canvasId: string,
  shapeType: 'rectangle' | 'circle' | 'text',
  params: ShapeParams,
  label?: string
): Promise<AIResult>

interface AIResult {
  success: boolean;
  message: string;
  object?: CanvasObject;
  objectId?: string;
  error?: string;
}

interface ShapeParams {
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  color?: string;
}
```

**Implementation:**
- Calls existing `objectsService.createObject()`
- Returns AI-friendly messages
- Minimal error handling (let errors surface naturally)

---

## 5. LangChain Integration

### Dependencies

```json
{
  "dependencies": {
    "langchain": "^0.3.0",
    "@langchain/openai": "^0.3.0",
    "@langchain/core": "^0.3.0",
    "openai": "^4.67.0"
  }
}
```

### Agent Setup

**File:** `app/api/ai/lib/langchain-agent.ts`

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { createManipulateCanvasTool } from "./canvas-tools";

export function createAgent(
  canvasContext: CanvasContext,
  objectMemory: Map<string, any>
) {
  const model = new ChatOpenAI({
    modelName: "gpt-4-turbo",
    temperature: 0.2,
  });
  
  const tools = [createManipulateCanvasTool(canvasContext, objectMemory)];
  const modelWithTools = model.bindTools(tools);
  
  return modelWithTools;
}
```

### System Prompt

```
You are an AI assistant for CollabCanvas, a collaborative design tool.

You can create shapes on the canvas using the manipulateCanvas tool.

Available operations: create
Available shapes: rectangle, circle, text

Canvas context:
- Canvas ID: {canvasId}
- Visible objects: {visibleObjects.length}
- Layers: {layers.map(l => l.name).join(', ')}

When creating shapes:
- Use reasonable defaults: rectangles (100x100), circles (radius 50), text (16px)
- Confirm successful creation with object properties
- If layer is locked, tell user to unlock it first
```

---

## 6. LangSmith Observability

### Environment Variables

```bash
OPENAI_API_KEY=sk-...
LANGCHAIN_API_KEY=lsv2_pt_...
LANGCHAIN_PROJECT=collabcanvas-ai
LANGCHAIN_TRACING_V2=true
```

### Auto-Tracing

When env vars are set, LangSmith automatically traces:
- User prompts
- Tool calls + parameters
- Tool results
- Final responses
- Latency metrics
- Errors

Access at: https://smith.langchain.com

---

## 7. Security

**API Keys:**
- Server-side only (API routes)
- Stored in Vercel environment variables
- Never exposed to client

**Authentication:**
- Firebase ID token in `Authorization: Bearer <token>` header
- Verify token with Firebase Admin SDK
- Extract userId from verified token
- Check user has canvas access (owner or collaborator)

---

## 8. Implementation Plan

### Phase 1: Backend Foundation (Day 1)

1. Install dependencies: `npm install langchain @langchain/openai @langchain/core openai`
2. Create `app/api/ai/chat/route.ts` with basic structure
3. Create `app/api/ai/lib/auth-utils.ts` for token verification
4. Test with simple OpenAI call (echo user message, no tools)
5. Add LangSmith env vars, verify traces in dashboard

### Phase 2: UI Components (Day 2)

6. Create `AIChatPanel.tsx` (all UI in one component)
7. Create `aiChatStore.ts` (Zustand store)
8. Create `useAIChat.ts` (hook with sessionStorage)
9. Add AI button to canvas header
10. Wire up API calls via `aiService.ts`

### Phase 3: Tools & Integration (Day 3-4)

11. Create `aiService.ts` with `createShape()`
12. Create `canvas-tools.ts` with `manipulateCanvas` tool (only "create" operation)
13. Update `langchain-agent.ts` with tool binding and objectMemory
14. Test all three commands
15. Verify multi-user sync and attribution

---

## 9. Success Criteria

✅ **Auth:** Only authenticated users can use AI  
✅ **Security:** API keys never in client code  
✅ **Tracing:** All requests visible in LangSmith  
✅ **Commands:** Rectangle, circle, text creation works  
✅ **Multi-User:** Objects sync to all collaborators  
✅ **Persistence:** Chat survives page refresh (sessionStorage)  
✅ **Performance:** API response < 2 seconds  
✅ **Foundation:** Object memory ready for PRD 2

---

## 10. Files to Create (12 new files)

**Feature Files (7):**
- `src/features/ai-agent/components/AIChatPanel.tsx`
- `src/features/ai-agent/hooks/useAIChat.ts`
- `src/features/ai-agent/services/aiService.ts`
- `src/features/ai-agent/lib/aiChatStore.ts`
- `src/features/ai-agent/types/index.ts`
- `src/features/ai-agent/index.ts`
- `src/features/ai-agent/README.md`

**API Files (4):**
- `app/api/ai/chat/route.ts`
- `app/api/ai/lib/langchain-agent.ts`
- `app/api/ai/lib/canvas-tools.ts`
- `app/api/ai/lib/auth-utils.ts`

**Documentation (1):**
- `tasks/prd-ai-agent-basic.md` (this file)

---

## 11. Files to Update (3)

- `app/canvas/[canvasId]/page.tsx` - Add AI button to header
- `package.json` - Add LangChain dependencies
- `.env.local` - Add OpenAI + LangSmith keys

---

## 12. Foundation for PRD 2

**What PRD 1 Establishes:**
- ✅ `manipulateCanvas` tool (PRD 2 adds more operations)
- ✅ Object memory Map (PRD 2 adds semantic search)
- ✅ AI service layer (PRD 2 adds more functions)
- ✅ Auth & API infrastructure (complete)
- ✅ LangSmith tracing (complete)

**What PRD 2 Will Add:**
- More `operation` types: "move", "resize", "delete", "batch_create", "layout"
- Semantic reference resolution using object memory
- Multi-step command planning
- Smart layout algorithms

**No Refactoring Required:** PRD 2 extends this foundation cleanly.

---

*Last Updated: 2025-10-19 - Simplified & ready for implementation*
