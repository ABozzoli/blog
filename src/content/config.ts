import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string(), //TODO: could reference a json
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    description: z.string(),
    draft: z.boolean(),
    category: z.string(), //TODO: could be an array
  }),
});

export const collections = { blog };
