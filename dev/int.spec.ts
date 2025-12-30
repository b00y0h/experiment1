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
})
