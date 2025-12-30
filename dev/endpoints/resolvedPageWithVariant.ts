import type { PayloadHandler } from 'payload'

import { resolvePageBlocks } from '../utils/resolvePageBlocks.js'
import { resolvePageWithVariant } from '../utils/resolvePageWithVariant.js'

/**
 * Custom REST endpoint handler for fetching resolved pages with variant overrides.
 *
 * URL: GET /api/pages/:slug/variants/:variantId/preview
 *
 * This endpoint fetches a page by slug and a variant by id, verifies the variant
 * belongs to the page, then applies the variant overrides to the resolved page.
 *
 * Responses:
 * - 200: Resolved page with variant overrides applied
 * - 400: Missing slug/variantId parameter, or variant doesn't belong to this page
 * - 404: Page or variant not found
 */
export const resolvedPageWithVariantHandler: PayloadHandler = async (req) => {
  const { payload, routeParams } = req

  // Extract params from route
  const slug = routeParams?.slug as string | undefined
  const variantId = routeParams?.variantId as string | undefined

  if (!slug) {
    return Response.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  if (!variantId) {
    return Response.json({ error: 'Missing variantId parameter' }, { status: 400 })
  }

  // Fetch the page by slug
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
    return Response.json({ error: 'Page not found' }, { status: 404 })
  }

  const page = pages[0]

  // Fetch the variant by id
  const variant = await payload.findByID({
    id: variantId,
    collection: 'page-variants',
    depth: 2, // Populate nested reusable blocks in content overrides
  }).catch(() => null)

  if (!variant) {
    return Response.json({ error: 'Variant not found' }, { status: 404 })
  }

  // Verify variant belongs to this page
  const variantPageId = typeof variant.page === 'object' ? variant.page.id : variant.page
  if (variantPageId !== page.id) {
    return Response.json(
      { error: 'Variant does not belong to this page' },
      { status: 400 },
    )
  }

  // Resolve the page blocks first
  const resolvedPage = resolvePageBlocks(page)

  // Apply variant overrides
  const resolvedPageWithVariantOverrides = resolvePageWithVariant(resolvedPage, variant)

  return Response.json(resolvedPageWithVariantOverrides)
}
