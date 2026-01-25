# Testis Docker Deployment

## Quick Start (Zero Config)

Start the complete Testis platform with a single command:

```bash
docker-compose -f docker-compose.full.yml up -d
```

This will start:
- **Web Dashboard**: http://localhost:3000
- **Collector API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **ClickHouse**: localhost:8123

## Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| Web Dashboard | 3000 | Management UI & Analytics |
| Collector API | 3001 | High-performance event ingestion |
| Worker | - | Background processing |
| PostgreSQL | 5432 | Application state |
| Redis | 6379 | Queues & caching |
| ClickHouse | 8123/9000 | Analytics storage |

## Development vs Production

### Development (Infrastructure Only)
```bash
docker-compose up -d
```
Starts only databases. Run apps locally with `pnpm dev`.

### Production (Full Stack)
```bash
docker-compose -f docker-compose.full.yml up -d
```
Starts complete platform in production mode.

## Health Checks

All services include health checks. Monitor status:
```bash
docker-compose -f docker-compose.full.yml ps
```

## Environment Variables

Default values work out of the box. For production, override:

```bash
# Create .env file
POSTGRES_PASSWORD=your_secure_password
CLICKHOUSE_PASSWORD=your_secure_password
NEXTAUTH_SECRET=your_jwt_secret
```

## Scaling

Scale individual services:
```bash
# Scale collectors for high traffic
docker-compose -f docker-compose.full.yml up -d --scale collector=3

# Scale workers for processing
docker-compose -f docker-compose.full.yml up -d --scale worker=2
```

## Data Persistence

All data is persisted in Docker volumes:
- `postgres_data`: Application state
- `redis_data`: Cache & queues
- `clickhouse_data`: Analytics events

## Logs

View service logs:
```bash
# All services
docker-compose -f docker-compose.full.yml logs -f

# Specific service
docker-compose -f docker-compose.full.yml logs -f collector
```

## Troubleshooting

### Service Won't Start
1. Check logs: `docker-compose logs [service]`
2. Verify health: `docker-compose ps`
3. Restart: `docker-compose restart [service]`

### Performance Issues
- Monitor collector response times in logs
- Scale collectors if >5ms response time
- Check Redis memory usage
- Monitor ClickHouse disk I/O

### Data Issues
- Verify ClickHouse schema: Connect to http://localhost:8123
- Check PostgreSQL migrations: `docker-compose exec postgres psql -U testis -d testis`
- Monitor Redis queues: `docker-compose exec redis redis-cli`