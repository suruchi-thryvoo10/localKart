import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Bike,
  Navigation,
  Phone,
  CheckCircle2,
  Package,
  MapPin,
  ShieldCheck,
  Store,
  DollarSign,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const DeliveryDashboard = () => {
  const { user, deliveryAgent } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpModalOrder, setOtpModalOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/delivery/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load delivery dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 6000);
    return () => clearInterval(interval);
  }, []);

  const handlePickup = async (orderId) => {
    try {
      const res = await api.post(`/delivery/orders/${orderId}/pickup`);
      if (res.data.success) {
        await fetchDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to pickup order');
    }
  };

  const handleVerifyDelivery = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) return;
    setVerifying(true);
    setOtpError('');

    try {
      const res = await api.post(`/delivery/orders/${otpModalOrder._id}/deliver`, {
        otp: otpInput.trim(),
      });
      if (res.data.success) {
        setOtpModalOrder(null);
        setOtpInput('');
        await fetchDashboard();
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid 4-digit OTP. Please re-check with customer.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading && !dashboardData) {
    return <div className="text-center py-20 text-slate-400">Loading delivery app...</div>;
  }

  const agent = dashboardData?.agent;
  const activeOrders = dashboardData?.activeOrders || [];
  const todayStats = dashboardData?.todayStats;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Rider Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 text-slate-950 flex items-center justify-center font-black text-xl">
              🛵
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block">
                Store Delivery Partner
              </span>
              <h1 className="text-xl font-black">{agent?.name || user?.name}</h1>
              <p className="text-xs text-slate-400">
                Store: {agent?.vendorId?.shopName || 'Assigned Store'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold ${
              agent?.isAvailable
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {agent?.isAvailable ? '🟢 Ready for Pickup' : '🔴 On Delivery'}
          </span>
        </div>

        {/* Today's Earning Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div className="bg-slate-800/80 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Today's Deliveries
            </span>
            <span className="text-xl font-black text-white block mt-0.5">
              {todayStats?.completedDeliveriesCount || 0} orders
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Today's Earnings (₹30/drop)
            </span>
            <span className="text-xl font-black text-emerald-400 block mt-0.5">
              ₹{todayStats?.todayEarnings || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>Active Tasks ({activeOrders.length})</span>
        </h2>
        <Link
          to="/delivery/history"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl"
        >
          View Completed Deliveries →
        </Link>
      </div>

      {/* Active Orders List */}
      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-2">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            🌴
          </div>
          <h3 className="text-base font-bold text-slate-800">No active delivery assignments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Stay tuned! When your store marks orders ready, they will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => {
            const isReady = order.status === 'READY_FOR_PICKUP';
            const isOut = order.status === 'OUT_FOR_DELIVERY';

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xl space-y-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Order #{order.orderNumber}
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      {order.items?.length} items ({order.pricing?.finalAmount} {order.payment?.method})
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      isReady ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {isReady ? 'Ready for Pickup' : 'Out For Delivery'}
                  </span>
                </div>

                {/* Pickup Store Location */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 text-brand-700 rounded-xl">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">
                        Pickup: {order.vendorId?.shopName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.vendorId?.address?.street}, {order.vendorId?.address?.area}
                      </div>
                    </div>
                  </div>
                  {order.vendorId?.phone && (
                    <a
                      href={`tel:${order.vendorId.phone}`}
                      className="p-2 bg-white text-brand-700 rounded-xl border border-slate-200"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Drop Location & Navigation */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950">
                        Drop: {order.deliveryAddress?.recipientName}
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        {order.deliveryAddress?.streetAddress}, {order.deliveryAddress?.area}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        order.deliveryAddress?.streetAddress + ', ' + order.deliveryAddress?.city
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-600 text-white rounded-xl flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Map
                    </a>
                    {order.deliveryAddress?.phone && (
                      <a
                        href={`tel:${order.deliveryAddress.phone}`}
                        className="p-2 bg-white text-emerald-800 rounded-xl border border-emerald-300"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Big Action Buttons */}
                {isReady && (
                  <button
                    onClick={() => handlePickup(order._id)}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-black rounded-2xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 text-sm transition"
                  >
                    <Bike className="w-5 h-5" />
                    <span>PICKUP ORDER & START RIDE 🛵</span>
                  </button>
                )}

                {isOut && (
                  <button
                    onClick={() => {
                      setOtpModalOrder(order);
                      setOtpInput('');
                      setOtpError('');
                    }}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm transition"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>VERIFY OTP & COMPLETE DELIVERY</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* OTP Entry Modal */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              🛡️
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Enter Customer OTP</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ask {otpModalOrder.deliveryAddress?.recipientName} for the 4-digit code shown on their screen.
              </p>
            </div>

            {otpError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">
                ⚠️ {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyDelivery} className="space-y-4">
              <input
                type="text"
                required
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full py-3.5 text-center font-black text-3xl tracking-[0.4em] bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500 focus:bg-white"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={verifying || otpInput.length < 4}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg text-sm transition"
                >
                  {verifying ? 'Verifying...' : 'Confirm Delivery'}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpModalOrder(null)}
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
