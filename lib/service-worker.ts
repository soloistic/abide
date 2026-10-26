export async function registerAbideServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;

  const url =
    process.env.NODE_ENV === "production"
      ? "/sw.js"
      : "/sw.js?development=1";

  return navigator.serviceWorker.register(url);
}
