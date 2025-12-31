# Roadmap: Landing Page Content Model

## Overview

Build a structured content model for Payload CMS that enables composable landing pages with Hero, Content, and Footer sections containing reusable block types. Development happens in the dev app first, with extraction to plugin once patterns stabilize.

## Domain Expertise

None

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-4) — SHIPPED 2025-12-30
- ✅ [v2.0 Page Assembly + Variant Ready](milestones/v2.0-ROADMAP.md) (Phases 5-9) — SHIPPED 2025-12-30
- ✅ [v3.0 Live Experiments + Lead Tracking](milestones/v3.0-ROADMAP.md) (Phases 10-14) — SHIPPED 2025-12-30
- 🚧 **v4.0 Block ↔ Component Sync + AI Catalog** — Phases 15-19 (in progress)

## Completed Phases

<details>
<summary>v1.0 MVP (Phases 1-4) — SHIPPED 2025-12-30</summary>

- [x] Phase 1: Foundation (1/1 plans) — completed 2025-12-30
- [x] Phase 2: Block Types (1/1 plans) — completed 2025-12-30
- [x] Phase 3: Reusable Blocks (1/1 plans) — completed 2025-12-30
- [x] Phase 4: Integration (1/1 plans) — completed 2025-12-30

</details>

<details>
<summary>v2.0 Page Assembly + Variant Ready (Phases 5-9) — SHIPPED 2025-12-30</summary>

- [x] Phase 5: Block Library Expansion (1/1 plans) — completed 2025-12-30
- [x] Phase 6: Block Settings + Stable IDs (2/2 plans) — completed 2025-12-30
- [x] Phase 7: Validation + Guardrails (2/2 plans) — completed 2025-12-30
- [x] Phase 8: Rendering Contract (2/2 plans) — completed 2025-12-30
- [x] Phase 9: Page Variants Shell (2/2 plans) — completed 2025-12-30

</details>

<details>
<summary>v3.0 Live Experiments + Lead Tracking (Phases 10-14) — SHIPPED 2025-12-30</summary>

- [x] Phase 10: Experiment Collection (1/1 plans) — completed 2025-12-30
- [x] Phase 11: Visitor Assignment (1/1 plans) — completed 2025-12-30
- [x] Phase 12: Lead Capture (1/1 plans) — completed 2025-12-30
- [x] Phase 13: Analytics Events (1/1 plans) — completed 2025-12-30
- [x] Phase 14: Experiment Dashboard (1/1 plans) — completed 2025-12-31

</details>

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14

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
| 10. Experiment Collection | v3.0 | 1/1 | Complete | 2025-12-30 |
| 11. Visitor Assignment | v3.0 | 1/1 | Complete | 2025-12-30 |
| 12. Lead Capture | v3.0 | 1/1 | Complete | 2025-12-30 |
| 13. Analytics Events | v3.0 | 1/1 | Complete | 2025-12-30 |
| 14. Experiment Dashboard | v3.0 | 1/1 | Complete | 2025-12-30 |

| 15. Repo Normalization | v4.0 | 1/1 | Complete | 2025-12-31 |
| 16. Block Registry | v4.0 | 2/2 | Complete | 2025-12-31 |
| 17. Frontend Renderer Mapping | v4.0 | 1/1 | Complete | 2025-12-31 |
| 18. Drift-Proof Type Sync | v4.0 | 2/2 | Complete | 2025-12-31 |
| 19. AI-Ready Catalog | v4.0 | 1/2 | In progress | - |

## 🚧 v4.0 Block ↔ Component Sync + AI Catalog (In Progress)

**Milestone Goal:** Frontend renderer mapping that stays in lockstep with Payload block definitions, plus an auto-updating AI catalog of allowed blocks for experiments.

### Phase 15: Repo Normalization

**Goal**: Make the Payload CMS app the "real" project (stop treating /dev like a temporary shell)
**Depends on**: v3.0 complete
**Research**: Unlikely (internal refactoring)
**Plans**: 1 plan

Plans:
- [x] 15-01: Promote /dev to primary app boundary

### Phase 16: Block Registry

**Goal**: Create a single, canonical "Block Registry" that describes all blocks and can be consumed by the front end + AI
**Depends on**: Phase 15
**Research**: Unlikely (internal patterns)
**Plans**: 2 plans

Plans:
- [x] 16-01: Create canonical Block Registry in-code (Payload-first)
- [x] 16-02: Generate machine-readable registry artifact

### Phase 17: Frontend Renderer Mapping

**Goal**: Map blockType -> component with safe fallbacks and hard checks
**Depends on**: Phase 16
**Research**: Unlikely (React patterns established)
**Plans**: 1 plan

Plans:
- [x] 17-01: Implement renderBlock() dispatch + unknown-block handling

### Phase 18: Drift-Proof Type Sync

**Goal**: Make "CMS changed but FE didn't" fail at build/CI time instead of breaking in production
**Depends on**: Phase 17
**Research**: Unlikely (TypeScript patterns)
**Plans**: 2 plans

Plans:
- [x] 18-01: Enforce compile-time contract between registry + components
- [x] 18-02: Add CI gates + integration tests for registry/rendering coverage

### Phase 19: AI-Ready Catalog

**Goal**: AI always knows what blocks exist right now and what it's allowed to use per client/campaign
**Depends on**: Phase 18
**Research**: Likely (AI integration patterns)
**Research topics**: Prompt injection best practices, catalog schema design for LLMs
**Plans**: 2 plans

Plans:
- [x] 19-01: Publish "available blocks" catalog endpoint for AI + tooling
- [ ] 19-02: Add allowlists/guardrails for AI experiments
