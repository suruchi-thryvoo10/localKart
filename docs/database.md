# Database Schema & Geospatial Indexing

LocalKart uses **MongoDB 7.0** with structured Mongoose schemas, strict schema constraints, and compound indexing for low-latency queries.

---

## 1. Geospatial Modeling & 2dsphere Indexing

The `Vendor` and `Address` schemas utilize GeoJSON `Point` coordinates:

```javascript
location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    index: '2dsphere'
  }
}
```

### Geospatial Query Strategy
* **Index**: `vendorSchema.index({ location: '2dsphere' });`
* **Distance Calculation**: Backend utilizes the Haversine Great-Circle formula:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lon}}{2}\right)}\right)$$
* **Radius Filtering**: Filters stores whose calculated distance is $\le \min(\text{userMaxRadius}, \text{vendorDeliveryRadiusKm})$.

---

## 2. Core Schemas & Key Fields

### 1. `User`
* `email`: Lowercase, unique, indexed.
* `password`: Bcrypt hashed with work factor 10, hidden (`select: false`).
* `role`: Enum `['CUSTOMER', 'VENDOR', 'DELIVERY_AGENT', 'ADMIN']`.
* `preferredLanguage`: Enum `['en', 'hi', 'od']`.
* `addresses`: Sub-document array with tag, street, landmark, city, state, pincode, and GeoJSON coordinates.

### 2. `Vendor`
* `userId`: ObjectId ref `User`, unique.
* `shopName`, `ownerName`, `phone`, `email`.
* `shopType`: Enum `['GROCERY', 'VEGETABLES', 'FRUITS', 'DAIRY', 'ORGANIC_PRODUCE', 'SUPERMARKET']`.
* `deliveryRadiusKm`: Number (default: 5km, max: 30km).
* `minOrderAmount`, `deliveryFee`, `freeDeliveryAbove`.
* `openingTime`, `closingTime`, `isOpen`.
* `status`: Enum `['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']`.
* `hasFreshStockToday`: Boolean badge updated by vendor daily.
* `rating`: Float (1.0 - 5.0), `totalRatings`: Integer.

### 3. `Product`
* `vendorId`: ObjectId ref `Vendor`, indexed.
* `categoryId`: ObjectId ref `Category`, indexed.
* `name`: Multilingual object `{ en: String, hi: String, od: String }`.
* `price`: Number, `discountPercent`: Number (0-90%).
* `unit`: Enum `['kg', 'gram', 'litre', 'ml', 'piece', 'packet', 'dozen', 'bundle']`.
* `stockQuantity`: Integer with atomic decrement.
* `freshnessStatus`: Enum `['FRESH_TODAY', 'AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK']`.
* `badge`: Enum `['FRESH_HARVEST', 'BESTSELLER', 'SEASONAL', 'ORGANIC', 'LOCAL_SPECIAL']`.

### 4. `Order`
* `orderNumber`: Unique alphanumeric index (e.g. `LK-2026-XXXX`).
* `customerId`: ObjectId ref `User`, indexed.
* `vendorId`: ObjectId ref `Vendor`, indexed.
* `deliveryAgentId`: ObjectId ref `DeliveryAgent`, indexed.
* `items`: Array of ordered snapshots `{ productId, name, price, discountPercent, finalPrice, unit, quantity, total }`.
* `pricing`: Sub-document containing `itemsTotal`, `deliveryFee`, `couponDiscount`, `platformCommissionAmount`, `vendorEarnings`, `finalAmount`.
* `status`: State machine enum `['PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED']`.
* `deliveryOtp`: 4-digit verification code.
* `statusHistory`: Array of audit events `{ status, timestamp, note, updatedBy }`.

---

## 3. Database Indexes

| Collection | Indexed Fields | Purpose |
| :--- | :--- | :--- |
| `users` | `email` (unique) | Fast authentication lookup |
| `vendors` | `location` (2dsphere) | Geospatial nearby store query |
| `vendors` | `shopName`, `description`, `address.area` (text) | Full-text store discovery |
| `products`| `vendorId`, `categoryId` (compound) | Fast store catalog filtering |
| `products`| `name.en`, `name.hi`, `name.od`, `tags` (text) | Multilingual search |
| `orders` | `customerId`, `createdAt` (compound desc) | Customer order history pagination |
| `orders` | `vendorId`, `status`, `createdAt` (compound) | Vendor live orders queue |
| `orders` | `deliveryAgentId`, `status` (compound) | Delivery boy active assignments |
