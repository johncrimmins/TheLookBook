# System Patterns: CollabCanvas v3

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Next.js App                          │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐  │
│  │    Auth    │  │ Presence │  │ Canvas  │  │ AI Agent  │  │
│  │  Feature   │  │ Feature  │  │ Feature │  │  Feature  │  │
│  └────────────┘  └──────────┘  └─────────┘  └───────────┘  │
│         │              │              │             │        │
│         └──────────────┴──────────────┴─────────────┘        │
│                         │                                     │
│                    Zustand Store                             │
└─────────────────────────┼───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼─────┐  ┌─────▼──────┐  ┌────▼─────┐
    │ Firebase  │  │  Firebase  │  │ OpenAI/  │
    │   Auth    │  │    RTDB    │  │LangChain │
    └───────────┘  │ (Cursors,  │  └──────────┘
                   │ Presence)  │
                   └────────────┘
                   ┌────────────┐
                   │ Firestore  │
                   │ (Objects)  │
                   └────────────┘
```

### Data Flow Architecture
1. **User authenticates** → Firebase Auth → User session stored
2. **User joins canvas** → Presence written to RTDB → Other users see them online
3. **User moves cursor** → Throttled position sent to RTDB → Others see cursor in real-time
4. **User creates object** → Zustand store updates → Object written to Firestore → Broadcast to RTDB → Other users' stores update
5. **User moves object** → Optimistic local update → Debounced persist to Firestore → Broadcast delta to RTDB
6. **AI command** (future) → LangChain parses → Function tools called → Objects created/modified → Synced via existing flow

## Key Technical Decisions

### Decision 1: Vertical Slicing Architecture
- **Decision:** Organize code by feature, not by technical layer
- **Rationale:** 
  - Each feature is self-contained (components, hooks, services, types)
  - Easier to understand and maintain
  - Natural boundary for code splitting
  - Clear ownership and testing scope
- **Alternatives Considered:** 
  - Traditional layered (all components/, all hooks/, all services/)
  - Would create long import paths and scattered related code
- **Trade-offs:**
  - ✅ Better scalability and maintainability
  - ✅ Clear feature boundaries
  - ⚠️ Some code duplication (mitigated by shared/ folder)

### Decision 2: Dual Database Strategy
- **Decision:** Use Firebase RTDB for ephemeral data, Firestore for persistence
- **Rationale:**
  - RTDB optimized for low-latency real-time updates (cursors, presence)
  - Firestore optimized for structured data and complex queries (objects)
  - Leverage strengths of each database
- **Alternatives Considered:**
  - RTDB only: Poor for structured data, harder queries
  - Firestore only: Higher latency for real-time cursors
  - Custom WebSocket server: More infrastructure to manage
- **Trade-offs:**
  - ✅ Optimal performance for each use case
  - ✅ Firebase handles scaling and reliability
  - ⚠️ Two databases to manage
  - ⚠️ Slightly more complex data flow

### Decision 3: Zustand for State Management
- **Decision:** Use Zustand instead of Redux or Context API
- **Rationale:**
  - Lightweight and minimal boilerplate
  - Excellent performance (no unnecessary re-renders)
  - TypeScript support out of the box
  - Simple API, easy to learn
- **Alternatives Considered:**
  - Redux: Too much boilerplate for this use case
  - Context API: Performance issues with frequent updates
  - Jotai/Recoil: Less mature, similar benefits to Zustand
- **Trade-offs:**
  - ✅ Fast development velocity
  - ✅ Great performance with canvas updates
  - ✅ Small bundle size
  - ⚠️ Less ecosystem tooling than Redux

### Decision 4: Last-Write-Wins Conflict Resolution
- **Decision:** Use timestamp-based last-write-wins for conflicts
- **Rationale:**
  - Simple to implement and reason about
  - Acceptable for MVP with known trade-offs
  - Predictable behavior for users
- **Alternatives Considered:**
  - CRDT: Complex implementation, overkill for MVP
  - Operational Transform: High complexity
  - Locking: Poor UX, reduces collaboration
- **Trade-offs:**
  - ✅ Simple implementation
  - ✅ Fast performance
  - ⚠️ Can lose edits in race conditions (acceptable for MVP)
  - ⚠️ No true merge capability

### Decision 5: Konva.js for Canvas Rendering
- **Decision:** Use Konva.js instead of raw Canvas API or other libraries
- **Rationale:**
  - High-level API for shapes and transformations
  - Built-in event handling and hit detection
  - Good performance with many objects
  - React integration via react-konva
- **Alternatives Considered:**
  - Raw Canvas API: Too low-level, more work
  - Fabric.js: Heavier, less React-friendly
  - Paper.js: Vector focus, different paradigm
- **Trade-offs:**
  - ✅ Faster development
  - ✅ Good performance
  - ✅ React integration
  - ⚠️ Learning curve for advanced features

## Design Patterns

### Pattern 1: Feature Slice Pattern
- **Purpose:** Organize all related code for a feature in one place
- **Implementation:** Each feature has components/, hooks/, services/, types/
- **Example:** See @src/features/presence/ for complete implementation

### Pattern 2: Service Layer Pattern
- **Purpose:** Encapsulate Firebase interactions and business logic
- **Implementation:** Each feature has a service file handling external calls
- **Example:** See @src/features/presence/services/presenceService.ts

### Pattern 3: Custom Hooks Pattern
- **Purpose:** Encapsulate stateful logic and side effects
- **Implementation:** Each feature exposes React hooks for components
- **Example:** See @src/features/presence/hooks/usePresence.ts

### Pattern 4: Optimistic Updates Pattern
- **Purpose:** Provide instant feedback before server confirmation
- **Implementation:** Update local state immediately, then sync to server
- **Key Steps:** (1) Local store update, (2) RTDB broadcast, (3) Firestore persist
- **Example:** See @src/features/objects/hooks/useObjects.ts

### Pattern 5: Pub/Sub Pattern for Real-Time Updates
- **Purpose:** Decouple data producers from consumers
- **Implementation:** RTDB listeners trigger store updates
- **Example:** See @src/features/objects/services/objectsService.ts and @src/features/presence/services/presenceService.ts

### Pattern 6: Shared Interaction Hook Pattern (DRY)
- **Purpose:** Eliminate code duplication across shape components
- **Implementation:** Single hook handles all interaction logic for any shape type
- **Benefits:** One place to update logic, ~30 lines for new shapes, type-safe, AI-ready
- **Example:** See @src/features/objects/hooks/useShapeInteractions.ts (hook) and @src/features/objects/components/Rectangle.tsx (usage)

### Pattern 7: ShadCN Component Pattern
- **Purpose:** Reusable, accessible UI components
- **Implementation:** Built on Radix UI + Tailwind, located in `src/shared/components/ui/`
- **Benefits:** Consistent design, ARIA compliant, easily customizable
- **Key Components:** Button, Input, Label, Card, Avatar, Badge, Separator, Popover
- **Example:** `import { Button } from '@/shared/components/ui/button'`

## Component Relationships

### Core Features (MVP)

#### Auth Feature
- **Responsibilities:** User authentication, session management, protected routes
- **Exposes:** `useAuth()`, `<AuthProvider>`, `<ProtectedRoute>`
- **Dependencies:** Firebase Auth
- **Integration:** Required by all other features

#### Presence Feature
- **Responsibilities:** User online/offline status, cursor positions
- **Exposes:** `usePresence()`, `useUserCursors()`, `<UserCursor>`
- **Dependencies:** Firebase RTDB, Auth feature
- **Integration:** Canvas feature renders cursors

#### Canvas Feature
- **Responsibilities:** Canvas rendering, pan/zoom, viewport management
- **Exposes:** `<Canvas>`, `useCanvas()`, `useViewport()`
- **Dependencies:** Konva.js, Zustand
- **Integration:** Hosts objects and cursors

#### Objects Feature
- **Responsibilities:** Shape creation, manipulation, sync
- **Exposes:** `useObjects()`, shape components, object services
- **Dependencies:** Firestore, RTDB, Canvas feature
- **Integration:** Rendered within Canvas, synced via services

### Post-MVP Features

#### AI Agent Feature
- **Responsibilities:** Natural language parsing, canvas manipulation via tools
- **Exposes:** `<AIChat>`, `useAIAgent()`, tool functions
- **Dependencies:** LangChain, OpenAI, Objects feature
- **Integration:** Calls object services to create/manipulate shapes

## Data Flow Patterns

### Cursor Movement Flow
User moves → Throttle (60fps) → Local store → RTDB broadcast → Listeners fire → Other users' stores update → Render (<50ms total)

### Object Creation Flow
User creates → UUID → Local store (optimistic) → Firestore persist → RTDB broadcast → Listeners fire → Other users' stores update → Render (<100ms total)

### Object Movement Flow
User drags → Local update (optimistic) → RTDB throttle (16ms) → Firestore debounce (300ms) → Smooth sync across users (<100ms perceived)

## Standards and Conventions

### Naming Conventions
- **Files:** PascalCase for components, camelCase for utilities
- **Components:** PascalCase (e.g., `UserCursor.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `usePresence.ts`)
- **Services:** camelCase with Service suffix (e.g., `presenceService.ts`)
- **Types:** PascalCase with type/interface keyword (e.g., `User`, `CanvasObject`)

### File Organization
- One component per file
- Co-locate tests with implementation (e.g., `usePresence.test.ts`)
- Barrel exports from feature index files
- Shared utilities in `src/shared/` - ruthlessly avoid overpolluting; keep modularity and only share utilities if truly shared across 2+ components

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- Functional components with hooks (no class components)
- Explicit return types for functions
- Descriptive variable names (avoid abbreviations)

### Documentation
- JSDoc comments for public APIs
- README in each feature folder explaining purpose
- Inline comments for complex logic
- Architecture decisions documented in this file

### Code Standards
- TypeScript strict mode, ESLint + Prettier
- Functional components with hooks
- One component per file, barrel exports from feature index
- JSDoc for public APIs, inline comments for complex logic

---
*Last Updated: 2025-10-19 (Added Pattern 7: ShadCN Component Pattern)*

