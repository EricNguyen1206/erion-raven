# Development Guide

> **Last Updated:** 2025-12-22  
> **Version:** 1.0.0

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Management](#database-management)
- [Code Quality](#code-quality)
- [Debugging](#debugging)
- [Common Issues](#common-issues)
- [Best Practices](#best-practices)

---

## 🔧 Prerequisites

Before starting development, ensure you have the following installed:

### Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|--------------|
| **Node.js** | 18+ | Runtime environment | [nodejs.org](https://nodejs.org/) |
| **PNPM** | 8+ | Package manager | `npm install -g pnpm` |
| **MongoDB** | 6+ | Database | [mongodb.com](https://www.mongodb.com/) |
| **Redis** | 7+ | Cache & sessions | [redis.io](https://redis.io/) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |

### Optional Tools

- **Docker** - For containerized development
- **MongoDB Compass** - GUI for MongoDB
- **Redis Commander** - GUI for Redis
- **Postman** - API testing
- **VS Code** - Recommended IDE

---

## 🚀 Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/EricNguyen1206/erion-raven.git
cd erion-raven
```

### 2. Install Dependencies

```bash
# Install all dependencies (monorepo)
pnpm install
```

This will install dependencies for:
- Root workspace
- Backend (`apps/api`)
- Frontend (`apps/web`)
- All shared packages (`packages/*`)

### 3. Set Up Environment Variables

**Backend:**
```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env`:
```env
# Server
NODE_ENV=development
PORT=8080
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/erion-raven

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret-key-change-this
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

**Frontend:**
```bash
cd apps/web
cp .env.example .env
```

Edit `apps/web/.env`:
```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

### 4. Start MongoDB and Redis

**Option A: Using Docker**
```bash
docker-compose up -d mongodb redis
```

**Option B: Local Installation**
```bash
# Start MongoDB
mongod --dbpath /path/to/data/db

# Start Redis
redis-server
```

### 5. Verify Setup

```bash
# Check MongoDB
mongosh

# Check Redis
redis-cli ping
# Should return: PONG
```

---

## 📁 Project Structure

```
erion-raven/
├── apps/
│   ├── api/                    # Backend Express API
│   │   ├── src/
│   │   │   ├── config/        # Configuration files
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── models/        # Mongoose models
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # Business logic
│   │   │   ├── utils/         # Utility functions
│   │   │   └── index.ts       # Entry point
│   │   ├── .env               # Environment variables
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                    # Frontend React app
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── pages/         # Page components
│       │   ├── hooks/         # Custom hooks
│       │   ├── services/      # API services
│       │   ├── store/         # Zustand stores
│       │   └── App.tsx
│       ├── .env               # Environment variables
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   ├── config/                 # Shared configs
│   ├── shared/                 # Shared utilities
│   ├── types/                  # Shared TypeScript types
│   └── validators/             # Shared validation schemas
│
├── _docs/                      # Documentation
├── .github/                    # GitHub Actions
├── docker-compose.yml
├── Makefile
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 🔄 Development Workflow

### Starting Development Servers

**Run everything:**
```bash
pnpm dev
```

This starts:
- Backend API on `http://localhost:8080`
- Frontend on `http://localhost:5173`

**Run individually:**
```bash
# Backend only
pnpm --filter @erion-raven/api dev

# Frontend only
pnpm --filter @erion-raven/web dev
```

### Making Changes

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

3. **Run linting:**
```bash
pnpm lint
pnpm lint:fix  # Auto-fix issues
```

4. **Run tests:**
```bash
pnpm test
```

5. **Commit changes:**
```bash
git add .
git commit -m "feat: add your feature"
```

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

6. **Push and create PR:**
```bash
git push origin feature/your-feature-name
```

---

## 🌍 Environment Variables

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment mode |
| `PORT` | Yes | `8080` | Server port |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `REDIS_HOST` | Yes | `localhost` | Redis host |
| `REDIS_PORT` | Yes | `6379` | Redis port |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `15m` | Access token expiry |
| `REFRESH_TOKEN_SECRET` | Yes | - | Refresh token secret |
| `REFRESH_TOKEN_EXPIRES_IN` | No | `7d` | Refresh token expiry |
| `CORS_ORIGIN` | Yes | - | Allowed CORS origin |
| `LOG_LEVEL` | No | `info` | Logging level |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | - | Backend API URL |
| `VITE_WS_URL` | Yes | - | WebSocket URL |

---

## 🗄️ Database Management

### MongoDB Operations

**Connect to MongoDB:**
```bash
mongosh mongodb://localhost:27017/erion-raven
```

**View collections:**
```javascript
show collections
```

**Query data:**
```javascript
db.users.find().pretty()
db.conversations.find({ type: 'group' })
db.messages.find({ conversationId: ObjectId('...') })
```

**Clear database:**
```javascript
db.dropDatabase()
```

### Seeding Data

```bash
cd apps/api
pnpm seed
```

This creates:
- Sample users
- Sample conversations
- Sample messages
- Sample friend relationships

---

## ✅ Code Quality

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm --filter @erion-raven/api lint

# Auto-fix issues
pnpm lint:fix
```

### Formatting

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check
```

### Type Checking

```bash
# Check types
pnpm type-check

# Watch mode
pnpm type-check --watch
```

---

## 🐛 Debugging

### Backend Debugging (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["--filter", "@erion-raven/api", "dev"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Frontend Debugging

Use browser DevTools:
- **Chrome DevTools** - F12
- **React DevTools** - Browser extension
- **Redux DevTools** - For state debugging

### Logging

**Backend:**
```typescript
import { logger } from '@/utils/logger';

logger.info('Info message');
logger.error('Error message', { error });
logger.debug('Debug message', { data });
```

**Frontend:**
```typescript
console.log('Development log');
console.error('Error:', error);
```

---

## ⚠️ Common Issues

### Issue: MongoDB Connection Failed

**Error:**
```
MongoServerError: Authentication failed
```

**Solution:**
```bash
# Check MongoDB is running
mongosh

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/erion-raven
```

### Issue: Redis Connection Timeout

**Error:**
```
Error: Redis connection timeout
```

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# Verify Redis config in .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use ::1:8080
```

**Solution:**
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Issue: PNPM Install Fails

**Error:**
```
ERR_PNPM_FETCH_404
```

**Solution:**
```bash
# Clear PNPM cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules
pnpm install
```

### Issue: TypeScript Errors

**Error:**
```
Cannot find module '@notify/types'
```

**Solution:**
```bash
# Build shared packages first
pnpm --filter @notify/types build
pnpm --filter @notify/validators build

# Or build all
pnpm build
```

---

## 🎯 Best Practices

### Code Organization

1. **Keep files small** - Max 300 lines per file
2. **Single responsibility** - One purpose per function/component
3. **Use TypeScript** - Always type your code
4. **Avoid any** - Use proper types instead of `any`

### API Development

1. **Use DTOs** - Validate all inputs with Zod schemas
2. **Handle errors** - Use try-catch and proper error responses
3. **Add logging** - Log important operations
4. **Document endpoints** - Update API_DESIGN.md

### Frontend Development

1. **Component structure** - Follow Atomic Design
2. **Custom hooks** - Extract reusable logic
3. **State management** - Use Zustand for global state
4. **API calls** - Use TanStack Query for data fetching

### Git Workflow

1. **Small commits** - Commit often with clear messages
2. **Feature branches** - Never commit directly to main
3. **Pull before push** - Always pull latest changes
4. **Code review** - Request reviews for PRs

### Testing

1. **Write tests** - Test new features
2. **Test edge cases** - Don't just test happy path
3. **Mock dependencies** - Use mocks for external services
4. **Run tests** - Before committing

---

## 📚 Related Documentation

- **[Architecture](./ARCHITECTURE.md)** - System architecture
- **[API Design](./API_DESIGN.md)** - API endpoints
- **[Database Schema](./DATABASE_SCHEMA.md)** - Database structure
- **[WebSocket Events](./WEBSOCKET_EVENTS.md)** - Real-time events
- **[Testing Guide](./TESTING.md)** - Testing strategies
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment

---

## 📞 Support

For development questions:
- **GitHub Issues:** [erion-raven/issues](https://github.com/EricNguyen1206/erion-raven/issues)
- **Email:** eric.nguyen@example.com
