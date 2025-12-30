import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { ValidationError } from 'payload'

type ExperimentVariant = {
  trafficPercent?: number
  variant?: { id: number | string; page?: { id: number | string } | number | string } | number | string
}

type ExperimentData = {
  page?: { id: number | string } | number | string
  status?: string
  variants?: ExperimentVariant[]
}

/**
 * Extracts the page ID from a variant's page reference.
 * Handles both populated objects and raw IDs.
 */
const getVariantPageId = (variant: ExperimentVariant): number | string | undefined => {
  if (!variant.variant) {
    return undefined
  }

  // If variant is populated object with page
  if (typeof variant.variant === 'object' && 'page' in variant.variant) {
    const page = variant.variant.page
    if (typeof page === 'object' && page !== null && 'id' in page) {
      return page.id
    }
    return page
  }

  return undefined
}

/**
 * Extracts the ID from a page reference (handles both populated and unpopulated)
 */
const getPageId = (page: ExperimentData['page']): number | string | undefined => {
  if (!page) {
    return undefined
  }
  if (typeof page === 'object' && 'id' in page) {
    return page.id
  }
  return page
}

/**
 * Validates experiment data:
 * 1. Traffic percentages must sum to exactly 100 when status is 'running'
 * 2. At least 2 variants required
 * 3. All variants must belong to the same page as the experiment
 */
const validateExperiment: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create' && operation !== 'update') {
    return data
  }

  const experimentData = data as ExperimentData
  const variants = experimentData.variants || []

  // Validation 1: At least 2 variants required
  if (variants.length < 2) {
    throw new ValidationError({
      errors: [
        {
          message: 'Experiment must have at least 2 variants',
          path: 'variants',
        },
      ],
    })
  }

  // Validation 2: Traffic percentages must sum to 100 when status is 'running'
  if (experimentData.status === 'running') {
    const totalTraffic = variants.reduce((sum, v) => sum + (v.trafficPercent || 0), 0)
    if (totalTraffic !== 100) {
      throw new ValidationError({
        errors: [
          {
            message: `Traffic percentages must sum to exactly 100% when running (currently ${totalTraffic}%)`,
            path: 'variants',
          },
        ],
      })
    }
  }

  // Validation 3: All variants must belong to the experiment's page
  // We need to fetch the variant documents to check their page references
  const experimentPageId = getPageId(experimentData.page)
  if (!experimentPageId) {
    return data // Can't validate page consistency without experiment page
  }

  // Collect variant IDs that need to be checked
  const variantIdsToCheck: (number | string)[] = []
  for (const v of variants) {
    if (typeof v.variant === 'object' && v.variant && 'page' in v.variant) {
      // Already populated, check directly
      const variantPageId = getVariantPageId(v)
      if (variantPageId && variantPageId !== experimentPageId) {
        throw new ValidationError({
          errors: [
            {
              message: 'All variants must belong to the same page as the experiment',
              path: 'variants',
            },
          ],
        })
      }
    } else if (v.variant) {
      // Need to fetch to check
      const variantId = typeof v.variant === 'object' && 'id' in v.variant ? v.variant.id : v.variant
      variantIdsToCheck.push(variantId)
    }
  }

  // Fetch unpopulated variants to check their page references
  if (variantIdsToCheck.length > 0) {
    const { docs: variantDocs } = await req.payload.find({
      collection: 'page-variants',
      depth: 0,
      where: {
        id: { in: variantIdsToCheck },
      },
    })

    for (const variantDoc of variantDocs) {
      const variantPageId =
        typeof variantDoc.page === 'object' && variantDoc.page !== null
          ? variantDoc.page.id
          : variantDoc.page
      if (variantPageId !== experimentPageId) {
        throw new ValidationError({
          errors: [
            {
              message: 'All variants must belong to the same page as the experiment',
              path: 'variants',
            },
          ],
        })
      }
    }
  }

  return data
}

export const Experiments: CollectionConfig = {
  slug: 'experiments',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Experiment identifier (e.g., "Holiday Hero Test", "CTA Button Color")',
      },
      required: true,
    },
    {
      name: 'page',
      type: 'relationship',
      admin: {
        description: 'The base page being tested',
      },
      relationTo: 'pages',
      required: true,
    },
    {
      name: 'variants',
      type: 'array',
      admin: {
        description: 'Page variants to test with traffic allocation',
      },
      fields: [
        {
          name: 'variant',
          type: 'relationship',
          admin: {
            description: 'The page variant for this test arm',
          },
          relationTo: 'page-variants',
          required: true,
        },
        {
          name: 'trafficPercent',
          type: 'number',
          admin: {
            description: 'Percentage of traffic to send to this variant (0-100)',
          },
          max: 100,
          min: 0,
          required: true,
        },
      ],
      minRows: 2,
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      admin: {
        description: 'Experiment lifecycle state',
      },
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Running', value: 'running' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        description: 'When experiment activates (optional, null = manual activation)',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'When experiment ends (optional, null = no auto-end)',
      },
    },
  ],
  hooks: {
    beforeChange: [validateExperiment],
  },
}
