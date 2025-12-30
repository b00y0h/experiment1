import type { Payload } from 'payload'

import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { customEndpointHandler } from '../src/endpoints/customEndpointHandler.js'
import { resolvedPageHandler } from './endpoints/resolvedPage.js'
import { getResolvedPage } from './utils/getResolvedPage.js'
import { resolvePageBlocks } from './utils/resolvePageBlocks'

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
