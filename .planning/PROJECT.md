# Landing Page Content Model

## What This Is

A structured content model for Payload CMS that enables composable landing pages with variant support. Pages have three defined sections (Hero, Content, Footer) with block types including Hero, Accordion, FAQ, and Stats. Blocks can be defined inline or referenced from a shared ReusableBlocks library. All blocks have stable blockIds for analytics tracking. Pages include validation guardrails (conversion element requirement) and can be resolved to deterministic JSON via API endpoints. PageVariants enable A/B testing with section-level overrides.

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

### Active

- [ ] Plugin extraction from dev app
- [ ] Variant activation logic (draft/active/archived states)
- [ ] A/B testing infrastructure and traffic splitting

### Out of Scope

- Frontend rendering components — content model only, rendering is consumer's responsibility
- Visual preview in admin — editors work with structured fields, no live preview
- Localization/i18n — English only, multi-language deferred to future version
- Block types beyond current set — expand based on usage

## Context

Shipped v2.0 with 5,062 LOC TypeScript in the dev app.
Tech stack: Payload CMS 3.37.0, Next.js, MongoDB Memory Server for tests.
Content model follows Contentful's modular, composable approach.

The `/src` folder contains publishable plugin code, while `/dev` contains the complete Payload + Next.js application where the content model was developed.

**Current capabilities:**
- 4 block types (Hero, Accordion, FAQ, Stats) across 3 sections
- Stable blockIds on all blocks for analytics tracking
- Validation at field and page level
- Rendering contract with API endpoints
- PageVariants for A/B testing preparation

**Test coverage:** 51 integration tests passing

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

---
*Last updated: 2025-12-30 after v2.0 milestone*
