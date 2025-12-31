/**
 * Frontend renderer mapping module
 * Provides dispatch function to map blockType → React component
 */

export {
  // Component lookup helper
  getBlockComponent,
  // Core dispatch function
  renderBlock,
  // Safe version that handles unknown types at runtime
  renderBlockSafe,
  // Fallback component
  UnknownBlock,
} from './renderBlock.js'

export type {
  BlockComponentMap,
  BlockType,
  // Type definitions
  RenderableBlock,
  UnknownBlockProps,
} from './renderBlock.js'
