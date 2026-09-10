// Cloudflare Pages Function: GET /api/videos
// Returns the channel's latest uploads so the carousel stays current between deploys.
// Title cleanup mirrors src/lib/youtube.ts, which renders the same list at build time.
const CHANNEL_ID = "UCjYX_HOuykERE56ojNx-NSw";

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

export async function onRequestGet() {
  const feed = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, {
    cf: { cacheTtl: 1800, cacheEverything: true },
  });
  if (!feed.ok) return Response.json({ videos: [] }, { status: 502 });

  const xml = await feed.text();
  const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .slice(0, 8)
    .map(([, e]) => {
      const id = /<yt:videoId>(.*?)<\/yt:videoId>/.exec(e)?.[1] ?? "";
      return {
        id,
        title: decode(/<title>([\s\S]*?)<\/title>/.exec(e)?.[1] ?? "").replace(/(\s+#[^\s#]+)+\s*$/, "").trim(),
        published: /<published>(.*?)<\/published>/.exec(e)?.[1] ?? "",
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    })
    .filter((v) => v.id);

  return Response.json({ videos }, { headers: { "cache-control": "public, max-age=1800" } });
}
