import type { Block, RichTextAdapter } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { createBlockSettings } from '../fields/blockSettings'
import { ctaValidator, maxLengthValidator, urlValidator } from '../validators/fieldValidators'

/**
 * Restricted Lexical editor that removes upload and relationship features.
 * Keeps: bold, italic, underline, strikethrough, links, lists, headings, paragraphs
 * Removes: upload (embedded media), relationship (embedded documents)
 */
export const restrictedLexicalEditor: RichTextAdapter = lexicalEditor({
  features: ({ defaultFeatures }) =>
    defaultFeatures.filter((feature) => !['relationship', 'upload'].includes(feature.key)),
})

// =============================================================================
// BLOCK FACTORY FUNCTIONS
// Each function returns a Payload Block config. Factory pattern ensures
// createBlockSettings() is called fresh for each usage, preventing shared state.
// =============================================================================

/**
 * Hero block with headline, subheadline, CTA, and optional media.
 * Allowed in: hero section only
 */
export const heroBlock = (): Block => ({
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
})

/**
 * Content block with rich text body.
 * Allowed in: content section
 */
export const contentBlock = (): Block => ({
  slug: 'contentBlock',
  fields: [
    {
      name: 'body',
      type: 'richText',
      editor: restrictedLexicalEditor,
    },
    createBlockSettings(),
  ],
})

/**
 * Accordion block with collapsible items.
 * Allowed in: content section
 */
export const accordionBlock = (): Block => ({
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
})

/**
 * FAQ block with question/answer pairs.
 * Allowed in: content section
 */
export const faqBlock = (): Block => ({
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
})

/**
 * Stats block with value/label pairs and optional icons.
 * Allowed in: content section
 */
export const statsBlock = (): Block => ({
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
})

/**
 * Footer block with simple text.
 * Allowed in: footer section
 */
export const footerBlock = (): Block => ({
  slug: 'footerBlock',
  fields: [
    {
      name: 'text',
      type: 'text',
    },
    createBlockSettings(),
  ],
})

/**
 * Reference to a reusable block.
 * Allowed in: content section
 */
export const reusableBlockRef = (): Block => ({
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
})

// =============================================================================
// SECTION-GROUPED EXPORTS
// Convenience exports for collections to import blocks by section
// =============================================================================

/** Blocks allowed in the hero section */
export const heroBlocks = [heroBlock]

/** Blocks allowed in the content section */
export const contentBlocks = [contentBlock, accordionBlock, reusableBlockRef, faqBlock, statsBlock]

/** Blocks allowed in the footer section */
export const footerBlocks = [footerBlock]

/** Blocks allowed in ReusableBlocks collection (excludes heroBlock and reusableBlockRef) */
export const reusableBlockTypes = [accordionBlock, contentBlock, footerBlock, faqBlock, statsBlock]

// =============================================================================
// BLOCK REGISTRY
// Central registry mapping blockType slug to factory function
// Used by schema generation, frontend renderer mapping, and AI catalog
// =============================================================================

type BlockFactory = () => Block

export type BlockRegistryEntry = {
  allowedSections: ('content' | 'footer' | 'hero')[]
  factory: BlockFactory
  label: string
  slug: string
}

/**
 * Canonical block registry with metadata for each block type.
 * Single source of truth for block definitions consumed by:
 * - Collections (Pages, ReusableBlocks)
 * - Schema generation (16-02)
 * - Frontend renderer mapping (Phase 17)
 * - AI catalog (Phase 19)
 *
 * IMPORTANT: Use `as const satisfies` to preserve literal types for keys.
 * This allows BlockTypeSlug to be a union of literal strings, not just `string`.
 */
export const blockRegistry = {
  accordionBlock: {
    slug: 'accordionBlock',
    allowedSections: ['content'],
    factory: accordionBlock,
    label: 'Accordion Block',
  },
  contentBlock: {
    slug: 'contentBlock',
    allowedSections: ['content'],
    factory: contentBlock,
    label: 'Content Block',
  },
  faqBlock: {
    slug: 'faqBlock',
    allowedSections: ['content'],
    factory: faqBlock,
    label: 'FAQ Block',
  },
  footerBlock: {
    slug: 'footerBlock',
    allowedSections: ['footer'],
    factory: footerBlock,
    label: 'Footer Block',
  },
  heroBlock: {
    slug: 'heroBlock',
    allowedSections: ['hero'],
    factory: heroBlock,
    label: 'Hero Block',
  },
  reusableBlockRef: {
    slug: 'reusableBlockRef',
    allowedSections: ['content'],
    factory: reusableBlockRef,
    label: 'Reusable Block Reference',
  },
  statsBlock: {
    slug: 'statsBlock',
    allowedSections: ['content'],
    factory: statsBlock,
    label: 'Stats Block',
  },
} satisfies Record<string, BlockRegistryEntry>

/**
 * Type-safe union of all block type slugs derived from registry keys.
 * Single source of truth for block type names - adding a block to registry
 * automatically includes it in this union.
 */
export type BlockTypeSlug = keyof typeof blockRegistry

/** Get all block slugs from the registry */
export const getBlockSlugs = (): BlockTypeSlug[] => Object.keys(blockRegistry) as BlockTypeSlug[]

/** Get blocks allowed in a specific section */
export const getBlocksForSection = (section: 'content' | 'footer' | 'hero'): Block[] =>
  Object.values(blockRegistry)
    .filter((entry) => entry.allowedSections.includes(section))
    .map((entry) => entry.factory())
