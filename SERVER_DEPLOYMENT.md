# Server Deployment Instructions

## Quick Start on Server

### 1. Prepare the Server
```bash
# Make deployment script executable
chmod +x deploy-check.sh
chmod +x start.sh

# Install required tools (if not present)
sudo apt update
sudo apt install -y curl bc
```

### 2. Deploy the Platform
```bash
# Option A: Use the automated start script
./start.sh

# Option B: Manual Docker Compose
docker-compose up -d
```

### 3. Verify Deployment
```bash
# Run comprehensive deployment check
./deploy-check.sh
```

## Expected Results

After successful deployment, you should see:

### ✅ Infrastructure Status
- PostgreSQL: Connected and ready
- Redis: Connected and responding to PING
- ClickHouse: HTTP interface accessible on port 8124

### ✅ Service Health
- Collector Health: Returns detailed health status
- Collector Metrics: Performance metrics available
- Web Dashboard: Accessible on port 3000

### ✅ API Functionality
- Event Collection: Accepts pageview/click events
- Authentication: Validates API keys correctly
- Error Handling: Rejects invalid requests appropriately

### ✅ Performance Benchmarks
- Response Time: <5ms for collector endpoints
- Throughput: Ready for 10k+ RPS
- Resource Usage: Optimized memory and CPU usage

## Service Endpoints

Once deployed, the following services will be available:

- **Web Dashboard**: http://your-server:3000
- **Collector API**: http://your-server:3001
- **Health Check**: http://your-server:3001/health
- **Metrics**: http://your-server:3001/metrics

## Port Configuration

The system uses these ports (configured to avoid conflicts):
- **3003**: Web Dashboard (Next.js)
- **3001**: Collector API (Fastify)
- **5432**: PostgreSQL (internal)
- **6379**: Redis (internal)
- **8125**: ClickHouse HTTP (mapped from 8123)
- **9002**: ClickHouse Native (mapped from 9000)

## Troubleshooting

If any checks fail, try these steps:

### 1. Check Container Status
```bash
docker-compose ps
```

### 2. View Service Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs collector
docker-compose logs worker
docker-compose logs web
```

### 3. Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart collector
```

### 4. Full Rebuild (if needed)
```bash
# Stop and remove containers
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

## Performance Optimization

For production deployment, consider:

### 1. System Resources
- **Minimum**: 4 CPU cores, 16GB RAM, 100GB SSD
- **Recommended**: 8 CPU cores, 32GB RAM, 500GB NVMe SSD

### 2. Network Configuration
- Configure firewall to allow only necessary ports
- Use reverse proxy (nginx) for SSL termination
- Set up load balancing for high availability

### 3. Database Optimization
- Tune PostgreSQL configuration for your workload
- Configure ClickHouse memory settings
- Set up regular backup procedures

## Security Checklist

Before production use:

- [ ] Change default database passwords
- [ ] Configure proper API key management
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain allowlists
- [ ] Set up monitoring and alerting
- [ ] Configure backup procedures
- [ ] Review firewall rules

## Monitoring

The platform includes built-in monitoring:

### Health Endpoints
- **Collector Health**: Detailed service status
- **Metrics**: Performance and usage statistics
- **Database Status**: Connection and query performance

### Key Metrics to Monitor
- Response times (target: <5ms)
- Queue depth (Redis BullMQ)
- Error rates and failed requests
- Database performance
- Memory and CPU usage

## Support

If you encounter issues:

1. **Check the deployment script output** for specific error messages
2. **Review service logs** using `docker-compose logs [service]`
3. **Verify system resources** are sufficient
4. **Check network connectivity** between services
5. **Ensure ports are not blocked** by firewall

## Success Indicators

A successful deployment will show:
- ✅ All infrastructure services connected
- ✅ All health checks passing
- ✅ API endpoints responding correctly
- ✅ Response times under 5ms
- ✅ No failed containers in `docker-compose ps`

The platform is now ready to handle high-throughput analytics with zero configuration required from end users.