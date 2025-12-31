# Roadmap: Landing Page Content Model

## Overview

Build a structured content model for Payload CMS that enables composable landing pages with Hero, Content, and Footer sections containing reusable block types. Development happens in the dev app first, with extraction to plugin once patterns stabilize.

## Domain Expertise

None

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-4) — SHIPPED 2025-12-30
- ✅ [v2.0 Page Assembly + Variant Ready](milestones/v2.0-ROADMAP.md) (Phases 5-9) — SHIPPED 2025-12-30
- 🚧 **v3.0 Live Experiments + Lead Tracking** — Phases 10-14 (in progress)

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

## 🚧 v3.0 Live Experiments + Lead Tracking (In Progress)

**Milestone Goal:** Enable live A/B experiments with visitor tracking, variant assignment, and lead capture for landing page optimization.

### Phase 10: Experiment Collection

**Goal**: Create Experiments collection linking variants with traffic allocation and activation rules
**Depends on**: Phase 9 (v2.0 complete)
**Research**: Unlikely (internal collection patterns established)
**Plans**: TBD

Plans:
- [x] 10-01: Experiments collection with validation + tests

### Phase 11: Visitor Assignment

**Goal**: Implement visitor identification and deterministic variant assignment logic
**Depends on**: Phase 10
**Research**: Likely (visitor identification strategies)
**Research topics**: Cookie-based vs fingerprinting approaches, deterministic hashing for consistent assignment, privacy considerations
**Plans**: TBD

Plans:
- [x] 11-01: Visitor ID + deterministic assignment + getAssignedVariant helper

### Phase 12: Lead Capture

**Goal**: Add Leads collection with experiment/variant attribution and form submission handling
**Depends on**: Phase 11
**Research**: Unlikely (CRUD patterns established)
**Plans**: TBD

Plans:
- [x] 12-01: Leads collection with attribution + tests

### Phase 13: Analytics Events

**Goal**: Track impressions, conversions, and custom events per variant
**Depends on**: Phase 12
**Research**: Likely (event tracking patterns)
**Research topics**: Event schema design, analytics integration options (GA4, Segment, custom), batch vs real-time
**Plans**: TBD

Plans:
- [x] 13-01: AnalyticsEvents collection with event schema + tests

### Phase 14: Experiment Dashboard

**Goal**: Admin UI components for viewing experiment results and activating/pausing experiments
**Depends on**: Phase 13
**Research**: Likely (Payload admin customization)
**Research topics**: Custom admin views in Payload 3.x, React components in admin, dashboard patterns
**Plans**: TBD

Plans:
- [x] 14-01: ExperimentStats component + calculateExperimentStats utility

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
| 14. Experiment Dashboard | v3.0 | 1/1 | Complete | 2025-12-31 |
