import { SITE } from "../data/site";

export type Video = { id: string; title: string; published: string; thumb: string };

// Used only if YouTube can't be reached during a build, so the page never ships empty.
const FALLBACK: Omit<Video, "thumb">[] = [
  { id: "FBq9pGBhcl4", title: "Your View Count Is Inflated: The Truth About YouTube's New Rules", published: "2026-08-31T21:00:15+00:00" },
  { id: "60CoxZiJmoM", title: "Mark Cuban's Neighborhood Revealed (and 4 More Elite Texas Streets)", published: "2026-08-05T23:25:55+00:00" },
  { id: "doNO2FdC0qU", title: "Why Smart Business Owners Are Quietly Winning on YouTube", published: "2026-07-03T15:54:34+00:00" },
];

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const withThumb = (v: Omit<Video, "thumb">): Video => ({
  ...v,
  // Drop trailing hashtags from titles (#texas #realestate)
  title: v.title.replace(/(\s+#[^\s#]+)+\s*$/, "").trim(),
  thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
});

let cache: Video[] | null = null;

/** Latest uploads from the channel's public feed, fetched at build time. */
export async function getVideos(limit = 8): Promise<Video[]> {
  if (cache) return cache.slice(0, limit);
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtubeChannelId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
      .map(([, e]) => ({
        id: /<yt:videoId>(.*?)<\/yt:videoId>/.exec(e)?.[1] ?? "",
        title: decode(/<title>([\s\S]*?)<\/title>/.exec(e)?.[1] ?? ""),
        published: /<published>(.*?)<\/published>/.exec(e)?.[1] ?? "",
      }))
      .filter((v) => v.id);
    if (!videos.length) throw new Error("feed had no videos");
    cache = videos.map(withThumb);
  } catch (err) {
    console.warn(`[youtube] using fallback list: ${err}`);
    cache = FALLBACK.map(withThumb);
  }
  return cache.slice(0, limit);
}
