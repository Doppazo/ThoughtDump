import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Thinkbox — AI Second Brain",
    short_name: "Thinkbox",
    description: "Capture spoken and typed ideas instantly with Gemini AI organizing them into your second brain.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Quick Capture",
        short_name: "Capture",
        description: "Open fast mini capture window",
        url: "/quick",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
