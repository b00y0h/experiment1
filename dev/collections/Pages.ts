import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { nanoid } from 'nanoid'
import { ValidationError } from 'payload'

import {
  accordionBlock,
  contentBlock,
  faqBlock,
  footerBlock,
  heroBlock,
  reusableBlockRef,
  statsBlock,
} from '../blocks'

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
      blocks: [heroBlock()],
      maxRows: 1,
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [contentBlock(), accordionBlock(), reusableBlockRef(), faqBlock(), statsBlock()],
    },
    {
      name: 'footer',
      type: 'blocks',
      blocks: [footerBlock()],
    },
  ],
  hooks: {
    beforeChange: [validateConversionElement, ensureBlockIds],
  },
}
