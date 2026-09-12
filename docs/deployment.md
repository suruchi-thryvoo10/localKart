# Production Deployment Guide

This guide outlines deployment options for hosting LocalKart in production environments (AWS, DigitalOcean, Render, or Kubernetes).

---

## 1. Environment Variables Checklist

Ensure the following environment variables are securely injected into your production environment:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/localkart?retryWrites=true&w=majority
REDIS_URL=rediss://default:<password>@redis-host:6379
JWT_SECRET=<generate-strong-64-byte-random-string>
JWT_REFRESH_SECRET=<generate-strong-64-byte-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://localkart.in
PLATFORM_COMMISSION_PERCENTAGE=5
DEFAULT_DELIVERY_RADIUS_KM=10
DEFAULT_DELIVERY_FEE=30
FREE_DELIVERY_THRESHOLD=500
```

---

## 2. Production Health Checks & Monitoring

* **Liveness Probe**: `GET /health` (Returns HTTP 200 with process uptime, DB status, and Redis status).
* **Readiness Probe**: `GET /api/v1/health` (Returns HTTP 200 with instance ID and version).

---

## 3. Recommended Production Architecture (AWS / Cloud)

* **CDN / Edge**: Cloudflare or AWS CloudFront (SSL, DDoS protection, edge asset caching).
* **Load Balancer**: AWS Application Load Balancer (ALB) or DigitalOcean Load Balancer.
* **Compute**: AWS ECS / Fargate or Kubernetes cluster running auto-scaled Node.js backend replicas.
* **Database**: MongoDB Atlas M10+ (Automated backups, Geo-replicated replicas).
* **Cache**: AWS ElastiCache for Redis (Cluster mode enabled).
