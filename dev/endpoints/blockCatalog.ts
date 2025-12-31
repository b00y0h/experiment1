import type { PayloadHandler } from 'payload'

import { generateRegistrySchema } from '../blocks/schema.js'

/**
 * Custom REST endpoint handler for fetching the block catalog.
 *
 * URL: GET /api/blocks/catalog
 *
 * This endpoint returns a machine-readable JSON catalog of all available blocks
 * with their field metadata. Designed for AI agents and external tooling to
 * discover block structure and constraints.
 *
 * Responses:
 * - 200: Block catalog JSON with all registered blocks
 */
export const blockCatalogHandler: PayloadHandler = () => {
  const schema = generateRegistrySchema()

  return Response.json(schema, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
    status: 200,
  })
}
