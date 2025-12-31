/**
 * Check Registry Sync
 *
 * Compares the on-disk block-registry.json with a freshly generated version.
 * Used by CI to detect when someone updates registry.ts but forgets to
 * regenerate the JSON artifact.
 *
 * Exit codes:
 * - 0: Registry is in sync
 * - 1: Registry drift detected (regeneration needed)
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'

import { generateRegistrySchema } from './schema.js'

const REGISTRY_PATH = resolve(process.cwd(), 'dev/block-registry.json')

try {
  // Load existing registry from disk
  const diskContent = readFileSync(REGISTRY_PATH, 'utf-8')
  const diskRegistry = JSON.parse(diskContent)

  // Generate fresh registry from code
  const freshRegistry = generateRegistrySchema()

  // Compare blocks (ignore generatedAt timestamp which always differs)
  const diskBlocks = JSON.stringify(diskRegistry.blocks, null, 2)
  const freshBlocks = JSON.stringify(freshRegistry.blocks, null, 2)

  if (diskBlocks !== freshBlocks) {
    console.error('❌ Registry drift detected!')
    console.error('')
    console.error('The on-disk block-registry.json does not match the current registry.ts.')
    console.error('This happens when you modify registry.ts without regenerating the JSON.')
    console.error('')
    console.error('To fix, run:')
    console.error('  pnpm generate:registry')
    console.error('')
    process.exit(1)
  }

  // Also check version
  if (diskRegistry.version !== freshRegistry.version) {
    console.error('❌ Registry version mismatch!')
    console.error(`Disk: ${diskRegistry.version}, Code: ${freshRegistry.version}`)
    console.error('')
    console.error('Run: pnpm generate:registry')
    process.exit(1)
  }

  console.log('✓ Registry sync: OK')
  console.log(`  Blocks: ${freshRegistry.blocks.length}`)
  console.log(`  Version: ${freshRegistry.version}`)
  process.exit(0)
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
    console.error('❌ block-registry.json not found!')
    console.error('')
    console.error('Generate it with:')
    console.error('  pnpm generate:registry')
    process.exit(1)
  }
  console.error('❌ Error checking registry:', error)
  process.exit(1)
}
