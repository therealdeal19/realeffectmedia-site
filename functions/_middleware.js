// Send the bare domain to www so there's one canonical address (matches SITE.url).
// Everything else passes straight through to the static site.
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === "realeffectmedia.com") {
    url.hostname = "www.realeffectmedia.com";
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
