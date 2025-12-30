import type { PayloadHandler } from 'payload'

import { resolvePageBlocks } from '../utils/resolvePageBlocks.js'

/**
 * Custom REST endpoint handler for fetching resolved pages.
 *
 * URL: GET /api/pages/:slug/resolved
 *
 * This endpoint fetches a page by slug with depth: 2 (to populate nested reusable blocks),
 * then resolves all reusableBlockRef blocks to their actual content using resolvePageBlocks.
 *
 * Responses:
 * - 200: Resolved page data
 * - 400: Missing slug parameter
 * - 404: Page not found
 */
export const resolvedPageHandler: PayloadHandler = async (req) => {
  const { payload, routeParams } = req

  // Extract slug from route params
  const slug = routeParams?.slug as string | undefined

  if (!slug) {
    return Response.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

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
    return Response.json({ error: 'Page not found' }, { status: 404 })
  }

  // Resolve reusableBlockRef blocks to actual content
  const resolvedPage = resolvePageBlocks(docs[0])

  return Response.json(resolvedPage)
}
