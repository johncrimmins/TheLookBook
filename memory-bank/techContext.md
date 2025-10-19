# Technical Context: CollabCanvas v3

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Canvas Library:** Konva.js (canvas management and rendering)
- **State Management:** Zustand (lightweight, performant state)
- **UI Components:** ShadCN (built on Radix UI primitives + Tailwind CSS)

### Backend / Services
- **Authentication:** Firebase Auth
- **Real-Time Database:** Firebase Realtime Database (RTDB) for cursor/presence
- **Persistence:** Firestore (object state persistence)
- **AI Integration:** LangChain (post-MVP)
- **LLM:** OpenAI API (post-MVP)
- **Observability:** LangSmith (post-MVP)

### Infrastructure
- **Hosting:** Vercel (Next.js optimized deployment)
- **CDN:** Vercel Edge Network
- **Environment:** Serverless functions via Vercel

## Development Setup

### Prerequisites
- Node.js 18+, Firebase account, OpenAI API key (for AI agent phase)

### Environment Configuration
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

# OpenAI (Post-MVP)
OPENAI_API_KEY=

# LangSmith (Post-MVP)
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=
```

## Dependencies

### Core Dependencies
- `next`: Next.js framework
- `react` & `react-dom`: React library
- `typescript`: Type safety
- `tailwindcss`: Utility-first CSS
- `konva` & `react-konva`: Canvas rendering and manipulation
- `zustand`: State management
- `firebase`: Firebase SDK (Auth, RTDB, Firestore)
- `@radix-ui/*`: Accessible UI primitives (ShadCN dependency)
- `class-variance-authority`: Component variant management
- `clsx` & `tailwind-merge`: Tailwind class utilities

### AI Dependencies (Post-MVP)
- `langchain`: AI agent orchestration
- `@langchain/openai`: OpenAI integration
- `openai`: OpenAI SDK

### Development Dependencies
- `@types/node`, `@types/react`, `@types/react-dom`: TypeScript types
- `eslint`, `eslint-config-next`: Code linting
- `prettier`: Code formatting
- `@typescript-eslint/*`: TypeScript linting

## Architecture: Vertical Slicing

Directory structure organized by feature, not layer:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── canvas/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── presence/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── objects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── ai-agent/ (post-MVP)
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
└── app/ (Next.js App Router)
    ├── layout.tsx
    ├── page.tsx
    └── canvas/[id]/page.tsx
```

## Technical Constraints

### Performance Requirements
- **Cursor Sync:** <50ms latency
- **Object Sync:** <100ms latency
- **AI Response:** <2s for single-step commands (post-MVP)
- **Frame Rate:** 60 FPS with 500+ objects
- **Load Time:** <3s initial page load

### Scalability Requirements
- Support 5+ concurrent users (MVP)
- Scale to 10+ concurrent users (stretch)
- Handle 500+ objects without degradation
- Efficient RTDB usage (minimize bandwidth)

### Security Requirements
- Firebase Auth for user management
- Protected routes (authenticated only)
- Environment variables for all secrets
- No exposed credentials in client code
- Firestore security rules for data access

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features
- Canvas API support required

## Development Workflow

### Build Strategy
1. ✅ Core Platform (auth, presence, canvas, objects, history)
2. 🔄 Phase 1 Canvas Improvements (manipulation features, UI refactor)
3. 📋 Phase 2 AI Agent (LangChain + OpenAI)

## Conflict Resolution Strategy
**Approach:** Last-Write-Wins (LWW)
- Each update includes timestamp
- Latest timestamp wins in conflicts
- Simple, predictable, acceptable for MVP
- Document this choice clearly in code

## Performance Optimizations
- Throttle cursor position updates (16ms = 60fps)
- Debounce object position persistence to Firestore
- Use RTDB for ephemeral data (cursors, presence)
- Use Firestore for persistent data (objects)
- Konva layer optimization (separate cursor layer)
- React memo for expensive re-renders

## Key Considerations
- Firebase RTDB connection limits (monitor quota)
- Canvas rendering performance with 500+ objects
- Vercel serverless cold starts (AI agent phase)
- Security: Firebase rules, input validation, cost monitoring
- Validate all user input
- Sanitize AI-generated commands

---
*Last Updated: 2025-10-19 - Added ShadCN UI dependencies*

