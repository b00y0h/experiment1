# Architecture

**Analysis Date:** 2025-12-29

## Pattern Overview

**Overall:** Payload CMS Plugin with Config Transformer Pattern

**Key Characteristics:**
- Plugin-based extensibility via configuration transformation
- Dual-directory structure (src/ for plugin, dev/ for testing)
- Hybrid React rendering (client + server components)
- Self-contained development environment with in-memory database

## Layers

**Plugin Configuration Layer:**
- Purpose: Transform Payload config to add collections, fields, endpoints, and UI components
- Contains: Plugin factory function, type definitions (`src/index.ts`)
- Depends on: Payload CMS core types
- Used by: Host applications that install the plugin

**UI Component Layer:**
- Purpose: Admin panel UI extensions
- Contains: Client components (hooks, fetch), Server components (Local API) (`src/components/`)
- Depends on: Payload UI, React, Local API
- Used by: Payload admin panel via component registration

**API Endpoint Layer:**
- Purpose: Custom REST endpoints
- Contains: Request handlers (`src/endpoints/`)
- Depends on: Payload request/response types
- Used by: Client components, external consumers

**Development Application Layer:**
- Purpose: Isolated testing environment for plugin development
- Contains: Payload config, collections, seed data, tests (`dev/`)
- Depends on: Plugin source, Payload CMS, Next.js
- Used by: Developers testing plugin functionality

## Data Flow

**Plugin Initialization Flow:**

1. Dev app loads `dev/payload.config.ts`
2. `buildConfig()` invoked with plugin configuration
3. `experiment1(pluginOptions)` returns config transformer
4. Transformer modifies config:
   - Adds `plugin-collection` to collections
   - Injects `addedByPlugin` field into specified collections
   - Registers UI components (`BeforeDashboardClient`, `BeforeDashboardServer`)
   - Registers `/my-plugin-endpoint` custom endpoint
   - Wraps `onInit` to seed `plugin-collection`
5. Config is sanitized and initialized by Payload
6. `onInit` executes (seeds dev user, plugin data)

**Client Component Request Lifecycle:**

1. `BeforeDashboardClient` renders in admin panel
2. `useEffect` triggers `fetchMessage()`
3. `fetch('/api/my-plugin-endpoint')` calls custom endpoint
4. `customEndpointHandler` returns JSON response
5. Component updates state and displays message

**Server Component Request Lifecycle:**

1. `BeforeDashboardServer` async component renders
2. `payload.find({ collection: 'plugin-collection' })` queries Local API
3. Payload executes database query via MongoDB adapter
4. Component renders document list

**State Management:**
- No global state (plugin is stateless)
- Component state via React hooks (useState)
- Database state via Payload collections

## Key Abstractions

**Plugin Factory:**
- Purpose: Create config transformer function
- Location: `src/index.ts`
- Pattern: Higher-order function (curried)
- Signature: `(options) => (config) => modifiedConfig`

**Export Entry Points:**
- Purpose: Separate exports for different use cases
- Examples: Main (`src/index.ts`), Client (`src/exports/client.ts`), RSC (`src/exports/rsc.ts`)
- Pattern: Package.json exports map with hash syntax for named exports

**PayloadHandler:**
- Purpose: Custom API endpoint handler
- Location: `src/endpoints/customEndpointHandler.ts`
- Pattern: Async function with PayloadRequest parameter

**Spread Syntax Extension:**
- Purpose: Non-destructive config modification
- Usage: `[...(config.collections || []), newCollection]`
- Pattern: Preserves existing config while adding new items

## Entry Points

**Plugin Main Entry:**
- Location: `src/index.ts`
- Triggers: Plugin import in host application
- Responsibilities: Export plugin factory function, types

**Plugin Client Entry:**
- Location: `src/exports/client.ts`
- Triggers: Import via `experiment-1/client#ComponentName`
- Responsibilities: Export client-side React components

**Plugin RSC Entry:**
- Location: `src/exports/rsc.ts`
- Triggers: Import via `experiment-1/rsc#ComponentName`
- Responsibilities: Export React Server Components

**Dev App Config:**
- Location: `dev/payload.config.ts`
- Triggers: Next.js app initialization
- Responsibilities: Configure Payload with plugin, collections, database

**Dev App Layout:**
- Location: `dev/app/(payload)/layout.tsx`
- Triggers: HTTP requests to admin panel
- Responsibilities: Root layout, import map handling

## Error Handling

**Strategy:** Minimal error handling (assumes Payload handles errors)

**Patterns:**
- No try/catch in plugin code (delegates to Payload)
- No custom error classes defined
- Client component has no fetch error handling (see CONCERNS.md)

## Cross-Cutting Concerns

**Logging:**
- Console logging for test email adapter
- No structured logging framework

**Validation:**
- Type validation via TypeScript at compile time
- Runtime validation delegated to Payload

**Authentication:**
- Payload built-in authentication
- Dev user seeded on initialization

---

*Architecture analysis: 2025-12-29*
*Update when major patterns change*
