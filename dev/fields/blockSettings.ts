import type { Field, FieldHook } from 'payload'

import { nanoid } from 'nanoid'

/**
 * Hook that generates a stable nanoid on document creation if blockId is empty.
 * Only runs on 'create' operation AND when value is empty to prevent regeneration on edits.
 */
const generateBlockId: FieldHook = ({ operation, value }) => {
  if (operation === 'create' && !value) {
    return nanoid(12)
  }
  return value
}

/**
 * Creates a shared blockSettings field group for use in page blocks.
 * Provides:
 * - blockId: Auto-generated stable 12-character nanoid for analytics/variant targeting
 * - analyticsLabel: Human-readable label for analytics dashboards
 */
export const createBlockSettings = (): Field => ({
  name: 'settings',
  type: 'group',
  admin: {
    description: 'Settings for analytics and variant targeting. Block ID is auto-generated on creation.',
  },
  fields: [
    {
      name: 'blockId',
      type: 'text',
      admin: {
        description: 'Auto-generated stable identifier. Do not modify unless necessary.',
        readOnly: false, // Allow manual override if needed
      },
      hooks: {
        beforeChange: [generateBlockId],
      },
      label: 'Block ID',
    },
    {
      name: 'analyticsLabel',
      type: 'text',
      admin: {
        description: 'Human-readable label for analytics dashboards (e.g., "Homepage Hero", "Pricing FAQ").',
      },
      label: 'Analytics Label',
    },
  ],
  label: 'Block Settings',
})
