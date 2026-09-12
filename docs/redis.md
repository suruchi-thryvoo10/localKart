# Redis Caching Architecture & Key Invalidation Strategy

Redis acts as the high-throughput caching tier for LocalKart, dramatically reducing database reads during peak ordering spikes (such as morning vegetable market rushes).

---

## 1. Key Naming Patterns & TTLs

| Cache Key Pattern | TTL (Seconds) | Purpose |
| :--- | :--- | :--- |
| `categories:all` | 3600 (1 hour) | Multilingual category definitions |
| `vendors:nearby:{lat}:{lng}:{radius}:{shopType}:{fresh}:{search}` | 60 (1 min) | Geospatial search result set |
| `vendor:{vendorId}` | 300 (5 mins) | Vendor profile and store policies |
| `products:vendor:{vendorId}:{categoryId}` | 300 (5 mins) | Vendor store product catalog |
| `product:{productId}` | 300 (5 mins) | Individual product information |

---

## 2. Invalidation Hooks (Cache Purging)

To prevent stale prices, outdated stock, or incorrect store open/closed states, specific mutations trigger targeted cache invalidations:

* **Vendor Status Change (`/toggle-open` or `/toggle-fresh`)**:
  * Calls `cache.delPattern('vendors:nearby:*')` to purge all active nearby discovery caches.
  * Ensures customers immediately see the updated status.
* **Product Created / Updated / Stock Adjusted**:
  * Calls `cache.delPattern('vendors:nearby:*')` and clears product cache keys.
* **Category Updated by Admin**:
  * Calls `cache.del('categories:all')`.

---

## 3. High Availability & In-Memory Fallback

The Redis service in `server/src/cache/redis.js` wraps `ioredis` with an automated fallback mechanism:
1. When Redis is connected: Uses full Redis memory persistence with TTLs.
2. If Redis is unavailable / restarting / local development without Docker: Automatically switches to an in-memory `Map` cache with local timestamp expiry.
3. Health check at `/health` returns `{ cache: { connected: true, mode: 'redis' } }`.
