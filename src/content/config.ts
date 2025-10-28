import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishDate: z.date().nullable(),
    updateDate: z.date().nullable(),
    description: z.string(),
    category: z.string(), //TODO: should be an array
  }),
});

export const collections = { articles };
