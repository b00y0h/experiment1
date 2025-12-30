# Roadmap: Landing Page Content Model

## Overview

Build a structured content model for Payload CMS that enables composable landing pages with Hero, Content, and Footer sections containing reusable block types. Development happens in the dev app first, with extraction to plugin once patterns stabilize.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Page collection with Hero → Content → Footer section structure
- [ ] **Phase 2: Block Types** - Core block implementations (Hero, Accordion, FAQ, Stats)
- [ ] **Phase 3: Reusable Blocks** - Library collection and block reference field
- [ ] **Phase 4: Integration** - Type generation and test coverage

## Phase Details

### Phase 1: Foundation
**Goal**: Create Page collection with three-section structure (Hero, Content, Footer) using Payload's array/block fields
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established Payload CMS patterns in existing codebase)
**Plans**: TBD

### Phase 2: Block Types
**Goal**: Implement four core block types: Hero (headline, subheadline, CTA, media), Accordion (expandable items), FAQ (Q&A pairs), Stats (numeric values with labels)
**Depends on**: Phase 1
**Research**: Unlikely (internal patterns using Payload block field types)
**Plans**: TBD

### Phase 3: Reusable Blocks
**Goal**: Create reusable blocks library collection and reference field to link pages to library blocks
**Depends on**: Phase 2
**Research**: Unlikely (Payload relationship fields are standard patterns)
**Plans**: TBD

### Phase 4: Integration
**Goal**: Generate TypeScript types for all new collections/fields and add integration tests
**Depends on**: Phase 3
**Research**: Unlikely (existing test infrastructure in dev/int.spec.ts)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete | 2025-12-30 |
| 2. Block Types | 0/TBD | Not started | - |
| 3. Reusable Blocks | 0/TBD | Not started | - |
| 4. Integration | 0/TBD | Not started | - |
