# 🦅 Erion Raven

> A modern, real-time chat application with direct messaging, group conversations, and friend management.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101.svg)](https://socket.io/)

---

## 🎯 Overview

**Erion Raven** is a full-stack real-time chat application built with a modern monorepo architecture (Turborepo). It features a Node.js/Express backend and a React frontend, leveraging MongoDB for persistence and Redis for high-performance caching and real-time state management.

### Key Features

*   **Real-time Messaging**: Instant delivery and updates using Socket.IO.
*   **Chat Modes**: Support for 1-1 Direct Messages and Group Conversations.
*   **Friend System**: Send, accept, and manage friend requests.
*   **Secure Auth**: JWT-based authentication with httpOnly cookie sessions.
*   **Presence**: Real-time online/offline status tracking.

---

## � Project Documentation

Detailed documentation for all features and systems is maintained in the `_docs/` directory.

### System & Architecture
*   **[High-Level Architecture](_docs/HIGH_LEVEL_DESIGN.md)** - System design, tech stack, and data flow.
*   **[Database Design](_docs/DATABASE_DESIGN.md)** - MongoDB schemas, collections, and relationships.
*   **[User Management & Utilities](_docs/OTHER_FEATURE.md)** - User profiles, search, and file uploads.

### Feature Implementations
*   **[Authentication Feature](_docs/AUTH_FEATURE.md)** - JWT flow, cookies, and session management.
*   **[Chat Realtime Feature](_docs/CHAT_REALTIME_FEATURE.md)** - WebSocket events, messaging flow, and room management.
*   **[Relationship Feature](_docs/RELATIONSHIP_FEATURE.md)** - Friend requests and conversation creation logic.
*   **[Online Status Feature](_docs/ONLINE_STATUS_FEATURE.md)** - Real-time user presence system.
*   **[Unread Message Feature](_docs/UNREAD_MESSAGE_FEATURE.md)** - Unread counts and read receipt logic.

### Guides
*   **[Development Guide](_docs/DEVELOPMENT.md)** - Setup instructions for local development.
*   **[Deployment Guide](_docs/DEPLOYMENT.md)** - Production deployment steps.
*   **[Testing Guide](_docs/TESTING.md)** - Running tests and ensuring quality.

---

## 🚀 Quick Start

1.  **Clone & Install**
    ```bash
    git clone https://github.com/EricNguyen1206/erion-raven.git
    cd erion-raven
    pnpm install
    ```

2.  **Environment Setup**
    Copy `.env.example` files to `.env` in `apps/api` and `apps/web` and configure your database/Redis credentials.

3.  **Run Development Server**
    ```bash
    pnpm dev
    ```

For more details, check the **[Development Guide](_docs/DEVELOPMENT.md)**.