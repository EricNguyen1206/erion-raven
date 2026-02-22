# Database Design for AI Bot Management Platform (ClawX Clone)

## Goal Focus
To architect a robust, scalable backend using **Supabase (PostgreSQL + pgvector)** for an AI Bot Management platform (similar to ClawX) within the `erion-raven` monolith. This design replaces the existing MongoDB setup to unify relational data and vector embeddings, enabling advanced RAG capabilities and simplified Row-Level Security.

## Architecture & Data Flow

### 1. Core Supabase Services Utilized
*   **Database (PostgreSQL):** Primary data store for all entities (Users, Workspaces, Bots, API Keys).
*   **Auth (GoTrue):** User authentication and session management. Ties directly into database relationships via `auth.users`.
*   **Storage:** Hosting Bot avatars, User profile pictures, and raw document uploads (PDFs, TXTs) before vectorization.
*   **pgvector Extension:** Storing text embeddings for Knowledge Bases directly within Postgres, enabling similarity search via SQL functions.

### 2. High-Level Entity Relationship Diagram (ERD) Overview
The data is structured hierarchically:
*   `Users` own `Workspaces` (or belong to them via `WorkspaceMembers`).
*   `Workspaces` contain multiple `Bots` (AI Agents).
*   `Bots` have one-to-many relationships with `KnowledgeBases` (Collections of documents/vectors).
*   `Bots` also have one-to-many relationships with `Conversations` (Chat sessions).
*   `Conversations` contain multiple `Messages`.

## Database Schema Design (PostgreSQL Tables)

Here is the proposed core schema structure.

### User & Workspace Domain
*   **`users`**: Extends `auth.users`. Stores custom profile data (name, avatar_url, billing_plan).
*   **`workspaces`**: Logical container for a team or personal account.
    *   `id`, `name`, `owner_id` (refs `users.id`), `created_at`
*   **`workspace_members`**: For team collaboration (future-proofing).
    *   `workspace_id`, `user_id`, `role` (admin, member)

### AI Bot Domain
*   **`bots`**: The core AI agent configuration.
    *   `id`
    *   `workspace_id` (refs `workspaces.id`)
    *   `name`, `avatar_url`, `description`
    *   `system_prompt` (The core instruction for the LLM)
    *   `model_provider` (e.g., 'openai', 'anthropic', 'zai')
    *   `model_id` (e.g., 'gpt-4o', 'claude-3-5-sonnet')
    *   `temperature`, `max_tokens`
    *   `status` (active, drafted)
    *   `created_at`, `updated_at`

### Knowledge & RAG Domain (The core reason for Postgres + pgvector)
*   **`knowledge_bases`**: A logical grouping of documents assigned to a bot.
    *   `id`, `bot_id` (refs `bots.id`), `name`, `sync_status`
*   **`documents`**: Represents uploaded files (PDF, Text).
    *   `id`, `kb_id` (refs `knowledge_bases.id`)
    *   `type` (e.g., 'pdf', 'url', 'text')
    *   `storage_path` (reference to Supabase Storage)
    *   `metadata` (JSONB)
*   **`document_chunks`**: The actual vector data for RAG.
    *   `id`
    *   `document_id` (refs `documents.id`)
    *   `content` (Text snippet)
    *   `embedding` (vector(1536) - assuming OpenAI embeddings or similar)
    *   `chunk_index`
    *   *Index:* HNSW or IVFFlat index on the `embedding` column for fast similarity search.

### Conversation & Logging Domain
*   **`conversations`**: A distinct chat session with a bot.
    *   `id`, `bot_id` (refs `bots.id`), `user_id` (optional, for tracking who chatted), `title`
*   **`messages`**: Individual messages in a conversation.
    *   `id`
    *   `conversation_id` (refs `conversations.id`)
    *   `role` (user, assistant, system)
    *   `content` (Text)
    *   `created_at`

## Implementation Steps (Transitioning to Postgres/ORM)

To implement this on the Node.js backend:
1.  **Select ORM:** Drizzle ORM is recommended for serverless/edge compatibility and excellent SQL-like syntax, but Prisma is also a solid choice for ease of use.
2.  **Schema Definition:** Write the schema in the chosen ORM's syntax (e.g., `schema.prisma` or `schema.ts`), incorporating `vector` types.
3.  **Migration:** Generate and apply Postgres migrations via the ORM CLI.
4.  **Replace Mongoose:** Systematically replace Mongoose models in `apps/api/src/models` with Postgres ORM queries.
5.  **Vector Search:** Implement a Postgres function (RPC) in Supabase or write raw SQL via the ORM to perform cosine similarity searches (`<=>`) on `document_chunks`.

## Security & Row-Level Security (RLS)

A major advantage of Supabase. We will implement RLS policies at the database level:
*   A user can only `SELECT`, `UPDATE`, `DELETE` bots where `workspace_id` belongs to them.
*   Even if the Node.js backend has a bug, the database itself prevents unauthorized access based on the JWT token.
