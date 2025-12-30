import type { Page, ReusableBlock } from '../payload-types'

/**
 * Content block types that can exist in the Page content array.
 * Excludes reusableBlockRef since it gets resolved to actual content.
 */
type InlineContentBlock = Exclude<NonNullable<Page['content']>[number], { blockType: 'reusableBlockRef' }>

/**
 * A resolved content block includes the original block data plus
 * an optional _resolvedFrom field for debugging/tracking purposes.
 */
type ResolvedContentBlock = {
  _resolvedFrom?: string
} & InlineContentBlock

/**
 * A page with resolved blocks - all reusableBlockRef blocks have been
 * replaced with their actual block content.
 */
export type ResolvedPage = {
  content: null | ResolvedContentBlock[]
} & Omit<Page, 'content'>

/**
 * Type guard to check if a relationship is populated (object) or unpopulated (string ID).
 */
function isPopulatedReusableBlock(block: ReusableBlock | string): block is ReusableBlock {
  return typeof block === 'object' && block !== null && 'id' in block
}

/**
 * Transforms a page by resolving all reusableBlockRef blocks to their actual block content.
 *
 * This function takes a Page document (typically fetched with depth >= 1 to populate relationships)
 * and replaces each reusableBlockRef block with the actual block content from the referenced
 * ReusableBlock document.
 *
 * Key behaviors:
 * - Preserves the reusableBlockRef's settings.blockId on the resolved block (for analytics tracking)
 * - Adds _resolvedFrom field with the ReusableBlock id for debugging
 * - Skips resolution for unpopulated references (keeps as reusableBlockRef)
 * - Removes reusableBlockRef blocks that point to empty ReusableBlock.block arrays
 * - Inline blocks (non-reusableBlockRef) are passed through unchanged
 * - Does NOT modify the original page object - returns a new object
 *
 * @param page - The Page document with relationships optionally populated
 * @returns A new page object with all resolvable reusableBlockRef blocks replaced
 */
export function resolvePageBlocks(page: Page): ResolvedPage {
  // Handle null/undefined content array
  if (!page.content || !Array.isArray(page.content)) {
    return {
      ...page,
      content: null,
    }
  }

  const resolvedContent: ResolvedContentBlock[] = []

  for (const block of page.content) {
    // Handle reusableBlockRef blocks
    if (block.blockType === 'reusableBlockRef') {
      const blockRef = block.block

      // Skip unpopulated references (keep as-is would break types, so skip entirely)
      if (!isPopulatedReusableBlock(blockRef)) {
        // For unpopulated refs, we can't resolve - keep the original block as a reusableBlockRef
        // Cast is necessary because TypeScript doesn't know this is the reusableBlockRef variant
        resolvedContent.push(block as unknown as ResolvedContentBlock)
        continue
      }

      // Get the actual block content from ReusableBlock
      const reusableBlock = blockRef
      const actualBlocks = reusableBlock.block

      // Skip if ReusableBlock has no blocks
      if (!actualBlocks || actualBlocks.length === 0) {
        continue
      }

      // Get the first (and typically only) block from the ReusableBlock
      const actualBlock = actualBlocks[0]

      // Create resolved block with preserved settings from the reusableBlockRef
      const resolvedBlock: ResolvedContentBlock = {
        ...actualBlock,
        // Preserve the blockId from the reusableBlockRef settings (for analytics tracking)
        settings: {
          ...actualBlock.settings,
          analyticsLabel: block.settings?.analyticsLabel || actualBlock.settings?.analyticsLabel,
          blockId: block.settings?.blockId || actualBlock.settings?.blockId,
        },
        // Add reference to original ReusableBlock for debugging
        _resolvedFrom: reusableBlock.id,
      }

      resolvedContent.push(resolvedBlock)
    } else {
      // Inline blocks are passed through unchanged
      resolvedContent.push(block)
    }
  }

  return {
    ...page,
    content: resolvedContent.length > 0 ? resolvedContent : null,
  }
}
