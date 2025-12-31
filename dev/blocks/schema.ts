import type { Block, Field, RelationshipField, SelectField } from 'payload'

import { blockRegistry } from './registry'

// =============================================================================
// SCHEMA TYPES
// Types describing the machine-readable registry artifact
// =============================================================================

/**
 * Describes a field in the block schema.
 * Simplified representation for frontend/AI consumption.
 */
export type BlockSchemaField = {
  /** Field label (from config or derived from name) */
  label?: string
  /** Field name */
  name: string
  /** For array fields: nested field schemas */
  nestedFields?: BlockSchemaField[]
  /** For select fields: available options */
  options?: Array<{ label: string; value: string }>
  /** For relationship fields: collection name */
  relationTo?: string
  /** Whether field is required */
  required?: boolean
  /** Field type (text, textarea, richText, array, group, relationship, upload, select) */
  type: string
}

/**
 * Describes a block in the registry schema.
 */
export type BlockSchema = {
  /** Sections where this block can be used */
  allowedSections: string[]
  /** Field definitions for this block */
  fields: BlockSchemaField[]
  /** Human-readable label */
  label: string
  /** Block slug/identifier */
  slug: string
}

/**
 * Complete registry schema output.
 */
export type RegistrySchema = {
  /** All block schemas */
  blocks: BlockSchema[]
  /** ISO timestamp when generated */
  generatedAt: string
  /** Schema version */
  version: string
}

// =============================================================================
// FIELD EXTRACTION
// =============================================================================

/**
 * Extracts schema field representation from a Payload field config.
 * Handles nested fields for groups and arrays.
 */
function extractField(field: Field): BlockSchemaField | null {
  // Skip settings group (internal, not needed for frontend)
  if ('name' in field && field.name === 'settings') {
    return null
  }

  const baseField: BlockSchemaField = {
    name: 'name' in field ? field.name : 'unknown',
    type: field.type,
  }

  // Add label if present
  if ('label' in field && typeof field.label === 'string') {
    baseField.label = field.label
  }

  // Add required if true
  if ('required' in field && field.required) {
    baseField.required = true
  }

  // Handle type-specific properties
  switch (field.type) {
    case 'array': {
      const arrayField = field
      const nestedFields = arrayField.fields
        .map((f) => extractField(f))
        .filter((f): f is BlockSchemaField => f !== null)
      if (nestedFields.length > 0) {
        baseField.nestedFields = nestedFields
      }
      break
    }
    case 'group': {
      const groupField = field
      const nestedFields = groupField.fields
        .map((f) => extractField(f))
        .filter((f): f is BlockSchemaField => f !== null)
      if (nestedFields.length > 0) {
        baseField.nestedFields = nestedFields
      }
      break
    }
    case 'relationship': {
      const relField = field as RelationshipField
      if (typeof relField.relationTo === 'string') {
        baseField.relationTo = relField.relationTo
      } else if (Array.isArray(relField.relationTo)) {
        baseField.relationTo = relField.relationTo.join(',')
      }
      break
    }
    case 'select': {
      const selectField = field as SelectField
      if (Array.isArray(selectField.options)) {
        baseField.options = selectField.options.map((opt) => {
          if (typeof opt === 'string') {
            return { label: opt, value: opt }
          }
          return { label: opt.label, value: opt.value }
        })
      }
      break
    }
    case 'upload': {
      // Upload fields have relationTo for the media collection
      const uploadField = field as RelationshipField
      if (typeof uploadField.relationTo === 'string') {
        baseField.relationTo = uploadField.relationTo
      }
      break
    }
  }

  return baseField
}

/**
 * Extracts all fields from a block config.
 */
function extractBlockFields(block: Block): BlockSchemaField[] {
  return block.fields.map((f) => extractField(f)).filter((f): f is BlockSchemaField => f !== null)
}

// =============================================================================
// SCHEMA GENERATION
// =============================================================================

/**
 * Generates the complete registry schema from the block registry.
 * Iterates over all registered blocks and extracts their field metadata.
 */
export function generateRegistrySchema(): RegistrySchema {
  const blocks: BlockSchema[] = []

  for (const entry of Object.values(blockRegistry)) {
    const block = entry.factory()
    const fields = extractBlockFields(block)

    blocks.push({
      slug: entry.slug,
      allowedSections: entry.allowedSections,
      fields,
      label: entry.label,
    })
  }

  // Sort blocks alphabetically by slug for consistent output
  blocks.sort((a, b) => a.slug.localeCompare(b.slug))

  return {
    blocks,
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
  }
}
