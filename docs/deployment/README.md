# Testis Deployment Guide

## Quick Start (Zero Config)

### One-Command Deployment

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

**Manual Docker Compose:**
```bash
# Full production deployment
docker-compose -f docker-compose.full.yml up -d

# Development (infrastructure only)
docker-compose up -d
```

## What Gets Deployed

The complete Testis platform includes:

### Core Services
- **Web Dashboard** (Next.js 15) - Port 3000
- **Collector API** (Fastify) - Port 3001  
- **Worker** (Node.js) - Background processing

### Infrastructure
- **PostgreSQL 16** - Application state (Port 5432)
- **Redis 7** - Queues & caching (Port 6379)
- **ClickHouse 23.12** - Analytics storage (Ports 8123, 9000)

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │───▶│   Collector     │───▶│     Redis       │
│  (Dashboard)    │    │   (<5ms API)    │    │   (BullMQ)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐             │
│   PostgreSQL    │◀───│     Worker      │◀────────────┘
│ (App State)     │    │  (Processing)   │
└─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   ClickHouse    │
                       │  (Analytics)    │
                       └─────────────────┘
```

## Performance Specifications

- **Collector Response Time**: <5ms guaranteed
- **Throughput**: 10,000+ RPS on single node
- **Data Processing**: Batched writes every 5s or 1000 events
- **Storage**: Optimized for heavy writes with MergeTree engine

## Environment Configuration

### Default Values (Development)
```env
POSTGRES_PASSWORD=testis_password
CLICKHOUSE_PASSWORD=testis_password
NEXTAUTH_SECRET=testis-dev-secret
```

### Production Override
Create `.env` file:
```env
POSTGRES_PASSWORD=your_secure_password
CLICKHOUSE_PASSWORD=your_secure_password  
NEXTAUTH_SECRET=your_jwt_secret_32_chars_min
NEXTAUTH_URL=https://your-domain.com
```

### System Requirements

**Minimum Specifications:**
- CPU: 4 cores (8 threads)
- RAM: 16GB
- Storage: 100GB SSD
- Network: 1Gbps

**Recommended Specifications:**
- CPU: 8 cores (16 threads)
- RAM: 32GB
- Storage: 500GB NVMe SSD
- Network: 10Gbps

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  collector:
    image: testis/collector:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  worker:
    image: testis/worker:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/testis
      - CLICKHOUSE_URL=http://clickhouse:8123
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - clickhouse
      - redis
    deploy:
      replicas: 2

  web:
    image: testis/web:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/testis
      - CLICKHOUSE_URL=http://clickhouse:8123
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=testis
      - POSTGRES_USER=testis
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf

  clickhouse:
    image: clickhouse/clickhouse-server:latest
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./clickhouse-config.xml:/etc/clickhouse-server/config.xml
    ulimits:
      nofile:
        soft: 262144
        hard: 262144

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 2gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  clickhouse_data:
  redis_data:
```

### Environment Configuration

#### Production Environment Variables
```env
# Application
NODE_ENV=production
LOG_LEVEL=info

# Database URLs
DATABASE_URL=postgresql://testis:${POSTGRES_PASSWORD}@postgres:5432/testis
CLICKHOUSE_URL=http://clickhouse:8123
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=${JWT_SECRET}
API_KEY_SALT=${API_KEY_SALT}

# Performance
WORKER_CONCURRENCY=10
BATCH_SIZE=1000
BATCH_TIMEOUT=5000

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
```

### Database Optimization

#### PostgreSQL Configuration (postgres.conf)
```conf
# Memory
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 1GB

# Connections
max_connections = 200
shared_preload_libraries = 'pg_stat_statements'

# WAL
wal_buffers = 64MB
checkpoint_completion_target = 0.9
max_wal_size = 4GB
min_wal_size = 1GB

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### ClickHouse Configuration (clickhouse-config.xml)
```xml
<clickhouse>
    <max_connections>1000</max_connections>
    <max_concurrent_queries>100</max_concurrent_queries>
    
    <!-- Memory -->
    <max_memory_usage>8000000000</max_memory_usage>
    <max_bytes_before_external_group_by>4000000000</max_bytes_before_external_group_by>
    
    <!-- Compression -->
    <compression>
        <case>
            <method>lz4</method>
        </case>
    </compression>
    
    <!-- Merge Tree Settings -->
    <merge_tree>
        <max_suspicious_broken_parts>10</max_suspicious_broken_parts>
        <parts_to_delay_insert>150</parts_to_delay_insert>
        <parts_to_throw_insert>300</parts_to_throw_insert>
    </merge_tree>
</clickhouse>
```

### Load Balancer Configuration

#### Nginx Configuration
```nginx
upstream collector_backend {
    least_conn;
    server collector1:3001 max_fails=3 fail_timeout=30s;
    server collector2:3001 max_fails=3 fail_timeout=30s;
    server collector3:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name collect.yourdomain.com;
    
    location / {
        proxy_pass http://collector_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Performance optimizations
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Timeouts
        proxy_connect_timeout 1s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
    }
}
```

### Monitoring & Observability

#### Health Checks
```bash
# Collector health
curl -f http://localhost:3001/health || exit 1

# Database connectivity
pg_isready -h postgres -p 5432 -U testis

# ClickHouse health
curl -f http://clickhouse:8123/ping

# Redis health
redis-cli -h redis ping
```

#### Metrics Collection
- **Application Metrics:** Prometheus + Grafana
- **Infrastructure:** Node Exporter, cAdvisor
- **Logs:** ELK Stack or Loki
- **APM:** Sentry for error tracking

### Scaling Strategies

#### Horizontal Scaling
1. **Collector Instances:** Scale based on CPU usage (target: 70%)
2. **Worker Instances:** Scale based on Redis queue depth
3. **Database Read Replicas:** For dashboard queries

#### Vertical Scaling
1. **Memory:** Monitor ClickHouse memory usage
2. **CPU:** Monitor collector response times
3. **Storage:** Monitor disk I/O and space usage

### Backup Strategy

#### Database Backups
```bash
# PostgreSQL backup
pg_dump -h postgres -U testis testis | gzip > backup_$(date +%Y%m%d).sql.gz

# ClickHouse backup
clickhouse-client --query "BACKUP TABLE events TO Disk('backups', 'events_$(date +%Y%m%d)')"
```

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL
docker exec testis_postgres pg_dump -U testis testis | gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

# ClickHouse
docker exec testis_clickhouse clickhouse-client --query "BACKUP DATABASE testis TO Disk('local', 'backup_$DATE')"

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

### Security Considerations

1. **Network Security:** Use VPC/private networks
2. **API Keys:** Rotate regularly, use strong entropy
3. **Database Access:** Restrict to application networks only
4. **SSL/TLS:** Terminate at load balancer level
5. **Secrets Management:** Use Docker secrets or external vault

### Performance Tuning

#### Collector Optimization
- Use cluster mode for Node.js
- Optimize Redis connection pooling
- Monitor garbage collection

#### Worker Optimization
- Tune batch sizes based on memory usage
- Implement circuit breakers for external services
- Use connection pooling for databases

#### Database Optimization
- Regular VACUUM and ANALYZE for PostgreSQL
- Optimize ClickHouse partitions and indexes
- Monitor query performance and optimize slow queries