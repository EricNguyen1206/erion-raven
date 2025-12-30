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

# Build specific package
pnpm --filter @raven/api build
pnpm --filter @raven/web build

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific backend test
pnpm --filter @raven/api test -- <test-file-pattern>
pnpm --filter @raven/api test chat.test

# Run specific frontend test
pnpm --filter @raven/web test <test-file>

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
- Use workspace package names for shared code: `@raven/types`, `@raven/validators`, `@raven/shared`
- Backend: Use `@/` alias for internal imports (configured in tsconfig)
- Frontend: Use `@/` alias for internal imports
- Group imports: external packages → workspace packages → relative imports
- Example:
  ```typescript
  import express from 'express';
  import { UserDto } from '@raven/types';
  import { AuthService } from '@/services/auth.service';
  ```

### Formatting (Prettier)
- Semicolons: required
- Trailing commas: ES5
- Quotes: single
- Print width: 100
- Tab width: 2 spaces (no tabs)
- Arrow function parens: always
- Line endings: LF
- JSX quotes: double

### TypeScript
- Strict typing: no `any` unless unavoidable (use `unknown` instead)
- Shared types: Define in `packages/types/src/` and export from `@raven/types`
- Explicit return types: Required in services, optional in components
- Interfaces vs Types: Use interfaces for shapes (models, DTOs), types for unions/intersections
- MongoDB IDs: Use `string` representation, not `ObjectId` in type definitions
- Example:
  ```typescript
  interface User {
    id: string;
    username: string;
  }

  type UserRole = 'admin' | 'user' | 'guest';
  ```

### Naming Conventions
- Components: PascalCase (`UserAvatar`, `ChatPanel`)
- Hooks: camelCase with "use" prefix (`useAuthStore`, `useChatFormState`)
- Classes/Services: PascalCase (`AuthService`, `WebSocketService`)
- Functions/Methods: camelCase (`signIn`, `sendMessage`)
- Variables: camelCase (`userId`, `accessToken`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)
- Interfaces: PascalCase with `I` prefix for Mongoose models only (`IUser`), no prefix otherwise

### Error Handling
- Backend: Wrap controller/service methods in try-catch, throw typed errors
- Frontend: Use try-catch in async functions, show toast notifications
- Logging: Backend uses `logger.error()` from utils, frontend uses `console.error()`
- Error objects: Use specific error messages, avoid exposing sensitive data
- Example:
  ```typescript
  // Backend
  public async signup(data: SignupRequestDto): Promise<UserDto> {
    try {
      // logic
    } catch (error) {
      logger.error('Signup error:', error);
      throw error;
    }
  }

  // Frontend
  signIn: async (email, password) => {
    try {
      await authService.signIn({ email, password });
      toast.success('Welcome back!');
    } catch (error) {
      console.error(error);
      toast.error('Sign in failed');
    }
  }
  ```

### React Patterns
- Functional components with hooks only (no class components)
- State management: Zustand for global state, TanStack Query for server state
- Component structure: Atomic Design (atoms → molecules → organisms → templates)
- ClassNames: Use `cn()` utility for merging Tailwind classes
- Props: Define interfaces explicitly, no inline types
- Example:
  ```typescript
  interface UserAvatarProps {
    name: string;
    avatarUrl?: string;
    size?: 'sm' | 'md' | 'lg';
  }

  export const UserAvatar = ({ name, avatarUrl, size = 'md' }: UserAvatarProps) => {
    return <div className={cn('avatar', `avatar-${size}`)}>{name}</div>;
  };
  ```

### Backend Patterns
- Controllers: Thin - delegate to services, handle request/response only
- Services: Business logic, keep testable and isolated
- Models: Mongoose schemas with indexes, use soft deletes (`deletedAt`)
- Routes: Prefix with `/api/v1`, apply middleware appropriately
- Validation: Use Zod schemas from `@raven/validators`
- Environment: Use `process.env['KEY']` for variable access
- Example:
  ```typescript
  export class AuthService {
    public async signup(data: SignupRequestDto): Promise<UserDto> {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) throw new Error('Email already exists');

      const hashedPassword = await bcrypt.hash(data.password, 12);
      const user = new User({ ...data, password: hashedPassword });
      return await user.save();
    }
  }
  ```

### Testing
- Backend: Jest + Supertest, use MongoDB Memory Server for integration tests
- Frontend: Vitest + React Testing Library, mock API calls with MSW
- Test location: Place next to tested file in `__tests__/` or `tests/` directory
- Structure: AAA pattern (Arrange, Act, Assert)
- Mocks: Use `jest.mock()` for external dependencies
- Single test command:
  ```bash
  # Backend
  pnpm --filter @raven/api test -- chat.test
  pnpm --filter @raven/api test -- -t "should allow user to connect"

  # Frontend
  pnpm --filter @raven/web test chat-flow.test
  ```

### Security
- Authentication: JWT access tokens (15min) + refresh tokens (7d) in httpOnly cookies
- Never store tokens in localStorage or memory
- Rate limiting: Redis-based (auth: 5 req/15min, general: 100 req/15min)
- Input validation: All inputs validated with Zod schemas
- Passwords: Bcrypt with 10-12 rounds
- Never log or expose sensitive data (tokens, passwords, emails)

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
├── components/
│   ├── atoms/       # Basic UI elements
│   ├── molecules/   # Composite components
│   ├── organisms/   # Complex components
│   ├── templates/   # Layout templates
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── services/        # API service functions
├── store/           # Zustand stores
└── pages/           # Page components
```

### WebSocket Events
- Server handlers: `apps/api/src/services/websocket.service.ts`
- Client: Socket instance in `apps/web/src/services/websocket.ts`
- Events: Reference `_docs/WEBSOCKET_EVENTS.md` for specifications
- Rooms: Users join conversation rooms, messages broadcast to room members

### Critical Notes
- Package names: Backend is `@raven/api`, Frontend is `@raven/web`
- Ports: API on 8080, Web on 3001
- Always run `pnpm lint` and `pnpm type-check` before committing
- Test coverage target: 80%+ for statements/functions/lines
- MongoDB ObjectIds: Use string representation in TypeScript types
- Never commit secrets or keys (.env files, credentials.json)
