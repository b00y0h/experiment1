# Landing Page Content Model

## What This Is

A structured content model for Payload CMS that enables composable landing pages. Pages have three defined sections (Hero, Content, Footer) with block types including Hero (headline, subheadline, CTA, media), Accordion (expandable items), and standard content blocks. Blocks can be defined inline or referenced from a shared ReusableBlocks library for reuse across pages.

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

### Active

- [ ] FAQ block type with question/answer pairs
- [ ] Stats block type with numeric values, labels, and optional icons
- [ ] Plugin extraction from dev app

### Out of Scope

- Frontend rendering components — content model only, rendering is consumer's responsibility
- Visual preview in admin — editors work with structured fields, no live preview
- Localization/i18n — English only, multi-language deferred to future version
- Additional block types beyond FAQ/Stats — expand based on usage

## Context

Shipped v1.0 with 1,382 LOC TypeScript in the dev app.
Tech stack: Payload CMS 3.37.0, Next.js, MongoDB Memory Server for tests.
Content model follows Contentful's modular, composable approach.

The `/src` folder contains publishable plugin code, while `/dev` contains the complete Payload + Next.js application where the content model was developed.

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
| Four block types only | Start minimal, expand based on real usage patterns | ⚠️ Revisit — shipped 2 of 4 (Hero, Accordion), FAQ/Stats deferred |
| CTA as group field | Organize related CTA fields, improve admin UX | ✓ Good — cleaner admin interface |

---
*Last updated: 2025-12-30 after v1.0 milestone*
