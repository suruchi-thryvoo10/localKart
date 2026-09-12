import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import {
  Store,
  Sparkles,
  Power,
  Package,
  Bike,
  CheckCircle2,
  Clock,
  Plus,
  Phone,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const VendorDashboard = () => {
  const { vendor, refreshProfile } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, agentsRes] = await Promise.all([
        api.get('/vendors/me/dashboard'),
        api.get('/orders/vendor/all'),
        api.get('/vendors/me/delivery-agents'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data.stats);
      if (ordersRes.data.success) {
        // Filter active orders
        const active = ordersRes.data.data.filter(
          (o) => ['PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)
        );
        setActiveOrders(active);
      }
      if (agentsRes.data.success) setDeliveryAgents(agentsRes.data.data);
    } catch (err) {
      console.error('Failed to load vendor dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 6000); // 6s fast sync
    return () => clearInterval(interval);
  }, []);

  const handleToggleOpen = async () => {
    try {
      await api.patch('/vendors/me/toggle-open');
      await refreshProfile();
      fetchDashboardData();
    } catch (err) {
      alert('Failed to toggle open status');
    }
  };

  const handleToggleFresh = async () => {
    try {
      await api.patch('/vendors/me/toggle-fresh');
      await refreshProfile();
      fetchDashboardData();
    } catch (err) {
      alert('Failed to toggle fresh stock');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, agentId = null) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status,
        deliveryAgentId: agentId || selectedAgentId[orderId],
      });
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading && !stats) {
    return <div className="text-center py-20 text-slate-400">Loading vendor portal...</div>;
  }

  const isOpen = vendor?.isOpen;
  const hasFresh = vendor?.hasFreshStockToday;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Big Action Header (Store Open/Close & Fresh Today Toggles) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30">
                🏪 Vendor Partner Portal
              </span>
              <span className="text-xs text-slate-400">
                {vendor?.address?.area}, {vendor?.address?.city}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{vendor?.shopName}</h1>
            <p className="text-xs text-slate-400 mt-1">Owner: {vendor?.ownerName} • Phone: {vendor?.phone}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Open / Closed Button */}
            <button
              onClick={handleToggleOpen}
              className={`py-3 px-5 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition active:scale-95 ${
                isOpen
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOpen ? 'SHOP IS OPEN' : 'SHOP IS CLOSED'}</span>
            </button>

            {/* Fresh Today Toggle */}
            <button
              onClick={handleToggleFresh}
              className={`py-3 px-5 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition active:scale-95 ${
                hasFresh
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>🥬</span>
              <span>{hasFresh ? 'FRESH TODAY ACTIVE' : 'MARK FRESH TODAY'}</span>
            </button>
          </div>
        </div>

        {/* 2. Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-slate-300">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Today's Net Earnings
            </span>
            <span className="text-2xl font-black text-emerald-400 block mt-1">
              ₹{stats?.todayRevenue || 0}
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Orders Right Now
            </span>
            <span className="text-2xl font-black text-amber-400 block mt-1">
              {stats?.activeOrdersCount || 0}
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Today's Total Orders
            </span>
            <span className="text-2xl font-black text-white block mt-1">
              {stats?.todayOrdersCount || 0}
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Delivery Fleet
            </span>
            <span className="text-2xl font-black text-brand-400 block mt-1">
              {stats?.availableDeliveryAgents || 0} / {stats?.totalDeliveryAgents || 0} Ready
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Navigation Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <Link
          to="/vendor/dashboard"
          className="px-4 py-2.5 bg-brand-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-600/20 whitespace-nowrap"
        >
          🚨 Live Orders Queue ({activeOrders.length})
        </Link>
        <Link
          to="/vendor/products"
          className="px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold whitespace-nowrap"
        >
          🥦 Products & Stock ({stats?.totalProducts || 0})
        </Link>
        <Link
          to="/vendor/orders"
          className="px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold whitespace-nowrap"
        >
          📜 All Orders History
        </Link>
        <Link
          to="/vendor/delivery-agents"
          className="px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold whitespace-nowrap"
        >
          🛵 My Delivery Boys ({deliveryAgents.length})
        </Link>
        <Link
          to="/vendor/settings"
          className="px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold whitespace-nowrap"
        >
          ⚙️ Store Settings
        </Link>
      </div>

      {/* 4. Incoming Active Orders Queue (High Impact Big Buttons) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Live Incoming Orders</span>
              {activeOrders.length > 0 && (
                <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                  {activeOrders.length} ACTION REQUIRED
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Orders update automatically. Use large action buttons to accept and dispatch quickly.
            </p>
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              ✅
            </div>
            <h3 className="text-base font-bold text-slate-800">All caught up! No pending orders</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              New customer orders will appear here with an alert sound. Keep your store OPEN.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeOrders.map((order) => {
              const isPending = order.status === 'PENDING';
              const isAccepted = order.status === 'ACCEPTED';
              const isPreparing = order.status === 'PREPARING';
              const isReady = order.status === 'READY_FOR_PICKUP';

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-3xl p-6 border shadow-lg transition space-y-5 ${
                    isPending ? 'border-amber-400 ring-4 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-base">
                          Order #{order.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 animate-pulse'
                              : isAccepted
                              ? 'bg-blue-100 text-blue-900'
                              : isPreparing
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Customer: <strong className="text-slate-800">{order.customerId?.name}</strong> •{' '}
                        {order.deliveryAddress?.area} ({order.deliveryAddress?.streetAddress})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">
                        ₹{order.pricing?.finalAmount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        {order.payment?.method} ({order.payment?.status})
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 max-h-40 overflow-y-auto text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between font-medium text-slate-800">
                        <span>
                          <strong className="text-brand-700 font-black">{item.quantity}x</strong>{' '}
                          {item.name} ({item.unit})
                        </span>
                        <span>₹{item.total}</span>
                      </div>
                    ))}
                  </div>

                  {order.customerNotes && (
                    <div className="text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                      📝 <strong>Customer Note:</strong> {order.customerNotes}
                    </div>
                  )}

                  {/* Delivery Agent Assignment Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Bike className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-slate-700">Assign Delivery Boy:</span>
                    </div>

                    <select
                      value={selectedAgentId[order._id] || order.deliveryAgentId?._id || ''}
                      onChange={(e) =>
                        setSelectedAgentId({ ...selectedAgentId, [order._id]: e.target.value })
                      }
                      className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 max-w-[200px]"
                    >
                      <option value="">-- Choose Delivery Boy --</option>
                      {deliveryAgents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.isAvailable ? '🟢 Available' : '🔴 Busy'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* BIG ACTION BUTTONS */}
                  <div className="pt-2">
                    {isPending && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'ACCEPTED')}
                          disabled={actionLoading[order._id]}
                          className="py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          ACCEPT ORDER
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'REJECTED')}
                          disabled={actionLoading[order._id]}
                          className="py-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition"
                        >
                          REJECT
                        </button>
                      </div>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'PREPARING')}
                        disabled={actionLoading[order._id]}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition"
                      >
                        <Package className="w-5 h-5" />
                        START PACKING & PREPARING
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'READY_FOR_PICKUP')}
                        disabled={actionLoading[order._id]}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        MARK READY FOR PICKUP
                      </button>
                    )}

                    {isReady && (
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-xs font-bold text-emerald-900">
                        📦 Order is packed and waiting for delivery partner pickup
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
