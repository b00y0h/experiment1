# Landing Page Content Model

## What This Is

A structured content model for Payload CMS that enables composable landing pages. Pages have three defined sections (Hero, Content, Footer) with specific block types (Hero, Accordions, FAQs, Stats). Blocks can be defined inline or referenced from a shared library for reuse across pages.

## Core Value

Clean, typed content schema that balances editor flexibility with content consistency and developer ergonomics.

## Requirements

### Validated

- ✓ Payload CMS plugin architecture — existing
- ✓ TypeScript strict mode configuration — existing
- ✓ Integration test infrastructure (Vitest + MongoDB Memory Server) — existing
- ✓ E2E test infrastructure (Playwright) — existing
- ✓ Dev app with collections (posts, media) — existing

### Active

- [ ] Page collection with Hero → Content → Footer section structure
- [ ] Hero block type with headline, subheadline, CTA, and media fields
- [ ] Accordion block type with expandable items (title + content)
- [ ] FAQ block type with question/answer pairs
- [ ] Stats block type with numeric values, labels, and optional icons
- [ ] Reusable blocks library collection for shared content
- [ ] Block reference field to link pages to library blocks
- [ ] Type generation for all new collections and fields

### Out of Scope

- Frontend rendering components — content model only, rendering is consumer's responsibility
- Visual preview in admin — editors work with structured fields, no live preview
- Localization/i18n — English only, multi-language deferred to future version
- Additional block types — start with 4 core types, expand based on usage
- Plugin extraction — build in dev app first, extract when stable

## Context

This builds on an existing Payload CMS plugin development repository. The `/src` folder contains publishable plugin code, while `/dev` contains a complete Payload + Next.js application for testing. The content model will be developed in `/dev` first and extracted to the plugin once stable.

The pattern follows Contentful's structured content approach where content is modular and composable rather than monolithic.

## Constraints

- **Framework**: Must work with Payload CMS 3.37.0 and its block/array field types
- **TypeScript**: All collections must generate proper TypeScript types via `pnpm generate:types`
- **Testing**: New collections must have integration tests in `dev/int.spec.ts`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Section-based pages vs flexible layout | Provides structure while allowing content flexibility within sections | — Pending |
| Inline + library blocks (hybrid) | Balance between simplicity (inline) and reusability (library) | — Pending |
| Build in dev app first | Faster iteration, extract to plugin when patterns stabilize | — Pending |
| Four block types only | Start minimal, expand based on real usage patterns | — Pending |

---
*Last updated: 2025-12-29 after initialization*
