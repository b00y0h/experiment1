import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { nanoid } from 'nanoid'

import { reusableBlockTypes } from '../blocks'

type BlockWithSettings = {
  [key: string]: unknown
  blockType: string
  settings?: {
    analyticsLabel?: string
    blockId?: string
  }
}

/**
 * Collection-level fallback hook that ensures all blocks have a blockId.
 * Handles edge cases where field-level hooks may not fire.
 */
const ensureBlockIds: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation !== 'create' && operation !== 'update') {
    return data
  }

  const processBlocks = (blocks: BlockWithSettings[] | undefined): void => {
    if (!Array.isArray(blocks)) {
      return
    }

    for (const block of blocks) {
      if (!block.settings) {
        block.settings = {}
      }
      if (!block.settings.blockId) {
        block.settings.blockId = nanoid(12)
      }
    }
  }

  // Process block array
  processBlocks(data.block as BlockWithSettings[] | undefined)

  return data
}

export const ReusableBlocks: CollectionConfig = {
  slug: 'reusable-blocks',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'blockType',
      type: 'select',
      options: [
        { label: 'Accordion', value: 'accordion' },
        { label: 'Content', value: 'content' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Footer', value: 'footer' },
        { label: 'Stats', value: 'stats' },
      ],
      required: true,
    },
    {
      name: 'block',
      type: 'blocks',
      blocks: reusableBlockTypes.map((factory) => factory()),
      maxRows: 1,
    },
  ],
  hooks: {
    beforeChange: [ensureBlockIds],
  },
}
