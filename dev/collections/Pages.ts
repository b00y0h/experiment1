import type { CollectionConfig } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Pages: CollectionConfig = {
  slug: 'pages',
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'hero',
      type: 'blocks',
      maxRows: 1,
      blocks: [
        {
          slug: 'heroBlock',
          fields: [
            {
              name: 'headline',
              type: 'text',
            },
            {
              name: 'subheadline',
              type: 'textarea',
            },
          ],
        },
      ],
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [
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
      ],
    },
    {
      name: 'footer',
      type: 'blocks',
      blocks: [
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
