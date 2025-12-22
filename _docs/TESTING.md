# Testing Guide

> **Last Updated:** 2025-12-22  
> **Version:** 1.0.0

## 📋 Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Test Coverage](#test-coverage)
- [Mocking](#mocking)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

---

## 🎯 Overview

The **erion-raven** project uses a comprehensive testing strategy to ensure code quality and reliability:

- **Unit Tests** - Test individual functions and components
- **Integration Tests** - Test API endpoints and services
- **E2E Tests** - Test complete user flows
- **Coverage Goals** - Aim for 80%+ code coverage

---

## 🛠️ Testing Stack

### Backend Testing

| Tool | Version | Purpose |
|------|---------|---------|
| **Jest** | 29.x | Test runner & framework |
| **Supertest** | 6.x | HTTP assertions |
| **MongoDB Memory Server** | 9.x | In-memory MongoDB for tests |
| **Redis Mock** | 0.56.x | Mock Redis client |

### Frontend Testing

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 1.x | Test runner (Vite-native) |
| **React Testing Library** | 14.x | Component testing |
| **MSW** | 2.x | API mocking |
| **@testing-library/user-event** | 14.x | User interaction simulation |

---

## 🚀 Running Tests

### All Tests

```bash
# Run all tests (backend + frontend)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Backend Tests Only

```bash
cd apps/api

# Run all backend tests
pnpm test

# Run specific test file
pnpm test auth.test.ts

# Run tests matching pattern
pnpm test --testNamePattern="should create user"

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Frontend Tests Only

```bash
cd apps/web

# Run all frontend tests
pnpm test

# Run specific test
pnpm test LoginForm.test.tsx

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# UI mode (Vitest UI)
pnpm test:ui
```

---

## 🧪 Unit Testing

### Backend Unit Tests

**Example: Testing a Service**

```typescript
// apps/api/src/services/__tests__/auth.service.test.ts

import { AuthService } from '../auth.service';
import { User } from '@/models/User';
import { Session } from '@/models/Session';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('@/models/User');
jest.mock('@/models/Session');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockUser = {
        _id: 'user123',
        ...userData,
        password: hashedPassword,
        save: jest.fn().mockResolvedValue(true)
      };

      (User as any).mockImplementation(() => mockUser);

      // Act
      const result = await authService.createUser(userData);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toMatchObject({
        username: userData.username,
        email: userData.email
      });
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const userData = {
        username: 'johndoe',
        email: 'existing@example.com',
        password: 'SecurePass123'
      };

      (User.findOne as jest.Mock).mockResolvedValue({ email: userData.email });

      // Act & Assert
      await expect(authService.createUser(userData)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('validateCredentials', () => {
    it('should return user if credentials are valid', async () => {
      // Arrange
      const email = 'john@example.com';
      const password = 'SecurePass123';

      const mockUser = {
        _id: 'user123',
        email,
        password: 'hashed_password'
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.validateCredentials(email, password);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email, deletedAt: null });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.validateCredentials('nonexistent@example.com', 'password')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Frontend Unit Tests

**Example: Testing a Component**

```typescript
// apps/web/src/components/molecules/__tests__/LoginForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import { vi } from 'vitest';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render login form', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid credentials', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass123');

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'SecurePass123'
      });
    });
  });

  it('should show loading state during submission', async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<LoginForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });
});
```

**Example: Testing a Custom Hook**

```typescript
// apps/web/src/hooks/__tests__/useAuth.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { vi } from 'vitest';

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      result.current.login('john@example.com', 'SecurePass123');
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
    });
  });

  it('should handle login error', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      result.current.login('invalid@example.com', 'wrongpassword');
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeDefined();
    });
  });
});
```

---

## 🔗 Integration Testing

### Backend Integration Tests

**Example: Testing API Endpoints**

```typescript
// apps/api/src/__tests__/integration/auth.integration.test.ts

import request from 'supertest';
import { app } from '@/index';
import { User } from '@/models/User';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('Auth API Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean up database after each test
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        username: userData.username,
        email: userData.email
      });
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
    });

    it('should return 409 if email already exists', async () => {
      const userData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      // Create user first
      await request(app).post('/api/v1/auth/signup').send(userData);

      // Try to create again
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        username: 'ab', // Too short
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/signin', () => {
    it('should login with valid credentials', async () => {
      // Create user first
      const userData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      await request(app).post('/api/v1/auth/signup').send(userData);

      // Login
      const response = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/profile', () => {
    it('should return user profile when authenticated', async () => {
      // Create and login user
      const userData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      await request(app).post('/api/v1/auth/signup').send(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: userData.email,
          password: userData.password
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Get profile
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        username: userData.username,
        email: userData.email
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
```

---

## 🌐 E2E Testing

**Example: Complete User Flow**

```typescript
// apps/web/src/__tests__/e2e/chat-flow.test.ts

import { test, expect } from '@playwright/test';

test.describe('Chat Flow E2E', () => {
  test('should complete full chat flow', async ({ page }) => {
    // 1. Navigate to app
    await page.goto('http://localhost:5173');

    // 2. Register
    await page.click('text=Sign Up');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123');
    await page.click('button:has-text("Create Account")');

    // 3. Verify redirect to home
    await expect(page).toHaveURL('http://localhost:5173/');

    // 4. Create conversation
    await page.click('text=New Conversation');
    await page.fill('[name="conversationName"]', 'Test Group');
    await page.click('button:has-text("Create")');

    // 5. Send message
    await page.fill('[placeholder="Type a message"]', 'Hello, world!');
    await page.press('[placeholder="Type a message"]', 'Enter');

    // 6. Verify message appears
    await expect(page.locator('text=Hello, world!')).toBeVisible();

    // 7. Logout
    await page.click('[aria-label="User menu"]');
    await page.click('text=Logout');

    // 8. Verify redirect to login
    await expect(page).toHaveURL('http://localhost:5173/login');
  });
});
```

---

## 📊 Test Coverage

### Viewing Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Goals

| Type | Target | Current |
|------|--------|---------|
| **Statements** | 80% | - |
| **Branches** | 75% | - |
| **Functions** | 80% | - |
| **Lines** | 80% | - |

### Coverage Configuration

**Backend (`apps/api/jest.config.js`):**
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**'
  ]
};
```

---

## 🎭 Mocking

### Mocking MongoDB

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### Mocking Redis

```typescript
import RedisMock from 'redis-mock';

jest.mock('redis', () => RedisMock);
```

### Mocking API Calls (Frontend)

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/v1/auth/signin', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: { id: '123', username: 'testuser' }
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## ✅ Best Practices

### 1. **Test Structure (AAA Pattern)**

```typescript
it('should do something', async () => {
  // Arrange - Set up test data
  const input = { ... };
  
  // Act - Execute the code under test
  const result = await functionUnderTest(input);
  
  // Assert - Verify the results
  expect(result).toBe(expected);
});
```

### 2. **Descriptive Test Names**

✅ Good:
```typescript
it('should return 401 when user is not authenticated')
it('should create conversation with valid data')
```

❌ Bad:
```typescript
it('test 1')
it('works')
```

### 3. **Test One Thing**

```typescript
// ✅ Good - Tests one specific behavior
it('should validate email format', () => {
  expect(validateEmail('invalid')).toBe(false);
});

// ❌ Bad - Tests multiple things
it('should validate input', () => {
  expect(validateEmail('invalid')).toBe(false);
  expect(validatePassword('123')).toBe(false);
  expect(validateUsername('ab')).toBe(false);
});
```

### 4. **Use Test Fixtures**

```typescript
// test/fixtures/users.ts
export const mockUser = {
  id: '123',
  username: 'testuser',
  email: 'test@example.com'
};

// In tests
import { mockUser } from '@/test/fixtures/users';
```

### 5. **Clean Up After Tests**

```typescript
afterEach(async () => {
  await User.deleteMany({});
  await Conversation.deleteMany({});
  jest.clearAllMocks();
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm type-check

      - name: Run tests
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📚 Related Documentation

- **[Architecture](./ARCHITECTURE.md)** - System architecture
- **[Development Guide](./DEVELOPMENT.md)** - Development setup
- **[API Design](./API_DESIGN.md)** - API endpoints

---

## 📞 Support

For testing questions:
- **GitHub Issues:** [erion-raven/issues](https://github.com/EricNguyen1206/erion-raven/issues)
- **Email:** eric.nguyen@example.com
