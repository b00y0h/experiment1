import React from 'react'

import type { Page } from '../payload-types.js'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Union type for all block types that can appear in Page sections.
 * Hero blocks come from page.hero array, content blocks from page.content,
 * and footer blocks from page.footer array.
 */
type HeroBlock = NonNullable<Page['hero']>[number]
type ContentBlock = NonNullable<Page['content']>[number]
type FooterBlock = NonNullable<Page['footer']>[number]

/**
 * Combined union of all renderable block types
 */
export type RenderableBlock = ContentBlock | FooterBlock | HeroBlock

/**
 * Extract blockType literals from the union for type-safe mapping
 */
export type BlockType = RenderableBlock['blockType']

/**
 * Map of blockType slugs to their React components
 */
export type BlockComponentMap = {
  [K in BlockType]: React.ComponentType<Extract<RenderableBlock, { blockType: K }>>
}

// =============================================================================
// PLACEHOLDER COMPONENTS
// These are simple preview components showing block type and data.
// Phase 18 will enforce real UI components to be created.
// =============================================================================

/**
 * Placeholder for Hero Block
 */
function HeroBlockPlaceholder(props: Extract<RenderableBlock, { blockType: 'heroBlock' }>) {
  return (
    <div data-block-type="heroBlock" style={{ border: '2px solid #3b82f6', margin: '0.5rem 0', padding: '1rem' }}>
      <div style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '0.5rem' }}>Hero Block</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{props.headline}</div>
      {props.subheadline && <div style={{ color: '#666', marginTop: '0.25rem' }}>{props.subheadline}</div>}
      {props.cta?.ctaText && (
        <div style={{ background: '#3b82f6', color: 'white', display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.5rem' }}>
          {props.cta.ctaText}
        </div>
      )}
    </div>
  )
}
HeroBlockPlaceholder.displayName = 'HeroBlockPlaceholder'

/**
 * Placeholder for Content Block
 */
function ContentBlockPlaceholder(props: Extract<RenderableBlock, { blockType: 'contentBlock' }>) {
  return (
    <div data-block-type="contentBlock" style={{ border: '2px solid #10b981', margin: '0.5rem 0', padding: '1rem' }}>
      <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem' }}>Content Block</div>
      <div style={{ color: '#666' }}>
        {props.body ? '[Rich text content]' : '[No content]'}
      </div>
    </div>
  )
}
ContentBlockPlaceholder.displayName = 'ContentBlockPlaceholder'

/**
 * Placeholder for Accordion Block
 */
function AccordionBlockPlaceholder(props: Extract<RenderableBlock, { blockType: 'accordionBlock' }>) {
  return (
    <div data-block-type="accordionBlock" style={{ border: '2px solid #f59e0b', margin: '0.5rem 0', padding: '1rem' }}>
      <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.5rem' }}>Accordion Block</div>
      <div style={{ color: '#666' }}>
        {props.items?.length ?? 0} accordion item(s)
      </div>
      {props.items?.map((item: { id?: null | string; title: string }, i: number) => (
        <div key={item.id ?? i} style={{ borderBottom: '1px solid #ddd', padding: '0.25rem 0' }}>
          {item.title}
        </div>
      ))}
    </div>
  )
}
AccordionBlockPlaceholder.displayName = 'AccordionBlockPlaceholder'

/**
 * Placeholder for FAQ Block
 */
function FaqBlockPlaceholder(props: Extract<RenderableBlock, { blockType: 'faqBlock' }>) {
  return (
    <div data-block-type="faqBlock" style={{ border: '2px solid #8b5cf6', margin: '0.5rem 0', padding: '1rem' }}>
      <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '0.5rem' }}>FAQ Block</div>
      <div style={{ color: '#666' }}>
        {props.items?.length ?? 0} question(s)
      </div>
      {props.items?.map((item: { id?: null | string; question: string }, i: number) => (
        <div key={item.id ?? i} style={{ borderBottom: '1px solid #ddd', padding: '0.25rem 0' }}>
          Q: {item.question}
        </div>
      ))}
    </div>
  )
}
FaqBlockPlaceholder.displayName = 'FaqBlockPlaceholder'

/**
 * Placeholder for Stats Block
 */
function StatsBlockPlaceholder(props: Extract<RenderableBlock, { blockType: 'statsBlock' }>) {
  return (
    <div data-block-type="statsBlock" style={{ border: '2px solid #ec4899', margin: '0.5rem 0', padding: '1rem' }}>
      <div style={{ color: '#ec4899', fontWeight: 'bold', marginBottom: '0.5rem' }}>Stats Block</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {props.items?.map((item: { id?: null | string; label: string; value: string }, i: number) => (
          <div key={item.id ?? i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{item.value}</div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
StatsBlockPlaceholder.displayName = 'StatsBlockPlaceholder'

/**
 * Placeholder for Footer Block
 */
function FooterBlockPlaceholder(props: Extract<RenderableBlock, { blockType: 'footerBlock' }>) {
  return (
    <div data-block-type="footerBlock" style={{ border: '2px solid #6b7280', margin: '0.5rem 0', padding: '1rem' }}>
      <div style={{ color: '#6b7280', fontWeight: 'bold', marginBottom: '0.5rem' }}>Footer Block</div>
      <div style={{ color: '#666' }}>{props.text || '[No text]'}</div>
    </div>
  )
}
FooterBlockPlaceholder.displayName = 'FooterBlockPlaceholder'

/**
 * Placeholder for Reusable Block Reference
 * Note: In normal usage, reusableBlockRef should be resolved before rendering.
 * This placeholder handles cases where resolution hasn't occurred.
 */
function ReusableBlockRefPlaceholder(props: Extract<RenderableBlock, { blockType: 'reusableBlockRef' }>) {
  const blockId = typeof props.block === 'string' ? props.block : props.block?.id
  return (
    <div data-block-type="reusableBlockRef" style={{ border: '2px dashed #9ca3af', margin: '0.5rem 0', padding: '1rem' }}>
      <div style={{ color: '#9ca3af', fontWeight: 'bold', marginBottom: '0.5rem' }}>Reusable Block Reference</div>
      <div style={{ color: '#666' }}>
        References block: {blockId ?? 'unknown'}
      </div>
      <div style={{ color: '#f97316', fontSize: '0.75rem', marginTop: '0.25rem' }}>
        (Should be resolved before rendering)
      </div>
    </div>
  )
}
ReusableBlockRefPlaceholder.displayName = 'ReusableBlockRefPlaceholder'

// =============================================================================
// UNKNOWN BLOCK FALLBACK
// =============================================================================

/**
 * Props for UnknownBlock component
 */
export interface UnknownBlockProps {
  block: { [key: string]: unknown; blockType: string }
}

/**
 * Fallback component for unrecognized block types.
 * Renders block data as JSON with warning styling.
 * Logs warning to console in development.
 */
export function UnknownBlock({ block }: UnknownBlockProps) {
  // Log warning in development
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[renderBlock] Unknown blockType: "${block.blockType}"`, block)
  }

  return (
    <div
      data-block-type="unknown"
      style={{
        background: '#fef2f2',
        border: '2px solid #ef4444',
        margin: '0.5rem 0',
        padding: '1rem',
      }}
    >
      <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Unknown Block: {block.blockType}
      </div>
      <pre style={{ fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto' }}>
        {JSON.stringify(block, null, 2)}
      </pre>
    </div>
  )
}
UnknownBlock.displayName = 'UnknownBlock'

// =============================================================================
// RENDER BLOCK DISPATCH FUNCTION
// =============================================================================


/**
 * Dispatches a block to its corresponding React component based on blockType.
 * Uses TypeScript exhaustive checking to ensure all block types are handled.
 *
 * @param block - The block data to render
 * @returns React node for the block, or UnknownBlock for unrecognized types
 *
 * @example
 * ```tsx
 * // Render all content blocks
 * {page.content?.map((block) => (
 *   <React.Fragment key={block.id}>
 *     {renderBlock(block)}
 *   </React.Fragment>
 * ))}
 * ```
 */
export function renderBlock(block: RenderableBlock): React.ReactNode {
  switch (block.blockType) {
    case 'accordionBlock':
      return <AccordionBlockPlaceholder {...block} />

    case 'contentBlock':
      return <ContentBlockPlaceholder {...block} />

    case 'faqBlock':
      return <FaqBlockPlaceholder {...block} />

    case 'footerBlock':
      return <FooterBlockPlaceholder {...block} />

    case 'heroBlock':
      return <HeroBlockPlaceholder {...block} />

    case 'reusableBlockRef':
      return <ReusableBlockRefPlaceholder {...block} />

    case 'statsBlock':
      return <StatsBlockPlaceholder {...block} />

    default: {
      // Exhaustive check - TypeScript errors if a blockType case is missing
      // We use a type assertion pattern: if all cases are covered, 'block' is 'never'
      // If a case is missing, this line will have a type error showing which type is unhandled
      const _exhaustiveCheck: never = block
      // At runtime, this should never be reached, but provides safety
      throw new Error(`Unhandled block type: ${(_exhaustiveCheck as RenderableBlock).blockType}`)
    }
  }
}

/**
 * Renders a block with runtime safety for unknown types.
 * Use this when the block type may not be in the known union
 * (e.g., data from external sources or older schema versions).
 *
 * @param block - The block data to render (may have unknown blockType)
 * @returns React node for the block, or UnknownBlock for unrecognized types
 */
export function renderBlockSafe(block: { [key: string]: unknown; blockType: string }): React.ReactNode {
  const knownTypes = ['heroBlock', 'contentBlock', 'accordionBlock', 'faqBlock', 'statsBlock', 'footerBlock', 'reusableBlockRef'] as const

  if (knownTypes.includes(block.blockType as typeof knownTypes[number])) {
    return renderBlock(block as RenderableBlock)
  }

  return <UnknownBlock block={block} />
}

/**
 * Get the placeholder component for a specific block type.
 * Useful for testing and introspection.
 */
export function getBlockComponent(blockType: BlockType): React.ComponentType<unknown> {
  const components: Record<BlockType, React.ComponentType<unknown>> = {
    accordionBlock: AccordionBlockPlaceholder as React.ComponentType<unknown>,
    contentBlock: ContentBlockPlaceholder as React.ComponentType<unknown>,
    faqBlock: FaqBlockPlaceholder as React.ComponentType<unknown>,
    footerBlock: FooterBlockPlaceholder as React.ComponentType<unknown>,
    heroBlock: HeroBlockPlaceholder as React.ComponentType<unknown>,
    reusableBlockRef: ReusableBlockRefPlaceholder as React.ComponentType<unknown>,
    statsBlock: StatsBlockPlaceholder as React.ComponentType<unknown>,
  }

  return components[blockType]
}
