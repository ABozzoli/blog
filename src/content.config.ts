import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const categorySchema = z.enum(["A11y", "Components", "Workarounds", "Ramblings", "ARIA", "WCAG", "CSS"]);

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    publishDate: z.date().nullable(),
    updateDate: z.date().nullable(),
    description: z.string(),
    categories: z.array(categorySchema).min(1),
  }),
});

export const collections = { articles };
