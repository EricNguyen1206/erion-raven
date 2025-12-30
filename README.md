# 🦅 Erion Raven

> A modern, real-time chat application with direct messaging and group conversations

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47a248.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101.svg)](https://socket.io/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Erion Raven** is a full-stack real-time chat application built with modern web technologies. It features a monorepo architecture with a Node.js/Express backend and React frontend, supporting real-time messaging, friend requests, and group conversations.

### Key Highlights

- 🚀 **Real-time Communication** - Instant messaging with Socket.IO
- 💬 **Multiple Chat Types** - Direct messages and group conversations
- 👥 **Friend System** - Send and accept friend requests
- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🏗️ **Monorepo Architecture** - Organized with Turborepo and PNPM

---

## ✨ Features

### Core Features

- ✅ **User Authentication**
  - Email/password registration and login
  - JWT access tokens with refresh token rotation
  - Secure httpOnly cookies
  - Password hashing with bcrypt

- ✅ **Real-time Messaging**
  - Instant message delivery with Socket.IO
  - Message history with pagination
  - Typing indicators
  - Online/offline status

- ✅ **Conversations**
  - Direct messages (1-on-1 chat)
  - Group conversations
  - Create, update, and delete conversations
  - Add/remove members (group owner only)

- ✅ **Friend System**
  - Send friend requests
  - Accept/decline requests
  - View friends list
  - Unfriend functionality

- ✅ **User Management**
  - User profiles
  - Search users by username
  - Update profile information
  - Avatar support

### Technical Features

- 🔒 **Security**
  - Rate limiting (Redis-based)
  - Input validation with Zod
  - CORS protection
  - XSS prevention
  - SQL injection protection

- 📊 **Performance**
  - Redis caching for sessions
  - Database indexing
  - Message pagination
  - Optimized queries

- 🧪 **Testing**
  - Unit tests with Jest
  - Integration tests
  - E2E tests with Vitest

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Cache:** Redis
- **WebSocket:** Socket.IO
- **Authentication:** JWT + Bcrypt
- **Validation:** Zod

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router v6
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **WebSocket:** Socket.IO Client

### DevOps

- **Package Manager:** PNPM
- **Monorepo:** Turborepo
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Linting:** ESLint + Prettier

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18 or higher
- **PNPM** 8 or higher
- **MongoDB** 6 or higher
- **Redis** 7 or higher

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/EricNguyen1206/erion-raven.git
cd erion-raven
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

Edit the `.env` files with your configuration:

**Backend (`apps/api/.env`):**
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/erion-raven
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`apps/web/.env`):**
```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

4. **Start MongoDB and Redis**

```bash
# Using Docker
docker-compose up -d mongodb redis

# Or start locally
mongod
redis-server
```

5. **Run the application**

```bash
# Development mode (both frontend and backend)
pnpm dev

# Or run separately
pnpm --filter @raven/api dev
pnpm --filter @raven/web dev
```

6. **Access the application**

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **API Docs:** http://localhost:8080/api-docs (if Swagger enabled)

---

## 📁 Project Structure

```
erion-raven/
├── apps/
│   ├── api/              # Backend Express API
│   └── web/              # Frontend React app
├── packages/
│   ├── config/           # Shared configs (ESLint, TS, etc.)
│   ├── shared/           # Shared utilities
│   ├── types/            # Shared TypeScript types
│   └── validators/       # Shared validation schemas
├── _docs/                # Documentation
├── .github/              # GitHub Actions workflows
├── docker-compose.yml    # Docker setup
├── Makefile              # Build commands
├── pnpm-workspace.yaml   # PNPM workspace config
├── turbo.json            # Turborepo config
└── package.json          # Root package.json
```

For detailed structure, see [Architecture Documentation](_docs/ARCHITECTURE.md).

---

## 📚 Documentation

Comprehensive documentation is available in the `_docs/` directory:

| Document | Description |
|----------|-------------|
| [**Architecture**](_docs/ARCHITECTURE.md) | System architecture, tech stack, and data flows |
| [**API Design**](_docs/API_DESIGN.md) | REST API endpoints and specifications |
| [**Database Schema**](_docs/DATABASE_SCHEMA.md) | MongoDB collections and relationships |
| [**WebSocket Events**](_docs/WEBSOCKET_EVENTS.md) | Real-time event specifications |
| [**Development Guide**](_docs/DEVELOPMENT.md) | Local development setup and workflows |
| [**Testing Guide**](_docs/TESTING.md) | Testing strategies and examples |
| [**Deployment Guide**](_docs/DEPLOYMENT.md) | Production deployment instructions |

---

## 💻 Development

### Available Scripts

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                    # Run all apps in dev mode
pnpm --filter @raven/api dev    # Backend only
pnpm --filter @raven/web dev    # Frontend only

# Build
pnpm build                  # Build all apps
pnpm --filter @raven/api build  # Backend only
pnpm --filter @raven/web build  # Frontend only

# Testing
pnpm test                   # Run all tests
pnpm test:watch            # Run tests in watch mode
pnpm test:coverage         # Generate coverage report

# Linting
pnpm lint                   # Lint all packages
pnpm lint:fix              # Fix linting errors
pnpm format                # Format code with Prettier

# Type checking
pnpm type-check            # Check TypeScript types

# Database
pnpm --filter @raven/api db:seed    # Seed database
```

### Using Makefile

```bash
make install               # Install dependencies
make dev                   # Start development
make build                 # Build for production
make test                  # Run tests
make lint                  # Lint code
make docker-up             # Start Docker services
make docker-down           # Stop Docker services
```

### Docker Development

```bash
# Start all services (MongoDB, Redis, API, Web)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

---

## 🚢 Deployment

The application can be deployed to various platforms:

- **Frontend:** Vercel, Netlify, or any static hosting
- **Backend:** Render, Railway, Heroku, or VPS
- **Database:** MongoDB Atlas
- **Cache:** Redis Cloud or Upstash

See the [Deployment Guide](_docs/DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

**Backend (Render.com):**
1. Connect GitHub repository
2. Set root directory to `apps/api`
3. Set build command: `cd ../.. && pnpm install && pnpm --filter @raven/api build`
4. Set start command: `cd ../.. && pnpm --filter @raven/api start`
5. Add environment variables

**Frontend (Vercel):**
1. Connect GitHub repository
2. Set root directory to `apps/web`
3. Framework preset: Vite
4. Add environment variables
5. Deploy

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use conventional commits

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Socket.IO](https://socket.io/) for real-time communication
- [Turborepo](https://turbo.build/) for monorepo management

---

## 📞 Contact & Support

- **Author:** Eric Nguyen
- **GitHub:** [@EricNguyen1206](https://github.com/EricNguyen1206)
- **Issues:** [GitHub Issues](https://github.com/EricNguyen1206/erion-raven/issues)

---

<div align="center">
  <p>Made with ❤️ by Eric Nguyen</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>