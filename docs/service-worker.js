const timestamp = 1636237142647;
const build = [
  "/_app/start-4d5d3c4f.js",
  "/_app/assets/start-61d1577b.css",
  "/_app/pages/__layout.svelte-2cf340d6.js",
  "/_app/assets/pages/__layout.svelte-1fda6867.css",
  "/_app/error.svelte-9465012a.js",
  "/_app/pages/index.svelte-248b6073.js",
  "/_app/assets/pages/index.svelte-c63fe1c6.css",
  "/_app/pages/about.svelte-414dab21.js",
  "/_app/assets/pages/about.svelte-bf4528fa.css",
  "/_app/pages/todos/index.svelte-ba43e4c4.js",
  "/_app/assets/pages/todos/index.svelte-784042c1.css",
  "/_app/chunks/vendor-836cc791.js"
];
const files = [
  "/.nojekyll",
  "/CHANGELOG.md",
  "/favicon.png",
  "/manifest.json",
  "/robots.txt",
  "/svelte-welcome.png",
  "/svelte-welcome.webp"
];
const worker = self;
const FILES = `cache${timestamp}`;
const to_cache = build.concat(files);
const staticAssets = new Set(to_cache);
worker.addEventListener("install", (event) => {
  event.waitUntil(caches.open(FILES).then((cache) => cache.addAll(to_cache)).then(() => {
    worker.skipWaiting();
  }));
});
worker.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(async (keys) => {
    for (const key of keys) {
      if (key !== FILES)
        await caches.delete(key);
    }
    worker.clients.claim();
  }));
});
async function fetchAndCache(request) {
  const cache = await caches.open(`offline${timestamp}`);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const response = await cache.match(request);
    if (response)
      return response;
    throw err;
  }
}
worker.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.headers.has("range"))
    return;
  const url = new URL(event.request.url);
  const isHttp = url.protocol.startsWith("http");
  const isDevServerRequest = url.hostname === self.location.hostname && url.port !== self.location.port;
  const isStaticAsset = url.host === self.location.host && staticAssets.has(url.pathname);
  const skipBecauseUncached = event.request.cache === "only-if-cached" && !isStaticAsset;
  if (isHttp && !isDevServerRequest && !skipBecauseUncached) {
    event.respondWith((async () => {
      const cachedAsset = isStaticAsset && await caches.match(event.request);
      return cachedAsset || fetchAndCache(event.request);
    })());
  }
});
