import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nanoid } from 'nanoid'

import { createBlockSettings } from '../fields/blockSettings'

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

  // Process all override block arrays
  processBlocks(data.heroOverride as BlockWithSettings[] | undefined)
  processBlocks(data.contentOverride as BlockWithSettings[] | undefined)
  processBlocks(data.footerOverride as BlockWithSettings[] | undefined)

  return data
}

/**
 * Hero block definition - same as Pages.ts
 */
const heroBlock = {
  slug: 'heroBlock',
  fields: [
    {
      name: 'headline',
      type: 'text' as const,
      maxLength: 100,
      required: true,
    },
    {
      name: 'subheadline',
      type: 'textarea' as const,
    },
    {
      name: 'cta',
      type: 'group' as const,
      fields: [
        {
          name: 'ctaText',
          type: 'text' as const,
          label: 'Button Label',
          maxLength: 50,
        },
        {
          name: 'ctaLink',
          type: 'text' as const,
          label: 'Button URL',
        },
      ],
      label: 'Call to Action',
    },
    {
      name: 'media',
      type: 'upload' as const,
      relationTo: 'media',
    },
    createBlockSettings(),
  ],
}

/**
 * Content block definitions - same as Pages.ts
 */
const contentBlocks = [
  {
    slug: 'contentBlock',
    fields: [
      {
        name: 'body',
        type: 'richText' as const,
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
        type: 'array' as const,
        fields: [
          {
            name: 'title',
            type: 'text' as const,
            required: true,
          },
          {
            name: 'content',
            type: 'richText' as const,
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
        type: 'relationship' as const,
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
        type: 'array' as const,
        fields: [
          {
            name: 'question',
            type: 'text' as const,
            required: true,
          },
          {
            name: 'answer',
            type: 'richText' as const,
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
        type: 'array' as const,
        fields: [
          {
            name: 'value',
            type: 'text' as const,
            required: true,
          },
          {
            name: 'label',
            type: 'text' as const,
            required: true,
          },
          {
            name: 'icon',
            type: 'text' as const,
          },
        ],
        maxRows: 12,
      },
      createBlockSettings(),
    ],
  },
]

/**
 * Footer block definition - same as Pages.ts
 */
const footerBlock = {
  slug: 'footerBlock',
  fields: [
    {
      name: 'text',
      type: 'text' as const,
    },
    createBlockSettings(),
  ],
}

export const PageVariants: CollectionConfig = {
  slug: 'page-variants',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Variant identifier (e.g., "Holiday Sale", "Mobile Optimized")',
      },
      required: true,
    },
    {
      name: 'page',
      type: 'relationship',
      admin: {
        description: 'The base page this variant applies to',
      },
      relationTo: 'pages',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      admin: {
        description: 'Lifecycle state of this variant',
      },
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'heroOverride',
      type: 'blocks',
      admin: {
        description: 'Replaces hero section when set',
      },
      blocks: [heroBlock],
    },
    {
      name: 'contentOverride',
      type: 'blocks',
      admin: {
        description: 'Replaces content section when set',
      },
      blocks: contentBlocks,
    },
    {
      name: 'footerOverride',
      type: 'blocks',
      admin: {
        description: 'Replaces footer section when set',
      },
      blocks: [footerBlock],
    },
  ],
  hooks: {
    beforeChange: [ensureBlockIds],
  },
}
