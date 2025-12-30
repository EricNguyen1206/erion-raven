# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Erion Raven** is a full-stack real-time chat application built with a modern monorepo architecture using Turborepo and PNPM. It features real-time messaging via Socket.IO, JWT-based authentication, friend requests, group conversations, and direct messaging.

## Essential Commands

### Development Commands

```bash
# Install all dependencies (monorepo)
pnpm install

# Start both frontend and backend in development mode
pnpm dev

# Start apps individually
pnpm --filter @raven/api dev      # Backend only (port 8080)
pnpm --filter @raven/web dev      # Frontend only (port 3001)

# Build all packages
pnpm build

# Build specific package
pnpm --filter @raven/api build
pnpm --filter @raven/web build
```

### Testing Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage (target: 80%+)
pnpm test:coverage

# Backend tests only
pnpm --filter @raven/api test

# Frontend tests only
pnpm --filter @raven/web test

# Frontend test UI (Vitest)
pnpm --filter @raven/web test:ui
```

### Code Quality Commands

```bash
# Lint all packages
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Format code with Prettier
pnpm format

# Type checking
pnpm type-check
```

### Makefile Shortcuts

```bash
make dev                  # Start development environment
make test                 # Run all tests
make build                # Build all packages
make clean                # Clean build artifacts and node_modules
make setup                # Complete setup (install + migrate + seed)
make health               # Check service health status
```

## Architecture

### Monorepo Structure

```
erion-raven/
├── apps/
│   ├── api/              # Backend (Express + TypeScript + MongoDB)
│   └── web/              # Frontend (React + Vite + TypeScript)
├── packages/
│   ├── config/           # Shared configs (ESLint, Jest, Prettier, TSConfig)
│   ├── shared/           # Shared utilities and helpers
│   ├── types/            # Shared TypeScript type definitions
│   └── validators/       # Shared Zod validation schemas
└── _docs/                # Comprehensive documentation
```

### Technology Stack

**Backend (`apps/api`):**
- Runtime: Node.js 18+ with TypeScript
- Framework: Express.js
- Database: MongoDB with Mongoose ODM
- Cache/Sessions: Redis
- WebSocket: Socket.IO 4.x
- Auth: JWT (access + refresh tokens in httpOnly cookies)
- Validation: Zod schemas
- Testing: Jest + Supertest

**Frontend (`apps/web`):**
- Framework: React 18 with Vite
- Routing: React Router v6
- State: Zustand (global) + TanStack Query (server state)
- UI: shadcn/ui components + Tailwind CSS
- WebSocket: Socket.IO Client
- HTTP: Axios
- Testing: Vitest + React Testing Library

**DevOps:**
- Package Manager: PNPM (workspaces)
- Monorepo: Turborepo
- Containerization: Docker + Docker Compose

### Key Services Layer (Backend)

The backend follows a service-oriented architecture:

- **AuthService** - User authentication, JWT generation, session management
- **UserService** - User CRUD operations, profile management
- **ConversationService** - Conversation creation, membership management
- **MessageService** - Message persistence, pagination, history
- **FriendService** - Friend requests, acceptance/rejection, friendship management
- **WebSocketService** - Real-time event handling, room management, Socket.IO integration
- **StorageService** - File/avatar uploads (integrates with S3-compatible storage)

### Data Flow Patterns

**Authentication Flow:**
1. Client sends credentials → API validates → AuthService checks MongoDB
2. On success: Generate JWT tokens → Store refresh token in Redis → Set httpOnly cookies
3. Subsequent requests: JWT middleware validates access token from cookies

**Real-time Messaging Flow:**
1. Client A emits `send_message` → Socket.IO server receives
2. WebSocketService → MessageService saves to MongoDB
3. WebSocketService publishes to Redis (for multi-server support)
4. Socket.IO broadcasts `new_message` to all clients in conversation room

**Friend Request Flow:**
1. POST /api/v1/friends/requests → FriendService validates relationship doesn't exist
2. Create FriendRequest document in MongoDB
3. WebSocketService emits `friend_request_received` to target user
4. Target user accepts → Create Friend documents for both users

### Security Architecture

1. **Authentication:** JWT access tokens (15min) + refresh tokens (7d) in httpOnly cookies
2. **Rate Limiting:** Redis-based (auth: 5 req/15min, general: 100 req/15min)
3. **Input Validation:** All inputs validated with Zod schemas (shared in `packages/validators`)
4. **Authorization:** Middleware checks resource ownership and conversation membership
5. **Password Security:** Bcrypt hashing with 10 rounds
6. **Transport:** HTTPS/TLS for API, WSS for WebSocket

## Important Development Patterns

### Shared Code Organization

- **Types** (`packages/types/src/`): All shared TypeScript interfaces and types
  - Use these for consistency between frontend and backend
  - Export from `@raven/types`

- **Validators** (`packages/validators/src/`): Zod schemas for input validation
  - Used on both frontend (form validation) and backend (API validation)
  - Export from `@raven/validators`

- **Shared Utilities** (`packages/shared/src/`): Common helpers, constants, error classes
  - Export from `@raven/shared`

### Backend Patterns

- **Models** (`apps/api/src/models/`): Mongoose schemas with indexes
  - Always add appropriate indexes for frequently queried fields
  - Use soft deletes with `deletedAt` field

- **Controllers** (`apps/api/src/controllers/`): Request handlers
  - Keep controllers thin - delegate to services
  - Use try-catch with centralized error handler

- **Services** (`apps/api/src/services/`): Business logic
  - Services should be testable and isolated
  - Services interact with models and external services

- **Routes** (`apps/api/src/routes/`): API endpoint definitions
  - Prefix all routes with `/api/v1`
  - Apply authentication middleware where needed

### Frontend Patterns

- **Component Structure:** Follows Atomic Design
  - `atoms/` - Basic UI elements (Button, Input)
  - `molecules/` - Composite components (SearchBar, MessageBubble)
  - `organisms/` - Complex components (ChatPanel, ConversationList)
  - `templates/` - Layout templates
  - `ui/` - shadcn/ui components

- **State Management:**
  - Global state (auth, user): Zustand stores (`store/`)
  - Server state (API data): TanStack Query
  - Local state: React useState/useReducer

- **API Calls:**
  - Create service files in `services/` (e.g., `authService.ts`)
  - Wrap with TanStack Query hooks for caching/refetching

- **WebSocket Integration:**
  - Use Socket.IO client from `services/websocket.ts`
  - Handle connection in custom hooks (`hooks/useSocket.ts`)
  - Emit events for user actions, listen for server events

### Testing Patterns

- **Backend:** Use MongoDB Memory Server for integration tests, mock Redis
- **Frontend:** Mock API calls with MSW (Mock Service Worker), use React Testing Library
- **Test Structure:** Follow AAA pattern (Arrange, Act, Assert)
- **Coverage Target:** 80%+ for statements/functions/lines, 75%+ for branches

## Documentation Structure

All documentation is in `_docs/`:

- **ARCHITECTURE.md** - System design, tech stack, data flows, scaling considerations
- **API_DESIGN.md** - Complete REST API documentation with examples
- **DATABASE_SCHEMA.md** - MongoDB collections, relationships, indexes
- **WEBSOCKET_EVENTS.md** - Socket.IO events (client/server), payloads, usage
- **DEVELOPMENT.md** - Local setup, environment variables, debugging
- **TESTING.md** - Testing strategies, examples, coverage configuration

**When implementing features:** Always reference these docs first to understand existing patterns and specifications.

## Common Development Scenarios

### Adding a New API Endpoint

1. Define validation schema in `packages/validators/src/`
2. Add method to appropriate service in `apps/api/src/services/`
3. Create controller method in `apps/api/src/controllers/`
4. Add route in `apps/api/src/routes/`
5. Update `_docs/API_DESIGN.md`
6. Write integration tests in `apps/api/src/__tests__/integration/`

### Adding a New Feature to Frontend

1. Define types in `packages/types/src/`
2. Create API service function in `apps/web/src/services/`
3. Create TanStack Query hook (if needed)
4. Build UI components following Atomic Design
5. Add to appropriate page in `apps/web/src/pages/`
6. Write component tests in `__tests__/` adjacent to component

### Working with WebSocket

- **Server:** Handlers in `apps/api/src/services/websocket.service.ts`
- **Client:** Socket instance in `apps/web/src/services/websocket.ts`
- **Events:** Always reference `_docs/WEBSOCKET_EVENTS.md` for event specifications
- **Testing:** Use Socket.IO test utilities, mock Redis pub/sub

### Database Changes

1. Update Mongoose model in `apps/api/src/models/`
2. Add indexes for new query patterns
3. Update types in `packages/types/src/`
4. Update `_docs/DATABASE_SCHEMA.md`
5. Test with MongoDB Memory Server in integration tests

## Environment Setup

**Required Services:**
- MongoDB 6+ (default: `mongodb://localhost:27017/erion-raven`)
- Redis 7+ (default: `localhost:6379`)
- Node.js 18+
- PNPM 8+

**Quick Start:**
```bash
# Using Docker for dependencies
docker-compose up -d mongodb redis

# Install and setup
pnpm install
make setup  # Runs install + migrations + seed

# Start development
pnpm dev
```

**URLs:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:8080
- API Docs: http://localhost:8080/api-docs (if configured)

## Critical Notes

- **Package Names:** Backend is `@raven/api`, Frontend is `@raven/web` (historical naming from "Notify" project)
- **Ports:** API runs on 8080 (not 3000), Web runs on 3001
- **Authentication:** Uses httpOnly cookies with JWT, not Authorization headers
- **WebSocket:** Shares the same port as the API (8080), upgrade from HTTP
- **IDs:** All MongoDB ObjectIds should use string representation in TypeScript types
- **Error Handling:** Backend uses centralized error handler, always throw typed errors

## References to Existing Code

When working on features, check these key files:

- Auth flow: `apps/api/src/services/auth.service.ts`
- WebSocket setup: `apps/api/src/services/websocket.service.ts`
- Database models: `apps/api/src/models/`
- API routes: `apps/api/src/routes/`
- Frontend auth: `apps/web/src/store/authStore.ts`
- API client: `apps/web/src/services/`
