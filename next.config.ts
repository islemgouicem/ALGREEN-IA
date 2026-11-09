import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  // A package-lock.json exists in the parent folder, so name this project's root explicitly
  turbopack: { root: process.cwd() },
};

export default nextConfig;
