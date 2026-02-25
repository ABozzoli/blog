import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishDate: z.date().nullable(),
    updateDate: z.date().nullable(),
    description: z.string(),
    categories: z.array(z.string()).min(1),
  }),
});

export const collections = { articles };
