# External Integrations

**Analysis Date:** 2025-12-29

## APIs & External Services

**Payment Processing:**
- Not detected

**Email/SMS:**
- Test Email Adapter - Development email logging (`dev/helpers/testEmailAdapter.ts`)
  - Logs emails to stdout instead of sending
  - Default sender: dev@payloadcms.com
  - No external email service integration

**External APIs:**
- Not detected (plugin-only codebase)

## Data Storage

**Databases:**
- MongoDB - Primary database adapter (`dev/payload.config.ts`)
  - Adapter: @payloadcms/db-mongodb
  - Connection: `DATABASE_URL` env var (`dev/.env`)
  - Dev URL: `mongodb://127.0.0.1/payload-plugin-experiment1-template`

- MongoDB Memory Server - In-memory testing database (`dev/payload.config.ts`)
  - Used when `NODE_ENV=test`
  - Auto-creates replica set for transactions

**File Storage:**
- Local filesystem - Media uploads (`dev/payload.config.ts`)
  - Static directory: `./dev/media`
  - Served at: `/media`

**Caching:**
- Not detected

## Authentication & Identity

**Auth Provider:**
- Payload Built-in Auth - Email/password authentication
  - User collection configured in `dev/payload.config.ts`
  - Dev credentials: `dev@payloadcms.com` / `test` (`dev/helpers/credentials.ts`)

**OAuth Integrations:**
- Not detected

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Analytics:**
- Not detected

**Logs:**
- Console logging only (stdout/stderr)
- No external logging service

## CI/CD & Deployment

**Hosting:**
- Not configured (plugin development repository)
- Plugin distributed via npm package

**CI Pipeline:**
- Not detected (no .github/workflows)

## Environment Configuration

**Development:**
- Required env vars: `DATABASE_URL`, `PAYLOAD_SECRET`
- Secrets location: `dev/.env` (gitignored in template)
- Mock services: MongoDB Memory Server for testing, test email adapter

**Staging:**
- Not applicable (plugin only)

**Production:**
- Plugin installed into host applications
- No direct production deployment

## Webhooks & Callbacks

**Incoming:**
- Not detected

**Outgoing:**
- Not detected

## Custom Endpoints

**Plugin-Defined:**
- `/my-plugin-endpoint` - Custom REST endpoint (`src/endpoints/customEndpointHandler.ts`)
  - Handler: `customEndpointHandler`
  - Method: GET
  - Returns: JSON with message field

**Payload Built-in:**
- `/api/[...slug]` - REST API catch-all (`dev/app/(payload)/api/[...slug]/route.ts`)
- `/api/graphql` - GraphQL endpoint (`dev/app/(payload)/api/graphql/route.ts`)
- `/api/graphql-playground` - GraphQL Playground (`dev/app/(payload)/api/graphql-playground/route.ts`)

---

*Integration audit: 2025-12-29*
*Update when adding/removing external services*
