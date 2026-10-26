import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Abide",
    short_name: "Abide",
    description:
      "A quiet place to reflect on how God is transforming your character through the Fruit of the Spirit.",
    lang: "en-GB",
    dir: "ltr",
    categories: ["lifestyle"],
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone"],
    orientation: "portrait",
    prefer_related_applications: false,
    launch_handler: {
      client_mode: "navigate-existing",
    },
    background_color: "#f7f4ec",
    theme_color: "#f7f4ec",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Reflect on today",
        short_name: "Reflect",
        description: "Open today’s reflection form",
        url: "/reflections/new",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Fruit timeline",
        short_name: "Timeline",
        description: "Revisit your reflections by month",
        url: "/reflections/timeline",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Prayers",
        short_name: "Prayers",
        description: "Return to the prayers you have written",
        url: "/prayers",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
