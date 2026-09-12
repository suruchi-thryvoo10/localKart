import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { CheckCircle2, ShieldCheck, ArrowRight, Store, Phone, Bike } from 'lucide-react';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Confirming your order...</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
          Order Confirmed!
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-2">
          Thank you for supporting local stores!
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Order #{order?.orderNumber} • Estimated delivery in 25-35 mins
        </p>
      </div>

      {/* OTP Highlight Box */}
      {order?.deliveryOtp && (
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-3xl shadow-xl space-y-2">
          <div className="text-xs font-bold uppercase text-emerald-100 tracking-wider">
            Your Delivery Verification OTP
          </div>
          <div className="text-3xl font-black tracking-[0.3em] bg-white text-slate-900 py-2 px-6 rounded-2xl inline-block shadow-inner">
            {order.deliveryOtp}
          </div>
          <div className="text-[11px] text-emerald-100 font-medium">
            Please share this 4-digit code with the delivery partner upon arrival at your door.
          </div>
        </div>
      )}

      {/* Store & Order Details */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 text-left shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Store className="w-4 h-4 text-brand-600" />
            <span>{order?.vendorId?.shopName}</span>
          </div>
          <span className="text-slate-500">{order?.items?.length} items</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Payment Mode:</span>
          <span className="font-bold text-slate-900">{order?.payment?.method} ({order?.payment?.status})</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Total Paid / Payable:</span>
          <span className="font-black text-slate-900 text-sm">₹{order?.pricing?.finalAmount}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={`/orders/${orderId}`}
          className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition"
        >
          <span>Track Order Live</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/"
          className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
