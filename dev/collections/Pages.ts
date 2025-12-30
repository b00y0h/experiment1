import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nanoid } from 'nanoid'

import { createBlockSettings } from '../fields/blockSettings'
import { ctaValidator, maxLengthValidator, urlValidator } from '../validators/fieldValidators'

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
 * Handles edge cases where field-level hooks may not fire (e.g., Lexical-embedded blocks).
 */
const ensureBlockIds: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation !== 'create' && operation !== 'update') {
    return data
  }

  const processBlocks = (blocks: BlockWithSettings[] | undefined): void => {
    if (!Array.isArray(blocks)) {return}

    for (const block of blocks) {
      if (!block.settings) {
        block.settings = {}
      }
      if (!block.settings.blockId) {
        block.settings.blockId = nanoid(12)
      }
    }
  }

  // Process all block arrays
  processBlocks(data.hero as BlockWithSettings[] | undefined)
  processBlocks(data.content as BlockWithSettings[] | undefined)
  processBlocks(data.footer as BlockWithSettings[] | undefined)

  return data
}

export const Pages: CollectionConfig = {
  slug: 'pages',
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
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      required: true,
      unique: true,
    },
    {
      name: 'hero',
      type: 'blocks',
      blocks: [
        {
          slug: 'heroBlock',
          fields: [
            {
              name: 'headline',
              type: 'text',
              maxLength: 100,
              required: true,
              validate: maxLengthValidator(100),
            },
            {
              name: 'subheadline',
              type: 'textarea',
            },
            {
              name: 'cta',
              type: 'group',
              admin: {
                condition: () => true,
              },
              fields: [
                {
                  name: 'ctaText',
                  type: 'text',
                  label: 'Button Label',
                  maxLength: 50,
                },
                {
                  name: 'ctaLink',
                  type: 'text',
                  label: 'Button URL',
                  validate: urlValidator,
                },
              ],
              label: 'Call to Action',
              validate: ctaValidator,
            },
            {
              name: 'media',
              type: 'upload',
              relationTo: 'media',
            },
            createBlockSettings(),
          ],
        },
      ],
      maxRows: 1,
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [
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
              maxRows: 20,
            },
            createBlockSettings(),
          ],
        },
        {
          slug: 'reusableBlockRef',
          fields: [
            {
              name: 'block',
              type: 'relationship',
              relationTo: 'reusable-blocks',
              required: true,
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
              maxRows: 30,
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
              maxRows: 12,
            },
            createBlockSettings(),
          ],
        },
      ],
    },
    {
      name: 'footer',
      type: 'blocks',
      blocks: [
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
      ],
    },
  ],
  hooks: {
    beforeChange: [ensureBlockIds],
  },
}
