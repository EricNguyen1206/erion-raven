# API Documentation

This document lists all the REST API endpoints available in the backend application.

## Base URL

All API endpoints are prefixed with `/api/v1`.

## Middleware

| Name | Description |
|------|-------------|
| `authRateLimit` | Rate limiting for authentication endpoints |
| `generalRateLimit` | Rate limiting for general authenticated endpoints |
| `authenticateToken` | Validates JWT access token from cookies |
| `validateDto` | Validates request body against a DTO schema |
| `socketAuth` | Authenticates WebSocket connections |

---

## Authentication APIs

Base Route: `/api/v1/auth`

| No | Route | Endpoint | Description | Method | Request | Response | Middleware | Errors |
|----|-------|----------|-------------|--------|---------|----------|------------|--------|
| 1 | `/auth/signup` | `/api/v1/auth/signup` | Register a new user | `POST` | `{ email: string, username: string, password: string }` | `{ success: true, data: { user, tokens } }` | `authRateLimit`, `validateDto(SignupRequestDto)` | `409` Email already exists, `500` Signup failed |
| 2 | `/auth/signin` | `/api/v1/auth/signin` | Sign in a user | `POST` | `{ email: string, password: string }` | `{ success: true, data: user }` (tokens in httpOnly cookies) | `authRateLimit`, `validateDto(SigninRequestDto)` | `401` Invalid credentials |
| 3 | `/auth/refresh` | `/api/v1/auth/refresh` | Refresh access token | `POST` | None (refresh token from cookie) | `{ success: true, message: 'Token refreshed successfully' }` | `authRateLimit` | `400` Refresh token required, `401` Invalid/expired token |
| 4 | `/auth/signout` | `/api/v1/auth/signout` | Sign out a user | `POST` | None (refresh token from cookie) | `{ success: true, message: 'Signed out successfully' }` | `authRateLimit`, `authenticateToken` | `400` Refresh token required, `401` Not authenticated, `500` Signout failed |

---

## User APIs

Base Route: `/api/v1/users`

| No | Route | Endpoint | Description | Method | Request | Response | Middleware | Errors |
|----|-------|----------|-------------|--------|---------|----------|------------|--------|
| 5 | `/users/profile` | `/api/v1/users/profile` | Get current user profile | `GET` | None | `{ success: true, data: user }` | `generalRateLimit`, `authenticateToken` | `500` Failed to get profile |
| 6 | `/users/profile` | `/api/v1/users/profile` | Update current user profile | `PUT` | `{ username?: string, email?: string, currentPassword?: string, newPassword?: string }` | `{ success: true, data: user }` | `generalRateLimit`, `authenticateToken`, `validateDto(UpdateProfileDto)` | `400` Current password incorrect, `500` Failed to update profile |
| 7 | `/users/search` | `/api/v1/users/search` | Search users by username | `GET` | Query: `username` (required) | `[{ id, username, email, ... }]` | `generalRateLimit`, `authenticateToken` | `400` Username query required, `500` Failed to search |

---

## Conversation APIs

Base Route: `/api/v1/conversations`

| No | Route | Endpoint | Description | Method | Request | Response | Middleware | Errors |
|----|-------|----------|-------------|--------|---------|----------|------------|--------|
| 8 | `/conversations` | `/api/v1/conversations` | Get all user conversations | `GET` | None | `{ success: true, data: conversations[] }` | `generalRateLimit`, `authenticateToken` | `500` Internal server error |
| 9 | `/conversations` | `/api/v1/conversations` | Create a new conversation | `POST` | `{ name: string, type: 'direct' \| 'group', userIds: string[] }` | `{ success: true, data: { id, name, type, ownerId } }` | `generalRateLimit`, `authenticateToken`, `validateDto(CreateConversationRequestDto)` | `400` Missing fields / Invalid type / Invalid user count, `500` Internal server error |
| 10 | `/conversations/:id` | `/api/v1/conversations/:id` | Get conversation by ID | `GET` | Params: `id` | `{ success: true, data: conversation }` | `generalRateLimit`, `authenticateToken` | `403` Not found, `404` Conversation not found, `500` Internal server error |
| 11 | `/conversations/:id` | `/api/v1/conversations/:id` | Update conversation | `PUT` | Params: `id`, Body: `{ name: string }` | `{ success: true, message: 'Conversation updated successfully' }` | `generalRateLimit`, `authenticateToken`, `validateDto(UpdateConversationRequestDto)` | `400` Invalid ID / Name required, `404` Conversation not found, `500` Internal server error |
| 12 | `/conversations/:id` | `/api/v1/conversations/:id` | Delete conversation | `DELETE` | Params: `id` | `{ success: true, message: 'Conversation deleted successfully' }` | `generalRateLimit`, `authenticateToken` | `400` Invalid ID, `403` Not owner, `404` Not found, `500` Internal server error |
| 13 | `/conversations/:id/user` | `/api/v1/conversations/:id/user` | Add user to conversation | `POST` | Params: `id`, Body: `{ userId: string }` | `{ success: true, message: 'User added to conversation successfully' }` | `generalRateLimit`, `authenticateToken`, `validateDto(ConversationMembershipRequest)` | `400` Invalid ID / userId required, `403` Not owner, `404` Conversation/User not found, `500` Internal server error |
| 14 | `/conversations/:id/user` | `/api/v1/conversations/:id/user` | Leave conversation | `PUT` | Params: `id` | `{ success: true, message: 'Left conversation successfully' }` | `generalRateLimit`, `authenticateToken` | `400` Invalid ID, `404` Conversation/User not found, `500` Internal server error |
| 15 | `/conversations/:id/user` | `/api/v1/conversations/:id/user` | Remove user from conversation | `DELETE` | Params: `id`, Body: `{ userId: string }` | `{ success: true, message: 'User removed from conversation successfully' }` | `generalRateLimit`, `authenticateToken`, `validateDto(ConversationMembershipRequest)` | `400` Invalid ID / userId required / Cannot remove owner, `403` Not owner, `404` Conversation/User not found, `500` Internal server error |

---

## Friend APIs

Base Route: `/api/v1/friends`

| No | Route | Endpoint | Description | Method | Request | Response | Middleware | Errors |
|----|-------|----------|-------------|--------|---------|----------|------------|--------|
| 16 | `/friends` | `/api/v1/friends` | Get all friends | `GET` | None | `{ success: true, data: friends[] }` | `generalRateLimit`, `authenticateToken` | `500` Failed to get friends |
| 17 | `/friends/requests` | `/api/v1/friends/requests` | Get all friend requests | `GET` | None | `{ success: true, data: requests[] }` | `generalRateLimit`, `authenticateToken` | `500` Failed to get friend requests |
| 18 | `/friends/requests` | `/api/v1/friends/requests` | Send a friend request | `POST` | `{ toUserId: string }` | `{ success: true, data: friendRequest, message: 'Friend request sent successfully' }` | `generalRateLimit`, `authenticateToken`, `validateDto(SendFriendRequestApiRequestDto)` | `400` Cannot send to self / Already friends / Already sent, `404` User not found, `500` Failed to send |
| 19 | `/friends/requests/:requestId/accept` | `/api/v1/friends/requests/:requestId/accept` | Accept a friend request | `POST` | Params: `requestId` | `{ success: true, data: friendship, message: 'Friend request accepted successfully' }` | `generalRateLimit`, `authenticateToken` | `400` Request ID required / Not authorized / Already processed, `404` Request not found, `500` Failed to accept |
| 20 | `/friends/requests/:requestId/decline` | `/api/v1/friends/requests/:requestId/decline` | Decline a friend request | `POST` | Params: `requestId` | `{ success: true, message: 'Friend request declined successfully' }` | `generalRateLimit`, `authenticateToken` | `400` Request ID required / Not authorized / Already processed, `404` Request not found, `500` Failed to decline |

---

## Message APIs

Base Route: `/api/v1/messages`

| No | Route | Endpoint | Description | Method | Request | Response | Middleware | Errors |
|----|-------|----------|-------------|--------|---------|----------|------------|--------|
| 21 | `/messages/conversation/:id` | `/api/v1/messages/conversation/:id` | Get conversation messages | `GET` | Params: `id`, Query: `limit?` (1-100, default 20), `before?` (ObjectId) | `{ success: true, data: messages[], pagination: { limit, before, hasMore } }` | `generalRateLimit`, `authenticateToken` | `400` Invalid ID / Invalid limit / Invalid before ObjectId, `500` Internal server error |
| 22 | `/messages` | `/api/v1/messages` | Create a new message | `POST` | `{ conversationId?: string, receiverId?: string, text?: string, url?: string, fileName?: string }` | `{ success: true, data: message }` | `generalRateLimit`, `authenticateToken`, `validateDto(SendMessageRequestDto)` | `400` Must specify conversationId or receiverId (not both) / At least one content field required, `500` Internal server error |
| 23 | `/messages/friend/:friendId` | `/api/v1/messages/friend/:friendId` | Get direct messages with friend | `GET` | Params: `friendId` | `{ success: true, data: messages[] }` | `generalRateLimit`, `authenticateToken` | `400` Friend ID required, `500` Internal server error |
| 24 | `/messages/:id` | `/api/v1/messages/:id` | Get message by ID | `GET` | Params: `id` | `{ success: true, data: message }` | `generalRateLimit`, `authenticateToken` | `400` Invalid message ID, `404` Message not found, `500` Internal server error |
| 25 | `/messages/:id` | `/api/v1/messages/:id` | Delete a message | `DELETE` | Params: `id` | `{ success: true, message: 'Message deleted successfully' }` | `generalRateLimit`, `authenticateToken` | `400` Invalid message ID, `500` Internal server error |

---

## WebSocket Management APIs

Base Route: `/api/v1/ws`

| No | Route | Endpoint | Description | Method | Request | Response | Middleware | Errors |
|----|-------|----------|-------------|--------|---------|----------|------------|--------|
| 26 | `/ws/stats` | `/api/v1/ws/stats` | Get WebSocket statistics | `GET` | None | `{ success: true, data: { connectedUsers, users: string[] } }` | None | `500` Internal server error |
| 27 | `/ws/conversations/:conversationId/participants` | `/api/v1/ws/conversations/:conversationId/participants` | Get conversation participants | `GET` | Params: `conversationId` | `{ success: true, data: { conversationId, participants, participantCount } }` | None | `400` Conversation ID required, `500` Internal server error |
| 28 | `/ws/conversations/:conversationId/broadcast` | `/api/v1/ws/conversations/:conversationId/broadcast` | Broadcast message to conversation (Admin) | `POST` | Params: `conversationId`, Body: `{ message: string }` | `{ success: true, message: 'Message broadcasted successfully' }` | None | `400` Conversation ID / Message required, `500` Internal server error |
| 29 | `/ws/users` | `/api/v1/ws/users` | Get connected users | `GET` | None | `{ success: true, data: { users: string[], count: number } }` | None | `500` Internal server error |
| 30 | `/ws/users/:userId` | `/api/v1/ws/users/:userId` | Disconnect a user (Admin) | `DELETE` | Params: `userId` | `{ success: true, message: 'User disconnected successfully' }` | None | `400` User ID required, `404` User not connected / Socket not found, `500` Internal server error |

---

## WebSocket Events

The application uses Socket.IO for real-time communication. Events are handled through the WebSocket connection.

### Socket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join_conversation` | Client → Server | `{ conversation_id: string }` | Join a conversation room |
| `leave_conversation` | Client → Server | `{ conversation_id: string }` | Leave a conversation room |
| `send_message` | Client → Server | `{ conversation_id: string, text?: string, url?: string, fileName?: string }` | Send a message to a conversation |
| `new_message` | Server → Client | `{ id, conversationId, senderId, senderName, text?, url?, fileName?, createdAt }` | New message received |
| `error` | Server → Client | `{ code: string, message: string, details?: string }` | Error notification |
| `disconnect` | Client → Server | None | Connection closed |

### Socket Authentication

WebSocket connections require authentication via the `socketAuth` middleware which validates the JWT token.

---

## Error Response Format

All error responses follow this format:

```json
{
  "code": 400,
  "message": "Error message",
  "details": "Detailed error description"
}
```

Or for some endpoints:

```json
{
  "success": false,
  "message": "Error message"
}
```
