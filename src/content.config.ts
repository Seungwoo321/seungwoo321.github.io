import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './_posts', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({
    title: z.string(), date: z.coerce.date(), published: z.boolean().default(true),
    permalink: z.string().optional(), series: z.string().optional(),
    tags: z.union([z.array(z.string()), z.string()]).default([]).transform(v => typeof v === 'string' ? [v] : v),
    categories: z.union([z.array(z.string()), z.string()]).default([]).transform(v => typeof v === 'string' ? [v] : v),
    description: z.string().optional(), excerpt: z.string().optional(),
  }),
});
const pages = defineCollection({ loader: glob({ pattern: '*.md', base: './content/pages' }) });
export const collections = { posts, pages };
