import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blogs = defineCollection({
  loader: glob({
    base: "./src/content/blogs",
    pattern: "**/*.md",
    generateId: ({ entry }) =>
      entry.replace(/\.md$/, "").replace(/\/index$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      draft: z.boolean().optional().default(false),
      tags: z.array(z.string()).optional().default([]),
      hoverImage: image().optional(),
    }),
});

export const collections = { blogs };
