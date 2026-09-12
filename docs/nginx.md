# Nginx Reverse Proxy & Load Balancer

Nginx sits at the edge of the LocalKart architecture, functioning as the **SSL terminator, static asset server, and upstream load balancer**.

---

## 1. Upstream Cluster Configuration

```nginx
upstream backend_cluster {
    least_conn; # Routes to instance with least active TCP connections
    server backend1:5000 max_fails=3 fail_timeout=10s;
    server backend2:5000 max_fails=3 fail_timeout=10s;
    keepalive 32;
}
```

* **`least_conn`**: Ensures compute-heavy operations (e.g., geospatial aggregations) don't bottleneck a single instance.
* **`max_fails=3 fail_timeout=10s`**: Automatically marks a failed container offline and reroutes incoming traffic to healthy nodes.
* **`keepalive 32`**: Maintains persistent connections between Nginx and Node instances, reducing TCP handshake overhead.

---

## 2. Performance & Security Features

* **Gzip Compression**: Compresses JSON payloads, JS bundles, and CSS stylesheets on the fly with compression level 6.
* **Security Headers**:
  * `X-Frame-Options: SAMEORIGIN` (Clickjacking prevention)
  * `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
  * `X-XSS-Protection: 1; mode=block`
* **Static File Caching**: 1-year immutable caching for built client assets (`/assets/*.js`, `/assets/*.css`).
