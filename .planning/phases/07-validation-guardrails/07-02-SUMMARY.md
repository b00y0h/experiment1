# Phase 7 Plan 2: Page-Level Validation and Lexical Editor Constraints Summary

**Page-level conversion element validation and restricted Lexical editor configuration with 5 new tests**

## Performance

- **Duration:** ~10 min
- **Started:** 2025-12-30
- **Completed:** 2025-12-30
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Added page-level `validateConversionElement` hook to Pages collection
- Enforces that every page must have at least one hero block with complete CTA (both ctaText and ctaLink)
- Configured restricted Lexical editor that removes `upload` and `relationship` features
- Applied restricted editor to all richText fields in Pages and ReusableBlocks
- Added 5 integration tests for page-level conversion element validation
- Updated 15+ existing tests to comply with new conversion element requirement

## Files Created/Modified

- `dev/collections/Pages.ts` - Added ValidationError import, HeroBlock type, validateConversionElement hook, and restrictedLexicalEditor configuration
- `dev/collections/ReusableBlocks.ts` - Added restrictedLexicalEditor configuration for all richText fields
- `dev/int.spec.ts` - Added Page-level conversion element validation describe block with 5 tests, updated existing tests to include valid CTAs

## Decisions Made

- Page-level validation runs in `beforeChange` hook alongside existing `ensureBlockIds` hook
- Conversion element defined as: heroBlock with both `cta.ctaText` and `cta.ctaLink` non-empty (after trim)
- Empty strings and whitespace-only values count as missing for conversion element
- Lexical editor restriction uses filter approach (`!['relationship', 'upload'].includes(feature.key)`) rather than explicit feature list
- Restricted editor applied consistently to both Pages and ReusableBlocks collections

## Deviations from Plan

### Notes

**1. Test assertion approach adjusted (same as 07-01)**
- **Found during:** Task 3 (validation tests)
- **Issue:** Plan specified testing for "conversion element" in error message. Payload wraps validation errors in generic format like "The following field is invalid: hero"
- **Resolution:** Tests verify the field path `hero` in error rather than custom message content. Custom message still appears in admin UI.
- **Impact:** None - tests still verify validation behavior correctly

**2. Existing tests required updates**
- **Found during:** Verification
- **Issue:** New page-level validation broke 15+ existing tests that created pages without CTAs
- **Resolution:** Auto-fixed by adding valid CTAs to all existing page creation tests
- **Impact:** Minor - tests still verify their original functionality, just with compliant data

**3. Removed "accepts empty CTA" test**
- **Found during:** Task 3 (validation tests)
- **Issue:** Previous test verified empty CTA was allowed at field level. This conflicts with new page-level validation requiring CTA for conversion element
- **Resolution:** Replaced test with comment explaining the intentional change
- **Impact:** None - field-level CTA validation still works, page-level validation adds stricter requirement

---

**Total deviations:** 3 auto-fixed, 0 deferred
**Impact on plan:** Minor test adjustments. No scope creep.

## Issues Encountered

None - all tasks completed successfully.

## Test Results

- **Total tests:** 31 passing
- **New tests:** 5 (Page-level conversion element validation)
- **Updated tests:** 15+ (added valid CTAs for compliance)

## Phase 7 Completion Status

With 07-02 complete, Phase 7 (Validation + Guardrails) is now fully implemented:

- **07-01:** Field-level constraints (headline maxLength, CTA validation, array limits)
- **07-02:** Page-level validation (conversion element required) + Lexical editor config

All validation layers are now in place:
1. **Field-level:** Individual field validators (maxLength, URL format, CTA completeness)
2. **Page-level:** Business rule enforcement (conversion element required)
3. **Editor-level:** Lexical features restricted (no upload/relationship in richText)

---
*Phase: 07-validation-guardrails*
*Completed: 2025-12-30*
