# Landing Page Content Model

## What This Is

A complete A/B testing content model for Payload CMS with drift-proof frontend integration. Composable landing pages with three sections (Hero, Content, Footer) and seven block types managed via centralized Block Registry. Full experimentation infrastructure: Experiments with traffic allocation, visitor assignment via hash bucketing, Leads collection with attribution, AnalyticsEvents for impressions/conversions, admin dashboard with statistics, and AI-ready block catalog with guardrails for automated content generation.

## Core Value

Clean, typed content schema that balances editor flexibility with content consistency and developer ergonomics.

## Requirements

### Validated

- ✓ Payload CMS plugin architecture — existing
- ✓ TypeScript strict mode configuration — existing
- ✓ Integration test infrastructure (Vitest + MongoDB Memory Server) — existing
- ✓ E2E test infrastructure (Playwright) — existing
- ✓ Dev app with collections (posts, media) — existing
- ✓ Page collection with Hero → Content → Footer section structure — v1.0
- ✓ Hero block type with headline, subheadline, CTA, and media fields — v1.0
- ✓ Accordion block type with expandable items (title + content) — v1.0
- ✓ Reusable blocks library collection for shared content — v1.0
- ✓ Block reference field to link pages to library blocks — v1.0
- ✓ Type generation for all new collections and fields — v1.0
- ✓ FAQ block type with question/answer pairs — v2.0
- ✓ Stats block type with numeric values, labels, and optional icons — v2.0
- ✓ Stable blockIds with nanoid(12) for analytics/variant targeting — v2.0
- ✓ Field-level validation (headline maxLength, CTA validation, array limits) — v2.0
- ✓ Page-level validation (conversion element required) — v2.0
- ✓ Restricted Lexical editor (no upload/relationship in richText) — v2.0
- ✓ resolvePageBlocks utility for deterministic page JSON — v2.0
- ✓ REST endpoint /api/pages/:slug/resolved — v2.0
- ✓ getResolvedPage Local API helper — v2.0
- ✓ PageVariants collection with section override support — v2.0
- ✓ Variant preview endpoints (REST + Local API) — v2.0
- ✓ Experiments collection with traffic allocation and variant-page validation — v3.0
- ✓ Visitor ID with nanoid(21) and deterministic variant assignment — v3.0
- ✓ Leads collection with experiment/variant/visitor attribution — v3.0
- ✓ AnalyticsEvents collection with impression/conversion/click/custom types — v3.0
- ✓ ExperimentStats RSC dashboard component with per-variant metrics — v3.0
- ✓ Block Registry with factory functions for all 7 block types — v4.0
- ✓ Machine-readable registry artifact (block-registry.json) — v4.0
- ✓ renderBlock() dispatch with exhaustive TypeScript checking — v4.0
- ✓ Compile-time contract between registry and Page types — v4.0
- ✓ CI gates (check:registry, check:sync) for drift detection — v4.0
- ✓ Block catalog REST endpoint (/api/blocks/catalog) — v4.0
- ✓ allowedBlockTypes guardrails for AI experiments — v4.0

### Active

- [ ] Plugin extraction from dev app

### Out of Scope

- Frontend rendering components — content model only, rendering is consumer's responsibility
- Visual preview in admin — editors work with structured fields, no live preview
- Localization/i18n — English only, multi-language deferred to future version
- Block types beyond current set — expand based on usage

## Context

Shipped v4.0 with 11,054 LOC TypeScript in the dev app.
Tech stack: Payload CMS 3.37.0, Next.js, MongoDB Memory Server for tests.
Content model follows Contentful's modular, composable approach.

The `/dev` folder is the primary Payload CMS application. The `/src` folder contains the original plugin template (pending extraction).

**Current capabilities:**
- 7 block types via centralized Block Registry (Hero, Content, Accordion, FAQ, Stats, Footer, ReusableBlockRef)
- Stable blockIds on all blocks for analytics tracking
- Validation at field and page level
- Rendering contract with API endpoints and renderBlock() dispatch
- Drift-proof type sync with compile-time assertions
- CI gates (check:registry, check:sync) for schema drift detection
- PageVariants for section-level overrides
- Experiments with traffic allocation, variant assignment, and AI guardrails
- Leads and AnalyticsEvents for conversion tracking
- Admin dashboard with experiment statistics
- AI-ready block catalog endpoint (/api/blocks/catalog)

**Test coverage:** 92+ integration tests passing

## Constraints

- **Framework**: Must work with Payload CMS 3.37.0 and its block/array field types
- **TypeScript**: All collections must generate proper TypeScript types via `pnpm generate:types`
- **Testing**: New collections must have integration tests in `dev/int.spec.ts`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Section-based pages vs flexible layout | Provides structure while allowing content flexibility within sections | ✓ Good — clear separation of hero/content/footer |
| Inline + library blocks (hybrid) | Balance between simplicity (inline) and reusability (library) | ✓ Good — ReusableBlocks collection works well |
| Build in dev app first | Faster iteration, extract to plugin when patterns stabilize | ✓ Good — pattern validated, ready for extraction |
| CTA as group field | Organize related CTA fields, improve admin UX | ✓ Good — cleaner admin interface |
| nanoid(12) for blockIds | Compact, URL-safe, collision-resistant stable IDs | ✓ Good — works well for analytics/variant targeting |
| Field-level + collection-level hooks | Field hooks for normal cases, collection fallback for edge cases | ✓ Good — robust ID generation |
| Section replacement for variants | Empty arrays = no override, non-empty = full replacement | ✓ Good — clear semantics |
| Restricted Lexical editor | Prevent upload/relationship in richText fields | ✓ Good — simpler content model |
| Simple string hash for bucketing | Sufficient for A/B traffic distribution | ✓ Good — lightweight, deterministic |
| Pure visitor ID utility | Cookie setting is caller's responsibility | ✓ Good — flexible across API/RSC |
| Traffic validation on running only | Allows incomplete draft experiments | ✓ Good — better editor experience |
| Block factory functions | Allows fresh createBlockSettings() per-use | ✓ Good — proper block ID generation |
| Registry-derived types | BlockTypeSlug from blockRegistry keys | ✓ Good — single source of truth |
| Exhaustive switch for rendering | TypeScript catches missing cases | ✓ Good — compile-time safety |
| JSON registry artifact | Machine-readable for AI/tooling | ✓ Good — enables automation |
| Empty allowedBlockTypes = all | Simplifies unrestricted experiments | ✓ Good — intuitive default |

---
*Last updated: 2025-12-31 after v4.0 milestone*
