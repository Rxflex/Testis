/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@testis/ui"],
  experimental: {
    optimizePackageImports: ["@testis/ui"]
  },
  env: {
    CLICKHOUSE_URL: process.env.CLICKHOUSE_URL || 'http://localhost:8125',
    CLICKHOUSE_DATABASE: process.env.CLICKHOUSE_DATABASE || 'testis',
    CLICKHOUSE_USERNAME: process.env.CLICKHOUSE_USERNAME || 'testis',
    CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD || 'testis_password',
  }
}

module.exports = nextConfig