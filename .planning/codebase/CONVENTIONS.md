# Coding Conventions

**Analysis Date:** 2025-12-29

## Naming Patterns

**Files:**
- PascalCase for React components (`BeforeDashboardClient.tsx`, `BeforeDashboardServer.tsx`)
- camelCase for handlers/utilities (`customEndpointHandler.ts`, `testEmailAdapter.ts`)
- kebab-case.ts for general modules
- *.spec.ts for test files (`int.spec.ts`, `e2e.spec.ts`)
- *.module.css for CSS Modules

**Functions:**
- camelCase for all functions (`fetchMessage`, `customEndpointHandler`)
- No special prefix for async functions
- Factory functions named after what they create (`experiment1`, `testEmailAdapter`)

**Variables:**
- camelCase for variables (`devUser`, `message`, `result`)
- No UPPER_SNAKE_CASE observed (constants use camelCase)
- No underscore prefix for private members

**Types:**
- PascalCase for interfaces and type aliases (`Experiment1Config`, `ServerComponentProps`)
- No `I` prefix for interfaces
- Suffix with purpose when helpful (`Config`, `Props`)

## Code Style

**Formatting (`.prettierrc.json`):**
- Single quotes: `"singleQuote": true`
- No semicolons: `"semi": false`
- Trailing commas: `"trailingComma": "all"`
- Print width: 100 characters
- Tab width: 2 spaces

**Linting (`eslint.config.js`):**
- Extends @payloadcms/eslint-config
- ESLint flat config format (v9+)
- Default ignores: dist, node_modules, .next, build outputs

## Import Organization

**Order:**
1. React and framework imports (`import React`, `import { Config }`)
2. Third-party packages (`import type { Payload }`)
3. Relative imports (`./components/`, `../helpers/`)

**Grouping:**
- Type imports use `import type { }` syntax
- No blank lines between import groups
- Named imports preferred

**Path Aliases:**
- No path aliases configured
- Relative imports used throughout

## Error Handling

**Patterns:**
- Minimal error handling in plugin code
- Delegates error handling to Payload CMS
- No try/catch blocks in current source

**Error Types:**
- No custom error classes defined
- Uses Payload's built-in error handling

## Logging

**Framework:**
- Console logging only (console.log, console.error)
- Test email adapter logs to stdout

**Patterns:**
- Log format: Simple string messages
- Used for: Email logging in test adapter
- No structured logging

## Comments

**When to Comment:**
- JSDoc for exported types and functions
- Inline comments for non-obvious logic
- Section comments in plugin index

**JSDoc/TSDoc:**
- Used for type definitions (`Experiment1Config`)
- Documents purpose and field descriptions
- Example:
```typescript
export type Experiment1Config = {
  /**
   * Enable or disable plugin
   * @default false
   */
  disabled?: boolean
}
```

**TODO Comments:**
- Not observed in current codebase

## Function Design

**Size:**
- Functions kept relatively small
- Plugin factory ~100 lines with clear sections

**Parameters:**
- Single config object for plugin options
- Destructuring in function signatures

**Return Values:**
- Explicit returns
- Config transformer returns modified config
- Handlers return Response objects

## Module Design

**Exports:**
- Named exports preferred (`export const experiment1`)
- No default exports
- Re-exports for entry points

**Barrel Files:**
- `src/exports/client.ts` - Client component exports with `'use client'`
- `src/exports/rsc.ts` - Server component exports
- Main entry at `src/index.ts`

**Pattern Examples:**

Client export (`src/exports/client.ts`):
```typescript
'use client'
export { BeforeDashboardClient } from '../components/BeforeDashboardClient'
```

RSC export (`src/exports/rsc.ts`):
```typescript
export { BeforeDashboardServer } from '../components/BeforeDashboardServer'
```

Plugin factory (`src/index.ts`):
```typescript
export const experiment1 =
  (pluginOptions: Experiment1Config) =>
  (config: Config): Config => {
    // Transform config
    return config
  }
```

---

*Convention analysis: 2025-12-29*
*Update when patterns change*
