import type { Payload } from 'payload'

import { type ResolvedPage, resolvePageBlocks } from './resolvePageBlocks.js'

/**
 * Local API helper to fetch and resolve a page by slug.
 *
 * This function provides a clean interface for Next.js App Router server components
 * to fetch fully-resolved page data.
 *
 * Usage:
 * ```typescript
 * const page = await getResolvedPage(payload, params.slug)
 * if (!page) notFound()
 * ```
 *
 * @param payload - The Payload instance
 * @param slug - The page slug to fetch
 * @returns The resolved page with all reusableBlockRef blocks replaced, or null if not found
 */
export async function getResolvedPage(
  payload: Payload,
  slug: string,
): Promise<null | ResolvedPage> {
  // Query pages collection for the requested slug
  const { docs } = await payload.find({
    collection: 'pages',
    depth: 2, // Populate nested reusable blocks
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  if (docs.length === 0) {
    return null
  }

  // Resolve reusableBlockRef blocks to actual content
  return resolvePageBlocks(docs[0])
}
