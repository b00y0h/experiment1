# Testing Patterns

**Analysis Date:** 2025-12-29

## Test Framework

**Runner:**
- Vitest 3.1.2 - Integration tests
- Config: `vitest.config.js` in project root

**E2E Framework:**
- Playwright 1.56.1 - Browser automation tests
- Config: `playwright.config.js` in project root

**Assertion Library:**
- Vitest built-in expect
- Playwright built-in expect
- Matchers: toBe, toMatchObject, toHaveLength, toBeDefined, toHaveTitle, toBeVisible

**Run Commands:**
```bash
pnpm test              # Run all tests (int + e2e)
pnpm test:int          # Integration tests only (Vitest)
pnpm test:e2e          # E2E tests only (Playwright)
pnpm lint              # Run ESLint
```

## Test File Organization

**Location:**
- Integration tests: `dev/int.spec.ts`
- E2E tests: `dev/e2e.spec.ts`
- Test helpers: `dev/helpers/`

**Naming:**
- Integration tests: `*.spec.ts` (Vitest convention)
- E2E tests: `*.spec.ts` (Playwright convention)
- No `.test.ts` files

**Structure:**
```
dev/
├── int.spec.ts              # Integration tests (Vitest)
├── e2e.spec.ts              # E2E tests (Playwright)
├── helpers/
│   ├── credentials.ts       # Dev user credentials
│   └── testEmailAdapter.ts  # Mock email adapter
└── payload.config.ts        # Test-aware config (MongoDB Memory Server)
```

## Test Structure

**Suite Organization (Vitest):**
```typescript
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

let payload: Payload

afterAll(async () => {
  await payload.destroy()
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('Plugin integration tests', () => {
  test('should query custom endpoint added by plugin', async () => {
    // arrange
    const response = await payload.local.customAPI({...})

    // assert
    expect(response.status).toBe(200)
  })
})
```

**Suite Organization (Playwright):**
```typescript
import { expect, test } from '@playwright/test'

test('should render admin panel logo', async ({ page }) => {
  await page.goto('/admin')

  // login
  await page.fill('#field-email', 'dev@payloadcms.com')
  await page.fill('#field-password', 'test')
  await page.click('.form-submit button')

  // assertions
  await expect(page).toHaveTitle(/Dashboard/)
  await expect(page.locator('.graphic-icon')).toBeVisible()
})
```

**Patterns:**
- beforeAll for shared setup (initialize Payload)
- afterAll for cleanup (destroy Payload instance)
- Async/await for all database operations
- One assertion focus per test

## Mocking

**Framework:**
- No explicit mocking framework used
- MongoDB Memory Server for database isolation

**Database Mocking (dev/payload.config.ts):**
```typescript
if (process.env.NODE_ENV === 'test') {
  const memoryDB = await MongoMemoryReplSet.create({
    replSet: { count: 1, dbName: 'payloadmemory', storageEngine: 'wiredTiger' },
  })
  process.env.DATABASE_URL = memoryDB.getUri()
}
```

**Email Mocking (dev/helpers/testEmailAdapter.ts):**
```typescript
export const testEmailAdapter = (): EmailAdapter => ({
  name: 'test-adapter',
  defaultFromAddress: 'dev@payloadcms.com',
  defaultFromName: 'Payload CMS',
  sendEmail: async (args) => {
    console.log('TEST EMAIL: ----------------------')
    console.log(JSON.stringify(args, null, 2))
  },
})
```

**What to Mock:**
- Database: MongoDB Memory Server for isolated tests
- Email: Test adapter that logs to console
- External services: Not applicable (none integrated)

## Fixtures and Factories

**Test Data:**
```typescript
// dev/helpers/credentials.ts
export const devUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}
```

**Seeding (dev/seed.ts):**
```typescript
export const seed = async (payload: Payload) => {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: { email: { equals: devUser.email } },
  })

  if (!totalDocs) {
    await payload.create({
      collection: 'users',
      data: devUser,
    })
  }
}
```

**Location:**
- Credentials: `dev/helpers/credentials.ts`
- Seed function: `dev/seed.ts`
- Mock adapters: `dev/helpers/testEmailAdapter.ts`

## Coverage

**Requirements:**
- No enforced coverage target
- Coverage tracked for awareness only

**Configuration:**
- Vitest has built-in coverage support
- No coverage configuration in vitest.config.js

**View Coverage:**
```bash
pnpm test:int -- --coverage  # Run with coverage
```

## Test Types

**Integration Tests (dev/int.spec.ts):**
- Scope: Plugin functionality with real Payload instance
- Database: MongoDB Memory Server (in-memory)
- Test cases:
  1. Query custom endpoint added by plugin
  2. Create post with custom field added by plugin
  3. Plugin creates and seeds plugin-collection

**E2E Tests (dev/e2e.spec.ts):**
- Scope: Full browser-based user flows
- Framework: Playwright with Chromium
- Test cases:
  1. Admin panel login and dashboard rendering

## Common Patterns

**Async Testing:**
```typescript
test('should query custom endpoint', async () => {
  const response = await payload.local.customAPI({
    path: '/my-plugin-endpoint',
  })
  expect(response.status).toBe(200)
})
```

**Database Testing:**
```typescript
test('can create post with plugin field', async () => {
  const post = await payload.create({
    collection: 'posts',
    data: {
      title: 'test',
      addedByPlugin: 'plugin value',
    },
  })
  expect(post.addedByPlugin).toBe('plugin value')
})
```

**E2E Login Pattern:**
```typescript
test('should render admin', async ({ page }) => {
  await page.goto('/admin')
  await page.fill('#field-email', devUser.email)
  await page.fill('#field-password', devUser.password)
  await page.click('.form-submit button')
  await expect(page).toHaveTitle(/Dashboard/)
})
```

**Snapshot Testing:**
- Not used in this codebase

## Configuration Details

**Vitest (vitest.config.js):**
```javascript
export default defineConfig({
  test: {
    environment: 'node',
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
})
```

**Playwright (playwright.config.js):**
```javascript
export default defineConfig({
  testDir: './dev',
  testMatch: '**/e2e.spec.{ts,js}',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  retries: process.env.CI ? 2 : 0,
})
```

---

*Testing analysis: 2025-12-29*
*Update when test patterns change*
