import type { NextConfig } from "next";

// Cache Components is intentionally left off: most routes read the session cookie
// and render per-user data, so the classic dynamic rendering model is simpler here.
// See docs/ARCHITECTURE.md for the reasoning.
const nextConfig: NextConfig = {
  // Database drivers run as plain Node packages (PGlite ships WASM + data files).
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  // The embedded demo database builds itself from these SQL files at runtime.
  outputFileTracingIncludes: { "/**": ["./supabase/migrations/**", "./supabase/seed.sql"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb", // business logos are uploaded as data URLs in mock mode
    },
  },
};

export default nextConfig;
