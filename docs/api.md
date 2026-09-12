# REST API Specification — LocalKart API v1

Base URL: `http://localhost:5000/api/v1` (or `http://localhost/api/v1` when running via Nginx)

All API responses strictly adhere to the standard envelope format:

**Success Response**:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2026-09-11T12:00:00.000Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERR_SPECIFIC_CODE",
  "errors": [ ... ],
  "timestamp": "2026-09-11T12:00:00.000Z"
}
```

---

## 1. Authentication Endpoints (`/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user (Customer, Vendor, or Delivery Agent) |
| `POST` | `/auth/login` | Public | Authenticate user and obtain access + refresh tokens |
| `POST` | `/auth/refresh-token` | Public | Obtain a new access token using a valid refresh token |
| `POST` | `/auth/logout` | User | Invalidate refresh token and logout |
| `GET` | `/auth/me` | User | Get currently authenticated profile |

---

## 2. Vendors Endpoints (`/vendors`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/vendors/nearby` | Public | Discover nearby open vendors within geospatial radius |
| `GET` | `/vendors/:id` | Public | Get vendor store profile & operating policies |
| `GET` | `/vendors/me/profile` | Vendor | Get own store profile |
| `PUT` | `/vendors/me/profile` | Vendor | Update store details, timings & delivery radius |
| `PATCH`| `/vendors/me/toggle-open` | Vendor | Single-tap Open / Closed shop status switch |
| `PATCH`| `/vendors/me/toggle-fresh`| Vendor | Broadcast "Fresh Stock Today 🥬" badge |
| `GET` | `/vendors/me/dashboard` | Vendor | Get vendor today's revenue & live order counts |
| `GET` | `/vendors/me/delivery-agents` | Vendor | Get delivery boys registered with this store |
| `POST` | `/vendors/me/delivery-agents` | Vendor | Register new delivery boy for this store |

---

## 3. Products Endpoints (`/products`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Filter products by vendor, category, search query |
| `GET` | `/products/fresh-today`| Public | Fetch morning fresh harvest products |
| `GET` | `/products/:id` | Public | Get product details |
| `POST` | `/products` | Vendor | Add new product to store |
| `PUT` | `/products/:id` | Vendor | Edit product details and pricing |
| `PATCH`| `/products/:id/stock` | Vendor | Fast stock increment/decrement |
| `PATCH`| `/products/:id/toggle-fresh` | Vendor | Toggle product "Fresh Today" flag |
| `DELETE`| `/products/:id` | Vendor | Remove product |

---

## 4. Cart Endpoints (`/cart`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Customer | Fetch cart items, subtotal, delivery fee & discount |
| `POST` | `/cart/items` | Customer | Add item (with single-vendor conflict check) |
| `PUT` | `/cart/items` | Customer | Update item quantity in basket |
| `DELETE`| `/cart` | Customer | Clear all items from basket |
| `POST` | `/cart/apply-coupon` | Customer | Apply promotional discount coupon |

---

## 5. Orders Endpoints (`/orders`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Customer | Create order with atomic stock reduction & OTP |
| `GET` | `/orders/my-orders` | Customer | Get customer order history |
| `GET` | `/orders/:id` | User | Get order tracking details & timeline |
| `POST` | `/orders/:id/cancel`| Customer | Cancel pending order |
| `GET` | `/orders/vendor/all`| Vendor | Get all store orders |
| `PATCH`| `/orders/:id/status`| Vendor / Agent | Advance order status (`ACCEPTED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`) |

---

## 6. Delivery Partner Endpoints (`/delivery`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/delivery/dashboard` | Agent | Get active assigned orders & today's delivery earnings |
| `POST` | `/delivery/orders/:id/pickup` | Agent | Mark order picked up (`OUT_FOR_DELIVERY`) |
| `POST` | `/delivery/orders/:id/deliver`| Agent | Complete delivery with customer 4-digit OTP |
| `GET` | `/delivery/history` | Agent | List completed delivery ledger |

---

## 7. Platform Admin Endpoints (`/admin`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/metrics` | Admin | Real-time GMV, platform revenue, order stats |
| `GET` | `/admin/vendors` | Admin | List all vendors with status filter |
| `PATCH`| `/admin/vendors/:id/status` | Admin | Approve / Suspend vendor & update commission |
| `GET` | `/admin/orders` | Admin | Global platform order monitor |
| `GET` | `/admin/settlements`| Admin | View vendor payout ledgers |
| `POST` | `/admin/settlements/generate`| Admin | Calculate and generate weekly vendor payouts |
