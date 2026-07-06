import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) sets up a Node worker at runtime using a path
  // Turbopack/webpack can't statically bundle. Keeping it external lets Node's
  // own `require` resolve it from node_modules instead of the route's bundle.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
