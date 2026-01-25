# API Documentation

## Collector Service API

Base URL: `http://localhost:3001` (development)

### Authentication

All requests to the collector API require an API key in the header:

```http
X-API-Key: your_api_key_here
```

### Endpoints

#### POST /collect

Ingests analytics events for processing.

**Request:**
```http
POST /collect
Content-Type: application/json
X-API-Key: test_key_12345
Origin: https://yourdomain.com

{
  "type": "pageview",
  "timestamp": 1640995200000,
  "url": "https://yourdomain.com/page",
  "visitor_id": "visitor_12345",
  "data": {
    "page_title": "Page Title",
    "referrer": "https://google.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response_time_ms": 2.34
}
```

**Event Types:**
- `pageview` - Page view event
- `click` - Click event
- `mousemove` - Mouse movement (for heatmaps)
- `scroll` - Scroll event

**Required Fields:**
- `type` - Event type (enum)
- `timestamp` - Unix timestamp in milliseconds
- `url` - Full URL where event occurred
- `visitor_id` - Unique visitor identifier

**Optional Fields:**
- `data` - Additional event data (object)

**Error Responses:**

```json
// Missing API key
{
  "error": "Missing API key"
}

// Invalid API key
{
  "error": "Invalid API key"
}

// Invalid payload
{
  "error": "Invalid payload",
  "details": ["type: Invalid enum value"]
}

// Service unavailable
{
  "error": "Service temporarily unavailable"
}
```

#### GET /health

Health check endpoint with detailed system status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1640995200000,
  "uptime": 3600.5,
  "redis": "connected",
  "queue": {
    "waiting": 0,
    "active": 2,
    "completed": 1543,
    "failed": 0
  },
  "metrics": {
    "requests": 15430,
    "errors": 0,
    "avgResponseTime": 2.1,
    "errorRate": "0%"
  },
  "checkTime": 1
}
```

#### GET /metrics

Performance metrics endpoint.

**Response:**
```json
{
  "requests": 15430,
  "errors": 0,
  "avgResponseTime": 2.1,
  "errorRate": 0,
  "uptime": 3600.5,
  "memory": {
    "rss": 45678592,
    "heapTotal": 29360128,
    "heapUsed": 18234567,
    "external": 1234567,
    "arrayBuffers": 123456
  },
  "timestamp": 1640995200000
}
```

## Event Data Schema

### Pageview Event
```json
{
  "type": "pageview",
  "timestamp": 1640995200000,
  "url": "https://example.com/page",
  "visitor_id": "visitor_12345",
  "data": {
    "page_title": "Page Title",
    "referrer": "https://google.com",
    "user_agent": "Mozilla/5.0...",
    "screen_resolution": "1920x1080",
    "viewport_size": "1200x800"
  }
}
```

### Click Event
```json
{
  "type": "click",
  "timestamp": 1640995200000,
  "url": "https://example.com/page",
  "visitor_id": "visitor_12345",
  "data": {
    "element_tag": "button",
    "element_id": "cta-button",
    "element_class": "btn btn-primary",
    "element_text": "Sign Up",
    "x": 450,
    "y": 300
  }
}
```

### Mouse Movement Event (Heatmap)
```json
{
  "type": "mousemove",
  "timestamp": 1640995200000,
  "url": "https://example.com/page",
  "visitor_id": "visitor_12345",
  "data": {
    "session_id": "session_12345",
    "coordinates": [
      {"x": 100, "y": 200, "t": 1640995200000},
      {"x": 105, "y": 205, "t": 1640995200100},
      {"x": 110, "y": 210, "t": 1640995200200}
    ],
    "viewport_w": 1200,
    "viewport_h": 800
  }
}
```

### Scroll Event
```json
{
  "type": "scroll",
  "timestamp": 1640995200000,
  "url": "https://example.com/page",
  "visitor_id": "visitor_12345",
  "data": {
    "scroll_depth": 0.75,
    "scroll_y": 1500,
    "page_height": 2000,
    "viewport_height": 800
  }
}
```

## Client Integration

### JavaScript SDK

```javascript
// Initialize Testis
const testis = new Testis({
  apiKey: 'your_api_key_here',
  endpoint: 'https://your-collector-domain.com/collect',
  visitorId: 'auto', // or provide custom visitor ID
  throttle: 100 // ms between mousemove events
});

// Track pageview
testis.pageview({
  title: document.title,
  referrer: document.referrer
});

// Track custom event
testis.track('click', {
  element: 'signup-button',
  campaign: 'header-cta'
});

// Enable heatmap tracking
testis.enableHeatmap();
```

### HTML Script Tag

```html
<script>
(function(t,e,s,i,s) {
  t[s]=t[s]||function(){(t[s].q=t[s].q||[]).push(arguments)};
  var n=e.createElement("script");n.async=1;n.src=i;
  e.getElementsByTagName("head")[0].appendChild(n);
})(window,document,"testis","https://cdn.testis.com/v1/testis.js");

testis('init', 'your_api_key_here');
testis('pageview');
</script>
```

## Rate Limits

- **Development**: No rate limits
- **Production**: 10,000 requests per minute per API key
- **Burst**: Up to 100 requests per second

## Error Handling

### Client-Side Retry Logic

```javascript
async function sendEvent(eventData, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 401) {
        throw new Error('Invalid API key');
      }
      
      if (i === retries - 1) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
      
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
    }
  }
}
```

### Beacon API Fallback

```javascript
// Use beacon API for reliability on page unload
window.addEventListener('beforeunload', () => {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/collect', JSON.stringify({
      type: 'pageview',
      timestamp: Date.now(),
      url: window.location.href,
      visitor_id: visitorId,
      data: { event: 'page_unload' }
    }));
  }
});
```

## Performance Considerations

### Collector Performance
- **Target Response Time**: < 5ms
- **Throughput**: 10,000+ RPS per instance
- **Memory Usage**: < 100MB per instance
- **CPU Usage**: < 50% under normal load

### Client Performance
- **Bundle Size**: < 10KB gzipped
- **Memory Impact**: < 1MB
- **CPU Impact**: Minimal (throttled events)
- **Network Impact**: Batched requests

### Optimization Tips

1. **Batch Events**: Group multiple events in single request
2. **Throttle Mouse Events**: Max 10 events per second
3. **Use Beacon API**: For page unload events
4. **Compress Payloads**: Enable gzip compression
5. **Cache API Keys**: Avoid repeated validation

## Security

### API Key Management
- API keys should be treated as sensitive data
- Use environment variables for server-side keys
- Rotate keys regularly in production
- Monitor for unauthorized usage

### CORS Configuration
- Configure allowed origins in production
- Use HTTPS for all requests
- Validate referrer headers

### Data Privacy
- Respect user privacy preferences
- Implement opt-out mechanisms
- Anonymize sensitive data
- Comply with GDPR/CCPA requirements

## Testing

### Load Testing
```bash
# Basic load test
pnpm load-test

# Custom load test
CONCURRENT_REQUESTS=500 TOTAL_REQUESTS=10000 pnpm load-test

# Stress test
CONCURRENT_REQUESTS=1000 TOTAL_REQUESTS=50000 pnpm load-test
```

### Integration Testing
```bash
# Test collector endpoint
curl -X POST http://localhost:3001/collect \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_key_12345" \
  -d '{"type":"pageview","timestamp":1640995200000,"url":"http://test.com","visitor_id":"test"}'

# Expected response
{"success":true,"response_time_ms":1.23}
```

## Monitoring

### Key Metrics
- **Response Time**: Average, P95, P99
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Queue Depth**: Pending events in Redis
- **Memory Usage**: Heap and RSS memory
- **CPU Usage**: Process CPU utilization

### Alerting Thresholds
- Response time > 10ms
- Error rate > 1%
- Queue depth > 10,000
- Memory usage > 500MB
- CPU usage > 80%

For more information, see the [Architecture Documentation](../architecture/README.md) and [Deployment Guide](../deployment/README.md).