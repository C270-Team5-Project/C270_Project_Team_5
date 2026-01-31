# Prometheus Monitoring Setup Preview

This is a preview of what your Prometheus monitoring setup would look like.

## 1. Updated Flask App (with Prometheus metrics)

**File: `tic-tac-toe/app.py`**
```python
from flask import Flask, render_template
from prometheus_flask_exporter import PrometheusMetrics

app = Flask(__name__)

# Initialize Prometheus metrics
metrics = PrometheusMetrics(app)

# Add custom info metric
metrics.info('app_info', 'Application info', version='1.0.0')

@app.route("/")
def home():
    return render_template("index.html")

# Prometheus metrics endpoint is automatically created at /metrics

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=False, port=3306)
```

**What this gives you automatically:**
- Request count per endpoint
- Request duration (histogram)
- Request size/response size
- HTTP status codes
- In-progress requests

---

## 2. Updated Dockerfile

**File: `tic-tac-toe/tempdir/Dockerfile`**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Flask and Prometheus exporter
RUN pip install --no-cache-dir flask prometheus-flask-exporter

COPY ./static ./static/
COPY ./templates ./templates/
COPY ./app.py ./app.py

EXPOSE 3306

ENV FLASK_DEBUG=0

CMD ["python", "-c", "from app import app; app.run(host='0.0.0.0', port=3306, debug=False)"]
```

---

## 3. Updated Docker Stack Configuration

**File: `tic-tac-toe/stack.yml`**
```yaml
version: "3.8"

services:
  tictactoe:
    image: tttapp:${IMAGE_TAG}
    ports:
      - "3307:3306"
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      update_config:
        parallelism: 1
        order: start-first
        delay: 3s
        failure_action: rollback
      rollback_config:
        parallelism: 1
        order: stop-first
      labels:
        # Enable Prometheus scraping
        - "prometheus.enable=true"
        - "prometheus.port=3306"
        - "prometheus.path=/metrics"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:3306/ || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    networks:
      - monitoring

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
    deploy:
      replicas: 1
    networks:
      - monitoring

networks:
  monitoring:
    driver: overlay

volumes:
  prometheus-data:
  grafana-data:
```

---

## 4. Prometheus Configuration

**File: `prometheus.yml`**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'tic-tac-toe-swarm'
    environment: 'production'

# Scrape configurations
scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Tic-tac-toe app (all 3 replicas)
  - job_name: 'tictactoe-app'
    dns_sd_configs:
      - names:
          - 'tasks.tictactoe'
        type: 'A'
        port: 3306
    metrics_path: '/metrics'
    scrape_interval: 10s

  # Docker Swarm nodes (optional - requires node exporter)
  - job_name: 'docker-nodes'
    static_configs:
      - targets: []  # Add node-exporter endpoints if you deploy them
```

---

## 5. Key Metrics You'll Get

### Application Metrics (from Flask)
```
# Request metrics
flask_http_request_total{method="GET",status="200"}
flask_http_request_duration_seconds{method="GET"}

# Application info
flask_app_info{version="1.0.0"}

# In-flight requests
flask_http_request_in_progress
```

### What You Can Monitor
1. **Request Rate**: How many requests per second each replica handles
2. **Response Time**: 95th/99th percentile latency
3. **Error Rate**: 4xx and 5xx responses
4. **Load Distribution**: Are all 3 replicas getting equal traffic?
5. **Availability**: Which replicas are up/down

---

## 6. Sample Prometheus Queries

Once running, you can use these queries in Prometheus (http://localhost:9090):

```promql
# Total requests per second across all replicas
rate(flask_http_request_total[5m])

# Average response time
rate(flask_http_request_duration_seconds_sum[5m]) 
/ 
rate(flask_http_request_duration_seconds_count[5m])

# Requests per replica
sum by (instance) (rate(flask_http_request_total[5m]))

# Error rate (non-2xx responses)
rate(flask_http_request_total{status!~"2.."}[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(flask_http_request_duration_seconds_bucket[5m]))
```

---

## 7. Accessing the Services

After deploying:

- **Tic-tac-toe App**: http://localhost:3307
- **Prometheus UI**: http://localhost:9090
- **Grafana Dashboard**: http://localhost:3000 (admin/admin)
- **App Metrics Endpoint**: http://localhost:3307/metrics

---

## 8. Deployment Commands

```bash
# Build the image with the tag
docker build -t tttapp:v1 ./tic-tac-toe/tempdir

# Deploy the stack
IMAGE_TAG=v1 docker stack deploy -c tic-tac-toe/stack.yml tictactoe

# Check services
docker service ls

# View logs from Prometheus
docker service logs tictactoe_prometheus

# Check metrics endpoint manually
curl http://localhost:3307/metrics
```

---

## What's Useful Here vs Overkill?

### ✅ **USEFUL** (Minimal viable monitoring)
- Flask app with `prometheus-flask-exporter` ← Very lightweight
- Prometheus scraping all 3 replicas
- Basic queries to check replica health and load distribution

### 🤔 **NICE TO HAVE** (Learning/Production-like)
- Grafana dashboards for visualization
- 15-day metric retention
- Health check monitoring

### ❌ **OVERKILL FOR YOUR APP**
- Alerting rules (AlertManager)
- Node exporters for host metrics
- Custom business metrics (no business logic to track)
- Complex aggregation rules

---

## Bottom Line

This setup would:
1. **Take ~5 minutes to implement**
2. **Add <10MB to your image** (slim Python + prometheus-flask-exporter)
3. **Use ~200MB RAM for Prometheus + Grafana**
4. **Give you production-grade observability patterns**

It's overkill for functionality but **great for learning Docker Swarm monitoring**.
