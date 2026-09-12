# Docker Architecture & Multi-Stage Builds

LocalKart provides containerization across all services using minimal **Node Alpine and Nginx Alpine** base images.

---

## 1. Container Topology

```
+-------------------------------------------------------------+
|                      localkart-net                          |
|                                                             |
|   +-----------------------------------------------------+   |
|   |             localkart-load-balancer (Nginx)         |   |
|   |                      Port 80                        |   |
|   +--------------------------+--------------------------+   |
|                              |                              |
|           +------------------+------------------+           |
|           |                                     |           |
|   +-------v-------+                     +-------v-------+   |
|   |  localkart-   |                     |  localkart-   |   |
|   |   backend1    |                     |   backend2    |   |
|   +-------+-------+                     +-------+-------+   |
|           |                                     |           |
|           +------------------+------------------+           |
|                              |                              |
|              +---------------+---------------+              |
|              |                               |              |
|      +-------v-------+               +-------v-------+      |
|      |  localkart-   |               |  localkart-   |      |
|      |    mongodb    |               |     redis     |      |
|      +---------------+               +---------------+      |
+-------------------------------------------------------------+
```

---

## 2. Dockerfile Optimization

### Backend (`docker/Dockerfile.backend`)
* Multi-stage build separates the build phase from runtime.
* Non-root user `localkart` created for least-privilege security.
* Integrated Docker `HEALTHCHECK` probing `GET http://localhost:5000/health`.

### Frontend (`docker/Dockerfile.frontend`)
* Stage 1 compiles production JS/CSS via Vite.
* Stage 2 copies the compiled static assets into an Nginx Alpine container, producing an ultra-lightweight image (~25MB).

---

## 3. Useful Docker Commands

```bash
# Build and run in background
docker compose up --build -d

# View real-time logs across all containers
docker compose logs -f

# Check container health status
docker compose ps

# Stop all services
docker compose down
```
