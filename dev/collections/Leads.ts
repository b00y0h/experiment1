import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

/**
 * Auto-sets convertedAt to current date on creation if not already set.
 */
const setConvertedAt: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' && !data.convertedAt) {
    data.convertedAt = new Date().toISOString()
  }
  return data
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'experiment',
      type: 'relationship',
      admin: {
        description: 'Which experiment this lead was captured from',
      },
      relationTo: 'experiments',
    },
    {
      name: 'variant',
      type: 'relationship',
      admin: {
        description: 'Which variant the visitor saw',
      },
      relationTo: 'page-variants',
    },
    {
      name: 'visitorId',
      type: 'text',
      admin: {
        description: 'The visitor ID from cookie at time of submission',
      },
    },
    {
      name: 'page',
      type: 'relationship',
      admin: {
        description: 'Which page the form was on',
      },
      relationTo: 'pages',
    },
    {
      name: 'formData',
      type: 'json',
      admin: {
        description: 'Arbitrary additional form fields as JSON object',
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Where the lead came from (e.g., "hero-cta", "footer-form")',
      },
    },
    {
      name: 'convertedAt',
      type: 'date',
      admin: {
        description: 'When this lead converted',
      },
    },
  ],
  hooks: {
    beforeChange: [setConvertedAt],
  },
}
