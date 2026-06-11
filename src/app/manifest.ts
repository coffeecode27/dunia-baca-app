import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dunia Baca",
    short_name: "Dunia Baca",
    description: "Platform berbagi ebook gratis",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4361ee",
    icons: [
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon-192x192.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
