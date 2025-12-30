/**
 * Represents a variant's traffic allocation in an experiment.
 */
export type VariantAllocation = {
  /** Percentage of traffic to send to this variant (0-100) */
  trafficPercent: number
  /** Unique identifier for the variant */
  variantId: string
}

/**
 * Result of variant assignment.
 */
export type AssignmentResult = {
  /** The hash bucket (0-99) the visitor was assigned to */
  bucket: number
  /** The assigned variant ID */
  variantId: string
}

/**
 * Creates a deterministic hash bucket (0-99) from a string.
 * Uses a simple but effective string hashing algorithm suitable for A/B bucketing.
 *
 * @param input - String to hash (typically visitorId + experimentId)
 * @returns Number between 0 and 99 inclusive
 */
function hashToBucket(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    // Multiply by position (i+1) to differentiate anagrams
    // Use prime number multiplication for better distribution
    hash = (hash * 31 + input.charCodeAt(i) * (i + 1)) >>> 0
  }
  return hash % 100
}

/**
 * Assigns a visitor to a variant based on traffic allocation percentages.
 *
 * This function is deterministic: the same visitorId + experimentId combination
 * will always return the same variant. Different visitors will be distributed
 * according to the traffic percentages.
 *
 * @param params - Assignment parameters
 * @param params.visitorId - Unique visitor identifier
 * @param params.experimentId - Unique experiment identifier
 * @param params.variants - Array of variant allocations with traffic percentages
 * @returns The assigned variant ID and bucket number
 *
 * @example
 * // Equal split
 * const result = assignVariantByTraffic({
 *   visitorId: 'visitor_abc',
 *   experimentId: 'exp_123',
 *   variants: [
 *     { variantId: 'A', trafficPercent: 50 },
 *     { variantId: 'B', trafficPercent: 50 },
 *   ],
 * })
 * // Visitor in bucket 0-49 gets 'A', bucket 50-99 gets 'B'
 *
 * @example
 * // Unequal split
 * const result = assignVariantByTraffic({
 *   visitorId: 'visitor_xyz',
 *   experimentId: 'exp_456',
 *   variants: [
 *     { variantId: 'control', trafficPercent: 70 },
 *     { variantId: 'treatment', trafficPercent: 30 },
 *   ],
 * })
 * // Visitor in bucket 0-69 gets 'control', bucket 70-99 gets 'treatment'
 *
 * @throws Error if variants array is empty
 */
export function assignVariantByTraffic(params: {
  experimentId: string
  variants: VariantAllocation[]
  visitorId: string
}): AssignmentResult {
  const { experimentId, variants, visitorId } = params

  if (variants.length === 0) {
    throw new Error('Variants array cannot be empty')
  }

  // Create deterministic hash from visitorId + experimentId
  const hashInput = `${visitorId}:${experimentId}`
  const bucket = hashToBucket(hashInput)

  // Walk through variants, accumulating traffic percentages
  let cumulativePercent = 0
  for (const variant of variants) {
    cumulativePercent += variant.trafficPercent
    if (bucket < cumulativePercent) {
      return {
        bucket,
        variantId: variant.variantId,
      }
    }
  }

  // Fallback to last variant (handles rounding edge cases)
  return {
    bucket,
    variantId: variants[variants.length - 1].variantId,
  }
}
