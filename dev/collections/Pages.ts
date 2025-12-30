import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nanoid } from 'nanoid'
import { ValidationError } from 'payload'

import { createBlockSettings } from '../fields/blockSettings'
import { ctaValidator, maxLengthValidator, urlValidator } from '../validators/fieldValidators'

/**
 * Restricted Lexical editor that removes upload and relationship features.
 * Keeps: bold, italic, underline, strikethrough, links, lists, headings, paragraphs
 * Removes: upload (embedded media), relationship (embedded documents)
 */
const restrictedLexicalEditor = lexicalEditor({
  features: ({ defaultFeatures }) =>
    defaultFeatures.filter((feature) => !['relationship', 'upload'].includes(feature.key)),
})

type BlockWithSettings = {
  [key: string]: unknown
  blockType: string
  settings?: {
    analyticsLabel?: string
    blockId?: string
  }
}

type HeroBlock = {
  blockType: 'heroBlock'
  cta?: {
    ctaLink?: string
    ctaText?: string
  }
  headline?: string
  subheadline?: string
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

/**
 * Page-level validation hook that ensures pages contain at least one conversion element.
 * A conversion element is defined as a hero block with both CTA text and CTA link set.
 */
const validateConversionElement: CollectionBeforeChangeHook = ({ data, operation }) => {
  // Only validate on create and update
  if (operation !== 'create' && operation !== 'update') {
    return data
  }

  const heroBlocks = data.hero as HeroBlock[] | undefined

  // Check if hero array exists and has at least one heroBlock
  if (!Array.isArray(heroBlocks) || heroBlocks.length === 0) {
    throw new ValidationError({
      errors: [
        {
          message: 'Page must contain at least one conversion element (hero with CTA)',
          path: 'hero',
        },
      ],
    })
  }

  // Check if at least one heroBlock has both ctaText and ctaLink set (non-empty)
  const hasConversionElement = heroBlocks.some((block) => {
    if (block.blockType !== 'heroBlock') {
      return false
    }
    const ctaText = block.cta?.ctaText?.trim()
    const ctaLink = block.cta?.ctaLink?.trim()
    return Boolean(ctaText) && Boolean(ctaLink)
  })

  if (!hasConversionElement) {
    throw new ValidationError({
      errors: [
        {
          message: 'Page must contain at least one conversion element (hero with CTA)',
          path: 'hero',
        },
      ],
    })
  }

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
              editor: restrictedLexicalEditor,
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
                  editor: restrictedLexicalEditor,
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
                  editor: restrictedLexicalEditor,
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
    beforeChange: [validateConversionElement, ensureBlockIds],
  },
}
