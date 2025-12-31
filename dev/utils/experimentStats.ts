import type { Payload } from 'payload'

/**
 * Metrics for a single variant in an experiment.
 */
export type VariantMetrics = {
  /** Conversion rate as percentage (0-100) */
  conversionRate: number
  /** Total number of conversions for this variant */
  conversions: number
  /** Total number of impressions for this variant */
  impressions: number
  /** Variant ID */
  variantId: string
  /** Variant name (if available) */
  variantName?: string
}

/**
 * Statistics for a single experiment.
 */
export type ExperimentStats = {
  /** Experiment ID */
  experimentId: string
  /** Experiment name */
  experimentName: string
  /** Experiment status */
  status: string
  /** Metrics for each variant in the experiment */
  variants: VariantMetrics[]
  /** ID of the variant with the highest conversion rate (if any conversions exist) */
  winningVariantId?: string
}

/**
 * Calculates experiment statistics from analytics events.
 *
 * This function:
 * 1. Queries experiments with status 'running' or 'paused'
 * 2. For each experiment, aggregates analytics-events to calculate impressions and conversions per variant
 * 3. Calculates conversion rates and identifies winning variants
 *
 * @param payload - Payload instance
 * @returns Array of experiment statistics
 */
export async function calculateExperimentStats(payload: Payload): Promise<ExperimentStats[]> {
  // Query active experiments (running or paused)
  const { docs: experiments } = await payload.find({
    collection: 'experiments',
    depth: 1, // Populate variant references
    where: {
      status: { in: ['running', 'paused'] },
    },
  })

  const stats: ExperimentStats[] = []

  for (const experiment of experiments) {
    // Extract variant IDs from experiment
    const variantIds: string[] = []
    const variantNames: Record<string, string> = {}

    if (experiment.variants && Array.isArray(experiment.variants)) {
      for (const v of experiment.variants) {
        const variantRef = v.variant
        let variantId: string | undefined
        let variantName: string | undefined

        if (typeof variantRef === 'object' && variantRef !== null && 'id' in variantRef) {
          variantId = String(variantRef.id)
          variantName = (variantRef as { name?: string }).name
        } else if (variantRef) {
          variantId = String(variantRef)
        }

        if (variantId) {
          variantIds.push(variantId)
          if (variantName) {
            variantNames[variantId] = variantName
          }
        }
      }
    }

    // Query analytics events for this experiment
    const { docs: events } = await payload.find({
      collection: 'analytics-events',
      limit: 10000, // High limit to get all events
      where: {
        experiment: { equals: experiment.id },
      },
    })

    // Aggregate metrics per variant
    const variantMetrics: Record<string, { conversions: number; impressions: number }> = {}

    // Initialize metrics for all variants
    for (const variantId of variantIds) {
      variantMetrics[variantId] = { conversions: 0, impressions: 0 }
    }

    // Count events per variant
    for (const event of events) {
      const variantRef = event.variant
      let variantId: string | undefined

      if (typeof variantRef === 'object' && variantRef !== null && 'id' in variantRef) {
        variantId = String(variantRef.id)
      } else if (variantRef) {
        variantId = String(variantRef)
      }

      if (variantId && variantMetrics[variantId]) {
        if (event.eventType === 'impression') {
          variantMetrics[variantId].impressions++
        } else if (event.eventType === 'conversion') {
          variantMetrics[variantId].conversions++
        }
      }
    }

    // Calculate conversion rates and build variant metrics array
    const variants: VariantMetrics[] = []
    let winningVariantId: string | undefined
    let highestConversionRate = -1

    for (const variantId of variantIds) {
      const metrics = variantMetrics[variantId]
      const conversionRate =
        metrics.impressions > 0 ? (metrics.conversions / metrics.impressions) * 100 : 0

      variants.push({
        conversionRate,
        conversions: metrics.conversions,
        impressions: metrics.impressions,
        variantId,
        variantName: variantNames[variantId],
      })

      // Track winning variant (highest conversion rate with at least 1 conversion)
      if (metrics.conversions > 0 && conversionRate > highestConversionRate) {
        highestConversionRate = conversionRate
        winningVariantId = variantId
      }
    }

    stats.push({
      experimentId: String(experiment.id),
      experimentName: experiment.name,
      status: experiment.status || 'draft',
      variants,
      winningVariantId,
    })
  }

  return stats
}
