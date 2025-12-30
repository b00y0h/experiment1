import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

/**
 * Auto-sets timestamp to current date on creation if not already set.
 */
const setTimestamp: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' && !data.timestamp) {
    data.timestamp = new Date().toISOString()
  }
  return data
}

export const AnalyticsEvents: CollectionConfig = {
  slug: 'analytics-events',
  admin: {
    useAsTitle: 'eventType',
  },
  fields: [
    {
      name: 'eventType',
      type: 'select',
      admin: {
        description: 'Type of analytics event',
      },
      options: [
        { label: 'Impression', value: 'impression' },
        { label: 'Conversion', value: 'conversion' },
        { label: 'Click', value: 'click' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
    },
    {
      name: 'experiment',
      type: 'relationship',
      admin: {
        description: 'Which experiment this event belongs to',
      },
      relationTo: 'experiments',
    },
    {
      name: 'variant',
      type: 'relationship',
      admin: {
        description: 'Which variant was shown',
      },
      relationTo: 'page-variants',
    },
    {
      name: 'visitorId',
      type: 'text',
      admin: {
        description: 'The visitor ID from cookie',
      },
    },
    {
      name: 'page',
      type: 'relationship',
      admin: {
        description: 'Which page the event occurred on',
      },
      relationTo: 'pages',
    },
    {
      name: 'blockId',
      type: 'text',
      admin: {
        description: 'The blockId for block-level tracking (matches nanoid(12) from blocks)',
      },
    },
    {
      name: 'eventName',
      type: 'text',
      admin: {
        description: 'Custom event name for type="custom" (e.g., "cta_hover", "video_play")',
      },
    },
    {
      name: 'eventData',
      type: 'json',
      admin: {
        description: 'Arbitrary metadata for the event',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      admin: {
        description: 'When the event occurred',
      },
    },
  ],
  hooks: {
    beforeChange: [setTimestamp],
  },
}
