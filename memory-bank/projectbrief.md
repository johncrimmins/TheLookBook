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
- ✅ Basic canvas with pan/zoom
- ✅ Two shape types (rectangle and circle)
- ✅ Ability to create, move, and delete objects
- ✅ Real-time sync between 2+ users
- ✅ Multiplayer cursors with name labels
- ✅ Presence awareness (who's online)
- ✅ User authentication (users have accounts/names)
- ✅ Deployed and publicly accessible
- ✅ ShadCN UI component system integrated

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
- Undo/redo with keyboard shortcuts
- Object grouping/ungrouping
- Layers panel with drag-to-reorder
- Alignment tools
- AI Agent advanced commands / improvements

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
- User authentication (Firebase Auth)
- Real-time cursor sync (Firebase RTDB)
- Real-time object sync (Firebase RTDB + Firestore persistence)
- User presence awareness
- Basic canvas with pan/zoom (Konva.js)
- Multiple shape types with move capability
- Connection status indicators
- Deployment (Vercel)
- ShadCN UI component integration

### In Scope (In Development)
- AI Agent with LangChain + OpenAI
- 8+ command types (creation, manipulation, layout, complex)
- Multi-step complex operations
- LangSmith observability
- Additional shape types (rectangles, circles, text, lines)
- Transform operations (resize, rotate)
- Multi-select and layer management

### Out of Scope (Future)
- Undo/redo
- Object grouping
- Layers panel
- Alignment tools
- Auto-layout
- Agent enhancements

---
*Last Updated: 2025-10-19 - Added ShadCN UI integration*

