# Roadmap: Landing Page Content Model

## Overview

Build a structured content model for Payload CMS that enables composable landing pages with Hero, Content, and Footer sections containing reusable block types. Development happens in the dev app first, with extraction to plugin once patterns stabilize.

## Domain Expertise

None

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-4) — SHIPPED 2025-12-30
- 🚧 **v2.0 Page Assembly + Variant Ready** - Phases 5-9 (in progress)

## Completed Phases

<details>
<summary>v1.0 MVP (Phases 1-4) — SHIPPED 2025-12-30</summary>

- [x] Phase 1: Foundation (1/1 plans) — completed 2025-12-30
- [x] Phase 2: Block Types (1/1 plans) — completed 2025-12-30
- [x] Phase 3: Reusable Blocks (1/1 plans) — completed 2025-12-30
- [x] Phase 4: Integration (1/1 plans) — completed 2025-12-30

</details>

## 🚧 v2.0 Page Assembly + Variant Ready (In Progress)

**Milestone Goal:** Enable fully-assembled landing pages with variant support for A/B testing and analytics integration.

### Phase 5: Block Library Expansion

**Goal**: Add the core landing-page blocks needed to build real paid-search pages end to end
**Depends on**: Phase 4 (v1.0 complete)
**Research**: Unlikely (extending existing block patterns)
**Plans**: TBD

Plans:
- [x] 05-01: FAQ and Stats blocks with integration tests

### Phase 6: Block Settings + Stable IDs

**Goal**: Make every block variant/analytics-ready with consistent settings and durable blockIds
**Depends on**: Phase 5
**Research**: Complete (nanoid for ID generation, field + collection hooks)
**Plans**: 2

Plans:
- [x] 06-01: Shared blockSettings field with nanoid(12) blockIds for Pages blocks
- [x] 06-02: Add blockSettings to ReusableBlocks collection

### Phase 7: Validation + Guardrails

**Goal**: Prevent invalid pages/blocks and enforce compliance/conversion requirements at the model level
**Depends on**: Phase 6
**Research**: Complete (Payload field validate functions, ValidationError for collection-level)
**Plans**: 2

Plans:
- [x] 07-01: Field-level constraints (headline maxLength, CTA validation, array limits)
- [x] 07-02: Page-level validation (conversion element required) + Lexical editor config

### Phase 8: Rendering Contract

**Goal**: Expose a deterministic, fully-resolved page JSON payload that Next.js can render with a single request
**Depends on**: Phase 7
**Research**: Complete (Payload depth parameter, custom endpoints)
**Plans**: 2

Plans:
- [x] 08-01: Core resolution logic (resolvePageBlocks utility + tests)
- [x] 08-02: API endpoints (REST endpoint + Local API helper + tests)

### Phase 9: Page Variants Shell

**Goal**: Introduce variants and experiments as first-class objects so you can preview overrides and prepare for A/B testing
**Depends on**: Phase 8
**Research**: Complete (separate collection model, section replacement semantics)
**Plans**: 2

Plans:
- [x] 09-01: PageVariants collection with block override fields
- [x] 09-02: Variant preview endpoint and resolution logic

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 1/1 | Complete | 2025-12-30 |
| 2. Block Types | v1.0 | 1/1 | Complete | 2025-12-30 |
| 3. Reusable Blocks | v1.0 | 1/1 | Complete | 2025-12-30 |
| 4. Integration | v1.0 | 1/1 | Complete | 2025-12-30 |
| 5. Block Library Expansion | v2.0 | 1/1 | Complete | 2025-12-30 |
| 6. Block Settings + Stable IDs | v2.0 | 2/2 | Complete | 2025-12-30 |
| 7. Validation + Guardrails | v2.0 | 2/2 | Complete | 2025-12-30 |
| 8. Rendering Contract | v2.0 | 2/2 | Complete | 2025-12-30 |
| 9. Page Variants Shell | v2.0 | 2/2 | Complete | 2025-12-30 |
