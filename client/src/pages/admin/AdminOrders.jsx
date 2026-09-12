import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { ShoppingBag, ChevronLeft, Eye, Store } from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/orders?limit=100');
        if (res.data.success) {
          setOrders(res.data.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load admin orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Admin Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-black text-slate-900">Platform Global Orders Audit</h1>
        <p className="text-xs text-slate-500">Live monitoring of all customer orders across all stores</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading global orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Store</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Order Value (₹)</th>
                  <th className="p-4">Platform Commission (₹)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Delivery Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">
                      #{o.orderNumber}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-800">{o.vendorId?.shopName}</div>
                      <div className="text-[11px] text-slate-400">{o.vendorId?.address?.area}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-800">{o.customerId?.name}</div>
                      <div className="text-[11px] text-slate-400">{o.deliveryAddress?.phone}</div>
                    </td>

                    <td className="p-4 font-bold text-slate-900">
                      ₹{o.pricing?.finalAmount}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {o.payment?.method} ({o.payment?.status})
                      </div>
                    </td>

                    <td className="p-4 font-bold text-emerald-700">
                      ₹{o.pricing?.platformCommissionAmount}
                      <div className="text-[10px] text-slate-400 font-normal">
                        ({o.pricing?.platformCommissionPercentage}%)
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-800">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="p-4">
                      {o.deliveryAgentId ? (
                        <span className="text-brand-700 font-semibold">
                          🛵 {o.deliveryAgentId?.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
