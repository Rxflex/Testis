PROJECT CONTEXT: TESTIS

Project Name: Testis

Type: Self-Hosted High-Performance User Profiling & Analytics Platform

Core Philosophy: "High Throughput, Zero Config, Deep Insight."

Goal: Provide business owners with deep profiling (age, income, interests) and heatmaps via a simple script installation, handling massive scale (10k+ RPS) on a single node.

## CRITICAL PROJECT REQUIREMENTS

**NO MOCK DATA POLICY**: The system must work with real data only. No fallbacks, no mock responses. If a service is unavailable, the system should fail fast with clear error messages. Mock data creates false confidence and hides real issues.

**PRODUCTION-READY STANDARD**: Every component must be production-ready from day one. No placeholder implementations, no "TODO" comments in production code.

1. TECH STACK & INFRASTRUCTURE

Monorepo Structure (Turborepo)

PackageManager: pnpm

/apps/web: Next.js 15 (App Router) - The Dashboard & Management UI.

/apps/collector: Fastify (Node.js) - High-performance ingestion service.

/apps/worker: Node.js - Background processor for enrichment & DB writes.

/packages/ui: Shared component library (Shadcn/UI).

/packages/database: Prisma Client (PostgreSQL only).

/packages/analytics: ClickHouse Client & Typed Schemas.

Databases (Strict Separation of Concerns)

ClickHouse (Analytics): Stores raw events, heatmaps, and logs. Optimized for heavy writes.

PostgreSQL (Application State): Stores Users, Projects, Domains, Settings, Billing.

Redis (Ephemeral):

Queue: BullMQ (buffering events from Collector to Worker).

Cache: Session storage, Hot-cache for valid API Keys and Domain allowlists.

2. ARCHITECTURAL RULES (CRITICAL)

The "Fire & Forget" Ingestion Pipeline

Goal: The Collector must respond in < 5ms.

Collector (Fastify):

MUST NOT connect to PostgreSQL or ClickHouse directly.

MUST perform only lightweight validation (check API Key existence in Redis).

MUST push the raw payload to Redis Queue (BullMQ).

MUST respond 200 OK immediately.

Worker (Node.js):

Consumes jobs from Redis.

Dynamic Domain Discovery: Checks if the Origin domain is known. If not, adds it to Postgres Domains table and updates Redis Cache.

Enrichment: Resolves GeoIP, parses User-Agent, calculates "Scoring" (Age/Income probability).

Batching: Inserts processed events into ClickHouse in batches (e.g., every 5s or 1000 items).

Client-Side Script

Written in TypeScript, compiled to raw ES5 (Vanilla JS).

Throttling: Mouse movements for heatmaps must be throttled (max 1 event per 100ms) and batched on the client side before sending.

Transport: Use navigator.sendBeacon for reliability upon page unload.

3. UI/UX GUIDELINES ("NO AI SLOP")

Aesthetic: "Data-Dense Professional"
Inspiration: Linear, Vercel, Plausible.
Forbidden: Generic colorful illustrations, large rounded corners (> 8px), wasted whitespace, "playful" fonts.

Visual Rules:

Density: The dashboard is a business tool. Information density should be high. Use 13px/14px fonts for tables and data.

Typography: Inter or Geist Sans. Use tabular nums (font-feature-settings: "tnum") for all metrics.

Colors:

Primary: Monochrome (Slate/Zinc).

Accents: Use color strictly to highlight meaningful data (e.g., Green for growth, Red for drop, Amber for warnings).

Dark Mode is the default or first-class citizen.

Components (Shadcn/UI):

Use Bento Grid layouts for overview cards.

Use Skeletons for loading states (Never use generic spinners).

Charts (Recharts): Minimalist axes, precise tooltips (Glassmorphism effect), no grid lines unless necessary.

4. DATA SCHEMA & MODELING

ClickHouse: events Table

Engine: MergeTree

Partition: toYYYYMM(timestamp)

Order By: (user_api_key, domain, timestamp) - Optimized for retrieving a specific client's data by time.

Columns:

user_api_key (String) - Tenant ID.

domain (String) - Automatically discovered domain.

visitor_id (String) - Fingerprint.

predicted_age_bucket (LowCardinality String) - '18-24', '25-34', etc.

income_score (UInt8) - 0-100 calculated score.

interests (Array(String)) - Tags derived from URL/Content.

ClickHouse: heatmaps Table

Storage Strategy: DO NOT store 1 row per pixel move.

Structure: Store arrays of coordinates per interaction session.

x_coords Array(UInt16)

y_coords Array(UInt16)

viewport_w UInt16

viewport_h UInt16

5. CODING STANDARDS

Language: TypeScript (Strict Mode).

Validation: All external inputs (API, Env vars) must be validated with Zod.

Error Handling:

Collector must never crash. If Redis is down, log to file/stdout but keep alive (or fail fast).

UI must handle empty states (e.g., "No data for this domain yet") gracefully with actionable empty-state components.

NO MOCK DATA: Never return mock/fake data. If real data is unavailable, return appropriate error states.

Naming:

Database tables: snake_case (Postgres), snake_case (ClickHouse).

TS Variables/Functions: camelCase.

React Components: PascalCase.

6. DOCUMENTATION STANDARDS

Structure: All documentation MUST be in /docs directory with strict organization.

Format: Markdown only. No duplication across files.

Required Documentation:

/docs/README.md - Project overview and quick start.

/docs/architecture/ - System design, data flow, and component interactions.

/docs/api/ - API specifications and examples.

/docs/deployment/ - Installation, configuration, and scaling guides.

/docs/development/ - Setup, coding standards, and contribution guidelines.

/docs/status/ - Current implementation status and roadmap.

Status Tracking:

Each feature/component must have clear status: Not Started | In Progress | Complete | Blocked.

Include completion percentage for partially implemented features.

Document known issues, technical debt, and next steps.

Update status after each significant change.

7. IMPLEMENTATION PHASES FOR AGENT

Phase 1 - Foundation (Scaffold):

✅ Init Turborepo with pnpm workspace

✅ Setup Next.js 15 app (/apps/web)

✅ Setup Fastify collector (/apps/collector)

✅ Setup Worker service (/apps/worker)

✅ Create shared packages structure

✅ Docker Compose for local development

Phase 2 - Core Infrastructure (Ingestion):

✅ Redis integration with BullMQ

✅ Fastify collector with <5ms response time

✅ API key validation via Redis cache

✅ Raw payload queuing system

Phase 3 - Data Processing (Processing):

✅ Worker job consumption from Redis

✅ Dynamic domain discovery logic

⏳ GeoIP and User-Agent enrichment

⏳ Age/Income scoring algorithms

Phase 4 - Storage Layer (Storage):

✅ ClickHouse schema implementation

✅ PostgreSQL schema with Prisma

✅ Batch writing optimization

✅ Data partitioning strategy

Phase 5 - Visualization (Dashboard):

🔄 Next.js dashboard with App Router (Basic implementation)

✅ Shadcn/UI component library

✅ Bento Grid layouts

✅ Recharts integration with glassmorphism

❌ Authentication system

❌ User management pages

❌ Project/Domain management

❌ Settings pages

❌ API key management UI

Phase 6 - Client Integration (Script):

✅ TypeScript tracking script

✅ ES5 compilation pipeline

✅ Mouse movement throttling

✅ Beacon API implementation

## MISSING CRITICAL COMPONENTS

### Authentication & Authorization
- ❌ User registration/login system
- ❌ Session management
- ❌ Role-based access control
- ❌ API key management interface

### Essential Pages
- ❌ Login/Register pages
- ❌ User dashboard/profile
- ❌ Project management
- ❌ Domain management
- ❌ API key management
- ❌ Settings/configuration
- ❌ Billing/subscription (if applicable)
- ❌ Help/documentation pages

### Data Processing
- ❌ Real GeoIP integration
- ❌ Advanced User-Agent parsing
- ❌ ML-based age/income scoring
- ❌ Content-based interest extraction

### Production Features
- ❌ Rate limiting
- ❌ DDoS protection
- ❌ Comprehensive error handling
- ❌ Monitoring and alerting
- ❌ Backup and recovery
- ❌ Performance optimization

## CURRENT STATUS: 60% COMPLETE

**BLOCKERS:**
1. No authentication system - users cannot register or login
2. Missing essential UI pages for user/project management
3. Mock data fallbacks need to be removed completely
4. Advanced analytics features not implemented

**IMMEDIATE PRIORITIES:**
1. Remove all mock data and fallbacks
2. Implement authentication system
3. Create essential user management pages
4. Add proper error handling without fallbacks

Legend: ✅ Complete | 🔄 In Progress | ⏳ Not Started | ❌ Blocked

