import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The app's screens are plain HTML/JS in public/. Open them at the main address.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    // Always serve the newest app files (no stale copies after an update)
    return [
      { source: "/:file(index.html|app.js|api.js|auth.js|vault.js|styles.css)", headers: [{ key: "Cache-Control", value: "no-cache" }] },
      { source: "/screens/:file*", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
};

export default nextConfig;
