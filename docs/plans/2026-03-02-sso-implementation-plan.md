# SSO Multi-Provider OAuth2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Passport.js-based OAuth2 redirect flows for Google and GitHub with auto-link-by-email, replacing the current one-shot Google credential endpoint.

**Architecture:** Passport.js with `passport-google-oauth20` and `passport-github2` strategies handle the redirect → callback → profile extraction. A shared `AuthService.findOrCreateOAuthUser()` method auto-links accounts by email and upserts provider entries into the User model. The backend sets httpOnly cookies and redirects to `FRONTEND_URL/auth/callback`. The frontend `AuthCallbackPage` calls `getProfile()` to hydrate the auth store.

**Tech Stack:** Express, Passport.js (passport-google-oauth20, passport-github2), Mongoose, JWT, Jest (tests), React + Zustand (frontend)

---

## Task 1: Install Dependencies

**Files:**
- Modify: `apps/api/package.json`

**Step 1: Install Passport and strategy packages**

```bash
cd apps/api
npm install passport passport-google-oauth20 passport-github2
npm install --save-dev @types/passport @types/passport-google-oauth20 @types/passport-github2
```

**Step 2: Verify packages installed**

```bash
cd apps/api
node -e "require('passport'); require('passport-google-oauth20'); require('passport-github2'); console.log('OK')"
```

Expected: `OK`

**Step 3: Commit**

```bash
git add apps/api/package.json apps/api/package-lock.json
git commit -m "chore(api): install passport and oauth2 strategy packages"
```

---

## Task 2: Update User Model — Add `providers` Field

**Files:**
- Modify: `apps/api/src/models/User.ts`

**Step 1: Write the failing test first**

Create file `apps/api/src/tests/auth.test.ts`:

```typescript
import mongoose from 'mongoose';
import { User } from '../models/User';

describe('User model — providers field', () => {
  it('should save a user with a providers array', async () => {
    const user = new User({
      username: 'testuser_providers',
      email: 'providers@test.com',
      providers: [{
        name: 'google',
        providerId: 'google-sub-123',
        email: 'providers@test.com',
        avatar: 'https://example.com/avatar.png',
        linkedAt: new Date(),
      }],
    });

    // Validate does NOT throw
    const err = user.validateSync();
    expect(err).toBeUndefined();
    expect(user.providers).toHaveLength(1);
    expect(user.providers[0].name).toBe('google');
  });

  it('should allow a user with no providers (email+password user)', () => {
    const user = new User({
      username: 'testuser_noproviders',
      email: 'noproviders@test.com',
      password: 'hashedpassword',
    });

    const err = user.validateSync();
    expect(err).toBeUndefined();
    expect(user.providers).toHaveLength(0);
  });
});
```

**Step 2: Run test — expect FAIL**

```bash
cd apps/api
npm test -- --testPathPattern=auth.test --verbose
```

Expected: FAIL — `user.providers is not iterable` or similar (field doesn't exist yet).

**Step 3: Add `providers` field to User model**

Open `apps/api/src/models/User.ts` and replace the entire file with:

```typescript
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProvider {
  name: 'google' | 'github';
  providerId: string;
  email: string;
  avatar?: string;
  linkedAt: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  providers: IProvider[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  id: string;
}

const ProviderSchema = new Schema<IProvider>(
  {
    name: { type: String, enum: ['google', 'github'], required: true },
    providerId: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String },
    linkedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    avatar: { type: String },
    providers: { type: [ProviderSchema], default: [] },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.index({ deletedAt: 1 });

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
```

**Step 4: Run test — expect PASS**

```bash
cd apps/api
npm test -- --testPathPattern=auth.test --verbose
```

Expected: PASS (2 tests passing)

**Step 5: Commit**

```bash
git add apps/api/src/models/User.ts apps/api/src/tests/auth.test.ts
git commit -m "feat(api): add providers sub-document array to User model"
```

---

## Task 3: Add `findOrCreateOAuthUser()` to AuthService

**Files:**
- Modify: `apps/api/src/services/auth.service.ts`
- Modify: `apps/api/src/tests/auth.test.ts`

**Step 1: Write failing tests — append to `auth.test.ts`**

```typescript
import { AuthService } from '../services/auth.service';

// After User model tests, add:
describe('AuthService.findOrCreateOAuthUser()', () => {
  const authService = new AuthService();

  const mockGoogleProfile = {
    provider: 'google' as const,
    providerId: 'google-sub-456',
    email: 'newuser@example.com',
    name: 'New User',
    avatar: 'https://example.com/photo.jpg',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user when email does not exist', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(null); // no existing user
    const saveMock = jest.fn().mockResolvedValue({
      id: 'new-user-id',
      username: 'New User',
      email: 'newuser@example.com',
      providers: [{ name: 'google', providerId: 'google-sub-456', email: 'newuser@example.com' }],
      createdAt: new Date(),
    });
    jest.spyOn(User.prototype, 'save').mockImplementation(saveMock);

    const result = await authService.findOrCreateOAuthUser(mockGoogleProfile);
    expect(saveMock).toHaveBeenCalled();
    expect(result.email).toBe('newuser@example.com');
  });

  it('should auto-link existing user when email matches', async () => {
    const existingUser = {
      id: 'existing-user-id',
      username: 'ExistingUser',
      email: 'newuser@example.com',
      providers: [],
      avatar: undefined,
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(existingUser as any);

    const result = await authService.findOrCreateOAuthUser(mockGoogleProfile);
    expect(existingUser.save).toHaveBeenCalled();
    // Provider was upserted
    expect(existingUser.providers).toHaveLength(1);
    expect(existingUser.providers[0].providerId).toBe('google-sub-456');
    expect(result.email).toBe('newuser@example.com');
  });

  it('should upsert (not duplicate) provider on re-login', async () => {
    const existingUser = {
      id: 'existing-user-id',
      username: 'ExistingUser',
      email: 'newuser@example.com',
      providers: [{ name: 'google', providerId: 'google-sub-456', email: 'newuser@example.com', avatar: 'old', linkedAt: new Date() }],
      avatar: undefined,
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(existingUser as any);

    await authService.findOrCreateOAuthUser({ ...mockGoogleProfile, avatar: 'https://new-avatar.jpg' });
    // Still only 1 provider entry
    expect(existingUser.providers).toHaveLength(1);
  });
});
```

**Step 2: Run tests — expect FAIL**

```bash
cd apps/api
npm test -- --testPathPattern=auth.test --verbose
```

Expected: FAIL — `authService.findOrCreateOAuthUser is not a function`

**Step 3: Add `findOrCreateOAuthUser()` and `createTokens()` to AuthService**

In `apps/api/src/services/auth.service.ts`:

1. Add this new interface at the top (after imports):
```typescript
export interface OAuthProfile {
  provider: 'google' | 'github';
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}
```

2. Add this private helper method to the `AuthService` class (before `googleSignin`):
```typescript
private async createTokens(user: IUser): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpire } as jwt.SignOptions
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const session = new Session({ userId: user._id, refreshToken, expiresAt });
  await session.save();

  return { accessToken, refreshToken };
}
```

3. Add this new public method to the `AuthService` class:
```typescript
public async findOrCreateOAuthUser(
  profile: OAuthProfile
): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
  try {
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      // Create new user
      let username = profile.name || profile.email.split('@')[0];
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
      }

      user = new User({
        username,
        email: profile.email,
        avatar: profile.avatar,
        providers: [{
          name: profile.provider,
          providerId: profile.providerId,
          email: profile.email,
          avatar: profile.avatar,
          linkedAt: new Date(),
        }],
      });

      await user.save();
      logger.info(`New user created via ${profile.provider}`, { userId: user.id });
    } else {
      // Auto-link: upsert provider entry
      const providerIndex = user.providers.findIndex(
        (p) => p.name === profile.provider && p.providerId === profile.providerId
      );

      if (providerIndex === -1) {
        user.providers.push({
          name: profile.provider,
          providerId: profile.providerId,
          email: profile.email,
          avatar: profile.avatar,
          linkedAt: new Date(),
        });
      } else {
        // Update avatar if changed
        user.providers[providerIndex].avatar = profile.avatar;
      }

      // Sync top-level avatar from provider if none set
      if (!user.avatar && profile.avatar) {
        user.avatar = profile.avatar;
      }

      await user.save();
      logger.info(`User auto-linked via ${profile.provider}`, { userId: user.id });
    }

    const { accessToken, refreshToken } = await this.createTokens(user);

    const userResponse: UserDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
    if (user.avatar) userResponse.avatar = user.avatar;

    return { user: userResponse, accessToken, refreshToken };
  } catch (error) {
    logger.error(`OAuth findOrCreate error (${profile.provider}):`, error);
    throw error;
  }
}
```

Also remove the old `verifyGoogleToken()` and `googleSignin()` methods (lines 186–285 of the original file — these are now replaced by Passport + `findOrCreateOAuthUser`).

**Step 4: Run tests — expect PASS**

```bash
cd apps/api
npm test -- --testPathPattern=auth.test --verbose
```

Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add apps/api/src/services/auth.service.ts apps/api/src/tests/auth.test.ts
git commit -m "feat(api): add findOrCreateOAuthUser() with auto-link-by-email to AuthService"
```

---

## Task 4: Configure Passport Strategies

**Files:**
- Create: `apps/api/src/config/passport.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: Create `apps/api/src/config/passport.ts`**

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { AuthService, OAuthProfile } from '@/services/auth.service';
import { logger } from '@/utils/logger';

const authService = new AuthService();

const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3000';

// Passport does not use sessions in this app (stateless JWT)
passport.serializeUser((_user, done) => done(null, _user));
passport.deserializeUser((user, done) => done(null, user as any));

// Google OAuth2 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env['GOOGLE_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
      callbackURL: `${API_BASE_URL}/api/v1/auth/google/callback`,
      scope: ['email', 'profile'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google profile'));

        const oauthProfile: OAuthProfile = {
          provider: 'google',
          providerId: profile.id,
          email,
          name: profile.displayName || email.split('@')[0],
          avatar: profile.photos?.[0]?.value,
        };

        const result = await authService.findOrCreateOAuthUser(oauthProfile);
        return done(null, result);
      } catch (error) {
        logger.error('Google strategy error:', error);
        return done(error as Error);
      }
    }
  )
);

// GitHub OAuth2 Strategy
passport.use(
  new GithubStrategy(
    {
      clientID: process.env['GITHUB_CLIENT_ID'] || '',
      clientSecret: process.env['GITHUB_CLIENT_SECRET'] || '',
      callbackURL: `${API_BASE_URL}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        // GitHub may not expose email directly — check emails array
        const email =
          profile.emails?.find((e: any) => e.primary)?.value ||
          profile.emails?.[0]?.value;

        if (!email) return done(new Error('No email from GitHub profile. Ensure your GitHub account has a public email or grant user:email scope.'));

        const oauthProfile: OAuthProfile = {
          provider: 'github',
          providerId: String(profile.id),
          email,
          name: profile.displayName || profile.username || email.split('@')[0],
          avatar: profile.photos?.[0]?.value,
        };

        const result = await authService.findOrCreateOAuthUser(oauthProfile);
        return done(null, result);
      } catch (error) {
        logger.error('GitHub strategy error:', error);
        return done(error as Error);
      }
    }
  )
);

export default passport;
```

**Step 2: Register Passport in `apps/api/src/index.ts`**

In `initializeMiddlewares()`, after `this.app.use(cookieParser());`, add:

```typescript
import passportConfig from '@/config/passport';
// ...
// In initializeMiddlewares(), after cookieParser:
this.app.use(passportConfig.initialize());
```

**Step 3: Add `API_BASE_URL` to env example**

File: `apps/api/env.example` — add:
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

**Step 4: Typecheck**

```bash
cd apps/api
npm run typecheck
```

Expected: No errors

**Step 5: Commit**

```bash
git add apps/api/src/config/passport.ts apps/api/src/index.ts apps/api/env.example
git commit -m "feat(api): configure Passport.js with Google and GitHub OAuth2 strategies"
```

---

## Task 5: Replace Auth Routes + Add OAuth Callback Controller

**Files:**
- Modify: `apps/api/src/routes/auth.routes.ts`
- Modify: `apps/api/src/controllers/auth.controller.ts`

**Step 1: Write failing integration test — append to `auth.test.ts`**

```typescript
import request from 'supertest';
// Note: import app after passport is configured
// These tests mock Passport internals

describe('GET /auth/google/callback (integration)', () => {
  it('should redirect to FRONTEND_URL on success', async () => {
    // We test the callback handler with a mocked req.user
    // This is covered by the controller unit test below
  });
});

describe('AuthController.oauthCallback()', () => {
  it('should set cookies and redirect to FRONTEND_URL on success', () => {
    const mockResult = {
      user: { id: '1', username: 'user', email: 'u@example.com', createdAt: new Date() },
      accessToken: 'access-jwt',
      refreshToken: 'refresh-token',
    };

    const req = { user: mockResult } as any;
    const res = {
      cookie: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const controller = new AuthController();
    controller.oauthCallback(req, res);

    expect(res.cookie).toHaveBeenCalledWith('accessToken', 'access-jwt', expect.any(Object));
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/auth/callback')
    );
  });

  it('should redirect to FRONTEND_URL/auth/callback?error=true when req.user is missing', () => {
    const req = { user: null } as any;
    const res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const controller = new AuthController();
    controller.oauthCallback(req, res);

    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('error=true')
    );
  });
});
```

**Step 2: Run tests — expect FAIL**

```bash
cd apps/api
npm test -- --testPathPattern=auth.test --verbose
```

Expected: FAIL — `controller.oauthCallback is not a function`

**Step 3: Add `oauthCallback()` to AuthController and remove `googleSignin()`**

In `apps/api/src/controllers/auth.controller.ts`:

1. Add import at top:
```typescript
import { config } from '@/config/config';
```
(already imported — check it's there)

2. Remove the `googleSignin` method entirely.

3. Add this new method to the class:
```typescript
public oauthCallback = (req: AuthenticatedRequest, res: Response): void => {
  const frontendUrl = process.env['FRONTEND_URL'] || 'http://localhost:5173';

  if (!req.user) {
    res.redirect(`${frontendUrl}/auth/callback?error=true`);
    return;
  }

  const result = req.user as any;

  const cookieOptions = {
    ...config.cookie,
    maxAge: 15 * 60 * 1000,
  };

  res.cookie('accessToken', result.accessToken, cookieOptions);

  res.cookie('refreshToken', result.refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${frontendUrl}/auth/callback?success=true`);
};
```

**Step 4: Replace auth routes**

Replace `apps/api/src/routes/auth.routes.ts` entirely with:

```typescript
import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '@/controllers/auth.controller';
import { validateDto } from '@/middleware/validation.middleware';
import { authenticateToken } from '@/middleware/auth.middleware';
import { SignupRequestDto, SigninRequestDto } from '@raven/validators';
import '@/config/passport'; // Ensure strategies are registered

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/signup
router.post('/signup', validateDto(SignupRequestDto), authController.signup.bind(authController));

// POST /api/v1/auth/signin
router.post('/signin', validateDto(SigninRequestDto), authController.signin.bind(authController));

// GET /api/v1/auth/google  — redirect to Google
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));

// GET /api/v1/auth/google/callback  — Google redirects back here
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env['FRONTEND_URL'] || 'http://localhost:5173'}/auth/callback?error=true`, session: false }),
  authController.oauthCallback.bind(authController)
);

// GET /api/v1/auth/github  — redirect to GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

// GET /api/v1/auth/github/callback  — GitHub redirects back here
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env['FRONTEND_URL'] || 'http://localhost:5173'}/auth/callback?error=true`, session: false }),
  authController.oauthCallback.bind(authController)
);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh.bind(authController));

// POST /api/v1/auth/signout
router.post('/signout', authenticateToken, authController.signout.bind(authController));

export { router as authRoutes };
```

**Step 5: Run tests — expect PASS**

```bash
cd apps/api
npm test -- --testPathPattern=auth.test --verbose
```

Expected: PASS (7+ tests)

**Step 6: Typecheck**

```bash
cd apps/api
npm run typecheck
```

Expected: No errors

**Step 7: Commit**

```bash
git add apps/api/src/controllers/auth.controller.ts apps/api/src/routes/auth.routes.ts apps/api/src/tests/auth.test.ts
git commit -m "feat(api): replace Google credential endpoint with Passport redirect routes for Google + GitHub"
```

---

## Task 6: Update Frontend — AuthCallbackPage + Login Buttons

**Files:**
- Create: `apps/web/src/pages/AuthCallbackPage.tsx`
- Modify: `apps/web/src/components/molecules/LoginForm.tsx`
- Modify: `apps/web/src/components/atoms/GithubLoginButton.tsx`
- Modify: `apps/web/src/services/authService.ts`
- Modify: Router config (find router file — usually `apps/web/src/App.tsx` or `apps/web/src/router.tsx`)

**Step 1: Create `apps/web/src/pages/AuthCallbackPage.tsx`**

```tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';

/**
 * AuthCallbackPage
 * Handles the redirect from backend after OAuth2 flow.
 * Backend redirects to /auth/callback?success=true or ?error=true
 */
const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getProfile } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const isSuccess = searchParams.get('success') === 'true';
      const isError = searchParams.get('error') === 'true';

      if (isError) {
        toast.error('OAuth sign-in failed. Please try again.');
        navigate('/login', { replace: true });
        return;
      }

      if (isSuccess) {
        await getProfile();
        toast.success('Welcome! 🎉');
        navigate('/', { replace: true });
        return;
      }

      // Neither — something unexpected
      navigate('/login', { replace: true });
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
};

export default AuthCallbackPage;
```

**Step 2: Find and update the router file**

First, find the router:
```bash
grep -r "LoginPage\|BrowserRouter\|createBrowserRouter" apps/web/src --include="*.tsx" -l
```

Add this route to the router (alongside `/login`):
```tsx
import AuthCallbackPage from '@/pages/AuthCallbackPage';
// Add route:
{ path: '/auth/callback', element: <AuthCallbackPage /> }
```

**Step 3: Update `LoginForm.tsx` — replace Google credential button**

Find lines 156–179 (the `<GoogleLogin ...>` block) and replace with:

```tsx
{/* Google SSO - redirect flow */}
<button
  type="button"
  onClick={() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${apiBase}/api/v1/auth/google`;
  }}
  className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border/30 bg-background/50 text-sm font-light text-foreground hover:bg-accent/10 transition-all duration-200"
>
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
  Sign in with Google
</button>
```

Also remove the `@react-oauth/google` import (`import { GoogleLogin } from '@react-oauth/google';`) and the `authService.googleSignIn` reference.

**Step 4: Update `GithubLoginButton.tsx` — wire up GitHub redirect**

Replace the entire file with:

```tsx
// External libraries
import { Github } from 'lucide-react';

export default function GithubLoginButton() {
  const handleGithubLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${apiBase}/api/v1/auth/github`;
  };

  return (
    <button
      className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border/30 bg-background/50 text-sm font-light text-foreground hover:bg-accent/10 transition-all duration-200"
      onClick={handleGithubLogin}
      type="button"
    >
      <Github size={18} />
      Sign in with GitHub
    </button>
  );
}
```

**Step 5: Add `GithubLoginButton` to `LoginForm.tsx`**

Import and add the GitHub button below the Google button in the `"Or continue with"` section:

```tsx
import GithubLoginButton from '@/components/atoms/GithubLoginButton';
// ...
<GithubLoginButton />
```

**Step 6: Remove `googleSignIn` from `authService.ts`**

Delete lines 33–38 (the `googleSignIn` method).

**Step 7: Check frontend builds**

```bash
cd apps/web
npm run build 2>&1 | tail -20
```

Expected: No errors.

**Step 8: Commit**

```bash
git add apps/web/src/pages/AuthCallbackPage.tsx \
        apps/web/src/components/molecules/LoginForm.tsx \
        apps/web/src/components/atoms/GithubLoginButton.tsx \
        apps/web/src/services/authService.ts
git commit -m "feat(web): add AuthCallbackPage, wire up Google + GitHub OAuth redirect buttons"
```

---

## Task 7: Add Secrets to CI/CD and Register OAuth Callbacks

**Files:**
- Modify: `cloudbuild-api.yaml`
- Modify: `.github/workflows/ci.yml` (if env vars are injected there)

**Step 1: Add new env vars to `cloudbuild-api.yaml`**

Find the `--set-env-vars` section in `cloudbuild-api.yaml` and add:

```yaml
GITHUB_CLIENT_ID=$_GITHUB_CLIENT_ID,
GITHUB_CLIENT_SECRET=$_GITHUB_CLIENT_SECRET,
FRONTEND_URL=$_FRONTEND_URL,
API_BASE_URL=$_API_BASE_URL
```

Also add to the `substitutions` block:
```yaml
_GITHUB_CLIENT_ID: ''
_GITHUB_CLIENT_SECRET: ''
_FRONTEND_URL: 'https://your-frontend.vercel.app'
_API_BASE_URL: 'https://your-api-cloudrun-url'
```

**Step 2: Register the OAuth callback URLs (manual step — do outside the codebase)**

- **Google Cloud Console** → APIs & Services → Credentials → your OAuth 2.0 Client:
  - Add authorized redirect URI: `https://<api-cloud-run-url>/api/v1/auth/google/callback`
  - Remove old credential-based client if present (or leave — it's separate)

- **GitHub** → Settings → Developer Settings → OAuth Apps → your app:
  - Set Authorization callback URL: `https://<api-cloud-run-url>/api/v1/auth/github/callback`
  - Create a new OAuth App if one doesn't exist

**Step 3: Add GitHub secrets to GitHub Actions (manual step)**

Go to GitHub repo → Settings → Secrets and Variables → Actions → New secret:
- `GITHUB_OAUTH_CLIENT_ID` → paste GitHub OAuth client ID
- `GITHUB_OAUTH_CLIENT_SECRET` → paste GitHub OAuth client secret

**Step 4: Commit**

```bash
git add cloudbuild-api.yaml
git commit -m "chore(ci): add GitHub OAuth env var substitutions to Cloud Build config"
```

---

## Task 8: Run All Tests, Push Branch, Open PR

**Step 1: Run full test suite**

```bash
cd apps/api
npm test -- --verbose
```

Expected: All tests PASS (no failures)

**Step 2: Run typecheck across workspace**

```bash
cd /path/to/repo-root
pnpm run typecheck  # or: cd apps/api && npm run typecheck && cd ../web && npm run typecheck
```

Expected: No errors

**Step 3: Push and open PR to develop**

```bash
git push origin feature/sso-multi-provider
gh pr create --base develop --title "feat: multi-provider SSO (Google + GitHub) with Passport.js" \
  --body "Implements Passport.js redirect-based OAuth2 for Google and GitHub. Auto-links accounts by email. Adds providers[] sub-doc to User model. Adds auth unit tests. See docs/plans/2026-03-02-sso-design.md."
```

**Step 4: Watch CI**

```bash
gh run watch
```

Expected: CI passes (lint + test + build + deploy to Cloud Run)

**Step 5: Merge PR**

```bash
gh pr merge --squash --delete-branch
```

---

## Reference: New Environment Variables

| Variable | Where to set | Description |
|---|---|---|
| `GITHUB_CLIENT_ID` | Cloud Run, .env | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Cloud Run, .env | GitHub OAuth App Client Secret |
| `API_BASE_URL` | Cloud Run, .env | Full URL of the deployed API (`https://api-xxx.run.app`) |
| `FRONTEND_URL` | Cloud Run, .env | Full URL of the deployed frontend (`https://your-app.vercel.app`) |
| `GOOGLE_CLIENT_ID` | Already set | Existing Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Already set | Existing Google OAuth Client Secret |
