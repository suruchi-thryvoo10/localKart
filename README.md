# LocalKart — Production-Ready Hyperlocal Grocery & Fresh Vegetable Delivery Platform

LocalKart is a production-grade hyperlocal grocery and fresh vegetable delivery platform built to digitally empower local vegetable vendors, neighbourhood kirana stores, customers, and vendor-owned delivery agents. Unlike centralized quick-commerce warehouses, LocalKart prioritizes **fresh morning farm harvests, nearby small business empowerment, multilingual support (English, Hindi, Odia), and high-availability horizontal scaling**.

---

## 🌟 Key Platform Highlights

* **Hyperlocal Geospatial Discovery**: High-performance MongoDB `2dsphere` location indexing and Haversine distance engine filtering stores within custom vendor delivery radii (e.g. 5km, 8km).
* **Direct Vendor Empowerment**: Small shop owners manage their own store timings, dispatch vendor-owned delivery boys, and broadcast daily morning harvests with a single tap (`🥬 MARK FRESH STOCK TODAY`).
* **4 Dedicated Role Portals**:
  1. **Customer**: Discover nearby vendors, browse fresh harvests, single-vendor cart isolation, live order tracking timeline, OTP verification, and review submissions.
  2. **Vendor**: High-contrast, large-button mobile interface with live incoming order audio-visual alerts, fast stock controllers, and delivery agent dispatcher.
  3. **Delivery Partner**: Mobile-first pickup & drop task view with integrated Google Maps navigation and 4-digit OTP delivery confirmation.
  4. **Platform Admin**: Real-time GMV metrics, platform commission tracking, vendor onboarding moderation, and automated payout settlements.
* **Single-Vendor Cart Isolation**: Prevents mixed-store multi-dispatch conflicts while providing a smooth 1-tap replacement prompt.
* **Atomic Inventory & Concurrency Safe**: Conditional MongoDB `$inc` stock reduction prevents overselling race conditions.
* **Multilingual First**: Real-time interface localization in **English, Hindi (हिन्दी), and Odia (ଓଡ଼ିଆ)**.
* **Production DevOps Stack**: Dual horizontal Node.js API instances (`backend1` & `backend2`) load-balanced via **Nginx** with **Redis Caching** and **Docker Compose**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6 |
| **Backend API** | Node.js, Express, Mongoose (MongoDB ODM), ioredis, JWT Auth, Bcrypt |
| **Database** | MongoDB 7.0 with `2dsphere` Geospatial Indexing |
| **Caching Layer** | Redis 7.2 with In-Memory Graceful Fallback Engine |
| **Reverse Proxy & LB**| Nginx Upstream Load Balancer (Least Connections, Gzip, SSL Ready) |
| **DevOps** | Docker, Docker Compose, Multi-stage Minimal Alpine Images |
| **Testing** | Jest, Supertest, MongoMemoryServer |

---

## 🚀 Quick Start Guide

### Option 1: Run with Docker Compose (Recommended)

Run the entire cluster (MongoDB + Redis + Backend 1 + Backend 2 + Frontend + Nginx Load Balancer) with a single command:

```bash
# Clone the repository
cd LocalKart

# Launch all 6 containerized services
docker compose up --build -d

# Check cluster health
curl http://localhost/health
```

* **Frontend & Load Balancer Entrypoint**: `http://localhost`
* **API Endpoints**: `http://localhost/api/v1`
* **Health Check**: `http://localhost/health`

---

### Option 2: Run Locally with Node.js

#### 1. Backend Server Setup
```bash
cd server
npm install

# Run database seed with realistic vendors & fresh produce
npm run seed

# Run automated Jest integration test suite (16/16 tests)
npm test

# Start the development API server
npm run dev
```
*API runs on `http://localhost:5000`*

#### 2. Frontend Client Setup
```bash
cd ../client
npm install
npm run dev
```
*Client runs on `http://localhost:3000` with automatic `/api` proxying to `http://localhost:5000`*

---

## 🔐 Default Demo Accounts

For instant evaluation, you can use the **Quick Role Switcher** bar at the top of the app or log in with these pre-seeded accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@localkart.com` | `Admin@localkart2026` | Full platform analytics & approvals |
| **🛒 Customer** | `customer@localkart.com` | `Customer@123` | Pre-configured with Saheed Nagar address |
| **🏪 Vendor (Vegetables)**| `ramesh@localkart.com` | `Vendor@123` | *Maa Tarini Fresh Vegetables* (Fresh Today Active) |
| **🏪 Vendor (Organic)** | `bijay@localkart.com` | `Vendor@123` | *Utkal Organic Mandi & Fruits* |
| **🏪 Vendor (Grocery)** | `santosh@localkart.com` | `Vendor@123` | *Annapurna Kirana & Daily Needs* |
| **🛵 Delivery Partner** | `delivery@localkart.com` | `Delivery@123` | *Manoj Jena (Motorcycle)* |

---

## 📦 Active Promotional Coupon Codes

* `FRESH50`: Flat ₹50 OFF on fresh vegetable orders above ₹199
* `LOCAL20`: 20% discount on order up to ₹80
* `WELCOME10`: 10% discount for all customers

---

## 📁 Project Directory Structure

```
LocalKart/
├── client/                     # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── api/                # Axios instance & token refresh interceptors
│   │   ├── components/         # Navbar, CartDrawer, LocationModal, Timeline, ProductCard
│   │   ├── context/            # Auth, Cart, Location, Language, Notification
│   │   ├── i18n/               # Localization dictionaries (EN, HI, OD)
│   │   ├── pages/              # 4 Role portals: Customer, Vendor, Delivery, Admin
│   │   ├── App.jsx
│   │   └── index.css
│   └── vite.config.js
│
├── server/                     # Modular Monolith Express API
│   ├── src/
│   │   ├── config/             # DB & Redis connection config
│   │   ├── modules/            # Domain modules (auth, vendors, products, cart, orders, etc.)
│   │   ├── models/             # Mongoose schemas (User, Vendor, Product, Order, etc.)
│   │   ├── middleware/         # RBAC, JWT Auth, Validators, Error & Rate Limiters
│   │   ├── cache/              # Redis caching service with fallback
│   │   ├── app.js              # Express app setup
│   │   └── seed.js             # Realistic database seed
│   ├── tests/                  # Automated Jest API test suites
│   └── server.js               # Entry point with graceful shutdown
│
├── nginx/                      # Nginx load balancer and static SPA configs
├── docker/                     # Production multi-stage Dockerfiles
├── docs/                       # Technical architecture and API documentation
├── docker-compose.yml          # Multi-container orchestration
└── README.md
```

---

## 📚 Technical Documentation

* [System Architecture](docs/architecture.md)
* [Database Schema & Indexes](docs/database.md)
* [REST API Specification](docs/api.md)
* [Redis Caching Strategy](docs/redis.md)
* [Nginx Load Balancing](docs/nginx.md)
* [Docker Deployment Guide](docs/docker.md)
* [Production Deployment](docs/deployment.md)

---

## 📄 License
MIT License © 2026 LocalKart Technologies
