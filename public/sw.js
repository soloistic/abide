/* Abide service worker: quiet offline support and gentle push reminders.
 *
 * - Navigations use a network-first strategy so reflections are always fresh
 *   when connected, falling back to the page cache and then /offline.
 * - Static assets (compiled JS/CSS, icons, fonts) use cache-first storage.
 * - Only same-origin GET requests are handled. Mutations travel over POST
 *   through Server Actions and are never cached or replayed.
 * - Push notifications open the reflection form (or another app URL) when
 *   tapped. Development registrations skip request caching so local work is
 *   never served stale.
 */

const VERSION = "abide-v2";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline";
const IS_DEVELOPMENT = new URL(self.location.href).searchParams.has(
  "development",
);
const PRECACHE = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];

self.addEventListener("install", (event) => {
  if (IS_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (IS_DEVELOPMENT) return;

  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && !response.redirected) {
            const copy = response.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ??
            (await caches.match(OFFLINE_URL)) ??
            Response.error()
          );
        }),
    );
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:png|svg|ico|woff2?)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};

  try {
    const parsed = event.data.json();
    payload = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    payload = { body: event.data.text() };
  }

  const title = typeof payload.title === "string" ? payload.title : "Abide";
  const options = {
    body:
      typeof payload.body === "string"
        ? payload.body
        : "Today’s reflection is still open.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag:
      typeof payload.tag === "string"
        ? payload.tag
        : "abide-daily-reminder",
    data: {
      url:
        typeof payload.url === "string" ? payload.url : "/reflections/new",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  const path =
    notificationData && typeof notificationData.url === "string"
      ? notificationData.url
      : "/";
  const target = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (!client.url.startsWith(self.location.origin)) continue;

          if ("navigate" in client) {
            return client
              .navigate(target)
              .then((navigated) => (navigated || client).focus())
              .catch(() => self.clients.openWindow(target));
          }

          return client.focus();
        }

        return self.clients.openWindow(target);
      }),
  );
});
