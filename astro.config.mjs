import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.realeffectmedia.com",
  // Keep URLs identical to the old Squarespace site (/faqs, not /faqs/)
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [
    sitemap({ filter: (page) => !page.includes("/thanks") && !page.includes("/404") }),
  ],
});
