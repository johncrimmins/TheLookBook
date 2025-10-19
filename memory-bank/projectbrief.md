# Project Brief: CollabCanvas v3

## Project Overview
**Project Name:** CollabCanvas v3  
**Timeline:** Core Platform (Complete), AI Agent Development (In Progress)  
**Status:** Production Ready - Building AI Agent

## Core Purpose
CollabCanvas is a real-time collaboration app enabling users to login, create and manipulate shapes with tools and AI, and collaborate with each other on a shared canvas in real time.

**Build Strategy:** First build the core collaborative canvas with real-time sync for the MVP. Then layer on an AI agent that manipulates the canvas through natural language.

## Primary Goals
1. **Bulletproof Multiplayer Sync** - Sub-50ms cursor sync, sub-100ms object sync
2. **Solid Foundation** - Collaborative infrastructure that scales cleanly to AI features
3. **Production Ready** - Deployed, publicly accessible, supporting 5+ concurrent users

## Core Platform Features (Complete) ✅
All 5 core features deployed:
- Auth, presence, canvas, objects, history
- Real-time sync (<100ms objects, <50ms cursors)
- ShadCN UI component system
- Deployed to Vercel, publicly accessible

## Key Requirements

### Phase 1: Core Collaborative Infrastructure (Complete) ✅
- Sub-100ms object sync, Sub-50ms cursor sync
- Conflict resolution (last-write-wins documented)
- Persistence & reconnection handling
- Clean connection status indicators
- Modern UI with ShadCN component system

### Phase 2: AI Canvas Agent (In Progress)
- 8+ distinct command types (creation, manipulation, layout, complex)
- Sub-2 second response time
- Multi-step operation planning
- Shared AI state across all users

### Phase 3: Advanced Features (Future)
- Object grouping, alignment tools
- AI Agent advanced commands

## Success Criteria

### Core Platform Success ✅
- Two cursors syncing smoothly with <50ms latency
- Objects sync across users with <100ms latency
- State persists through disconnects and page refreshes
- 5+ users can collaborate simultaneously
- Zero visible lag during rapid multi-user edits
- Professional UI with consistent design system

### AI Agent Success (In Development)
- 90%+ command accuracy
- Natural UX with immediate feedback
- Complex commands (pre-defined inputs) execute multi-step plans correctly
- Multiple users can use AI simultaneously without conflict

### Performance Targets
- Consistent performance with 500+ objects
- Smooth interactions at 60 FPS
- Fast load times (<3s initial)

## Constraints
- **Timeline:** Core platform complete, now building AI layer
- **Performance:** Sub-50ms cursor, sub-100ms objects, sub-2s AI responses
- **Scalability:** Must support 5+ concurrent users minimum
- **Architecture:** Vertical slicing by feature for clean separation
- **UI Standards:** ShadCN component system for all UI elements

## Scope

### In Scope (Complete) ✅
- Core platform: Auth, presence, canvas, objects, history
- Real-time sync (RTDB + Firestore)
- ShadCN UI, deployment to Vercel

### In Scope (Phase 1 Complete) ✅
- Phase 1: Toolbar refactor, layers panel, multi-select

### In Scope (Planned)
- Phase 2: AI Agent (LangChain + OpenAI, 8+ command types)
- Phase 3: Lookbooks (PRDs ready - Feature 8 & 9)
  - My Lookbooks: Multi-canvas project repository with auto-save
  - Shared Lookbooks: Collaboration, ownership, Google Docs-style presence
  - Backend: "canvases" collection, Frontend: "Lookbooks" terminology
  - Firestore structure ready, no breaking changes to existing features

### Out of Scope (Future)
- Advanced Lookbooks features (templates, public sharing, search/filtering)
- AI Agent enhancements beyond Phase 2

---
*Last Updated: 2025-10-19 - Phase 1 complete; Lookbooks PRDs ready*

