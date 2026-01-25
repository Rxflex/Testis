# System Architecture

## Overview

Testis is a self-hosted, high-performance user profiling and analytics platform designed to handle massive scale (10k+ RPS) on a single node while providing deep insights through user profiling and heatmap analysis.

## Core Philosophy

**"High Throughput, Zero Config, Deep Insight"**

- **High Throughput**: Optimized for 10,000+ requests per second
- **Zero Config**: Simple script installation with sensible defaults
- **Deep Insight**: Advanced user profiling with age, income, and interest prediction

## System Components

### 1. Client-Side Tracking Script (`@testis/tracking`)

**Purpose**: Lightweight JavaScript library for event collection

**Key Features**:
- ES5 compatible (< 10KB gzipped)
- Automatic event tracking (pageviews, clicks, scrolls, mouse movements)
- Visitor fingerprinting without cookies
- Event batching and throttling
- Beacon API for reliable delivery

**Architecture**:
```typescript
// Event flow
Browser Event → Throttle/Batch → Queue → Send to Collector
```

**Performance Optimizations**:
- Mouse movement throttling (max 10 events/second)
- Event batching (5 events or immediate for pageviews)
- Canvas fingerprinting for visitor identification
- Beacon API for page unload reliability

### 2. Collector Service (`apps/collector`)

**Purpose**: High-performance event ingestion with < 5ms response time

**Technology**: Fastify (Node.js)

**Architecture Rules (CRITICAL)**:
- MUST NOT connect to PostgreSQL or ClickHouse directly
- MUST perform only lightweight validation (Redis API key check)
- MUST push raw payload to Redis Queue (BullMQ)
- MUST respond 200 OK immediately

**Data Flow**:
```
Client Request → API Key Validation (Redis) → Queue Event (BullMQ) → 200 OK Response
```

**Performance Features**:
- Redis-only validation for sub-5ms responses
- BullMQ for reliable event queuing
- Comprehensive error handling with graceful degradation
- Real-time metrics and health monitoring

### 3. Worker Service (`apps/worker`)

**Purpose**: Background processing, enrichment, and database writes

**Technology**: Node.js with BullMQ

**Responsibilities**:
- Consume events from Redis queue
- Dynamic domain discovery and caching
- Event enrichment (GeoIP, User-Agent parsing)
- Age/Income scoring algorithms
- Batch writing to ClickHouse

**Processing Pipeline**:
```
Redis Queue → Domain Discovery → Enrichment → Batching → ClickHouse
```

**Batch Optimization**:
- Batch size: 1000 events OR 5-second intervals
- Automatic table partitioning by month
- Connection pooling for database efficiency

### 4. Web Dashboard (`apps/web`)

**Purpose**: Professional analytics dashboard and management UI

**Technology**: Next.js 15 (App Router)

**UI/UX Principles**:
- Data-dense professional design
- Dark mode as default
- High information density (13px/14px fonts)
- Bento Grid layouts for optimal space usage
- Skeleton loading states (no spinners)

**Features**:
- Real-time analytics with 30-second refresh
- Interactive charts with glassmorphism tooltips
- Responsive design with mobile support
- Error handling with actionable feedback

## Database Architecture

### Strict Separation of Concerns

#### ClickHouse (Analytics Data)
**Purpose**: High-performance analytics storage optimized for heavy writes

**Tables**:
```sql
-- Events table
CREATE TABLE events (
    user_api_key String,
    domain String,
    visitor_id String,
    event_type LowCardinality(String),
    timestamp DateTime64(3),
    url String,
    predicted_age_bucket LowCardinality(String),
    income_score UInt8,
    interests Array(String),
    geo_country LowCardinality(String),
    geo_city String,
    user_agent String,
    ip String,
    data String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_api_key, domain, timestamp);

-- Heatmaps table (optimized for coordinate arrays)
CREATE TABLE heatmaps (
    user_api_key String,
    domain String,
    visitor_id String,
    session_id String,
    url String,
    timestamp DateTime64(3),
    x_coords Array(UInt16),
    y_coords Array(UInt16),
    viewport_w UInt16,
    viewport_h UInt16
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_api_key, domain, timestamp);
```

#### PostgreSQL (Application State)
**Purpose**: User management, projects, domains, settings, billing

**Schema**:
```sql
-- Users and authentication
users (id, email, name, api_key, created_at, updated_at)

-- Project organization
projects (id, name, description, user_id, created_at, updated_at)

-- Domain management
domains (id, hostname, project_id, verified, created_at, updated_at)

-- API key management
api_keys (id, key, name, user_id, active, last_used, created_at, updated_at)
```

#### Redis (Ephemeral Data)
**Purpose**: Caching and queuing

**Usage**:
- **BullMQ Queues**: Event processing pipeline
- **API Key Cache**: Fast validation (`api_key:${key}` → user_id)
- **Domain Cache**: Known domains (`domain:${hostname}` → "1")
- **Session Storage**: User sessions and temporary data

## Data Flow Architecture

### "Fire & Forget" Ingestion Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│  Collector  │───▶│    Redis    │───▶│   Worker    │
│   Script    │    │  (Fastify)  │    │   (Queue)   │    │ (Processor) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                                      │
                           ▼                                      ▼
                   ┌─────────────┐                        ┌─────────────┐
                   │    Redis    │                        │ ClickHouse  │
                   │   (Cache)   │                        │ (Analytics) │
                   └─────────────┘                        └─────────────┘
                                                                 │
                                                                 ▼
                                                         ┌─────────────┐
                                                         │ PostgreSQL  │
                                                         │   (State)   │
                                                         └─────────────┘
```

### Request Flow

1. **Client Event**: Browser generates event (pageview, click, etc.)
2. **Script Processing**: Event is throttled, batched, and queued
3. **HTTP Request**: Sent to collector with API key header
4. **Collector Validation**: Redis lookup for API key (< 1ms)
5. **Queue Event**: Push to BullMQ queue and respond immediately
6. **Worker Processing**: Background consumption and enrichment
7. **Database Write**: Batch insert to ClickHouse
8. **Dashboard Update**: Real-time display with 30s refresh

## Performance Characteristics

### Collector Performance
- **Target Response Time**: < 5ms
- **Throughput**: 10,000+ RPS per instance
- **Memory Usage**: < 100MB per instance
- **CPU Usage**: < 50% under normal load

### Client Script Performance
- **Bundle Size**: < 10KB gzipped
- **Memory Impact**: < 1MB browser memory
- **CPU Impact**: Minimal (throttled events)
- **Network Impact**: Batched requests

### Database Performance
- **ClickHouse**: Optimized for 100k+ inserts/second
- **PostgreSQL**: Connection pooling with Prisma
- **Redis**: Sub-millisecond cache lookups
- **Batch Processing**: 1000 events or 5-second intervals

## Scalability Design

### Horizontal Scaling
- **Collector**: Stateless, can run multiple instances behind load balancer
- **Worker**: Multiple workers can process same queue
- **Database**: ClickHouse supports clustering
- **Redis**: Redis Cluster for high availability

### Vertical Scaling
- **Single Node Target**: 10k+ RPS on single server
- **Memory Efficient**: Minimal memory footprint
- **CPU Optimized**: Async processing throughout

## Security Architecture

### API Security
- **API Key Authentication**: Required for all collector requests
- **CORS Configuration**: Configurable origin validation
- **Rate Limiting**: Configurable per-key limits
- **Input Validation**: Zod schemas for all inputs

### Data Privacy
- **No Cookies**: Uses canvas fingerprinting
- **IP Anonymization**: Optional IP masking
- **GDPR Compliance**: Data retention policies
- **Self-Hosted**: Complete data control

## Monitoring & Observability

### Health Checks
- **Collector**: `/health` endpoint with detailed status
- **Database**: Connection health monitoring
- **Queue**: BullMQ job statistics
- **Worker**: Processing metrics

### Metrics Collection
- **Response Times**: P50, P95, P99 percentiles
- **Throughput**: Requests per second
- **Error Rates**: Failed request percentages
- **Queue Depth**: Pending job counts

### Alerting Thresholds
- Response time > 10ms
- Error rate > 1%
- Queue depth > 10,000 jobs
- Memory usage > 500MB
- CPU usage > 80%

## Development Architecture

### Monorepo Structure
```
testis/
├── apps/
│   ├── web/          # Next.js dashboard
│   ├── collector/    # Fastify API
│   └── worker/       # Background processor
├── packages/
│   ├── ui/           # Shared components
│   ├── database/     # Prisma client
│   ├── analytics/    # ClickHouse client
│   └── tracking/     # Client script
├── scripts/          # Development tools
└── docs/             # Documentation
```

### Build System
- **Turborepo**: Monorepo orchestration
- **pnpm**: Package management
- **TypeScript**: Strict mode across all packages
- **Webpack**: Client script compilation
- **Docker Compose**: Local development environment

## Deployment Architecture

### Container Strategy
- **Multi-stage builds**: Optimized Docker images
- **Service separation**: Each app in own container
- **Shared networks**: Internal communication
- **Volume persistence**: Database data

### Infrastructure Requirements
- **Minimum**: 4 CPU cores, 8GB RAM, 100GB SSD
- **Recommended**: 8 CPU cores, 16GB RAM, 500GB SSD
- **Network**: 1Gbps connection for high throughput
- **OS**: Linux (Ubuntu 20.04+ recommended)

This architecture delivers on the core promise of "High Throughput, Zero Config, Deep Insight" while maintaining professional standards for performance, reliability, and user experience.