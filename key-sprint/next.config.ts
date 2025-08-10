import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/keysprint-typing-arena', // Replace with your repo name
  assetPrefix: '/keysprint-typing-arena/',
  images: { unoptimized: true }
};

export default nextConfig;
