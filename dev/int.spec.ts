import type { Payload } from 'payload'

import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { customEndpointHandler } from '../src/endpoints/customEndpointHandler.js'
import { resolvedPageHandler } from './endpoints/resolvedPage.js'
import { resolvedPageWithVariantHandler } from './endpoints/resolvedPageWithVariant.js'
import { assignVariantByTraffic } from './utils/assignVariant.js'
import { getAssignedVariant } from './utils/getAssignedVariant.js'
import { getResolvedPage } from './utils/getResolvedPage.js'
import { getResolvedPageWithVariant } from './utils/getResolvedPageWithVariant.js'
import { resolvePageBlocks } from './utils/resolvePageBlocks'
import { getOrCreateVisitorId, VISITOR_COOKIE_MAX_AGE, VISITOR_COOKIE_NAME } from './utils/visitorId.js'

let payload: Payload

afterAll(async () => {
  await payload.destroy()
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('Plugin integration tests', () => {
  test('should query custom endpoint added by plugin', async () => {
    const request = new Request('http://localhost:3000/api/my-plugin-endpoint', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await customEndpointHandler(payloadRequest)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toMatchObject({
      message: 'Hello from custom endpoint',
    })
  })

  test('can create post with custom text field added by plugin', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: {
        addedByPlugin: 'added by plugin',
      },
    })
    expect(post.addedByPlugin).toBe('added by plugin')
  })

  test('plugin creates and seeds plugin-collection', async () => {
    expect(payload.collections['plugin-collection']).toBeDefined()

    const { docs } = await payload.find({ collection: 'plugin-collection' })

    expect(docs).toHaveLength(1)
  })
})

describe('Pages collection', () => {
  test('can create page with hero block', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-hero-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Learn More',
            },
            headline: 'Welcome to Our Site',
            subheadline: 'This is a test subheadline',
          },
        ],
        title: 'Test Page with Hero',
      },
    })

    expect(page.title).toBe('Test Page with Hero')
    expect(page.slug).toBe('test-hero-page')
    expect(page.hero).toHaveLength(1)
    expect(page.hero?.[0]?.blockType).toBe('heroBlock')
    expect(page.hero?.[0]?.headline).toBe('Welcome to Our Site')
  })

  test('can create page with content blocks', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-content-page',
        content: [
          {
            blockType: 'contentBlock',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Test content', version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
          {
            blockType: 'accordionBlock',
            items: [
              {
                title: 'FAQ Item 1',
              },
            ],
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Get Started',
            },
            headline: 'Content Page Hero',
          },
        ],
        title: 'Test Page with Content',
      },
    })

    expect(page.content).toHaveLength(2)
    expect(page.content?.[0]?.blockType).toBe('contentBlock')
    expect(page.content?.[1]?.blockType).toBe('accordionBlock')
  })

  test('enforces unique slug constraint', async () => {
    await payload.create({
      collection: 'pages',
      data: {
        slug: 'duplicate-slug',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: '/signup',
              ctaText: 'Sign Up',
            },
            headline: 'First Page Hero',
          },
        ],
        title: 'First Page',
      },
    })

    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'duplicate-slug',
          hero: [
            {
              blockType: 'heroBlock',
              cta: {
                ctaLink: '/signup',
                ctaText: 'Sign Up',
              },
              headline: 'Second Page Hero',
            },
          ],
          title: 'Second Page',
        },
      }),
    ).rejects.toThrow()
  })

  test('can create page with FAQ block', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-faq-page',
        content: [
          {
            blockType: 'faqBlock',
            items: [
              {
                question: 'What is Payload CMS?',
              },
              {
                question: 'How do I get started?',
              },
            ],
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Get Started',
            },
            headline: 'FAQ Page Hero',
          },
        ],
        title: 'Test FAQ Page',
      },
    })

    expect(page.content).toHaveLength(1)
    expect(page.content?.[0]?.blockType).toBe('faqBlock')
    if (page.content?.[0]?.blockType === 'faqBlock') {
      expect(page.content[0].items).toHaveLength(2)
      expect(page.content[0].items?.[0]?.question).toBe('What is Payload CMS?')
    }
  })

  test('can create page with Stats block', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-stats-page',
        content: [
          {
            blockType: 'statsBlock',
            items: [
              {
                icon: 'star',
                label: 'Customer Satisfaction',
                value: '99%',
              },
              {
                label: 'Users Worldwide',
                value: '10M+',
              },
            ],
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'View Stats',
            },
            headline: 'Stats Page Hero',
          },
        ],
        title: 'Test Stats Page',
      },
    })

    expect(page.content).toHaveLength(1)
    expect(page.content?.[0]?.blockType).toBe('statsBlock')
    if (page.content?.[0]?.blockType === 'statsBlock') {
      expect(page.content[0].items).toHaveLength(2)
      expect(page.content[0].items?.[0]?.value).toBe('99%')
      expect(page.content[0].items?.[0]?.label).toBe('Customer Satisfaction')
      expect(page.content[0].items?.[0]?.icon).toBe('star')
    }
  })
})

describe('Pages blockId generation', () => {
  test('Pages: blocks get auto-generated blockId on create', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-blockid-create',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Test Hero for BlockId',
          },
        ],
        title: 'Test BlockId Create',
      },
    })

    expect(page.hero).toHaveLength(1)
    expect(page.hero?.[0]?.settings?.blockId).toBeDefined()
    expect(page.hero?.[0]?.settings?.blockId).toHaveLength(12)
  })

  test('Pages: blockId persists on update (not regenerated)', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-blockid-persist',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Original Headline',
          },
        ],
        title: 'Test BlockId Persist',
      },
    })

    const originalBlockId = page.hero?.[0]?.settings?.blockId
    expect(originalBlockId).toBeDefined()
    expect(originalBlockId).toHaveLength(12)

    // Update the page (change headline)
    const updatedPage = await payload.update({
      id: page.id,
      collection: 'pages',
      data: {
        hero: [
          {
            ...page.hero?.[0],
            blockType: 'heroBlock',
            headline: 'Updated Headline',
          },
        ],
      },
    })

    // Verify blockId is unchanged
    expect(updatedPage.hero?.[0]?.settings?.blockId).toBe(originalBlockId)
    expect(updatedPage.hero?.[0]?.headline).toBe('Updated Headline')
  })

  test('Pages: user-provided blockId is preserved', async () => {
    const customBlockId = 'custom-hero-id'
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-blockid-custom',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Custom BlockId Hero',
            settings: {
              blockId: customBlockId,
            },
          },
        ],
        title: 'Test Custom BlockId',
      },
    })

    expect(page.hero?.[0]?.settings?.blockId).toBe(customBlockId)
  })
})

describe('ReusableBlocks blockId generation', () => {
  test('ReusableBlocks: blocks get auto-generated blockId', async () => {
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'accordionBlock',
            items: [
              {
                title: 'Accordion Item for BlockId Test',
              },
            ],
          },
        ],
        blockType: 'accordion',
        title: 'Test ReusableBlocks BlockId',
      },
    })

    expect(reusableBlock.block).toHaveLength(1)
    expect(reusableBlock.block?.[0]?.settings?.blockId).toBeDefined()
    expect(reusableBlock.block?.[0]?.settings?.blockId).toHaveLength(12)
  })
})

describe('ReusableBlocks collection', () => {
  test('can create reusable accordion block', async () => {
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'accordionBlock',
            items: [
              {
                title: 'What is Payload CMS?',
              },
              {
                title: 'How do I install it?',
              },
            ],
          },
        ],
        blockType: 'accordion',
        title: 'FAQ Section',
      },
    })

    expect(reusableBlock.title).toBe('FAQ Section')
    expect(reusableBlock.blockType).toBe('accordion')
    expect(reusableBlock.block).toHaveLength(1)
    expect(reusableBlock.block?.[0]?.blockType).toBe('accordionBlock')
  })

  test('page can reference reusable block', async () => {
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'contentBlock',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Reusable content', version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
        blockType: 'content',
        title: 'Shared Footer Content',
      },
    })

    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'page-with-reusable',
        content: [
          {
            block: reusableBlock.id,
            blockType: 'reusableBlockRef',
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Reusable Block Test Hero',
          },
        ],
        title: 'Page with Reusable Block',
      },
    })

    expect(page.content).toHaveLength(1)
    expect(page.content?.[0]?.blockType).toBe('reusableBlockRef')
  })

  test('can query pages with populated reusable blocks', async () => {
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'footerBlock',
            text: 'Footer text content',
          },
        ],
        blockType: 'footer',
        title: 'Populated Test Block',
      },
    })

    await payload.create({
      collection: 'pages',
      data: {
        slug: 'page-population-test',
        content: [
          {
            block: reusableBlock.id,
            blockType: 'reusableBlockRef',
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Population Test Hero',
          },
        ],
        title: 'Page for Population Test',
      },
    })

    const { docs } = await payload.find({
      collection: 'pages',
      depth: 1,
      where: {
        slug: {
          equals: 'page-population-test',
        },
      },
    })

    expect(docs).toHaveLength(1)
    const page = docs[0]
    expect(page.content?.[0]?.blockType).toBe('reusableBlockRef')

    // With depth: 1, the relationship should be populated
    const blockRef = page.content?.[0]
    if (blockRef?.blockType === 'reusableBlockRef') {
      const populatedBlock = blockRef.block
      expect(typeof populatedBlock).toBe('object')
      if (typeof populatedBlock === 'object' && populatedBlock !== null) {
        expect(populatedBlock.title).toBe('Populated Test Block')
      }
    }
  })

  test('can create reusable FAQ block', async () => {
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'faqBlock',
            items: [
              {
                question: 'What is a reusable block?',
              },
              {
                question: 'How do I use it?',
              },
            ],
          },
        ],
        blockType: 'faq',
        title: 'Reusable FAQ Section',
      },
    })

    expect(reusableBlock.title).toBe('Reusable FAQ Section')
    expect(reusableBlock.blockType).toBe('faq')
    expect(reusableBlock.block).toHaveLength(1)
    expect(reusableBlock.block?.[0]?.blockType).toBe('faqBlock')
  })

  test('can create reusable Stats block', async () => {
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'statsBlock',
            items: [
              {
                icon: 'users',
                label: 'Happy Clients',
                value: '500+',
              },
              {
                label: 'Support',
                value: '24/7',
              },
            ],
          },
        ],
        blockType: 'stats',
        title: 'Company Stats',
      },
    })

    expect(reusableBlock.title).toBe('Company Stats')
    expect(reusableBlock.blockType).toBe('stats')
    expect(reusableBlock.block).toHaveLength(1)
    expect(reusableBlock.block?.[0]?.blockType).toBe('statsBlock')
  })
})

describe('Field validation', () => {
  test('rejects headline exceeding max length (100 chars)', async () => {
    const longHeadline = 'A'.repeat(101) // 101 characters

    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'test-long-headline',
          hero: [
            {
              blockType: 'heroBlock',
              cta: {
                ctaLink: 'https://example.com',
                ctaText: 'Test CTA',
              },
              headline: longHeadline,
            },
          ],
          title: 'Test Long Headline Page',
        },
      }),
    ).rejects.toThrow(/Headline/)
  })

  test('accepts headline at max length (100 chars)', async () => {
    const maxHeadline = 'A'.repeat(100) // Exactly 100 characters

    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-max-headline',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: maxHeadline,
          },
        ],
        title: 'Test Max Headline Page',
      },
    })

    expect(page.hero?.[0]?.headline).toBe(maxHeadline)
  })

  // Note: Incomplete CTA tests are now caught by page-level validation (conversion element required)
  // which runs before field-level CTA validation. Both validations reject the page, just with different
  // error messages. Testing that page is rejected correctly.
  test('rejects CTA with text but no link', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'test-incomplete-cta-text-only',
          hero: [
            {
              blockType: 'heroBlock',
              cta: {
                ctaText: 'Click Me',
                // ctaLink intentionally missing
              },
              headline: 'Test Hero',
            },
          ],
          title: 'Test Incomplete CTA',
        },
      }),
    ).rejects.toThrow(/hero/)
  })

  test('rejects CTA with link but no text', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'test-incomplete-cta-link-only',
          hero: [
            {
              blockType: 'heroBlock',
              cta: {
                ctaLink: 'https://example.com',
                // ctaText intentionally missing
              },
              headline: 'Test Hero',
            },
          ],
          title: 'Test Incomplete CTA Link Only',
        },
      }),
    ).rejects.toThrow(/hero/)
  })

  test('rejects invalid URL format in ctaLink', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'test-invalid-url',
          hero: [
            {
              blockType: 'heroBlock',
              cta: {
                ctaLink: 'not-a-valid-url',
                ctaText: 'Click Me',
              },
              headline: 'Test Hero',
            },
          ],
          title: 'Test Invalid URL',
        },
      }),
    ).rejects.toThrow(/Button URL/)
  })

  test('accepts valid CTA with both text and link', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-valid-cta',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Click Me',
            },
            headline: 'Test Hero with CTA',
          },
        ],
        title: 'Test Valid CTA Page',
      },
    })

    expect(page.hero?.[0]?.cta?.ctaText).toBe('Click Me')
    expect(page.hero?.[0]?.cta?.ctaLink).toBe('https://example.com')
  })

  test('accepts CTA with relative URL', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-relative-url',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: '/contact',
              ctaText: 'Contact Us',
            },
            headline: 'Test Relative URL',
          },
        ],
        title: 'Test Relative URL Page',
      },
    })

    expect(page.hero?.[0]?.cta?.ctaLink).toBe('/contact')
  })

  // Note: Empty CTA is no longer allowed at page level due to conversion element requirement.
  // The CTA group field validation still allows empty CTA (both fields empty or omitted),
  // but page-level validation requires at least one hero block with a complete CTA.

  test('rejects accordion with more than 20 items', async () => {
    const items = Array.from({ length: 21 }, (_, i) => ({
      title: `Item ${i + 1}`,
    }))

    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'test-accordion-max-items',
          content: [
            {
              blockType: 'accordionBlock',
              items,
            },
          ],
          hero: [
            {
              blockType: 'heroBlock',
              cta: {
                ctaLink: 'https://example.com',
                ctaText: 'Test CTA',
              },
              headline: 'Accordion Test Hero',
            },
          ],
          title: 'Test Accordion Max Items',
        },
      }),
    ).rejects.toThrow()
  })

  test('accepts accordion at max items (20)', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      title: `Item ${i + 1}`,
    }))

    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-accordion-20-items',
        content: [
          {
            blockType: 'accordionBlock',
            items,
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Accordion 20 Items Hero',
          },
        ],
        title: 'Test Accordion 20 Items',
      },
    })

    if (page.content?.[0]?.blockType === 'accordionBlock') {
      expect(page.content[0].items).toHaveLength(20)
    }
  })
})

describe('Page-level conversion element validation', () => {
  // Note: Payload wraps validation errors in generic format like "The following field is invalid: hero"
  // Tests verify the validation occurs by matching on the field path 'hero'

  test('rejects page without hero (no conversion element)', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'test-no-hero',
          title: 'Page Without Hero',
        },
      }),
    ).rejects.toThrow(/hero/)
  })

  test('rejects page with empty hero array', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'test-empty-hero',
          hero: [],
          title: 'Page With Empty Hero',
        },
      }),
    ).rejects.toThrow(/hero/)
  })

  test('rejects page with hero but no CTA fields', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'test-hero-no-cta',
          hero: [
            {
              blockType: 'heroBlock',
              headline: 'No CTA Hero',
            },
          ],
          title: 'Page With Hero But No CTA',
        },
      }),
    ).rejects.toThrow(/hero/)
  })

  test('rejects page with hero and empty CTA strings', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'test-hero-empty-cta',
          hero: [
            {
              blockType: 'heroBlock',
              cta: {
                ctaLink: '',
                ctaText: '',
              },
              headline: 'Empty CTA Hero',
            },
          ],
          title: 'Page With Hero Empty CTA',
        },
      }),
    ).rejects.toThrow(/hero/)
  })

  test('accepts page with valid conversion element (hero with CTA)', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-valid-conversion',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com/signup',
              ctaText: 'Sign Up Now',
            },
            headline: 'Valid Conversion Element',
          },
        ],
        title: 'Page With Valid Conversion Element',
      },
    })

    expect(page.slug).toBe('test-valid-conversion')
    expect(page.hero?.[0]?.cta?.ctaText).toBe('Sign Up Now')
    expect(page.hero?.[0]?.cta?.ctaLink).toBe('https://example.com/signup')
  })
})

describe('Page block resolution', () => {
  test('resolves reusableBlockRef to inline content block', async () => {
    // Create ReusableBlock with contentBlock
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'contentBlock',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Reusable content for resolution test', version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
        blockType: 'content',
        title: 'Content Block for Resolution Test',
      },
    })

    // Create Page with reusableBlockRef pointing to it
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-resolve-content-block',
        content: [
          {
            block: reusableBlock.id,
            blockType: 'reusableBlockRef',
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Resolution Test Hero',
          },
        ],
        title: 'Page for Content Block Resolution',
      },
    })

    // Fetch page with depth: 2 (to populate nested block)
    const { docs } = await payload.find({
      collection: 'pages',
      depth: 2,
      where: {
        id: { equals: page.id },
      },
    })

    const fetchedPage = docs[0]

    // Call resolvePageBlocks
    const resolvedPage = resolvePageBlocks(fetchedPage)

    // Verify content[0].blockType is 'contentBlock' (not 'reusableBlockRef')
    expect(resolvedPage.content).toHaveLength(1)
    expect(resolvedPage.content?.[0]?.blockType).toBe('contentBlock')

    // Verify content[0]._resolvedFrom equals ReusableBlock id
    expect(resolvedPage.content?.[0]?._resolvedFrom).toBe(reusableBlock.id)
  })

  test('resolves reusableBlockRef to inline accordion block', async () => {
    // Create ReusableBlock with accordionBlock containing items
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'accordionBlock',
            items: [
              { title: 'Accordion Item 1' },
              { title: 'Accordion Item 2' },
              { title: 'Accordion Item 3' },
            ],
          },
        ],
        blockType: 'accordion',
        title: 'Accordion Block for Resolution Test',
      },
    })

    // Create Page referencing it
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-resolve-accordion-block',
        content: [
          {
            block: reusableBlock.id,
            blockType: 'reusableBlockRef',
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Accordion Resolution Test Hero',
          },
        ],
        title: 'Page for Accordion Block Resolution',
      },
    })

    // Fetch with depth 2
    const { docs } = await payload.find({
      collection: 'pages',
      depth: 2,
      where: {
        id: { equals: page.id },
      },
    })

    const resolvedPage = resolvePageBlocks(docs[0])

    // Verify accordionBlock with items preserved
    expect(resolvedPage.content).toHaveLength(1)
    expect(resolvedPage.content?.[0]?.blockType).toBe('accordionBlock')

    if (resolvedPage.content?.[0]?.blockType === 'accordionBlock') {
      expect(resolvedPage.content[0].items).toHaveLength(3)
      expect(resolvedPage.content[0].items?.[0]?.title).toBe('Accordion Item 1')
      expect(resolvedPage.content[0].items?.[1]?.title).toBe('Accordion Item 2')
      expect(resolvedPage.content[0].items?.[2]?.title).toBe('Accordion Item 3')
    }

    expect(resolvedPage.content?.[0]?._resolvedFrom).toBe(reusableBlock.id)
  })

  test('preserves inline blocks alongside resolved blocks', async () => {
    // Create a reusable block
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'contentBlock',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Reusable content', version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
        blockType: 'content',
        title: 'Reusable for Mixed Test',
      },
    })

    // Create Page with mix of inline contentBlock AND reusableBlockRef
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-mixed-blocks',
        content: [
          {
            blockType: 'accordionBlock',
            items: [{ title: 'Inline Accordion Item' }],
          },
          {
            block: reusableBlock.id,
            blockType: 'reusableBlockRef',
          },
          {
            blockType: 'faqBlock',
            items: [{ question: 'Inline FAQ Question' }],
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Mixed Blocks Test Hero',
          },
        ],
        title: 'Page with Mixed Blocks',
      },
    })

    // Fetch with depth 2
    const { docs } = await payload.find({
      collection: 'pages',
      depth: 2,
      where: {
        id: { equals: page.id },
      },
    })

    const resolvedPage = resolvePageBlocks(docs[0])

    // Verify both blocks present with correct types
    expect(resolvedPage.content).toHaveLength(3)

    // First block: inline accordion (unchanged)
    expect(resolvedPage.content?.[0]?.blockType).toBe('accordionBlock')
    expect(resolvedPage.content?.[0]?._resolvedFrom).toBeUndefined()

    // Second block: resolved from reusableBlockRef to contentBlock
    expect(resolvedPage.content?.[1]?.blockType).toBe('contentBlock')
    expect(resolvedPage.content?.[1]?._resolvedFrom).toBe(reusableBlock.id)

    // Third block: inline FAQ (unchanged)
    expect(resolvedPage.content?.[2]?.blockType).toBe('faqBlock')
    expect(resolvedPage.content?.[2]?._resolvedFrom).toBeUndefined()
  })

  test('preserves blockId from reusableBlockRef settings', async () => {
    // Create a reusable block
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'contentBlock',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Content for blockId test', version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
        blockType: 'content',
        title: 'Reusable for BlockId Test',
      },
    })

    // Create Page with reusableBlockRef that has a specific blockId
    const customBlockId = 'custom-ref-id1'
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-blockid-preservation',
        content: [
          {
            block: reusableBlock.id,
            blockType: 'reusableBlockRef',
            settings: {
              blockId: customBlockId,
            },
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'BlockId Preservation Test Hero',
          },
        ],
        title: 'Page for BlockId Preservation',
      },
    })

    // Fetch with depth 2
    const { docs } = await payload.find({
      collection: 'pages',
      depth: 2,
      where: {
        id: { equals: page.id },
      },
    })

    const resolvedPage = resolvePageBlocks(docs[0])

    // Verify the resolved block has the original reusableBlockRef's settings.blockId
    expect(resolvedPage.content).toHaveLength(1)
    expect(resolvedPage.content?.[0]?.blockType).toBe('contentBlock')
    expect(resolvedPage.content?.[0]?.settings?.blockId).toBe(customBlockId)
  })

  test('handles unpopulated reusableBlockRef gracefully', async () => {
    // Create a reusable block
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'contentBlock',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Content for unpopulated test', version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
        blockType: 'content',
        title: 'Reusable for Unpopulated Test',
      },
    })

    // Create Page with reusableBlockRef
    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-unpopulated-ref',
        content: [
          {
            block: reusableBlock.id,
            blockType: 'reusableBlockRef',
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Unpopulated Ref Test Hero',
          },
        ],
        title: 'Page for Unpopulated Ref Test',
      },
    })

    // Fetch with depth: 0 (relationship not populated)
    const { docs } = await payload.find({
      collection: 'pages',
      depth: 0,
      where: {
        id: { equals: page.id },
      },
    })

    // Call resolvePageBlocks - should not crash, keep as reusableBlockRef
    const resolvedPage = resolvePageBlocks(docs[0])

    // Should have kept the reusableBlockRef since it couldn't be resolved
    expect(resolvedPage.content).toHaveLength(1)
    expect(resolvedPage.content?.[0]?.blockType).toBe('reusableBlockRef')
  })
})

describe('Resolved page API', () => {
  test('getResolvedPage returns resolved page by slug', async () => {
    // Create ReusableBlock with contentBlock
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'contentBlock',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Content for getResolvedPage test', version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
        blockType: 'content',
        title: 'Reusable for getResolvedPage Test',
      },
    })

    // Create Page with reusableBlockRef pointing to it
    await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-get-resolved-page',
        content: [
          {
            block: reusableBlock.id,
            blockType: 'reusableBlockRef',
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'getResolvedPage Test Hero',
          },
        ],
        title: 'Page for getResolvedPage Test',
      },
    })

    // Call getResolvedPage helper
    const resolvedPage = await getResolvedPage(payload, 'test-get-resolved-page')

    // Verify returns resolved page with inline contentBlock
    expect(resolvedPage).not.toBeNull()
    expect(resolvedPage?.slug).toBe('test-get-resolved-page')
    expect(resolvedPage?.content).toHaveLength(1)
    expect(resolvedPage?.content?.[0]?.blockType).toBe('contentBlock')
    expect(resolvedPage?.content?.[0]?._resolvedFrom).toBe(reusableBlock.id)
  })

  test('getResolvedPage returns null for non-existent slug', async () => {
    const result = await getResolvedPage(payload, 'does-not-exist-slug')
    expect(result).toBeNull()
  })

  test('REST endpoint returns resolved page', async () => {
    // Create ReusableBlock with accordionBlock
    const reusableBlock = await payload.create({
      collection: 'reusable-blocks',
      data: {
        block: [
          {
            blockType: 'accordionBlock',
            items: [
              { title: 'REST Endpoint Test Item 1' },
              { title: 'REST Endpoint Test Item 2' },
            ],
          },
        ],
        blockType: 'accordion',
        title: 'Reusable for REST Endpoint Test',
      },
    })

    // Create Page with reusableBlockRef
    await payload.create({
      collection: 'pages',
      data: {
        slug: 'test-rest-endpoint-resolved',
        content: [
          {
            block: reusableBlock.id,
            blockType: 'reusableBlockRef',
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'REST Endpoint Test Hero',
          },
        ],
        title: 'Page for REST Endpoint Test',
      },
    })

    // Create request to test endpoint handler
    const request = new Request('http://localhost:3000/api/pages/test-rest-endpoint-resolved/resolved', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    // Add routeParams manually since createPayloadRequest doesn't parse them from the URL
    payloadRequest.routeParams = { slug: 'test-rest-endpoint-resolved' }

    const response = await resolvedPageHandler(payloadRequest)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.slug).toBe('test-rest-endpoint-resolved')
    expect(data.content).toHaveLength(1)
    expect(data.content[0].blockType).toBe('accordionBlock')
    expect(data.content[0]._resolvedFrom).toBe(reusableBlock.id)
  })

  test('REST endpoint returns 404 for non-existent page', async () => {
    const request = new Request('http://localhost:3000/api/pages/does-not-exist/resolved', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    payloadRequest.routeParams = { slug: 'does-not-exist' }

    const response = await resolvedPageHandler(payloadRequest)

    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data.error).toBe('Page not found')
  })

  test('REST endpoint returns 400 for missing slug', async () => {
    const request = new Request('http://localhost:3000/api/pages//resolved', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    // No routeParams.slug set

    const response = await resolvedPageHandler(payloadRequest)

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Missing slug parameter')
  })
})

describe('PageVariants collection', () => {
  test('creates variant with name and page reference', async () => {
    // Create a base page first
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'variant-base-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Base Page for Variants',
          },
        ],
        title: 'Base Page for Variants',
      },
    })

    // Create a variant referencing the base page
    const variant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Holiday Sale Variant',
        page: basePage.id,
        status: 'draft',
      },
    })

    expect(variant.name).toBe('Holiday Sale Variant')
    // page relationship may be populated object or ID depending on depth
    const pageRef = typeof variant.page === 'object' ? variant.page.id : variant.page
    expect(pageRef).toBe(basePage.id)
    expect(variant.status).toBe('draft')
  })

  test('stores hero override blocks with blockIds', async () => {
    // Create a base page first
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'variant-hero-override-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Original CTA',
            },
            headline: 'Original Hero',
          },
        ],
        title: 'Page for Hero Override Test',
      },
    })

    // Create variant with heroOverride
    const variant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Hero Override Variant',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com/sale',
              ctaText: 'Shop Now',
            },
            headline: 'Holiday Sale Hero',
            subheadline: 'Limited time offer!',
          },
        ],
        page: basePage.id,
      },
    })

    expect(variant.heroOverride).toHaveLength(1)
    expect(variant.heroOverride?.[0]?.blockType).toBe('heroBlock')
    expect(variant.heroOverride?.[0]?.headline).toBe('Holiday Sale Hero')
    // Verify blockId is auto-generated
    expect(variant.heroOverride?.[0]?.settings?.blockId).toBeDefined()
    expect(variant.heroOverride?.[0]?.settings?.blockId).toHaveLength(12)
  })

  test('stores content override blocks', async () => {
    // Create a base page first
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'variant-content-override-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Content Override Test Page',
          },
        ],
        title: 'Page for Content Override Test',
      },
    })

    // Create variant with contentOverride containing multiple block types
    const variant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Content Override Variant',
        contentOverride: [
          {
            blockType: 'contentBlock',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Holiday content', version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
          {
            blockType: 'accordionBlock',
            items: [
              { title: 'FAQ 1' },
              { title: 'FAQ 2' },
            ],
          },
        ],
        page: basePage.id,
      },
    })

    expect(variant.contentOverride).toHaveLength(2)
    expect(variant.contentOverride?.[0]?.blockType).toBe('contentBlock')
    expect(variant.contentOverride?.[1]?.blockType).toBe('accordionBlock')

    // Verify blockIds are auto-generated for both blocks
    expect(variant.contentOverride?.[0]?.settings?.blockId).toBeDefined()
    expect(variant.contentOverride?.[0]?.settings?.blockId).toHaveLength(12)
    expect(variant.contentOverride?.[1]?.settings?.blockId).toBeDefined()
    expect(variant.contentOverride?.[1]?.settings?.blockId).toHaveLength(12)
  })

  test('stores footer override blocks', async () => {
    // Create a base page first
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'variant-footer-override-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Footer Override Test Page',
          },
        ],
        title: 'Page for Footer Override Test',
      },
    })

    // Create variant with footerOverride
    const variant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Footer Override Variant',
        footerOverride: [
          {
            blockType: 'footerBlock',
            text: 'Holiday Sale Footer - Free Shipping on Orders Over $50',
          },
        ],
        page: basePage.id,
      },
    })

    expect(variant.footerOverride).toHaveLength(1)
    expect(variant.footerOverride?.[0]?.blockType).toBe('footerBlock')
    expect(variant.footerOverride?.[0]?.text).toBe('Holiday Sale Footer - Free Shipping on Orders Over $50')
    // Verify blockId is auto-generated
    expect(variant.footerOverride?.[0]?.settings?.blockId).toBeDefined()
    expect(variant.footerOverride?.[0]?.settings?.blockId).toHaveLength(12)
  })

  test('enforces required page relationship', async () => {
    // Attempt to create variant without page field
    await expect(
      payload.create({
        collection: 'page-variants',
        data: {
          name: 'Orphan Variant',
          // page intentionally missing
        },
      }),
    ).rejects.toThrow()
  })
})

describe('Page variant preview', () => {
  test('resolves page with hero override applied', async () => {
    // Create a base page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'preview-hero-test',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Original CTA',
            },
            headline: 'Original Hero Headline',
            subheadline: 'Original subheadline',
          },
        ],
        title: 'Preview Hero Test Page',
      },
    })

    // Create variant with heroOverride
    const variant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Hero Override Preview Variant',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com/sale',
              ctaText: 'Shop Sale',
            },
            headline: 'Holiday Sale Hero',
            subheadline: 'Limited time offer!',
          },
        ],
        page: basePage.id,
      },
    })

    // Call getResolvedPageWithVariant
    const result = await getResolvedPageWithVariant(payload, 'preview-hero-test', variant.id)

    // Verify hero section is replaced
    expect(result).not.toBeNull()
    expect(result?.hero).toHaveLength(1)
    expect(result?.hero?.[0]?.headline).toBe('Holiday Sale Hero')
    expect(result?.hero?.[0]?.subheadline).toBe('Limited time offer!')
    expect(result?.hero?.[0]?.cta?.ctaText).toBe('Shop Sale')
  })

  test('resolves page with content override applied', async () => {
    // Create a base page with content
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'preview-content-test',
        content: [
          {
            blockType: 'accordionBlock',
            items: [
              { title: 'Original FAQ Item 1' },
              { title: 'Original FAQ Item 2' },
            ],
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Content Override Test Hero',
          },
        ],
        title: 'Preview Content Test Page',
      },
    })

    // Create variant with contentOverride
    const variant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Content Override Preview Variant',
        contentOverride: [
          {
            blockType: 'faqBlock',
            items: [
              { question: 'Holiday FAQ Question 1' },
              { question: 'Holiday FAQ Question 2' },
              { question: 'Holiday FAQ Question 3' },
            ],
          },
        ],
        page: basePage.id,
      },
    })

    // Call getResolvedPageWithVariant
    const result = await getResolvedPageWithVariant(payload, 'preview-content-test', variant.id)

    // Verify content section is replaced (not merged)
    expect(result).not.toBeNull()
    expect(result?.content).toHaveLength(1)
    expect(result?.content?.[0]?.blockType).toBe('faqBlock')
    if (result?.content?.[0]?.blockType === 'faqBlock') {
      expect(result.content[0].items).toHaveLength(3)
      expect(result.content[0].items?.[0]?.question).toBe('Holiday FAQ Question 1')
    }
  })

  test('preserves original sections when override is empty', async () => {
    // Create a base page with content
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'preview-empty-override-test',
        content: [
          {
            blockType: 'statsBlock',
            items: [
              { label: 'Happy Customers', value: '1000+' },
            ],
          },
        ],
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Empty Override Test Hero',
          },
        ],
        title: 'Preview Empty Override Test Page',
      },
    })

    // Create variant with empty contentOverride (no override)
    const variant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Empty Override Preview Variant',
        contentOverride: [], // Empty array means no override
        page: basePage.id,
      },
    })

    // Call getResolvedPageWithVariant
    const result = await getResolvedPageWithVariant(payload, 'preview-empty-override-test', variant.id)

    // Verify original content is preserved
    expect(result).not.toBeNull()
    expect(result?.content).toHaveLength(1)
    expect(result?.content?.[0]?.blockType).toBe('statsBlock')
    if (result?.content?.[0]?.blockType === 'statsBlock') {
      expect(result.content[0].items?.[0]?.value).toBe('1000+')
    }
  })

  test('includes _variant metadata in response', async () => {
    // Create a base page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'preview-metadata-test',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Metadata Test Hero',
          },
        ],
        title: 'Preview Metadata Test Page',
      },
    })

    // Create variant
    const variant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Metadata Test Variant',
        page: basePage.id,
      },
    })

    // Call getResolvedPageWithVariant
    const result = await getResolvedPageWithVariant(payload, 'preview-metadata-test', variant.id)

    // Verify _variant metadata
    expect(result).not.toBeNull()
    expect(result?._variant).toBeDefined()
    expect(result?._variant?.id).toBe(variant.id)
    expect(result?._variant?.name).toBe('Metadata Test Variant')
  })

  test('REST endpoint returns 404 for unknown page', async () => {
    const request = new Request('http://localhost:3000/api/pages/nonexistent-page-slug/variants/xxx/preview', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    payloadRequest.routeParams = { slug: 'nonexistent-page-slug', variantId: 'xxx' }

    const response = await resolvedPageWithVariantHandler(payloadRequest)

    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data.error).toBe('Page not found')
  })

  test('REST endpoint returns 404 for unknown variant', async () => {
    // Create a valid page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'preview-unknown-variant-test',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Unknown Variant Test Hero',
          },
        ],
        title: 'Preview Unknown Variant Test Page',
      },
    })

    const request = new Request(
      `http://localhost:3000/api/pages/${basePage.slug}/variants/nonexistent-variant-id/preview`,
      { method: 'GET' },
    )

    const payloadRequest = await createPayloadRequest({ config, request })
    payloadRequest.routeParams = { slug: basePage.slug, variantId: 'nonexistent-variant-id' }

    const response = await resolvedPageWithVariantHandler(payloadRequest)

    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data.error).toBe('Variant not found')
  })

  test('REST endpoint returns 400 when variant belongs to different page', async () => {
    // Create page A
    const pageA = await payload.create({
      collection: 'pages',
      data: {
        slug: 'preview-page-a-mismatch',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA A',
            },
            headline: 'Page A Hero',
          },
        ],
        title: 'Preview Page A for Mismatch Test',
      },
    })

    // Create page B
    const pageB = await payload.create({
      collection: 'pages',
      data: {
        slug: 'preview-page-b-mismatch',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA B',
            },
            headline: 'Page B Hero',
          },
        ],
        title: 'Preview Page B for Mismatch Test',
      },
    })

    // Create variant for page A
    const variantForPageA = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Variant for Page A',
        page: pageA.id,
      },
    })

    // Try to preview variant (for page A) on page B
    const request = new Request(
      `http://localhost:3000/api/pages/${pageB.slug}/variants/${variantForPageA.id}/preview`,
      { method: 'GET' },
    )

    const payloadRequest = await createPayloadRequest({ config, request })
    payloadRequest.routeParams = { slug: pageB.slug, variantId: variantForPageA.id }

    const response = await resolvedPageWithVariantHandler(payloadRequest)

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Variant does not belong to this page')
  })
})

describe('Experiments collection', () => {
  test('can create experiment with two variants', async () => {
    // Create a base page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'experiment-test-page-1',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Experiment Test Page',
          },
        ],
        title: 'Experiment Test Page',
      },
    })

    // Create two variants for this page
    const variantA = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Variant A',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/a', ctaText: 'A CTA' },
            headline: 'Variant A Hero',
          },
        ],
        page: basePage.id,
      },
    })

    const variantB = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Variant B',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/b', ctaText: 'B CTA' },
            headline: 'Variant B Hero',
          },
        ],
        page: basePage.id,
      },
    })

    // Create experiment with two variants
    const experiment = await payload.create({
      collection: 'experiments',
      data: {
        name: 'Homepage Hero Test',
        page: basePage.id,
        status: 'draft',
        variants: [
          { trafficPercent: 50, variant: variantA.id },
          { trafficPercent: 50, variant: variantB.id },
        ],
      },
    })

    expect(experiment.name).toBe('Homepage Hero Test')
    expect(experiment.status).toBe('draft')
    expect(experiment.variants).toHaveLength(2)
    expect(experiment.variants?.[0]?.trafficPercent).toBe(50)
    expect(experiment.variants?.[1]?.trafficPercent).toBe(50)
  })

  test('rejects traffic percentages not summing to 100 when running', async () => {
    // Create a base page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'experiment-test-page-2',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Experiment Test Page 2',
          },
        ],
        title: 'Experiment Test Page 2',
      },
    })

    // Create two variants
    const variantA = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Variant A Traffic Test',
        page: basePage.id,
      },
    })

    const variantB = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Variant B Traffic Test',
        page: basePage.id,
      },
    })

    // Attempt to create experiment with invalid traffic sum when running
    await expect(
      payload.create({
        collection: 'experiments',
        data: {
          name: 'Invalid Traffic Test',
          page: basePage.id,
          status: 'running', // Running status requires 100% sum
          variants: [
            { trafficPercent: 30, variant: variantA.id },
            { trafficPercent: 30, variant: variantB.id },
          ],
        },
      }),
    ).rejects.toThrow(/variants/)
  })

  test('allows non-100% traffic when status is draft', async () => {
    // Create a base page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'experiment-test-page-3',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Experiment Test Page 3',
          },
        ],
        title: 'Experiment Test Page 3',
      },
    })

    // Create two variants
    const variantA = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Variant A Draft Test',
        page: basePage.id,
      },
    })

    const variantB = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Variant B Draft Test',
        page: basePage.id,
      },
    })

    // Create experiment with non-100% traffic in draft (should succeed)
    const experiment = await payload.create({
      collection: 'experiments',
      data: {
        name: 'Draft Traffic Test',
        page: basePage.id,
        status: 'draft', // Draft allows any percentage
        variants: [
          { trafficPercent: 20, variant: variantA.id },
          { trafficPercent: 30, variant: variantB.id },
        ],
      },
    })

    expect(experiment.name).toBe('Draft Traffic Test')
    expect(experiment.status).toBe('draft')
    // Total is 50%, which is allowed in draft
  })

  test('rejects variant from different page', async () => {
    // Create two pages
    const pageA = await payload.create({
      collection: 'pages',
      data: {
        slug: 'experiment-page-a-mismatch',
        hero: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/a', ctaText: 'A CTA' },
            headline: 'Page A',
          },
        ],
        title: 'Page A for Mismatch',
      },
    })

    const pageB = await payload.create({
      collection: 'pages',
      data: {
        slug: 'experiment-page-b-mismatch',
        hero: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/b', ctaText: 'B CTA' },
            headline: 'Page B',
          },
        ],
        title: 'Page B for Mismatch',
      },
    })

    // Create variant for page A
    const variantForPageA = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Variant for Page A',
        page: pageA.id,
      },
    })

    // Create variant for page B
    const variantForPageB = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Variant for Page B',
        page: pageB.id,
      },
    })

    // Attempt to create experiment for page A with variant from page B
    await expect(
      payload.create({
        collection: 'experiments',
        data: {
          name: 'Mismatched Variant Test',
          page: pageA.id,
          status: 'draft',
          variants: [
            { trafficPercent: 50, variant: variantForPageA.id },
            { trafficPercent: 50, variant: variantForPageB.id }, // Wrong page!
          ],
        },
      }),
    ).rejects.toThrow(/variants/)
  })

  test('rejects experiment with single variant', async () => {
    // Create a base page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'experiment-test-page-single',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Single Variant Test Page',
          },
        ],
        title: 'Single Variant Test Page',
      },
    })

    // Create one variant
    const singleVariant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Single Variant',
        page: basePage.id,
      },
    })

    // Attempt to create experiment with only one variant
    await expect(
      payload.create({
        collection: 'experiments',
        data: {
          name: 'Single Variant Experiment',
          page: basePage.id,
          status: 'draft',
          variants: [{ trafficPercent: 100, variant: singleVariant.id }],
        },
      }),
    ).rejects.toThrow(/variants/)
  })
})

describe('Visitor identification', () => {
  test('getOrCreateVisitorId returns existing visitor ID from cookies', () => {
    const existingId = 'existing-visitor-id-123'
    const mockCookies = {
      get: (name: string) => {
        if (name === VISITOR_COOKIE_NAME) {
          return { value: existingId }
        }
        return undefined
      },
    }

    const result = getOrCreateVisitorId(mockCookies)

    expect(result.visitorId).toBe(existingId)
    expect(result.isNew).toBe(false)
  })

  test('getOrCreateVisitorId generates new ID when cookie is missing', () => {
    const mockCookies = {
      get: () => undefined,
    }

    const result = getOrCreateVisitorId(mockCookies)

    expect(result.visitorId).toBeDefined()
    expect(result.visitorId).toHaveLength(21) // nanoid(21) standard length
    expect(result.isNew).toBe(true)
  })

  test('getOrCreateVisitorId handles string cookie format', () => {
    const existingId = 'string-format-visitor-id'
    const mockCookies = {
      get: (name: string) => {
        if (name === VISITOR_COOKIE_NAME) {
          return existingId // Some implementations return string directly
        }
        return undefined
      },
    }

    const result = getOrCreateVisitorId(mockCookies)

    expect(result.visitorId).toBe(existingId)
    expect(result.isNew).toBe(false)
  })

  test('exports correct cookie constants', () => {
    expect(VISITOR_COOKIE_NAME).toBe('visitor_id')
    expect(VISITOR_COOKIE_MAX_AGE).toBe(31536000) // 365 days in seconds
  })
})

describe('Variant assignment', () => {
  test('assignVariantByTraffic is deterministic (same inputs = same output)', () => {
    const params = {
      experimentId: 'exp-123',
      variants: [
        { trafficPercent: 50, variantId: 'A' },
        { trafficPercent: 50, variantId: 'B' },
      ],
      visitorId: 'visitor-abc',
    }

    // Call 100 times with same inputs
    const results: string[] = []
    for (let i = 0; i < 100; i++) {
      results.push(assignVariantByTraffic(params).variantId)
    }

    // All results should be identical
    const firstResult = results[0]
    expect(results.every((r) => r === firstResult)).toBe(true)
  })

  test('assignVariantByTraffic distributes traffic according to percentages', () => {
    const variants = [
      { trafficPercent: 50, variantId: 'A' },
      { trafficPercent: 50, variantId: 'B' },
    ]

    // Generate 1000 unique visitor IDs and assign them
    const counts = { A: 0, B: 0 }
    for (let i = 0; i < 1000; i++) {
      const result = assignVariantByTraffic({
        experimentId: 'distribution-test',
        variants,
        visitorId: `visitor-${i}-${Math.random()}`,
      })
      counts[result.variantId as 'A' | 'B']++
    }

    // With 50/50 split, each should be roughly 500 (allow 15% margin for randomness)
    expect(counts.A).toBeGreaterThan(350)
    expect(counts.A).toBeLessThan(650)
    expect(counts.B).toBeGreaterThan(350)
    expect(counts.B).toBeLessThan(650)
  })

  test('assignVariantByTraffic handles unequal splits correctly', () => {
    const variants = [
      { trafficPercent: 70, variantId: 'control' },
      { trafficPercent: 30, variantId: 'treatment' },
    ]

    const counts = { control: 0, treatment: 0 }
    for (let i = 0; i < 1000; i++) {
      const result = assignVariantByTraffic({
        experimentId: 'unequal-test',
        variants,
        visitorId: `visitor-unequal-${i}-${Math.random()}`,
      })
      counts[result.variantId as 'control' | 'treatment']++
    }

    // 70/30 split - control should be roughly 700, treatment roughly 300
    expect(counts.control).toBeGreaterThan(550)
    expect(counts.control).toBeLessThan(850)
    expect(counts.treatment).toBeGreaterThan(150)
    expect(counts.treatment).toBeLessThan(450)
  })
})

describe('Leads collection', () => {
  let leadsTestPage: Awaited<ReturnType<typeof payload.create<'pages'>>>
  let leadsTestVariant: Awaited<ReturnType<typeof payload.create<'page-variants'>>>
  let leadsTestExperiment: Awaited<ReturnType<typeof payload.create<'experiments'>>>

  beforeAll(async () => {
    // Create test fixtures for Leads tests
    leadsTestPage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'leads-test-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Leads Test Page',
          },
        ],
        title: 'Leads Test Page',
      },
    })

    leadsTestVariant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Leads Test Variant',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/leads-test', ctaText: 'Leads CTA' },
            headline: 'Leads Test Variant Hero',
          },
        ],
        page: leadsTestPage.id,
      },
    })

    // Need a second variant to create an experiment
    const secondVariant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Leads Test Variant B',
        page: leadsTestPage.id,
      },
    })

    leadsTestExperiment = await payload.create({
      collection: 'experiments',
      data: {
        name: 'Leads Test Experiment',
        page: leadsTestPage.id,
        status: 'running',
        variants: [
          { trafficPercent: 50, variant: leadsTestVariant.id },
          { trafficPercent: 50, variant: secondVariant.id },
        ],
      },
    })
  })

  test('can create lead with email only', async () => {
    const lead = await payload.create({
      collection: 'leads',
      data: {
        email: 'test@example.com',
      },
    })

    expect(lead.email).toBe('test@example.com')
    // convertedAt should be auto-set
    expect(lead.convertedAt).toBeDefined()
    const convertedDate = new Date(lead.convertedAt!)
    expect(convertedDate.getTime()).toBeLessThanOrEqual(Date.now())
  })

  test('can create lead with full attribution', async () => {
    const lead = await payload.create({
      collection: 'leads',
      data: {
        name: 'Test User',
        email: 'attributed@example.com',
        experiment: leadsTestExperiment.id,
        page: leadsTestPage.id,
        source: 'hero-cta',
        variant: leadsTestVariant.id,
        visitorId: 'visitor-abc-123',
      },
    })

    expect(lead.email).toBe('attributed@example.com')
    expect(lead.name).toBe('Test User')
    expect(lead.visitorId).toBe('visitor-abc-123')
    expect(lead.source).toBe('hero-cta')
    expect(lead.convertedAt).toBeDefined()

    // Verify relationships (may be populated or ID depending on depth)
    const experimentRef = typeof lead.experiment === 'object' ? lead.experiment.id : lead.experiment
    expect(experimentRef).toBe(leadsTestExperiment.id)

    const variantRef = typeof lead.variant === 'object' ? lead.variant.id : lead.variant
    expect(variantRef).toBe(leadsTestVariant.id)

    const pageRef = typeof lead.page === 'object' ? lead.page.id : lead.page
    expect(pageRef).toBe(leadsTestPage.id)
  })

  test('can create lead with custom formData', async () => {
    const customFormData = {
      company: 'Acme Corp',
      phone: '+1-555-1234',
      preferredTime: 'morning',
      subscribeNewsletter: true,
    }

    const lead = await payload.create({
      collection: 'leads',
      data: {
        email: 'formdata@example.com',
        formData: customFormData,
      },
    })

    expect(lead.email).toBe('formdata@example.com')
    expect(lead.formData).toEqual(customFormData)
    expect(lead.formData.company).toBe('Acme Corp')
    expect(lead.formData.subscribeNewsletter).toBe(true)
  })

  test('lead captures visitorId', async () => {
    const visitorId = 'unique-visitor-id-xyz-789'

    const lead = await payload.create({
      collection: 'leads',
      data: {
        email: 'visitor@example.com',
        visitorId,
      },
    })

    expect(lead.email).toBe('visitor@example.com')
    expect(lead.visitorId).toBe(visitorId)
  })
})

describe('Visitor variant assignment', () => {
  test('returns null when no running experiment exists', async () => {
    // Create a page without any running experiment
    await payload.create({
      collection: 'pages',
      data: {
        slug: 'no-experiment-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Page Without Experiment',
          },
        ],
        title: 'Page Without Experiment',
      },
    })

    const result = await getAssignedVariant({
      pageSlug: 'no-experiment-page',
      payload,
      visitorId: 'visitor-no-exp',
    })

    expect(result).toBeNull()
  })

  test('assigns variant deterministically (same visitor always gets same variant)', async () => {
    // Create a page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'deterministic-test-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Base CTA',
            },
            headline: 'Deterministic Test Page',
          },
        ],
        title: 'Deterministic Test Page',
      },
    })

    // Create two variants
    const variantA = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Deterministic Variant A',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/det-a', ctaText: 'A CTA' },
            headline: 'Deterministic Variant A Hero',
          },
        ],
        page: basePage.id,
      },
    })

    const variantB = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Deterministic Variant B',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/det-b', ctaText: 'B CTA' },
            headline: 'Deterministic Variant B Hero',
          },
        ],
        page: basePage.id,
      },
    })

    // Create running experiment
    await payload.create({
      collection: 'experiments',
      data: {
        name: 'Deterministic Test Experiment',
        page: basePage.id,
        status: 'running',
        variants: [
          { trafficPercent: 50, variant: variantA.id },
          { trafficPercent: 50, variant: variantB.id },
        ],
      },
    })

    // Call multiple times with same visitor ID
    const visitorId = 'deterministic-visitor-xyz'
    const results: string[] = []
    for (let i = 0; i < 5; i++) {
      const result = await getAssignedVariant({
        pageSlug: 'deterministic-test-page',
        payload,
        visitorId,
      })
      results.push(result!.variantId)
    }

    // All results should be the same variant
    const firstVariantId = results[0]
    expect(results.every((r) => r === firstVariantId)).toBe(true)
  })

  test('different visitors get distributed across variants', async () => {
    // Create a page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'distribution-test-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Base CTA',
            },
            headline: 'Distribution Test Page',
          },
        ],
        title: 'Distribution Test Page',
      },
    })

    // Create two variants
    const variantA = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Distribution Variant A',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/dist-a', ctaText: 'A CTA' },
            headline: 'Distribution Variant A Hero',
          },
        ],
        page: basePage.id,
      },
    })

    const variantB = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Distribution Variant B',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/dist-b', ctaText: 'B CTA' },
            headline: 'Distribution Variant B Hero',
          },
        ],
        page: basePage.id,
      },
    })

    // Create running experiment with 50/50 split
    await payload.create({
      collection: 'experiments',
      data: {
        name: 'Distribution Test Experiment',
        page: basePage.id,
        status: 'running',
        variants: [
          { trafficPercent: 50, variant: variantA.id },
          { trafficPercent: 50, variant: variantB.id },
        ],
      },
    })

    // Assign 20 different visitors
    const assignedVariants: string[] = []
    for (let i = 0; i < 20; i++) {
      const result = await getAssignedVariant({
        pageSlug: 'distribution-test-page',
        payload,
        visitorId: `distribution-visitor-${i}`,
      })
      assignedVariants.push(result!.variantId)
    }

    // Should have at least some of each variant (not all same)
    const variantACount = assignedVariants.filter((v) => v === variantA.id).length
    const variantBCount = assignedVariants.filter((v) => v === variantB.id).length

    expect(variantACount).toBeGreaterThan(0)
    expect(variantBCount).toBeGreaterThan(0)
  })

  test('returns resolved page with variant overrides applied', async () => {
    // Create a page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'override-test-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Original CTA',
            },
            headline: 'Original Hero Headline',
          },
        ],
        title: 'Override Test Page',
      },
    })

    // Create variant with hero override
    const variant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Override Test Variant',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/override', ctaText: 'Override CTA' },
            headline: 'Override Hero Headline',
          },
        ],
        page: basePage.id,
      },
    })

    // Create running experiment with 100% traffic to single variant
    // (need 2 variants minimum, but we'll use 99/1 split to ensure we get this variant)
    const dummyVariant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Dummy Variant',
        page: basePage.id,
      },
    })

    await payload.create({
      collection: 'experiments',
      data: {
        name: 'Override Test Experiment',
        page: basePage.id,
        status: 'running',
        variants: [
          { trafficPercent: 100, variant: variant.id },
          { trafficPercent: 0, variant: dummyVariant.id },
        ],
      },
    })

    const result = await getAssignedVariant({
      pageSlug: 'override-test-page',
      payload,
      visitorId: 'override-test-visitor',
    })

    expect(result).not.toBeNull()
    expect(result!.resolvedPage).toBeDefined()
    expect(result!.resolvedPage.hero?.[0]?.headline).toBe('Override Hero Headline')
    expect(result!.resolvedPage.hero?.[0]?.cta?.ctaText).toBe('Override CTA')
    expect(result!.resolvedPage._variant?.id).toBe(variant.id)
  })

  test('handles experiment with unequal traffic split (70/30)', async () => {
    // Create a page
    const basePage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'unequal-split-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Base CTA',
            },
            headline: 'Unequal Split Test Page',
          },
        ],
        title: 'Unequal Split Test Page',
      },
    })

    // Create two variants
    const controlVariant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Control Variant (70%)',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/control', ctaText: 'Control CTA' },
            headline: 'Control Variant Hero',
          },
        ],
        page: basePage.id,
      },
    })

    const treatmentVariant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Treatment Variant (30%)',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/treatment', ctaText: 'Treatment CTA' },
            headline: 'Treatment Variant Hero',
          },
        ],
        page: basePage.id,
      },
    })

    // Create running experiment with 70/30 split
    await payload.create({
      collection: 'experiments',
      data: {
        name: 'Unequal Split Experiment',
        page: basePage.id,
        status: 'running',
        variants: [
          { trafficPercent: 70, variant: controlVariant.id },
          { trafficPercent: 30, variant: treatmentVariant.id },
        ],
      },
    })

    // Assign 50 different visitors and count distribution
    const counts: Record<string, number> = {}
    for (let i = 0; i < 50; i++) {
      const result = await getAssignedVariant({
        pageSlug: 'unequal-split-page',
        payload,
        visitorId: `unequal-visitor-${i}`,
      })
      const variantId = result!.variantId
      counts[variantId] = (counts[variantId] || 0) + 1
    }

    // Control (70%) should have more assignments than treatment (30%)
    const controlCount = counts[controlVariant.id] || 0
    const treatmentCount = counts[treatmentVariant.id] || 0

    // With 50 visitors and 70/30 split, control should generally have more
    // Allow for some variance but control should have at least as many as treatment
    expect(controlCount + treatmentCount).toBe(50)
    // Control should have meaningfully more than treatment in a 70/30 split
    expect(controlCount).toBeGreaterThanOrEqual(treatmentCount)
  })
})

describe('AnalyticsEvents collection', () => {
  let analyticsTestPage: Awaited<ReturnType<typeof payload.create<'pages'>>>
  let analyticsTestVariant: Awaited<ReturnType<typeof payload.create<'page-variants'>>>
  let analyticsTestExperiment: Awaited<ReturnType<typeof payload.create<'experiments'>>>

  beforeAll(async () => {
    // Create test fixtures for AnalyticsEvents tests
    analyticsTestPage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'analytics-test-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Analytics Test Page',
          },
        ],
        title: 'Analytics Test Page',
      },
    })

    analyticsTestVariant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Analytics Test Variant',
        heroOverride: [
          {
            blockType: 'heroBlock',
            cta: { ctaLink: '/analytics-test', ctaText: 'Analytics CTA' },
            headline: 'Analytics Test Variant Hero',
          },
        ],
        page: analyticsTestPage.id,
      },
    })

    // Need a second variant to create an experiment
    const secondVariant = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Analytics Test Variant B',
        page: analyticsTestPage.id,
      },
    })

    analyticsTestExperiment = await payload.create({
      collection: 'experiments',
      data: {
        name: 'Analytics Test Experiment',
        page: analyticsTestPage.id,
        status: 'running',
        variants: [
          { trafficPercent: 50, variant: analyticsTestVariant.id },
          { trafficPercent: 50, variant: secondVariant.id },
        ],
      },
    })
  })

  test('creates impression event with experiment attribution', async () => {
    const event = await payload.create({
      collection: 'analytics-events',
      data: {
        eventType: 'impression',
        experiment: analyticsTestExperiment.id,
        page: analyticsTestPage.id,
        variant: analyticsTestVariant.id,
        visitorId: 'visitor-impression-123',
      },
    })

    expect(event.eventType).toBe('impression')
    expect(event.visitorId).toBe('visitor-impression-123')
    // timestamp should be auto-set
    expect(event.timestamp).toBeDefined()
    const timestamp = new Date(event.timestamp!)
    expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now())

    // Verify relationships (may be populated or ID depending on depth)
    const experimentRef = typeof event.experiment === 'object' ? event.experiment.id : event.experiment
    expect(experimentRef).toBe(analyticsTestExperiment.id)

    const variantRef = typeof event.variant === 'object' ? event.variant.id : event.variant
    expect(variantRef).toBe(analyticsTestVariant.id)

    const pageRef = typeof event.page === 'object' ? event.page.id : event.page
    expect(pageRef).toBe(analyticsTestPage.id)
  })

  test('creates conversion event', async () => {
    const event = await payload.create({
      collection: 'analytics-events',
      data: {
        eventType: 'conversion',
        page: analyticsTestPage.id,
        visitorId: 'visitor-conversion-456',
      },
    })

    expect(event.eventType).toBe('conversion')
    expect(event.visitorId).toBe('visitor-conversion-456')
    // timestamp should be auto-set
    expect(event.timestamp).toBeDefined()
    const timestamp = new Date(event.timestamp!)
    expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now())
  })

  test('creates custom event with blockId and eventData', async () => {
    const customEventData = {
      duration: 30,
      percentWatched: 75,
    }

    const event = await payload.create({
      collection: 'analytics-events',
      data: {
        blockId: 'abc123xyz789',
        eventData: customEventData,
        eventName: 'video_play',
        eventType: 'custom',
        visitorId: 'visitor-custom-789',
      },
    })

    expect(event.eventType).toBe('custom')
    expect(event.eventName).toBe('video_play')
    expect(event.blockId).toBe('abc123xyz789')
    expect(event.eventData).toEqual(customEventData)
    expect(event.eventData.duration).toBe(30)
    expect(event.eventData.percentWatched).toBe(75)
    expect(event.visitorId).toBe('visitor-custom-789')
    expect(event.timestamp).toBeDefined()
  })

  test('queries events by experiment', async () => {
    // Create a second experiment for filtering test
    const secondPage = await payload.create({
      collection: 'pages',
      data: {
        slug: 'analytics-filter-test-page',
        hero: [
          {
            blockType: 'heroBlock',
            cta: {
              ctaLink: 'https://example.com',
              ctaText: 'Test CTA',
            },
            headline: 'Filter Test Page',
          },
        ],
        title: 'Filter Test Page',
      },
    })

    const filterVariantA = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Filter Variant A',
        page: secondPage.id,
      },
    })

    const filterVariantB = await payload.create({
      collection: 'page-variants',
      data: {
        name: 'Filter Variant B',
        page: secondPage.id,
      },
    })

    const secondExperiment = await payload.create({
      collection: 'experiments',
      data: {
        name: 'Filter Test Experiment',
        page: secondPage.id,
        status: 'running',
        variants: [
          { trafficPercent: 50, variant: filterVariantA.id },
          { trafficPercent: 50, variant: filterVariantB.id },
        ],
      },
    })

    // Create events for the first experiment
    await payload.create({
      collection: 'analytics-events',
      data: {
        eventType: 'impression',
        experiment: analyticsTestExperiment.id,
        visitorId: 'visitor-filter-1',
      },
    })

    await payload.create({
      collection: 'analytics-events',
      data: {
        eventType: 'impression',
        experiment: analyticsTestExperiment.id,
        visitorId: 'visitor-filter-2',
      },
    })

    // Create events for the second experiment
    await payload.create({
      collection: 'analytics-events',
      data: {
        eventType: 'impression',
        experiment: secondExperiment.id,
        visitorId: 'visitor-filter-3',
      },
    })

    // Query events by first experiment
    const { docs: firstExpEvents } = await payload.find({
      collection: 'analytics-events',
      where: {
        experiment: { equals: analyticsTestExperiment.id },
      },
    })

    // Query events by second experiment
    const { docs: secondExpEvents } = await payload.find({
      collection: 'analytics-events',
      where: {
        experiment: { equals: secondExperiment.id },
      },
    })

    // Verify filtering works (first experiment has at least 2 from this test)
    expect(firstExpEvents.length).toBeGreaterThanOrEqual(2)
    expect(secondExpEvents.length).toBeGreaterThanOrEqual(1)

    // Verify all events in first query belong to first experiment
    for (const event of firstExpEvents) {
      const experimentRef = typeof event.experiment === 'object' ? event.experiment.id : event.experiment
      expect(experimentRef).toBe(analyticsTestExperiment.id)
    }

    // Verify all events in second query belong to second experiment
    for (const event of secondExpEvents) {
      const experimentRef = typeof event.experiment === 'object' ? event.experiment.id : event.experiment
      expect(experimentRef).toBe(secondExperiment.id)
    }
  })
})
