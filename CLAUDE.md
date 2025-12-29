# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Payload CMS plugin development repository. The `/src` folder contains the plugin source code that gets published to npm, while the `/dev` folder contains a complete Payload application used to develop and test the plugin in isolation.

## Commands

```bash
# Development - runs the dev Payload app with Next.js turbopack
pnpm dev

# Run all tests
pnpm test

# Run integration tests only (Vitest with in-memory MongoDB)
pnpm test:int

# Run e2e tests only (Playwright - starts dev server automatically)
pnpm test:e2e

# Linting
pnpm lint
pnpm lint:fix

# Build plugin for publishing
pnpm build

# Generate Payload types and import map for dev app
pnpm generate:types
pnpm generate:importmap
```

## Architecture

### Directory Structure

- **`/src`** - Plugin source code (published to npm via `dist/`)
- **`/dev`** - Isolated Payload application for plugin development and testing

### The Dev Application (`/dev`)

The dev folder is a minimal Payload + Next.js application created specifically for plugin development:

- **`payload.config.ts`** - Imports and configures the plugin from `experiment-1` (self-referencing package)
- **`seed.ts`** - Seeds initial data (dev user) on app initialization
- **`int.spec.ts`** - Integration tests using Vitest
- **`e2e.spec.ts`** - End-to-end tests using Playwright
- **`app/`** - Next.js app router with Payload admin panel

The dev app uses MongoDB Memory Server in test mode (`NODE_ENV=test`), allowing tests to run without external database dependencies.

### Plugin Entry Points

The plugin exposes three entry points via package.json exports:

1. **Main (`experiment-1`)** - Plugin function that modifies Payload config (`src/index.ts`)
2. **Client (`experiment-1/client`)** - Client components with `'use client'` directive (`src/exports/client.ts`)
3. **RSC (`experiment-1/rsc`)** - React Server Components (`src/exports/rsc.ts`)

## Payload Plugin Architecture

Plugins are config transformers—functions that receive the Payload config and return a modified version.

### Plugin Function Signature

```ts
export const myPlugin =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    // Modify config
    return config
  }
```

### Initialization Order

1. Incoming config is validated
2. **Plugins execute in order** (before sanitization)
3. Default options are merged in
4. Config is sanitized
5. Final config is initialized

### What Plugins Can Extend

- **Collections** - Add new collections or fields to existing ones
- **Globals** - Add global configuration
- **Hooks** - Lifecycle hooks (beforeChange, afterRead, etc.)
- **Endpoints** - Custom REST API routes
- **Admin UI** - Custom components, views, and panels
- **onInit** - Initialization logic (must await existing onInit first)

### Spread Syntax Pattern

Always spread existing config to avoid overwriting other plugins' modifications:

```ts
// Arrays - spread existing, then add new
config.collections = [
  ...(config.collections || []),
  newCollection,
]

// Objects - spread existing properties
config.hooks = {
  ...(config.hooks || {}),
  // additional hooks
}

// Functions - call existing first, then add logic
config.onInit = async (payload) => {
  if (incomingConfig.onInit) await incomingConfig.onInit(payload)
  // your onInit logic
}
```

### Admin Component Registration

Components are registered as string import paths with hash syntax for named exports:

```ts
config.admin.components.beforeDashboard.push('my-plugin/client#MyComponent')
```

## Development Setup

1. Copy `dev/.env.example` to `dev/.env`
2. Set `DATABASE_URL` for your MongoDB instance (not needed for tests)
3. Set `PAYLOAD_SECRET` to any unique string
4. Run `pnpm dev` and open http://localhost:3000

## References

- [Payload Plugin Overview](https://payloadcms.com/docs/plugins/overview)
- [Building Your Own Plugin](https://payloadcms.com/docs/plugins/build-your-own)
