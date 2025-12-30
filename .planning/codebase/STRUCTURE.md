# Codebase Structure

**Analysis Date:** 2025-12-29

## Directory Layout

```
experiment-1/
├── src/                    # Plugin source code (published to npm)
│   ├── index.ts           # Main plugin export & config transformer
│   ├── components/        # React components for admin UI
│   ├── endpoints/         # Custom API endpoint handlers
│   └── exports/           # Entry point exports (client, rsc)
├── dev/                    # Development & testing application
│   ├── app/               # Next.js App Router
│   ├── helpers/           # Test utilities and fixtures
│   ├── payload.config.ts  # Payload CMS configuration
│   ├── seed.ts            # Database seeding logic
│   ├── int.spec.ts        # Integration tests (Vitest)
│   └── e2e.spec.ts        # E2E tests (Playwright)
├── dist/                   # Built plugin output
├── package.json           # Package metadata & scripts
├── tsconfig.json          # TypeScript configuration
├── vitest.config.js       # Vitest test config
├── playwright.config.js   # Playwright E2E config
└── eslint.config.js       # ESLint rules
```

## Directory Purposes

**src/**
- Purpose: Plugin source code published to npm via `dist/`
- Contains: TypeScript/TSX source files
- Key files: `index.ts` (main plugin), `exports/client.ts`, `exports/rsc.ts`
- Subdirectories: `components/`, `endpoints/`, `exports/`

**src/components/**
- Purpose: React components for Payload admin panel
- Contains: Client components (`.tsx` with `'use client'`), Server components (`.tsx`)
- Key files: `BeforeDashboardClient.tsx`, `BeforeDashboardServer.tsx`
- Subdirectories: None

**src/endpoints/**
- Purpose: Custom REST API endpoint handlers
- Contains: Handler functions for plugin endpoints
- Key files: `customEndpointHandler.ts`
- Subdirectories: None

**src/exports/**
- Purpose: Package entry points for different use cases
- Contains: Re-exports with proper directives
- Key files: `client.ts` (client components), `rsc.ts` (server components)
- Subdirectories: None

**dev/**
- Purpose: Isolated Payload + Next.js app for plugin development and testing
- Contains: Full Next.js application with Payload integration
- Key files: `payload.config.ts`, `seed.ts`, `int.spec.ts`, `e2e.spec.ts`
- Subdirectories: `app/`, `helpers/`

**dev/app/**
- Purpose: Next.js App Router structure
- Contains: Layouts, pages, API routes
- Key files: `(payload)/layout.tsx`, `(payload)/api/[...slug]/route.ts`
- Subdirectories: `(payload)/` (Payload routes), `my-route/` (custom route)

**dev/helpers/**
- Purpose: Test utilities and fixtures
- Contains: Credentials, mock adapters
- Key files: `credentials.ts`, `testEmailAdapter.ts`
- Subdirectories: None

## Key File Locations

**Entry Points:**
- `src/index.ts` - Main plugin export
- `src/exports/client.ts` - Client components entry
- `src/exports/rsc.ts` - Server components entry
- `dev/payload.config.ts` - Dev app Payload configuration

**Configuration:**
- `tsconfig.json` - TypeScript compiler options
- `vitest.config.js` - Vitest test configuration
- `playwright.config.js` - Playwright E2E configuration
- `eslint.config.js` - ESLint rules
- `.prettierrc.json` - Code formatting
- `.swcrc` - SWC transpiler options
- `dev/.env` - Environment variables

**Core Logic:**
- `src/index.ts` - Plugin config transformer (collections, fields, endpoints, UI)
- `src/endpoints/customEndpointHandler.ts` - Custom API handler
- `src/components/BeforeDashboardClient.tsx` - Client dashboard component
- `src/components/BeforeDashboardServer.tsx` - Server dashboard component

**Testing:**
- `dev/int.spec.ts` - Integration tests (3 test cases)
- `dev/e2e.spec.ts` - E2E tests (1 test case)
- `dev/helpers/` - Test fixtures and utilities

**Documentation:**
- `README.md` - User-facing documentation
- `CLAUDE.md` - AI assistant instructions

## Naming Conventions

**Files:**
- PascalCase.tsx - React components (`BeforeDashboardClient.tsx`)
- camelCase.ts - Utilities, handlers (`customEndpointHandler.ts`)
- kebab-case.ts - General modules
- *.module.css - CSS Modules (`BeforeDashboardServer.module.css`)
- *.spec.ts - Test files (`int.spec.ts`, `e2e.spec.ts`)
- *.config.js - Configuration files

**Directories:**
- lowercase - All directories (`components`, `endpoints`, `exports`)
- (group) - Route groups in Next.js (`(payload)`)
- [...slug] - Catch-all routes

**Special Patterns:**
- `index.ts` - Main entry point for directories
- `client.ts` / `rsc.ts` - Export entry points
- `route.ts` - Next.js API routes
- `page.tsx` - Next.js pages
- `layout.tsx` - Next.js layouts

## Where to Add New Code

**New Feature:**
- Primary code: `src/index.ts` (plugin logic)
- Components: `src/components/`
- Tests: `dev/int.spec.ts` or `dev/e2e.spec.ts`

**New Component/Module:**
- Implementation: `src/components/NewComponent.tsx`
- Client export: Add to `src/exports/client.ts`
- Server export: Add to `src/exports/rsc.ts`
- Registration: `src/index.ts` admin.components section

**New Endpoint:**
- Handler: `src/endpoints/newEndpointHandler.ts`
- Registration: `src/index.ts` config.endpoints section
- Tests: `dev/int.spec.ts`

**New Collection:**
- Definition: `src/index.ts` collections array
- Types: Auto-generated in `dev/payload-types.ts`
- Tests: `dev/int.spec.ts`

**Utilities:**
- Plugin utilities: `src/utilities/` (create if needed)
- Test utilities: `dev/helpers/`

## Special Directories

**dist/**
- Purpose: Built plugin output for npm publishing
- Source: Generated by `pnpm build` (SWC compilation)
- Committed: No (in .gitignore)

**node_modules/**
- Purpose: Installed dependencies
- Source: pnpm install
- Committed: No (in .gitignore)

**dev/media/**
- Purpose: Uploaded media files during development
- Source: Payload file uploads
- Committed: No (in .gitignore)

---

*Structure analysis: 2025-12-29*
*Update when directory structure changes*
