# AGENTS.md

This file guides agentic coding assistants working in the Raven monorepo.

## Development Commands

```bash
# Install all dependencies
pnpm install

# Start both frontend (port 3001) and backend (port 8080)
pnpm dev

# Start specific app
pnpm --filter @raven/api dev
pnpm --filter @raven/web dev

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run specific backend test file
pnpm --filter @raven/api test -- chat.test

# Run specific backend test by name
pnpm --filter @raven/api test -- -t "should allow user to connect"

# Run specific frontend test
pnpm --filter @raven/web test chat-flow.test

# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm type-check
```

## Code Style Guidelines

### Imports
- Workspace packages: `@raven/types`, `@raven/validators`, `@raven/shared`
- Internal: Use `@/` alias for both backend and frontend
- Order: external packages → workspace packages → relative imports

### Formatting (Prettier)
- Semicolons: required
- Trailing commas: ES5
- Quotes: single (JS/TS), double for JSX
- Print width: 100, Tab width: 2, No tabs
- Arrow function parens: always, Line endings: LF

### TypeScript
- No `any` (use `unknown` instead), strict typing required
- Shared types in `packages/types/src/`, exported from `@raven/types`
- Explicit return types in services, optional in components
- Interfaces for shapes (models/DTOs), types for unions/intersections
- MongoDB IDs as `string` in type definitions
- Interface naming: `IUser` for Mongoose models only, no prefix otherwise

### Naming Conventions
- Components: PascalCase (`UserAvatar`, `ChatPanel`)
- Hooks: camelCase with "use" prefix (`useAuthStore`, `useChatFormState`)
- Classes/Services: PascalCase (`AuthService`, `WebSocketService`)
- Functions/Methods: camelCase (`signIn`, `sendMessage`)
- Variables: camelCase (`userId`, `accessToken`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)

### Error Handling
- Backend: Wrap controller/service methods in try-catch, use `logger.error()` from utils
- Frontend: Use try-catch in async functions, show toast notifications, use `console.error()`
- Never log or expose sensitive data (tokens, passwords, emails)

### React Patterns
- Functional components with hooks only (no class components)
- Zustand for global state, TanStack Query for server state
- Atomic Design structure: atoms → molecules → organisms → templates
- ClassNames: Use `cn()` utility for merging Tailwind classes
- Props: Define interfaces explicitly, no inline types

### Backend Patterns
- Controllers: Thin - delegate to services, handle request/response only
- Services: Business logic, keep testable and isolated
- Models: Mongoose schemas with indexes, use soft deletes (`deletedAt`)
- Routes: Prefix with `/api/v1`, apply middleware appropriately
- Validation: Use Zod schemas from `@raven/validators`
- Environment: Use `process.env['KEY']` for variable access

### Testing
- Backend: Jest + Supertest, MongoDB Memory Server for integration tests
- Frontend: Vitest + React Testing Library, MSW for API mocking
- Location: `__tests__/` or `tests/` directory next to tested file
- Structure: AAA pattern (Arrange, Act, Assert)
- Mocks: Use `jest.mock()` for external dependencies

### Security
- JWT access tokens (15min) + refresh tokens (7d) in httpOnly cookies
- Never store tokens in localStorage or memory
- Rate limiting: Redis-based (auth: 5 req/15min, general: 100 req/15min)
- All inputs validated with Zod schemas
- Passwords: Bcrypt with 10-12 rounds

### File Organization
```
apps/api/src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── services/        # Business logic
└── utils/           # Utility functions

apps/web/src/
├── components/      # atoms/molecules/organisms/templates/ui
├── hooks/           # Custom React hooks
├── services/        # API service functions
├── store/           # Zustand stores
└── pages/           # Page components
```

### Critical Notes
- Package names: Backend `@raven/api`, Frontend `@raven/web`
- Ports: API on 8080, Web on 3001
- Always run `pnpm lint` and `pnpm type-check` before committing
- Test coverage target: 80%+ for statements/functions/lines
- Never commit secrets or keys (.env files, credentials.json)
- WebSocket events: Reference `_docs/WEBSOCKET_EVENTS.md` for specifications
