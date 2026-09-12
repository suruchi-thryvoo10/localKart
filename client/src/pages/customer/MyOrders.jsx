import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ShoppingBag, ArrowRight, Store, Clock, Star, CheckCircle2 } from 'lucide-react';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load customer orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY_FOR_PICKUP: 'bg-indigo-100 text-indigo-800',
      OUT_FOR_DELIVERY: 'bg-brand-100 text-brand-800 font-bold',
      DELIVERED: 'bg-emerald-100 text-emerald-800 font-bold',
      CANCELLED: 'bg-red-100 text-red-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t('nav.orders')}</h1>
          <p className="text-xs text-slate-500">Track current and past deliveries</p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          + Order Again
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl p-8 border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
            📦
          </div>
          <h3 className="text-lg font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">Explore fresh vegetables and groceries near you!</p>
          <Link
            to="/"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg">
                    🏪
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{order.vendorId?.shopName}</h3>
                    <span className="text-[11px] text-slate-400">
                      Order #{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items summary */}
              <div className="text-xs text-slate-600 line-clamp-1">
                {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="text-xs">
                  <span className="text-slate-400">Total: </span>
                  <span className="font-black text-slate-900 text-sm">₹{order.pricing?.finalAmount}</span>
                  <span className="text-[11px] text-slate-400 ml-1">({order.payment?.method})</span>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-2 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 text-brand-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <span>Track / Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
