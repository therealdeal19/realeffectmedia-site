import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Blog posts live in src/content/blog as Markdown. The filename is the URL:
// src/content/blog/my-post.md  ->  /blog/my-post
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(""),
    date: z.coerce.date(),
    image: z.string().optional().default(""),
    imageAlt: z.string().optional().default(""),
    youtube: z.string().optional().default(""),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
