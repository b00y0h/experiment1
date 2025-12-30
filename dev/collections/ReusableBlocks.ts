import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nanoid } from 'nanoid'

import { createBlockSettings } from '../fields/blockSettings'

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
      blocks: [
        {
          slug: 'accordionBlock',
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'content',
                  type: 'richText',
                  editor: lexicalEditor(),
                },
              ],
            },
            createBlockSettings(),
          ],
        },
        {
          slug: 'contentBlock',
          fields: [
            {
              name: 'body',
              type: 'richText',
              editor: lexicalEditor(),
            },
            createBlockSettings(),
          ],
        },
        {
          slug: 'footerBlock',
          fields: [
            {
              name: 'text',
              type: 'text',
            },
            createBlockSettings(),
          ],
        },
        {
          slug: 'faqBlock',
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'answer',
                  type: 'richText',
                  editor: lexicalEditor(),
                },
              ],
            },
            createBlockSettings(),
          ],
        },
        {
          slug: 'statsBlock',
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'icon',
                  type: 'text',
                },
              ],
            },
            createBlockSettings(),
          ],
        },
      ],
      maxRows: 1,
    },
  ],
  hooks: {
    beforeChange: [ensureBlockIds],
  },
}
