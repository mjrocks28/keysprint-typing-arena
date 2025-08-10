import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// Derive repo name from GitHub Actions env ("owner/repo") or allow manual override via REPO_NAME
const repoName = process.env.REPO_NAME || process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const subdir = isProd && repoName ? `/${repoName}/next` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: subdir,
  assetPrefix: subdir ? `${subdir}/` : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
