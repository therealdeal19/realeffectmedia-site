# realeffectmedia.com

The Real Effect Media website, built with [Astro](https://astro.build) and hosted on Cloudflare Pages.

## Publishing

Every push to `main` builds the site and publishes it to Cloudflare Pages (project `realeffectmedia`)
through `.github/workflows/deploy.yml`. That includes posts saved in Pages CMS, which commit to `main`.
The workflow needs a `CLOUDFLARE_API_TOKEN` repository secret (Cloudflare Pages: Edit permission).

Manual publish from this computer still works: `npx wrangler login` once, then `npm run deploy`.

The YouTube carousel refreshes itself on the live site via `functions/api/videos.js`, so new uploads
show up without a deploy.

To preview the built site with the Cloudflare function locally: `npm run build` then `npm run preview:cf`
(opens on http://localhost:8788).

## Writing a blog post

1. Go to https://app.pagescms.org and sign in with GitHub.
2. Open this repository and click **Blog posts**, then **Add an entry**.
3. Fill in the title, date, summary and featured image, write the post, and click **Save**.

Saving publishes the post. The site rebuilds automatically, and the post is live in about a minute.
Tick **Draft** to save a post without publishing it.

## Things that update on their own

- **YouTube carousel:** rendered from the channel feed on every build, then refreshed in the browser
  from `/api/videos`, so new uploads appear without a rebuild.
- **Sitemap:** regenerated on every build at `/sitemap-index.xml`.

## Settings

`src/data/site.ts` holds the consultation form key (Web3Forms), an optional booking link, and the YouTube channel.
FAQ text lives in `src/data/faqs.ts`.

## Running it locally

```
npm install
npm run dev
```

Then open http://localhost:4321.

## Old Squarespace URLs

`public/_redirects` sends old URLs to their new home with permanent (301) redirects.
