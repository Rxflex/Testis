/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@testis/ui"],
  experimental: {
    optimizePackageImports: ["@testis/ui"]
  }
}

module.exports = nextConfig