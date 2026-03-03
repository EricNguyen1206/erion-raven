# SSO Design — Multi-Provider OAuth2 (Google + GitHub)

**Date:** 2026-03-02  
**Status:** Approved  
**Author:** Brainstorming session

---

## Problem

The current Google OAuth implementation is a one-shot credential flow: the frontend posts a Google ID token to `POST /api/v1/auth/google`, the backend verifies it with `google-auth-library`, and issues app-level JWTs. This is incomplete SSO because:

- The `User` model has no `provider`/`googleId` fields — same email via email+password and Google can't be cleanly tracked or linked.
- There is no redirect-based OAuth2 flow, so adding GitHub (or any other provider) is architecturally inconsistent.
- A `GithubLoginButton.tsx` exists on the frontend but there is zero backend GitHub OAuth support.
- No auth-specific tests exist.

---

## Solution

Replace the one-shot Google credential flow with a proper **redirect-based OAuth2 flow using Passport.js** for both Google and GitHub. Implement **auto-link by email**: if a user signs in with a provider whose email matches an existing account, the new provider is added to their account rather than creating a duplicate.

---

## Architecture

### OAuth Flow (both providers)

```
Frontend                           Backend (Express)
────────                           ──────────────────
[Login Page]
  ├─ "Sign in with Google" ──────→ GET /api/v1/auth/google
  │                                   └→ Passport redirects to Google
  │                       ←────────── /api/v1/auth/google/callback
  │                                   (Passport exchanges code → profile)
  │                                   Auto-link or create User
  │                                   Set JWT + refresh httpOnly cookies
  │                       ←────────── 302 → FRONTEND_URL/auth/callback
  │
  ├─ "Sign in with GitHub" ──────→ GET /api/v1/auth/github
  │                                   └→ Passport redirects to GitHub
  │                       ←────────── /api/v1/auth/github/callback
  │                                   (same flow as Google)
  │                       ←────────── 302 → FRONTEND_URL/auth/callback
  │
  └─ Email/Password ─────────────→ POST /api/v1/auth/signin  (unchanged)
```

### Auto-Link Logic

```
On OAuth callback:
  1. Get verified email from provider profile
  2. Find User by email in MongoDB
  3a. User found → upsert provider entry in user.providers[]
  3b. User not found → create new User with providers[] populated
  4. Generate JWT access token + refresh token → save Session
  5. Set httpOnly cookies → redirect to frontend
```

---

## Data Model

### User Model — New `providers` Field

```typescript
providers: [{
  name: 'google' | 'github',
  providerId: string,       // Google `sub` / GitHub numeric id as string
  email: string,
  avatar?: string,
  linkedAt: Date
}]
```

The existing `password?: string` (optional) remains unchanged — email+password users can still coexist and auto-link their OAuth providers later.

---

## Backend Changes

### New Dependencies (apps/api)

```
passport
passport-google-oauth20
passport-github2
@types/passport
@types/passport-google-oauth20
@types/passport-github2
```

### New / Modified Files

| File | Change |
|---|---|
| `apps/api/src/config/passport.ts` | **NEW** — configure GoogleStrategy + GithubStrategy |
| `apps/api/src/models/User.ts` | **MODIFY** — add `providers` sub-document array |
| `apps/api/src/services/auth.service.ts` | **MODIFY** — add `findOrCreateOAuthUser()`, extract `createTokens()` private helper, remove old `verifyGoogleToken()` and `googleSignin()` |
| `apps/api/src/controllers/auth.controller.ts` | **MODIFY** — add `oauthCallback()` handler, remove `googleSignin()` |
| `apps/api/src/routes/auth.routes.ts` | **MODIFY** — add 4 OAuth routes, remove `POST /google` |
| `apps/api/src/index.ts` | **MODIFY** — initialize Passport middleware |
| `apps/api/src/tests/auth.test.ts` | **NEW** — auth unit + integration tests |

### New Routes

```
GET /api/v1/auth/google           → passport.authenticate('google', { scope: ['email','profile'] })
GET /api/v1/auth/google/callback  → Passport callback → oauthCallback()
GET /api/v1/auth/github           → passport.authenticate('github', { scope: ['user:email'] })
GET /api/v1/auth/github/callback  → Passport callback → oauthCallback()
```

### Removed Route

```
POST /api/v1/auth/google   ← REMOVED (replaced by redirect flow above)
```

### New Environment Variables

```bash
# Already exists:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# New:
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## Frontend Changes

| File | Change |
|---|---|
| `apps/web/src/components/molecules/LoginForm.tsx` | Replace Google button credential handler → `window.location.href = /api/v1/auth/google` |
| `apps/web/src/components/atoms/GithubLoginButton.tsx` | Wire up → `window.location.href = /api/v1/auth/github` |
| `apps/web/src/pages/AuthCallbackPage.tsx` | **NEW** — handles `/auth/callback` redirect from backend, calls `getProfile()`, redirects to `/chat` |
| `apps/web/src/services/authService.ts` | Remove `googleSignIn(credential)` method |
| Router config | Add `/auth/callback` route pointing to `AuthCallbackPage` |

---

## Testing Strategy

### Unit Tests (`src/tests/auth.test.ts`)

- `AuthService.findOrCreateOAuthUser()` — new user created when email not found
- `AuthService.findOrCreateOAuthUser()` — existing user auto-linked when email matches
- `AuthService.findOrCreateOAuthUser()` — avatar updated from provider profile
- `AuthService.findOrCreateOAuthUser()` — provider entry upserted (not duplicated on re-login)
- `AuthController.oauthCallback()` — cookies set correctly, redirect issued

### Integration Tests

- `GET /auth/google/callback` with mocked Passport profile → 302 to FRONTEND_URL
- `GET /auth/github/callback` with mocked Passport profile → 302 to FRONTEND_URL

---

## Deployment

1. Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `FRONTEND_URL` to:
   - GitHub Actions secrets (for CI)
   - Cloud Run environment (`cloudbuild-api.yaml`)
2. Register OAuth callback URLs in Google Cloud Console:
   - `https://api-url/api/v1/auth/google/callback`
3. Register OAuth callback URLs in GitHub OAuth App settings:
   - `https://api-url/api/v1/auth/github/callback`
4. Add `https://api-url/api/v1/auth/google/callback` to Google authorized redirect URIs (remove old credential-based client setup if present)
