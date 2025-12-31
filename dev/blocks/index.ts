/**
 * Block Registry barrel export
 * Re-exports all block definitions and utilities from registry.ts
 */
export {
  // Block factory functions
  accordionBlock,
  // Registry and utilities
  blockRegistry,
  contentBlock,
  // Section-grouped exports
  contentBlocks,
  faqBlock,
  footerBlock,
  footerBlocks,
  getBlocksForSection,
  getBlockSlugs,
  heroBlock,
  heroBlocks,
  // Shared editor config
  restrictedLexicalEditor,
  // Reusable block types (for ReusableBlocks collection)
  reusableBlockRef,
  reusableBlockTypes,
  statsBlock,
} from './registry'

export type { BlockRegistryEntry } from './registry'
