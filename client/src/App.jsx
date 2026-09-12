import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LocationProvider } from './context/LocationContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { LocationModal } from './components/LocationModal.jsx';
import { VendorConflictModal } from './components/VendorConflictModal.jsx';

// Customer Pages
import { CustomerHome } from './pages/customer/CustomerHome.jsx';
import { FreshToday } from './pages/customer/FreshToday.jsx';
import { VendorDetail } from './pages/customer/VendorDetail.jsx';
import { Checkout } from './pages/customer/Checkout.jsx';
import { OrderSuccess } from './pages/customer/OrderSuccess.jsx';
import { OrderTracking } from './pages/customer/OrderTracking.jsx';
import { MyOrders } from './pages/customer/MyOrders.jsx';
import { Addresses } from './pages/customer/Addresses.jsx';

// Auth Pages
import { Login } from './pages/auth/Login.jsx';
import { Register } from './pages/auth/Register.jsx';

// Vendor Pages
import { VendorDashboard } from './pages/vendor/VendorDashboard.jsx';
import { VendorProducts } from './pages/vendor/VendorProducts.jsx';
import { VendorOrders } from './pages/vendor/VendorOrders.jsx';
import { VendorDeliveryAgents } from './pages/vendor/VendorDeliveryAgents.jsx';
import { VendorSettings } from './pages/vendor/VendorSettings.jsx';

// Delivery Pages
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard.jsx';
import { DeliveryHistory } from './pages/delivery/DeliveryHistory.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminVendors } from './pages/admin/AdminVendors.jsx';
import { AdminOrders } from './pages/admin/AdminOrders.jsx';
import { AdminSettlements } from './pages/admin/AdminSettlements.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <NotificationProvider>
                <div className="min-h-screen flex flex-col justify-between bg-[#F8FAF8] text-slate-800">
                  <Navbar />
                  <CartDrawer />
                  <LocationModal />
                  <VendorConflictModal />

                  <main className="flex-1">
                    <Routes>
                      {/* Customer Routes */}
                      <Route path="/" element={<CustomerHome />} />
                      <Route path="/fresh-today" element={<FreshToday />} />
                      <Route path="/store/:id" element={<VendorDetail />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                      <Route path="/orders/:id" element={<OrderTracking />} />
                      <Route path="/orders" element={<MyOrders />} />
                      <Route path="/addresses" element={<Addresses />} />

                      {/* Auth Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Vendor Portal Routes */}
                      <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                      <Route path="/vendor/products" element={<VendorProducts />} />
                      <Route path="/vendor/orders" element={<VendorOrders />} />
                      <Route path="/vendor/delivery-agents" element={<VendorDeliveryAgents />} />
                      <Route path="/vendor/settings" element={<VendorSettings />} />

                      {/* Delivery Partner Routes */}
                      <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                      <Route path="/delivery/history" element={<DeliveryHistory />} />

                      {/* Admin Portal Routes */}
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/vendors" element={<AdminVendors />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                      <Route path="/admin/settlements" element={<AdminSettlements />} />

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>

                  <Footer />
                </div>
              </NotificationProvider>
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
