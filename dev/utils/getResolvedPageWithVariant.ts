import type { Payload } from 'payload'

import type { ResolvedPageWithVariant } from './resolvePageWithVariant.js'

import { resolvePageBlocks } from './resolvePageBlocks.js'
import { resolvePageWithVariant } from './resolvePageWithVariant.js'

/**
 * Local API helper to fetch and resolve a page by slug with a variant applied.
 *
 * This function provides a clean interface for Next.js App Router server components
 * to fetch fully-resolved page data with variant overrides.
 *
 * Usage:
 * ```typescript
 * const page = await getResolvedPageWithVariant(payload, params.slug, params.variantId)
 * if (!page) notFound()
 * ```
 *
 * Returns null if:
 * - Page not found by slug
 * - Variant not found by id
 * - Variant doesn't belong to the specified page
 *
 * @param payload - The Payload instance
 * @param slug - The page slug to fetch
 * @param variantId - The variant id to apply
 * @returns The resolved page with variant overrides, or null if not found/invalid
 */
export async function getResolvedPageWithVariant(
  payload: Payload,
  slug: string,
  variantId: string,
): Promise<null | ResolvedPageWithVariant> {
  // Query pages collection for the requested slug
  const { docs: pages } = await payload.find({
    collection: 'pages',
    depth: 2, // Populate nested reusable blocks
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  if (pages.length === 0) {
    return null
  }

  const page = pages[0]

  // Fetch the variant by id
  const variant = await payload.findByID({
    id: variantId,
    collection: 'page-variants',
    depth: 2, // Populate nested reusable blocks in content overrides
  }).catch(() => null)

  if (!variant) {
    return null
  }

  // Verify variant belongs to this page
  const variantPageId = typeof variant.page === 'object' ? variant.page.id : variant.page
  if (variantPageId !== page.id) {
    return null
  }

  // Resolve the page blocks first
  const resolvedPage = resolvePageBlocks(page)

  // Apply variant overrides and return
  return resolvePageWithVariant(resolvedPage, variant)
}
