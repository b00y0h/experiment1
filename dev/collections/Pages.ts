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
              required: true,
            },
            {
              name: 'subheadline',
              type: 'textarea',
            },
            {
              name: 'cta',
              type: 'group',
              label: 'Call to Action',
              admin: {
                condition: () => true,
              },
              fields: [
                {
                  name: 'ctaText',
                  type: 'text',
                  label: 'Button Label',
                },
                {
                  name: 'ctaLink',
                  type: 'text',
                  label: 'Button URL',
                },
              ],
            },
            {
              name: 'media',
              type: 'upload',
              relationTo: 'media',
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
          slug: 'reusableBlockRef',
          fields: [
            {
              name: 'block',
              type: 'relationship',
              relationTo: 'reusable-blocks',
              required: true,
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
