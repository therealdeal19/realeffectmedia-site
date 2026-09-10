// One-time import of the blog posts from the old Squarespace site.
// Usage: npm run import-squarespace
// Writes Markdown to src/content/blog and downloads images to public/media/blog.
import TurndownService from "turndown";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.realeffectmedia.com";
const OUT = "src/content/blog";
const MEDIA = "public/media/blog";

// Old Squarespace URLs that get a clean new slug. Keep public/_redirects in sync.
const RENAME = {
  "Blog Post Title One-3zaa9-zlxng-xbkmm-zx56h":
    "how-youtube-helps-real-estate-agents-in-austin-and-houston-generate-leads-in-2026",
};
// Posts whose Squarespace date was wrong (left over from the template).
const DATE_FIX = {
  "how-youtube-helps-real-estate-agents-in-austin-and-houston-generate-leads-in-2026": "2026-05-28",
};

const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced", emDelimiter: "*" });
td.remove(["script", "style", "noscript", "button"]);

const getJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
};

async function download(url, name) {
  const src = url.includes("squarespace-cdn.com") && !url.includes("format=") ? `${url}${url.includes("?") ? "&" : "?"}format=1500w` : url;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`${res.status} for ${src}`);
  const type = res.headers.get("content-type") ?? "";
  const ext = type.includes("png") ? ".png" : type.includes("webp") ? ".webp" : ".jpg";
  const file = `${name}${ext}`;
  await writeFile(path.join(MEDIA, file), Buffer.from(await res.arrayBuffer()));
  return `/media/blog/${file}`;
}

// Calendar date in the site's time zone (Squarespace showed dates in Central time)
const localDate = (ms) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date(ms));

const plain = (html) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/\s+/g, " ").trim();

function summary(html) {
  const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => plain(m[1])).filter((t) => t.length > 60);
  const text = paras[0] ?? plain(html);
  if (text.length <= 158) return text;
  return text.slice(0, 155).replace(/\s+\S*$/, "") + "…";
}

const yamlStr = (s) => JSON.stringify(s ?? "");

await mkdir(OUT, { recursive: true });
await mkdir(MEDIA, { recursive: true });

const list = await getJson(`${SITE}/blog?format=json`);
for (const item of list.items) {
  const post = (await getJson(`${SITE}${item.fullUrl}?format=json`)).item;
  const slug = RENAME[post.urlId] ?? post.urlId;
  let html = post.body ?? "";

  // Swap Squarespace images for local copies with clean <img> tags
  const imgTags = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  let n = 0;
  for (const tag of imgTags) {
    const src = /data-src="([^"]+)"/.exec(tag)?.[1] ?? /\ssrc="([^"]+)"/.exec(tag)?.[1];
    if (!src || src.startsWith("data:")) { html = html.replace(tag, ""); continue; }
    const alt = /alt="([^"]*)"/.exec(tag)?.[1] ?? "";
    const local = await download(src, `${slug}-${++n}`);
    html = html.replace(tag, `<img src="${local}" alt="${alt}">`);
  }

  let md = td.turndown(html)
    .replace(/ /g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  // Drop a leading H1 that repeats the title (the page already shows it)
  md = md.replace(/^# .+\n+/, "");

  const image = post.assetUrl ? await download(post.assetUrl, slug) : "";
  const date = DATE_FIX[slug] ?? localDate(post.publishOn);

  const front = [
    "---",
    `title: ${yamlStr(post.title)}`,
    `description: ${yamlStr(summary(post.body ?? ""))}`,
    `date: ${date}`,
    `image: ${yamlStr(image)}`,
    `imageAlt: ${yamlStr("")}`,
    `youtube: ${yamlStr("")}`,
    "draft: false",
    "---",
  ].join("\n");

  await writeFile(path.join(OUT, `${slug}.md`), `${front}\n\n${md}\n`);
  console.log(`✓ ${slug}.md  (${date}, ${imgTags.length} inline images)`);
}
