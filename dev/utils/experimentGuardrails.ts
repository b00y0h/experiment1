import type { BlockTypeSlug } from '../blocks/registry.js'

import { getBlockSlugs } from '../blocks/registry.js'

/**
 * Check if a block type is allowed for an experiment.
 * Empty allowedBlockTypes = all blocks allowed.
 */
export function isBlockAllowed(
  blockType: BlockTypeSlug,
  allowedBlockTypes: BlockTypeSlug[] | null | undefined,
): boolean {
  // Empty or null = no restrictions
  if (!allowedBlockTypes || allowedBlockTypes.length === 0) {
    return true
  }
  return allowedBlockTypes.includes(blockType)
}

/**
 * Get allowed blocks for an experiment as catalog subset.
 * Returns all blocks if no restrictions.
 */
export function getAllowedBlocks(
  allowedBlockTypes: BlockTypeSlug[] | null | undefined,
): BlockTypeSlug[] {
  if (!allowedBlockTypes || allowedBlockTypes.length === 0) {
    return getBlockSlugs()
  }
  return allowedBlockTypes
}
