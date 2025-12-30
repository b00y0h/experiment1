import type { Payload } from 'payload'

import type { ResolvedPageWithVariant } from './resolvePageWithVariant.js'

import { assignVariantByTraffic, type VariantAllocation } from './assignVariant.js'
import { getResolvedPageWithVariant } from './getResolvedPageWithVariant.js'

/**
 * Result of getting an assigned variant for a visitor.
 */
export type AssignedVariantResult = {
  /** The ID of the experiment */
  experimentId: string
  /** The resolved page with variant overrides applied */
  resolvedPage: ResolvedPageWithVariant
  /** The ID of the assigned variant */
  variantId: string
  /** The visitor ID used for assignment */
  visitorId: string
}

/**
 * Finds a running experiment for a page and assigns the visitor to a variant.
 *
 * This function:
 * 1. Queries for running experiments targeting the specified page
 * 2. If no running experiment exists, returns null
 * 3. Uses deterministic hashing to assign the visitor to a variant
 * 4. Returns the resolved page with the assigned variant's overrides applied
 *
 * @param params - Parameters for variant assignment
 * @param params.payload - The Payload instance
 * @param params.visitorId - Unique visitor identifier
 * @param params.pageSlug - The page slug to find experiments for
 * @returns The assigned variant result, or null if no running experiment exists
 *
 * @example
 * const result = await getAssignedVariant({
 *   payload,
 *   visitorId: 'visitor_abc123',
 *   pageSlug: 'homepage',
 * })
 *
 * if (result) {
 *   // Render result.resolvedPage with variant overrides applied
 *   console.log(`Assigned to variant ${result.variantId} in experiment ${result.experimentId}`)
 * } else {
 *   // No running experiment, render base page
 * }
 */
export async function getAssignedVariant(params: {
  pageSlug: string
  payload: Payload
  visitorId: string
}): Promise<AssignedVariantResult | null> {
  const { pageSlug, payload, visitorId } = params

  // First, find the page by slug to get its ID
  const { docs: pages } = await payload.find({
    collection: 'pages',
    depth: 0,
    where: {
      slug: { equals: pageSlug },
    },
  })

  if (pages.length === 0) {
    return null
  }

  const page = pages[0]

  // Query for running experiments targeting this page
  const { docs: experiments } = await payload.find({
    collection: 'experiments',
    depth: 1, // Populate variant relationships
    where: {
      and: [{ page: { equals: page.id } }, { status: { equals: 'running' } }],
    },
  })

  if (experiments.length === 0) {
    return null
  }

  // Use first running experiment (log warning if multiple)
  const experiment = experiments[0]
  if (experiments.length > 1) {
    // eslint-disable-next-line no-console
    console.warn(
      `Multiple running experiments found for page "${pageSlug}". Using first one: ${experiment.id}`,
    )
  }

  // Map experiment variants to VariantAllocation format
  const variants = experiment.variants || []
  const allocations: VariantAllocation[] = variants.map((v) => {
    // Handle both populated and unpopulated variant references
    const variantId = typeof v.variant === 'object' && v.variant ? v.variant.id : v.variant
    return {
      trafficPercent: v.trafficPercent || 0,
      variantId: String(variantId),
    }
  })

  if (allocations.length === 0) {
    throw new Error(`Experiment ${experiment.id} has no variants`)
  }

  // Get deterministic variant assignment
  const assignment = assignVariantByTraffic({
    experimentId: String(experiment.id),
    variants: allocations,
    visitorId,
  })

  // Fetch the resolved page with the assigned variant applied
  const resolvedPage = await getResolvedPageWithVariant(payload, pageSlug, assignment.variantId)

  if (!resolvedPage) {
    throw new Error(
      `Variant ${assignment.variantId} not found or does not belong to page "${pageSlug}"`,
    )
  }

  return {
    experimentId: String(experiment.id),
    resolvedPage,
    variantId: assignment.variantId,
    visitorId,
  }
}
