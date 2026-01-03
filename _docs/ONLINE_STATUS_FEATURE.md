# Online Status Feature - Context Transfer Document

## Feature Overview

Implement real-time online/offline status indicators for friends in a chat application using **Socket.io** for real-time events and **Redis** for ephemeral TTL-based status storage.

---

## Requirements

### Functional Requirements

1. **Visual Status Indicators**: Green badge = online, Gray badge = offline
2. **Display Locations**:
   - Sidebar direct message cards (next to friend's avatar)
   - Chat header (shows "Online" / "Offline" text for 1-1 conversations)
3. **Real-time Updates**: Status changes broadcast to online friends immediately
4. **Initial Hydration**: Fetch friends' online status on app load

### Technical Requirements

1. **Heartbeat Mechanism**: 30-second interval from frontend to backend
2. **Redis TTL**: 60-second expiration, refreshed by heartbeat
3. **Batched Broadcasts**: Handle large friend lists without server overload
4. **Efficient Lookups**: Query multiple users' status in single Redis call

---

## Architecture

### Data Flow

```
Frontend (Heartbeat every 30s) 
    → WebSocket HEARTBEAT event 
    → PresenceService.handleHeartbeat() 
    → Redis TTL refresh

User Connect/Disconnect 
    → PresenceService.handleUserConnect/Disconnect() 
    → Redis status update 
    → Broadcast FRIEND_STATUS_CHANGED to online friends

Initial Load 
    → GET /api/v1/friends/online-status 
    → Hydrate useOnlineStatusStore
```

### Redis Key Structure

- `user:online:{userId}` - Hash with TTL (60 seconds)
- `online_users` - Set for efficient membership checks

---

## Implementation Status

### ✅ Completed - Backend

| File | Changes |
|------|---------|
| `packages/types/src/socket.ts` | Added `HEARTBEAT`, `FRIEND_STATUS_CHANGED` events and payload types |
| `apps/api/src/services/redis.service.ts` | TTL 5min→1min, added `refreshUserOnline()`, `getMultipleUsersOnlineStatus()` |
| `apps/api/src/services/presence.service.ts` | **NEW**: Handles heartbeat, connect/disconnect, batched broadcasts |
| `apps/api/src/controllers/websocket.controller.ts` | Integrated PresenceService, heartbeat listener |
| `apps/api/src/controllers/friend.controller.ts` | Added `getFriendsOnlineStatus` endpoint |
| `apps/api/src/routes/friend.routes.ts` | Added `GET /friends/online-status` route |
| `apps/api/src/services/conversation.service.ts` | Added `otherUserId` field to direct message DTOs |

### ✅ Completed - Frontend

| File | Changes |
|------|---------|
| `apps/web/src/store/useOnlineStatusStore.ts` | **NEW**: Zustand store for status tracking |
| `apps/web/src/store/useSocketStore.ts` | 30s heartbeat interval, `FRIEND_STATUS_CHANGED` listener |
| `apps/web/src/components/atoms/OnlineStatusBadge.tsx` | **NEW**: Green/gray badge component |
| `apps/web/src/components/atoms/DirectMessageCard.tsx` | Integrated badge using `otherUserId` |
| `apps/web/src/components/organisms/ChatHeader.tsx` | Derives friend's online status from store |
| `apps/web/src/components/templates/MessagesWebSocketProvider.tsx` | Hydrates status on connect |

### ✅ Completed - Types

| File | Changes |
|------|---------|
| `packages/types/src/socket.ts` | `HeartbeatPayload`, `FriendStatusChangedPayload` |
| `packages/types/src/conversation.ts` | Added `otherUserId?: string` to `ConversationDto` |

---

## Bug Found & Status

### Issue: Badges Always Gray Despite Users Being Online in Redis

**Symptoms:**
- Redis shows users in `online_users` SET
- Console shows "Friends online status hydrated: 9"  
- But all badges remain gray

**Root Cause Analysis:**
1. ~~`PresenceService` used incorrect friend ID extraction~~ - **FIXED**
2. `otherUserId` may not be returned from conversations API - **NEEDS VERIFICATION**
3. Possible ID mismatch between store keys and badge lookups - **NEEDS VERIFICATION**

**Debug Logging Added:**
```typescript
// In OnlineStatusBadge.tsx
console.log('[OnlineStatusBadge]', {
  userId,           // What ID the badge is looking up
  isOnline,         // Current lookup result
  storeKeys,        // What IDs are in the store
  hasUser           // Whether userId exists in store
});
```

---

## Remaining Work

### 1. Debug ID Mismatch
- Check console logs to compare:
  - IDs in `useOnlineStatusStore.statuses`
  - IDs passed to `OnlineStatusBadge` from `DirectMessageCard`
- Verify `otherUserId` is returned by `/api/v1/conversations` endpoint

### 2. Test Real-time Updates
- Login as two users in separate browser windows
- Verify badge turns green when friend comes online
- Verify badge turns gray when friend goes offline

### 3. Remove Debug Logging
- Remove `console.log` from `OnlineStatusBadge.tsx` after fixing

### 4. Add Unit Tests
- `PresenceService` tests for heartbeat, connect/disconnect, broadcast

---

## Test Credentials

- **User 1**: user1@example.com / password123
- **User 2**: user2@example.com / password123

Default values are pre-filled on the login page.

---

## Key Files for Investigation

### Backend
- `/apps/api/src/services/presence.service.ts` - Core presence logic
- `/apps/api/src/services/conversation.service.ts` - Check `buildConversationDto` returns `otherUserId`

### Frontend
- `/apps/web/src/store/useOnlineStatusStore.ts` - Zustand store
- `/apps/web/src/components/atoms/OnlineStatusBadge.tsx` - Badge with debug logging
- `/apps/web/src/components/atoms/DirectMessageCard.tsx` - Uses `convo.otherUserId || convo.ownerId`

---

## Commands

```bash
# Build types package (required after type changes)
cd packages/types && pnpm build

# Build API (required after backend changes)
cd apps/api && pnpm build

# Run development servers
cd apps/api && pnpm dev    # Backend on :8080
cd apps/web && pnpm dev    # Frontend on :3001
```
