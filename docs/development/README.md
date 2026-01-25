# Development Guide

## Prerequisites

- **Node.js 18+** - JavaScript runtime
- **pnpm 8+** - Package manager
- **Docker & Docker Compose** - For local databases
- **Git** - Version control

## Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd testis
pnpm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Start infrastructure services
docker-compose up -d

# Wait for services to be ready (30-60 seconds)
docker-compose logs -f
```

### 3. Database Setup
```bash
# Generate Prisma client and push schema
pnpm --filter @testis/database db:generate
pnpm --filter @testis/database db:push

# Seed development data
pnpm seed
```

### 4. Start Development Servers
```bash
# Start all services
pnpm dev

# Services will be available at:
# - Web Dashboard: http://localhost:3000
# - Collector API: http://localhost:3001
# - Worker: Background process (check logs)
```

## Project Structure

```
testis/
├── apps/
│   ├── web/          # Next.js 15 Dashboard
│   │   ├── app/      # App Router pages
│   │   ├── components/ # React components
│   │   └── lib/      # Utilities
│   ├── collector/    # Fastify Ingestion API
│   │   └── src/      # TypeScript source
│   └── worker/       # Background Processor
│       └── src/      # TypeScript source
├── packages/
│   ├── ui/           # Shared UI Components
│   │   ├── src/components/ # Shadcn/UI components
│   │   └── src/lib/  # Utilities
│   ├── database/     # Prisma Client
│   │   ├── prisma/   # Schema and migrations
│   │   └── src/      # Client exports
│   └── analytics/    # ClickHouse Client
│       └── src/      # Client and schemas
├── scripts/          # Development scripts
├── docs/             # Documentation
└── docker/           # Docker configurations
```

## Development Workflow

### Making Changes

1. **Frontend Changes** (apps/web):
   - Hot reload enabled
   - Tailwind CSS for styling
   - TypeScript strict mode

2. **API Changes** (apps/collector):
   - Auto-restart on file changes
   - Fastify with performance monitoring
   - Redis integration for caching

3. **Worker Changes** (apps/worker):
   - Auto-restart on file changes
   - BullMQ job processing
   - Database integration

4. **Shared Package Changes**:
   - Changes automatically picked up by apps
   - Build packages if needed: `pnpm --filter @testis/ui build`

### Database Changes

#### PostgreSQL (Application State)
```bash
# Edit schema
vim packages/database/prisma/schema.prisma

# Generate client
pnpm --filter @testis/database db:generate

# Push changes to database
pnpm --filter @testis/database db:push

# Create migration (production)
pnpm --filter @testis/database db:migrate
```

#### ClickHouse (Analytics)
```bash
# Edit schemas in packages/analytics/src/index.ts
# Tables are auto-created by worker on startup
```

### Testing

#### Unit Tests
```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @testis/ui test
```

#### Performance Testing
```bash
# Load test the collector
pnpm load-test

# Custom load test
CONCURRENT_REQUESTS=200 TOTAL_REQUESTS=2000 pnpm load-test
```

#### Manual Testing
```bash
# Test collector endpoint
curl -X POST http://localhost:3001/collect \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_key_12345" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "type": "pageview",
    "timestamp": 1640995200000,
    "url": "http://localhost:3000/test",
    "visitor_id": "test_visitor_123"
  }'

# Check collector health
curl http://localhost:3001/health

# Check collector metrics
curl http://localhost:3001/metrics
```

## Coding Standards

### TypeScript
- **Strict mode enabled** across all packages
- **Zod validation** for all external inputs
- **camelCase** for variables and functions
- **PascalCase** for React components
- **snake_case** for database tables/columns

### React/Next.js
- **App Router** (Next.js 15)
- **Server Components** by default
- **Client Components** only when needed
- **Tailwind CSS** for styling
- **Dark mode first** approach

### API Design
- **RESTful endpoints** where appropriate
- **JSON responses** with consistent error format
- **HTTP status codes** following standards
- **Request validation** with Zod schemas

### Database
- **Prisma** for PostgreSQL operations
- **ClickHouse** for analytics queries
- **Redis** for caching and queues
- **Migrations** for schema changes

## Performance Guidelines

### Collector Service
- **Target**: < 5ms response time
- **No database connections** in request path
- **Redis-only validation** for API keys
- **Immediate queue and respond** pattern

### Worker Service
- **Batch processing** (1000 events or 5s intervals)
- **Error handling** with retries
- **Memory efficient** event processing
- **Database connection pooling**

### Frontend
- **Server-side rendering** where possible
- **Lazy loading** for heavy components
- **Optimized images** and assets
- **Minimal JavaScript** bundle size

## Debugging

### Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f clickhouse

# Application logs
pnpm dev  # Shows logs from all apps
```

### Database Inspection
```bash
# PostgreSQL
pnpm --filter @testis/database db:studio

# Redis
docker-compose exec redis redis-cli
> KEYS *
> GET api_key:test_key_12345

# ClickHouse
docker-compose exec clickhouse clickhouse-client
> SHOW TABLES;
> SELECT * FROM events LIMIT 10;
```

### Performance Monitoring
```bash
# Collector metrics
curl http://localhost:3001/metrics

# Load testing
pnpm load-test

# System resources
docker stats
```

## Common Issues

### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Kill processes if needed
kill -9 <PID>
```

### Database Connection Issues
```bash
# Restart databases
docker-compose restart postgres redis clickhouse

# Check database logs
docker-compose logs postgres
```

### Package Resolution Issues
```bash
# Clear node_modules and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

### Build Issues
```bash
# Clean and rebuild
pnpm clean
pnpm build
```

## Environment Variables

### Required Variables
```bash
# Database connections
DATABASE_URL="postgresql://testis:testis_password@localhost:5432/testis"
REDIS_URL="redis://localhost:6379"

# ClickHouse
CLICKHOUSE_URL="http://localhost:8123"
CLICKHOUSE_DATABASE="testis"
CLICKHOUSE_USERNAME="testis"
CLICKHOUSE_PASSWORD="testis_password"

# Application
NODE_ENV="development"
```

### Optional Variables
```bash
# Collector
COLLECTOR_PORT="3001"
MAX_PAYLOAD_SIZE="1048576"

# Worker
BATCH_SIZE="1000"
BATCH_INTERVAL_MS="5000"

# Load Testing
CONCURRENT_REQUESTS="100"
TOTAL_REQUESTS="1000"
```

## Contributing

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes** following coding standards
3. **Test thoroughly** including performance tests
4. **Update documentation** if needed
5. **Submit pull request** with clear description

## Troubleshooting

### "Redis connection failed"
- Ensure Docker Compose is running: `docker-compose up -d`
- Check Redis logs: `docker-compose logs redis`

### "Database connection failed"
- Ensure PostgreSQL is running: `docker-compose ps`
- Run database setup: `pnpm --filter @testis/database db:push`

### "ClickHouse connection failed"
- Wait for ClickHouse to fully start (can take 30-60 seconds)
- Check logs: `docker-compose logs clickhouse`

### "Package not found" errors
- Reinstall dependencies: `pnpm install`
- Build packages: `pnpm build`

For more help, check the [Architecture Documentation](../architecture/README.md) or [API Documentation](../api/README.md).