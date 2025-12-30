# Technology Stack

**Analysis Date:** 2025-12-29

## Languages

**Primary:**
- TypeScript 5.7.3 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript - Build scripts, config files (`vitest.config.js`, `playwright.config.js`, `eslint.config.js`)

## Runtime

**Environment:**
- Node.js ^18.20.2 || >=20.9.0 - `package.json` (engines field)
- ESM module system (type: "module") - `package.json`

**Package Manager:**
- pnpm ^9 || ^10 - `package.json` (engines field)
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- Next.js 15.4.10 - Full-stack framework (`package.json`, `dev/next.config.mjs`)
- React 19.2.1 - UI framework (`package.json`)
- Payload CMS 3.37.0 - Headless CMS (`package.json`, `dev/payload.config.ts`)

**Testing:**
- Vitest 3.1.2 - Unit/integration tests (`package.json`, `vitest.config.js`)
- Playwright 1.56.1 - E2E tests (`package.json`, `playwright.config.js`)

**Build/Dev:**
- SWC 0.6.0 - Transpilation to JavaScript (`package.json`, `.swcrc`)
- TypeScript 5.7.3 - Type checking, declaration generation (`tsconfig.json`)

## Key Dependencies

**Critical:**
- @payloadcms/next 3.37.0 - Payload + Next.js integration (`package.json`)
- @payloadcms/ui 3.37.0 - Admin panel UI components (`package.json`)
- @payloadcms/richtext-lexical 3.37.0 - Rich text editor (`package.json`)

**Infrastructure:**
- @payloadcms/db-mongodb 3.37.0 - MongoDB database adapter (`package.json`, `dev/payload.config.ts`)
- @payloadcms/db-postgres 3.37.0 - PostgreSQL adapter (available) (`package.json`)
- @payloadcms/db-sqlite 3.37.0 - SQLite adapter (available) (`package.json`)
- mongodb-memory-server 10.1.4 - In-memory MongoDB for testing (`package.json`)
- sharp 0.34.2 - Image processing (`package.json`, `dev/payload.config.ts`)
- graphql 16.8.1 - GraphQL support (`package.json`)

## Configuration

**Environment:**
- .env files in dev directory (`dev/.env`)
- Required: `DATABASE_URL`, `PAYLOAD_SECRET`

**Build:**
- `tsconfig.json` - TypeScript compiler options (ES2022, strict mode)
- `.swcrc` - SWC transpiler configuration
- `vitest.config.js` - Test runner configuration
- `playwright.config.js` - E2E test configuration
- `eslint.config.js` - ESLint rules (flat config)
- `.prettierrc.json` - Code formatting

## Platform Requirements

**Development:**
- Any platform with Node.js 18.20.2+ or 20.9.0+
- MongoDB for database (or uses in-memory for tests)
- No external dependencies required for testing

**Production:**
- Distributed as npm package
- Plugin installed via npm/pnpm into Payload projects
- Requires host application with Payload CMS 3.x

---

*Stack analysis: 2025-12-29*
*Update after major dependency changes*
