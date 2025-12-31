---
phase: 19-ai-ready-catalog
plan: 02
type: summary
---

# Summary: Allowlists/Guardrails for AI Experiments

## Outcome
SUCCESS - Added allowedBlockTypes field to Experiments collection with guardrail validation utilities and integration tests.

## What Was Built

### AllowedBlockTypes Field
Added multi-select field to Experiments collection that allows administrators to restrict which block types AI can use for a specific experiment. Semantics: empty array = no restriction (all blocks allowed), non-empty = only specified blocks allowed.

**Field Configuration:**
- Type: select with `hasMany: true`
- Options: All 7 block types from blockRegistry with human-readable labels
- Admin description: "Block types AI can use for this experiment (empty = all allowed)"

### Guardrail Utilities
Created `dev/utils/experimentGuardrails.ts` with two functions for programmatic guardrail enforcement:

1. **`isBlockAllowed(blockType, allowedBlockTypes)`** - Checks if a specific block type is allowed for an experiment. Returns true for all blocks when restrictions are null/undefined/empty.

2. **`getAllowedBlocks(allowedBlockTypes)`** - Returns the subset of blocks allowed for an experiment. Returns all 7 blocks when no restrictions set.

### Integration Tests
Added 4 integration tests in "Experiment Guardrails" test suite:
1. **experiment with no allowedBlockTypes allows all blocks** - Verifies all blocks pass isBlockAllowed when null/undefined/empty
2. **experiment with allowedBlockTypes restricts to specified** - Verifies isBlockAllowed returns true for allowed, false for disallowed
3. **getAllowedBlocks returns subset when restricted** - Verifies only specified blocks returned
4. **getAllowedBlocks returns all when unrestricted** - Verifies all 7 blocks returned for null/undefined/empty

## Files Changed
- `dev/collections/Experiments.ts` - Modified (added import + allowedBlockTypes field)
- `dev/utils/experimentGuardrails.ts` - Created (29 lines)
- `dev/int.spec.ts` - Modified (added import + 4 test cases)

## Verification
- `pnpm generate:types` - SUCCESS (Experiment type now includes `allowedBlockTypes?: BlockTypeSlug[]`)
- `pnpm test:int` - 95 tests pass (including 4 new guardrails tests)
- `pnpm lint` - 0 errors (29 pre-existing warnings)

## Deviations
None - implementation followed plan exactly.

## Technical Notes
- Field position: Added after `status` field as specified in plan
- Type safety: Uses `BlockTypeSlug` type from registry ensuring compile-time validation
- Options dynamically derived from `getBlockSlugs()` and `blockRegistry` - adding new blocks automatically includes them in options
- Guardrail functions are pure and side-effect-free, suitable for any context

## Phase 19 Complete
This completes Phase 19: AI-Ready Catalog for v4.0 milestone. The phase delivered:
- Plan 01: Block catalog REST endpoint (`/api/blocks/catalog`)
- Plan 02: Experiment guardrails (`allowedBlockTypes` field + validation utilities)

Together these features enable AI agents to discover available blocks and respect per-experiment constraints when generating content.
