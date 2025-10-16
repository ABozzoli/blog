import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    update: z.date().optional(),
    description: z.string(),
    draft: z.boolean(),
    category: z.string(), //TODO: could be an array
  }),
});

export const collections = { articles };
