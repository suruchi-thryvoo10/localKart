import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import {
  TrendingUp,
  Store,
  ShoppingBag,
  Bike,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Layers,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/metrics');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading admin metrics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase bg-purple-100 text-purple-800">
              👑 Platform Administration
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">LocalKart Central Dashboard</h1>
          <p className="text-xs text-slate-500">
            Real-time platform metrics, commission revenue, and vendor moderation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/vendors"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Manage Vendors ({metrics?.totalVendors || 0})
          </Link>
          <Link
            to="/admin/settlements"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Settlements & Payouts
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total GMV */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total GMV Sales
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{metrics?.totalGMV?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-slate-400">Total gross value transacted</div>
        </div>

        {/* Platform Revenue (Commission) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Platform Revenue (Commission)
            </span>
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-brand-700">
            ₹{metrics?.platformRevenue?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-emerald-600 font-bold">5% Platform commission cut</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Platform Orders
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics?.totalOrders || 0}
          </div>
          <div className="text-xs text-slate-500">
            {metrics?.deliveredOrdersCount || 0} Delivered • {metrics?.activeOrdersCount || 0} Active
          </div>
        </div>

        {/* Vendors & Fleet */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Vendors & Delivery Boys
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics?.approvedVendors || 0} <span className="text-sm font-semibold text-slate-400">/ {metrics?.totalDeliveryAgents || 0} fleet</span>
          </div>
          <div className="text-xs text-slate-500">
            {metrics?.totalUsers || 0} Registered customers
          </div>
        </div>
      </div>

      {/* Quick Access Portal Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/vendors"
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-300 transition group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xl">
              🏪
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition">
                Vendor Moderation & Approvals
              </h3>
              <p className="text-xs text-slate-500">Approve local shops & set commissions</p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-600 flex items-center gap-1">
            Open Vendor Manager →
          </span>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-300 transition group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl">
              📦
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition">
                Live Orders Ledger
              </h3>
              <p className="text-xs text-slate-500">Monitor all hyperlocal deliveries in real-time</p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-600 flex items-center gap-1">
            View Live Orders →
          </span>
        </Link>

        <Link
          to="/admin/settlements"
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-300 transition group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xl">
              💰
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition">
                Vendor Settlements & Payouts
              </h3>
              <p className="text-xs text-slate-500">Automate weekly vendor bank payouts</p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-600 flex items-center gap-1">
            Generate Settlements →
          </span>
        </Link>
      </div>
    </div>
  );
};
