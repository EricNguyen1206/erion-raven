# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Erion Raven** is a real-time chat application built as a TypeScript monorepo using Turborepo and pnpm workspaces. It features a Node.js/Express backend with Socket.IO for WebSocket communication, and a React frontend with Vite.

### Tech Stack

**Backend (`apps/api`):**
- Node.js 18+ with Express.js
- TypeScript 5.x with strict configuration
- MongoDB with Mongoose ODM
- Redis for caching and session management
- Socket.IO 4.x for real-time WebSocket
- JWT authentication with httpOnly cookies
- Google OAuth 2.0
- AWS S3 for file uploads

**Frontend (`apps/web`):**
- React 19.x with TypeScript
- Vite as build tool and dev server
- React Router v7 for routing
- TanStack Query for data fetching
- Zustand for state management
- Tailwind CSS 4.x with Radix UI components
- Socket.IO client for real-time communication

**Shared Packages:**
- `@raven/types` - TypeScript type definitions
- `@raven/shared` - Shared utilities and constants
- `@raven/validators` - Input validation schemas
- `@raven/config` - Shared configurations (ESLint, Prettier, Jest, TSConfig)

## Development Commands

### Root Level (Turborepo)
```bash
pnpm dev        # Start all development servers (turbo run dev)
pnpm build      # Build all packages
pnpm test       # Run all tests
pnpm lint       # Lint all packages
pnpm format     # Format all code with Prettier
pnpm clean      # Clean all build artifacts
```

### Backend Specific (`apps/api`)
```bash
cd apps/api
pnpm dev         # Start development server with ts-node-dev (hot reload)
pnpm build       # Build with TypeScript compiler
pnpm start       # Run built server
pnpm test        # Run Jest tests
pnpm lint        # Run ESLint
pnpm typecheck   # TypeScript type checking without emitting files
```

### Frontend Specific (`apps/web`)
```bash
cd apps/web
pnpm dev         # Start Vite dev server on port 3001
pnpm build       # Build with TypeScript + Vite
pnpm preview     # Preview production build
pnpm lint        # Run ESLint
pnpm clean       # Remove dist and node_modules
```

### Makefile Alternatives
```bash
make help              # Show all available commands
make backend-dev       # Start backend development
make frontend-dev      # Start frontend development
make migrate           # Run database migrations
make seed              # Seed database with test data
make quick-start       # Complete setup for new contributors
make check-env         # Check prerequisites and environment
```

## Architecture

### Layered Architecture

The system follows a clear separation of concerns:

**Client Layer:**
- React web application with real-time WebSocket connection

**API Gateway Layer:**
- Express REST API on port 8080
- Socket.IO WebSocket server

**Service Layer:**
- Auth Service (JWT, Google OAuth)
- User Service (profile management)
- Conversation Service (chat rooms)
- Message Service (message handling)
- Friend Service (friendship management)
- WebSocket Service (real-time events)
- Storage Service (file uploads to S3)
- Presence Service (online/offline status)
- Redis Service (caching and sessions)

**Data Layer:**
- MongoDB (primary database)
- Redis (caching, sessions, presence)
- AWS S3 (object storage)

### Backend Structure (`apps/api/src/`)

```
config/          # Configuration files (database, Redis, Swagger, etc.)
controllers/     # Request handlers (HTTP and WebSocket)
middleware/      # Express middleware (auth, validation, error handling)
models/          # Mongoose models (MongoDB schemas)
routes/          # API routes organized by feature
services/        # Business logic layer
utils/           # Utility functions (logger, helpers)
index.ts         # Application entry point
```

**Key Pattern:** Controllers handle HTTP requests/responses, Services contain business logic, Models define schemas with Mongoose, and Middleware handles cross-cutting concerns.

### Frontend Structure (`apps/web/src/`)

```
components/      # React components organized by complexity
  ├── atoms/     # Basic UI elements (buttons, inputs, etc.)
  ├── molecules/ # Composite components
  ├── organisms/ # Complex components
  ├── templates/ # Layout templates
  └── ui/        # Radix UI components (shadcn/ui)
guards/          # Route guards for protected routes
hooks/           # Custom React hooks
lib/             # Libraries & utilities
pages/           # Page components
services/        # API services and HTTP client
store/           # Zustand stores for client state
App.tsx          # Root component
```

**Key Pattern:** Component hierarchy follows atomic design (Atoms → Molecules → Organisms → Templates). Custom hooks for reusable logic. TanStack Query for server state, Zustand for client state.

### Shared Packages

All shared packages use workspace references (`workspace:*`) in package.json:

- **@raven/types** - Import from `@raven/types` for shared TypeScript types (user, conversation, message, friend, socket)
- **@raven/validators** - Import from `@raven/validators` for validation schemas (auth.dto, conversation.dto, etc.)
- **@raven/shared** - Import from `@raven/shared` for shared utilities and constants
- **@raven/config** - Extends from workspace configs (ESLint, Prettier, Jest, TSConfig)

## Key Architecture Patterns

### Backend Patterns
- **Repository Pattern** - Services act as repositories for data access
- **Service Layer Pattern** - Business logic isolated in service classes
- **Middleware Pattern** - Cross-cutting concerns (auth, validation, errors)
- **Event-driven** - Socket.IO for real-time events
- **Soft deletion** - `deletedAt` timestamps instead of hard deletes
- **Environment-based config** - Uses .env files with validation

### Frontend Patterns
- **Atomic Design** - Component hierarchy (atoms → molecules → organisms)
- **Custom hooks** - Reusable logic extraction
- **Query-based data fetching** - TanStack Query for server state
- **State management** - Zustand for client state
- **Centralized API client** - Axios with interceptors
- **Type-safe API calls** - Generated types from @raven/types

### Security Architecture
- JWT access tokens (15-minute expiry)
- Refresh tokens in database (30-day expiry)
- httpOnly cookies for token storage
- CSRF protection with SameSite cookies
- Rate limiting with express-rate-limit
- Helmet.js for security headers
- Input validation at all layers (class-validator, Zod)

## Environment Setup

1. **Copy environment files:**
   - `apps/api/.env.example` → `apps/api/.env`
   - `apps/web/.env.example` → `apps/web/.env`

2. **Configure database credentials** in both .env files

3. **Run development servers:**
   ```bash
   pnpm dev    # Starts both backend (port 8080) and frontend (port 3001)
   ```

## Important Notes

- **Module aliases:** Backend uses `@/` alias for src directory (handled by tsconfig-paths/register in dev, module-alias in production)
- **Monorepo:** Always use `pnpm` commands from root to leverage Turborepo caching
- **Hot reload:** Both frontend (Vite) and backend (ts-node-dev) support hot reload in development
- **Type checking:** Run `pnpm typecheck` in backend to verify types without building
- **Documentation:** Comprehensive feature documentation in `_docs/` directory
- **Testing:** Jest for backend, Vitest for frontend

## Database Collections

MongoDB has 7 main collections: users, conversations, messages, friends, refresh_tokens, presence, and file_uploads. See `_docs/DATABASE_DESIGN.md` for detailed schema information.

## WebSocket Events

Real-time communication uses Socket.IO with custom events. The WebSocket controller handles connection, authentication, and event routing. See `_docs/CHAT_REALTIME_FEATURE.md` for event details.

### Key Socket Events

**Client → Server:**
- `SEND_MESSAGE` - Send a new message
- `JOIN_CONVERSATION` - Join a conversation room
- `LEAVE_CONVERSATION` - Leave a conversation room
- `TYPING_START` - User started typing
- `TYPING_STOP` - User stopped typing
- `MESSAGES_READ` - Mark messages as read

**Server → Client:**
- `NEW_MESSAGE` - New message received
- `MESSAGE_UPDATED` - Message was updated
- `MESSAGE_DELETED` - Message was deleted
- `USER_TYPING` - User is typing
- `USER_STOPPED_TYPING` - User stopped typing
- `USER_ONLINE` - User came online
- `USER_OFFLINE` - User went offline

### Authentication Flow

**Important:** The system uses JWT-based authentication with dual-token pattern:

1. **Access Token** (15 min expiry) - Stateless JWT for API authorization, stored in httpOnly cookie
2. **Refresh Token** (30 day expiry) - Stateful token stored in MongoDB Session collection, in httpOnly cookie
3. **Google OAuth** - Maps Google Identity to internal User records, issues same JWT tokens
4. **Cookie Security** - httpOnly cookies prevent XSS access, SameSite protects against CSRF

**Refresh Flow:** Frontend automatically refreshes access tokens on 401 responses or preemptively. See `_docs/AUTH_FEATURE.md` for complete authentication flows.

**Middleware:** All protected routes use `authenticateToken` middleware which checks `req.cookies.accessToken` first, then falls back to `Authorization: Bearer` header.
