# Project Milestones: Landing Page Content Model

## v4.0 Block ↔ Component Sync + AI Catalog (Shipped: 2025-12-31)

**Delivered:** Frontend renderer mapping with drift-proof type sync, plus AI-ready block catalog with experiment guardrails.

**Phases completed:** 15-19 (8 plans total)

**Key accomplishments:**

- Promoted /dev to primary Payload CMS app boundary with clear documentation
- Created centralized Block Registry with factory functions for all 7 block types
- Added machine-readable registry artifact (block-registry.json) with pnpm generate:registry
- Implemented renderBlock() dispatch with exhaustive TypeScript checking
- Enforced compile-time contract between registry and Page types (drift-proof sync)
- Added CI gates (check:registry, check:sync) to catch registry/schema drift
- Created /api/blocks/catalog REST endpoint for AI/tooling block discovery
- Added allowedBlockTypes guardrails for AI experiment block restrictions

**Stats:**

- 34 files created/modified
- 11,054 lines of TypeScript (2,892 net new)
- 5 phases, 8 plans
- 2 days from v3.0 to v4.0

**Git range:** `feat(15-01)` → `feat(19-02)`

**What's next:** Plugin extraction from dev app

---

## v3.0 Live Experiments + Lead Tracking (Shipped: 2025-12-30)

**Delivered:** Complete A/B testing infrastructure with experiments, visitor assignment, lead capture, analytics events, and admin dashboard.

**Phases completed:** 10-14 (5 plans total)

**Key accomplishments:**

- Experiments collection with traffic allocation validation and variant-page consistency
- Visitor ID system with nanoid(21) and deterministic variant assignment via hash bucketing
- Leads collection with full experiment/variant/visitor attribution for conversion tracking
- AnalyticsEvents collection with impression/conversion/click/custom event types
- ExperimentStats RSC component with per-variant metrics and conversion rate calculation

**Stats:**

- 25 files created/modified
- 7,726 lines of TypeScript (3,608 net new)
- 5 phases, 5 plans, 12 tasks
- 1 day from v2.0 to v3.0

**Git range:** `feat(10-01)` → `feat(14-01)`

**What's next:** Plugin extraction from dev app or additional experiment features

---

## v2.0 Page Assembly + Variant Ready (Shipped: 2025-12-30)

**Delivered:** Page assembly with rendering contract, validation guardrails, stable blockIds, and variant preview system for A/B testing.

**Phases completed:** 5-9 (9 plans total)

**Key accomplishments:**

- Added FAQ and Stats blocks for comprehensive landing page content
- Implemented stable blockIds with nanoid(12) for analytics/variant targeting
- Created field and page-level validation with conversion element requirement
- Built rendering contract with resolvePageBlocks and REST/Local API endpoints
- Introduced PageVariants collection with section override preview system

**Stats:**

- 37 files created/modified
- 5,062 lines of TypeScript
- 5 phases, 9 plans, 18 tasks
- 1 day from v1.0 to v2.0

**Git range:** `feat(05-01)` → `feat(09-02)`

**What's next:** Plugin extraction from dev app, variant activation logic, or A/B testing infrastructure

---

## v1.0 MVP (Shipped: 2025-12-30)

**Delivered:** Composable landing page content model with three-section structure and reusable block library.

**Phases completed:** 1-4 (4 plans total)

**Key accomplishments:**

- Created Page collection with three-section block architecture (hero, content, footer)
- Implemented Hero block with headline, subheadline, CTA group, and media fields
- Added Accordion block with expandable items for content sections
- Created ReusableBlocks collection for shared content library
- Added block reference field to link pages to reusable library blocks
- 6 integration tests covering all new collections and relationships

**Stats:**

- 14 files created/modified
- 1,382 lines of TypeScript
- 4 phases, 4 plans, 8 tasks
- 1 day from start to ship

**Git range:** `feat(01-01)` → `feat(04-01)`

**What's next:** v2.0 Page Assembly + Variant Ready

---
