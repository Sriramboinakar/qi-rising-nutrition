import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Qi Rising Nutrition",
    short_name: "Qi Rising",
    description: "Private nutrition coaching management platform",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f7f5",
    theme_color: "#2E5A44",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}