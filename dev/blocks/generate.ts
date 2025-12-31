/**
 * Script to generate the block registry JSON artifact.
 * Run with: pnpm generate:registry
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { generateRegistrySchema } from './schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUTPUT_PATH = path.join(__dirname, '..', 'block-registry.json')

function main(): void {
  console.log('Generating block registry schema...')

  const schema = generateRegistrySchema()

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(schema, null, 2))

  console.log(`✓ Generated ${schema.blocks.length} block schemas`)
  console.log(`✓ Output: ${OUTPUT_PATH}`)
}

main()
