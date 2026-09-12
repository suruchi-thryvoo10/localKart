import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { Bike, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const DeliveryHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/delivery/history');
        if (res.data.success) {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Link
        to="/delivery/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-black text-slate-900">Completed Deliveries History</h1>
        <p className="text-xs text-slate-500">
          Total {history.length} deliveries completed successfully
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading delivery history...</div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No completed deliveries yet</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  Order #{order.orderNumber}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Store: {order.vendorId?.shopName}
                </span>
                <span className="text-slate-400 block text-[11px]">
                  Delivered on: {new Date(order.deliveredAt || order.updatedAt).toLocaleString()}
                </span>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-xl block mb-1">
                  +₹30 Earned
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Verified with OTP
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
