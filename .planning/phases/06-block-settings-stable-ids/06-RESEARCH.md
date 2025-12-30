# Phase 6: Block Settings + Stable IDs - Research

**Researched:** 2025-12-30
**Domain:** Payload CMS block IDs and variant-ready settings
**Confidence:** HIGH

<research_summary>
## Summary

Researched how to make Payload blocks variant/analytics-ready with stable IDs and consistent settings. Key discovery: **Payload already auto-generates unique `id` fields for every block and array item** - these are MongoDB ObjectID-style strings that persist across edits.

The challenge is not ID generation but **ID stability** (not regenerating on edit) and **ID semantics** (human-readable for analytics). Payload's native block IDs are stable but opaque. For A/B testing and analytics, a custom `blockId` field with semantic meaning (e.g., "hero-homepage-variant-a") is more useful than "6507a2f3b8e3c5001234abcd".

**Primary recommendation:** Add a custom `blockId` text field with `beforeChange` hook that auto-generates a nanoid-based ID if not provided, while preserving user-defined semantic IDs when set. Keep Payload's native `id` for internal references.
</research_summary>

<standard_stack>
## Standard Stack

### Core (ID Generation)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| nanoid | 5.x | URL-safe unique IDs | Smaller than UUID (21 chars), secure, URL-friendly |
| @paralleldrive/cuid2 | 2.x | Cryptographically secure IDs | More secure than nanoid if security critical |

**Recommendation:** Use `nanoid` - balance of size, security, and URL-friendliness. Only use cuid2 if IDs might be exposed in security-sensitive contexts.

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| uuid | 9.x | Standard UUIDs | Only if you need database-native UUID support |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nanoid | cuid2 | cuid2 more secure but 60x slower, longer output |
| nanoid | uuid | UUID is 36 chars with dashes, nanoid is 21 URL-safe |
| custom blockId | Payload native id | Native id is opaque, custom field allows semantic naming |

**Installation:**
```bash
pnpm add nanoid
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Block Settings Structure
```typescript
// Common settings for every block type
const blockSettings = {
  name: 'settings',
  type: 'group',
  admin: {
    condition: () => true,
  },
  fields: [
    {
      name: 'blockId',
      type: 'text',
      admin: {
        description: 'Unique ID for analytics/A-B testing. Auto-generated if empty.',
      },
      hooks: {
        beforeChange: [
          ({ value, operation }) => {
            if (!value && operation === 'create') {
              return nanoid(12) // Short but unique
            }
            return value
          },
        ],
      },
    },
    {
      name: 'analyticsLabel',
      type: 'text',
      admin: {
        description: 'Human-readable label for analytics dashboards',
      },
    },
    {
      name: 'variantGroup',
      type: 'text',
      admin: {
        description: 'Group ID for A/B test variants (blocks with same group are variants)',
      },
    },
  ],
}
```

### Pattern 1: Field-Level Hook for Auto-Generation
**What:** Use `beforeChange` hook on text field to auto-generate ID on create
**When to use:** When you want ID auto-generated but user-overridable
**Example:**
```typescript
{
  name: 'blockId',
  type: 'text',
  hooks: {
    beforeChange: [
      ({ value, operation }) => {
        // Only generate on create if empty
        if (!value && operation === 'create') {
          return nanoid(12)
        }
        return value
      },
    ],
  },
}
```

### Pattern 2: Blocks-Level Hook for All Items
**What:** Use collection `beforeChange` hook to process all blocks in an array
**When to use:** When you need to ensure ALL blocks have IDs (bulk processing)
**Example:**
```typescript
// Collection-level beforeChange
{
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (data.content) {
          data.content = data.content.map((block) => ({
            ...block,
            settings: {
              ...block.settings,
              blockId: block.settings?.blockId || nanoid(12),
            },
          }))
        }
        return data
      },
    ],
  },
}
```

### Pattern 3: Reusable Block Settings Field Config
**What:** Extract common settings to a reusable field definition
**When to use:** When multiple blocks share the same settings structure
**Example:**
```typescript
// dev/fields/blockSettings.ts
import { Field } from 'payload'
import { nanoid } from 'nanoid'

export const blockSettingsFields: Field[] = [
  {
    name: 'blockId',
    type: 'text',
    admin: { description: 'Unique ID for analytics' },
    hooks: {
      beforeChange: [
        ({ value, operation }) => {
          if (!value && operation === 'create') return nanoid(12)
          return value
        },
      ],
    },
  },
  {
    name: 'analyticsLabel',
    type: 'text',
  },
]

// Usage in block definition
{
  slug: 'heroBlock',
  fields: [
    { name: 'headline', type: 'text' },
    {
      name: 'settings',
      type: 'group',
      fields: blockSettingsFields,
    },
  ],
}
```

### Anti-Patterns to Avoid
- **Regenerating ID on every edit:** Check `operation === 'create'` before generating
- **Using Payload's native id for analytics:** Native IDs are opaque, use semantic custom IDs
- **Hiding blockId completely:** Make it editable so editors can set semantic names like "homepage-hero-v2"
- **Generating in defaultValue:** Can cause issues with list views showing same ID
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unique ID generation | Math.random() string | nanoid | Collision risk, not cryptographically random |
| URL-safe encoding | Base64 custom | nanoid (built-in) | Already URL-safe alphabet |
| ID uniqueness checking | Database query per create | nanoid with length 12+ | Collision probability negligible at 12+ chars |

**Key insight:** The ID generation problem is solved. Focus on the *semantic* problem: what IDs mean to analytics and A/B testing, not how to generate them.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: ID Regeneration on Edit
**What goes wrong:** Block ID changes every time document is saved
**Why it happens:** Hook runs on every operation, not just create
**How to avoid:** Check `operation === 'create'` before generating new ID
**Warning signs:** Analytics showing single blocks as multiple blocks over time

### Pitfall 2: Lexical Rich Text Hook Bypass
**What goes wrong:** Field hooks don't fire for blocks inside Lexical editor
**Why it happens:** Known Payload issue - only `afterRead` fires for Lexical-embedded blocks
**How to avoid:** Use collection-level `beforeChange` hook to process all content
**Warning signs:** Blocks in rich text fields missing generated IDs

### Pitfall 3: Same ID Across Duplicated Blocks
**What goes wrong:** When user duplicates a block, both have same blockId
**Why it happens:** Copy operation preserves all fields including ID
**How to avoid:** Handle `operation === 'create'` for duplicates OR use `beforeDuplicate` hook to clear ID
**Warning signs:** Duplicate analytics events, A/B test assignment issues

### Pitfall 4: Over-Indexing on Block ID
**What goes wrong:** Database queries by blockId are slow
**Why it happens:** blockId field not indexed
**How to avoid:** If querying by blockId, add database index
**Warning signs:** Slow analytics queries, timeout on block lookups
</common_pitfalls>

<code_examples>
## Code Examples

### Basic Block with Settings
```typescript
// Source: Payload docs + research patterns
import { nanoid } from 'nanoid'

export const heroBlock = {
  slug: 'heroBlock',
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'blockId',
          type: 'text',
          admin: {
            description: 'Unique ID for analytics. Auto-generated if empty.',
          },
          hooks: {
            beforeChange: [
              ({ value, operation }) => {
                if (!value && operation === 'create') {
                  return nanoid(12)
                }
                return value
              },
            ],
          },
        },
      ],
    },
  ],
}
```

### Shared Settings Field Definition
```typescript
// Source: Payload field reuse pattern
import { Field } from 'payload'
import { nanoid } from 'nanoid'

export const createBlockSettings = (): Field => ({
  name: 'settings',
  type: 'group',
  admin: {
    condition: () => true,
  },
  fields: [
    {
      name: 'blockId',
      type: 'text',
      hooks: {
        beforeChange: [
          ({ value, operation }) => {
            if (!value && operation === 'create') return nanoid(12)
            return value
          },
        ],
      },
    },
    {
      name: 'analyticsLabel',
      type: 'text',
    },
  ],
})
```

### Collection-Level Fallback Hook
```typescript
// Source: Community pattern for ensuring all blocks have IDs
import { CollectionBeforeChangeHook } from 'payload'
import { nanoid } from 'nanoid'

const ensureBlockIds: CollectionBeforeChangeHook = ({ data, operation }) => {
  const processBlocks = (blocks: any[]) => {
    return blocks?.map((block) => ({
      ...block,
      settings: {
        ...block.settings,
        blockId: block.settings?.blockId || nanoid(12),
      },
    }))
  }

  if (operation === 'create' || operation === 'update') {
    if (data.hero) data.hero = processBlocks(data.hero)
    if (data.content) data.content = processBlocks(data.content)
    if (data.footer) data.footer = processBlocks(data.footer)
  }

  return data
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| uuid v4 | nanoid | 2022+ | Smaller, faster, URL-safe by default |
| Custom random | cuid2 | 2023 | Better security guarantees if needed |
| Manual block ID fields | Payload native block.id | Always | Native ID exists, focus on semantic ID |

**New tools/patterns to consider:**
- **beforeDuplicate hook:** Handle block duplication properly (clear blockId)
- **Virtual fields:** Could compute analytics-ready ID from block position + type

**Deprecated/outdated:**
- **uuid v1-3:** Security issues, use v4+ or nanoid
- **shortid:** Deprecated in favor of nanoid
</sota_updates>

<open_questions>
## Open Questions

1. **beforeDuplicate hook support for blocks**
   - What we know: Payload has beforeDuplicate hook at collection level
   - What's unclear: Whether it fires for individual block duplication in admin UI
   - Recommendation: Test during implementation, fall back to collection hook

2. **Index strategy for blockId**
   - What we know: MongoDB can index nested fields
   - What's unclear: Performance impact at scale for this use case
   - Recommendation: Defer indexing until analytics queries prove slow
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Payload Field Hooks Documentation](https://payloadcms.com/docs/hooks/fields) - Hook types, signatures, usage
- [Payload Blocks Field Documentation](https://payloadcms.com/docs/fields/blocks) - Native block structure
- [nanoid GitHub](https://github.com/ai/nanoid) - Library docs and benchmarks

### Secondary (MEDIUM confidence)
- [Payload Community: Auto Custom ID](https://payloadcms.com/community-help/github/how-to-implement-automatic-custom-id) - Pattern verified
- [Payload GitHub Discussion #5878](https://github.com/payloadcms/payload/discussions/5878) - beforeValidate pattern
- [UUID vs CUID vs NanoID comparison](https://dev.to/turck/comparing-uuid-cuid-and-nanoid-a-developers-guide-50c) - Verified with library docs

### Tertiary (LOW confidence - needs validation)
- Lexical embedded blocks hook issue - mentioned in GitHub issues, validate in testing
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Payload CMS v3 field hooks, blocks field
- Ecosystem: nanoid for ID generation
- Patterns: Field-level hooks, collection-level fallbacks, reusable field definitions
- Pitfalls: ID regeneration, Lexical bypass, duplication

**Confidence breakdown:**
- Standard stack: HIGH - nanoid is established, well-documented
- Architecture: HIGH - patterns from official Payload docs
- Pitfalls: MEDIUM - some from community reports, need validation
- Code examples: HIGH - based on official Payload patterns

**Research date:** 2025-12-30
**Valid until:** 2026-01-30 (30 days - Payload ecosystem stable)
</metadata>

---

*Phase: 06-block-settings-stable-ids*
*Research completed: 2025-12-30*
*Ready for planning: yes*
