const timestamp = 1636245884900;
const build = [
  "/_app/start-b1bde137.js",
  "/_app/assets/start-61d1577b.css",
  "/_app/pages/__layout.svelte-6238fdf2.js",
  "/_app/assets/pages/__layout.svelte-1fda6867.css",
  "/_app/error.svelte-506bd508.js",
  "/_app/pages/index.svelte-613aafde.js",
  "/_app/assets/pages/index.svelte-c63fe1c6.css",
  "/_app/pages/about.svelte-90a08c9f.js",
  "/_app/assets/pages/files.svelte-7da30d25.css",
  "/_app/pages/files.svelte-fd8b8af2.js",
  "/_app/pages/todos/index.svelte-f05623c3.js",
  "/_app/assets/pages/todos/index.svelte-784042c1.css",
  "/_app/chunks/vendor-03dbd443.js",
  "/_app/chunks/env-a13806e5.js"
];
const files = [
  "/.nojekyll",
  "/CHANGELOG.md",
  "/favicon.png",
  "/logo_256.png",
  "/manifest.webmanifest",
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
