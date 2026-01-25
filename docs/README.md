# Testis - High-Performance User Profiling & Analytics Platform

## Overview

Testis is a self-hosted analytics platform designed for high-throughput user profiling and behavioral analysis. Built for business owners who need deep insights (age, income, interests) and heatmaps with zero configuration complexity.

**Core Philosophy:** "High Throughput, Zero Config, Deep Insight."

**Performance Target:** 10k+ RPS on a single node with <5ms response times.

## Quick Start

```bash
# Clone and setup
git clone <repository>
cd testis
pnpm install

# Start development environment
docker-compose up -d
pnpm dev
```

## Architecture Overview

- **Collector (Fastify):** Ultra-fast event ingestion (<5ms response)
- **Worker (Node.js):** Background processing and enrichment
- **Dashboard (Next.js 15):** Real-time analytics interface
- **Storage:** ClickHouse (events) + PostgreSQL (app state) + Redis (cache/queue)

## Documentation Structure

- [Architecture](./architecture/) - System design and data flow
- [API Reference](./api/) - Endpoint specifications
- [Deployment](./deployment/) - Installation and scaling
- [Development](./development/) - Setup and contribution guide
- [Status](./status/) - Current implementation progress

## Key Features

- **Real-time Analytics:** Live visitor tracking and profiling
- **Heatmap Generation:** Mouse movement and click tracking
- **User Profiling:** Age/income prediction with interest tagging
- **Zero Config:** Automatic domain discovery and setup
- **High Performance:** Optimized for massive scale on minimal hardware