import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/keysprint-typing-arena/next', // repo name + subfolder
  images: { unoptimized: true }
};

export default nextConfig;
