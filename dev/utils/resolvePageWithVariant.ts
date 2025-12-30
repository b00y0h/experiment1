import type { Page, PageVariant, ReusableBlock } from '../payload-types'
import type { ResolvedPage } from './resolvePageBlocks.js'

/**
 * A resolved page with variant metadata.
 * Extends ResolvedPage with _variant info when a variant is applied.
 */
export type ResolvedPageWithVariant = {
  _variant?: {
    id: string
    name: string
  }
} & ResolvedPage

/**
 * Content block types that can exist in variant override arrays.
 * Matches the type from resolvePageBlocks.
 */
type InlineContentBlock = Exclude<NonNullable<Page['content']>[number], { blockType: 'reusableBlockRef' }>

/**
 * Type guard to check if a relationship is populated (object) or unpopulated (string ID).
 */
function isPopulatedReusableBlock(block: ReusableBlock | string): block is ReusableBlock {
  return typeof block === 'object' && block !== null && 'id' in block
}

/**
 * Resolves content blocks by handling reusableBlockRef blocks.
 * This is a shared helper extracted from resolvePageBlocks logic.
 */
function resolveContentBlocks(
  blocks: NonNullable<PageVariant['contentOverride']>,
): InlineContentBlock[] {
  const resolvedContent: InlineContentBlock[] = []

  for (const block of blocks) {
    if (block.blockType === 'reusableBlockRef') {
      const blockRef = block.block

      // Skip unpopulated references
      if (!isPopulatedReusableBlock(blockRef)) {
        resolvedContent.push(block as unknown as InlineContentBlock)
        continue
      }

      const reusableBlock = blockRef
      const actualBlocks = reusableBlock.block

      // Skip if ReusableBlock has no blocks
      if (!actualBlocks || actualBlocks.length === 0) {
        continue
      }

      // Get the first block from the ReusableBlock
      const actualBlock = actualBlocks[0]

      // Create resolved block with preserved settings from the reusableBlockRef
      const resolvedBlock = {
        ...actualBlock,
        _resolvedFrom: reusableBlock.id,
        settings: {
          ...actualBlock.settings,
          analyticsLabel: block.settings?.analyticsLabel || actualBlock.settings?.analyticsLabel,
          blockId: block.settings?.blockId || actualBlock.settings?.blockId,
        },
      }

      resolvedContent.push(resolvedBlock as InlineContentBlock)
    } else {
      // Inline blocks are passed through unchanged
      resolvedContent.push(block)
    }
  }

  return resolvedContent
}

/**
 * Applies a PageVariant's overrides to a resolved page.
 *
 * This function takes an already-resolved page (from resolvePageBlocks) and a PageVariant,
 * then applies any override blocks from the variant. Overrides completely replace
 * the corresponding section (no merging).
 *
 * Key behaviors:
 * - If variant.heroOverride has blocks (length > 0), replaces page.hero entirely
 * - If variant.contentOverride has blocks, replaces page.content entirely
 * - If variant.footerOverride has blocks, replaces page.footer entirely
 * - Empty override arrays (length 0 or null/undefined) mean "no override" - keep original section
 * - Override content blocks go through reusableBlockRef resolution
 * - Adds _variant metadata with variant id and name
 *
 * @param page - The already-resolved page (from resolvePageBlocks or getResolvedPage)
 * @param variant - The PageVariant with override blocks to apply
 * @returns A new page object with variant overrides applied and _variant metadata
 */
export function resolvePageWithVariant(
  page: ResolvedPage,
  variant: PageVariant,
): ResolvedPageWithVariant {
  // Start with the resolved page
  const result: ResolvedPageWithVariant = {
    ...page,
    _variant: {
      id: variant.id,
      name: variant.name,
    },
  }

  // Apply hero override if present (non-empty array)
  if (variant.heroOverride && variant.heroOverride.length > 0) {
    result.hero = variant.heroOverride
  }

  // Apply content override if present (non-empty array)
  // Content blocks need resolution for reusableBlockRef
  if (variant.contentOverride && variant.contentOverride.length > 0) {
    const resolvedContent = resolveContentBlocks(variant.contentOverride)
    result.content = resolvedContent.length > 0 ? resolvedContent : null
  }

  // Apply footer override if present (non-empty array)
  if (variant.footerOverride && variant.footerOverride.length > 0) {
    result.footer = variant.footerOverride
  }

  return result
}
