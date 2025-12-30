import type { CollectionConfig } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const ReusableBlocks: CollectionConfig = {
  slug: 'reusable-blocks',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'blockType',
      type: 'select',
      required: true,
      options: [
        { label: 'Accordion', value: 'accordion' },
        { label: 'Content', value: 'content' },
        { label: 'Footer', value: 'footer' },
      ],
    },
    {
      name: 'block',
      type: 'blocks',
      maxRows: 1,
      blocks: [
        {
          slug: 'accordionBlock',
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'content',
                  type: 'richText',
                  editor: lexicalEditor(),
                },
              ],
            },
          ],
        },
        {
          slug: 'contentBlock',
          fields: [
            {
              name: 'body',
              type: 'richText',
              editor: lexicalEditor(),
            },
          ],
        },
        {
          slug: 'footerBlock',
          fields: [
            {
              name: 'text',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
