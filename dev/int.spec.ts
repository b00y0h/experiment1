import type { Payload } from 'payload'

import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { customEndpointHandler } from '../src/endpoints/customEndpointHandler.js'

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
        title: 'First Page',
      },
    })

    await expect(
      payload.create({
        collection: 'pages',
        data: {
          slug: 'duplicate-slug',
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
                value: '99%',
                label: 'Customer Satisfaction',
                icon: 'star',
              },
              {
                value: '10M+',
                label: 'Users Worldwide',
              },
            ],
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
      collection: 'pages',
      id: page.id,
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
                value: '500+',
                label: 'Happy Clients',
                icon: 'users',
              },
              {
                value: '24/7',
                label: 'Support',
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
