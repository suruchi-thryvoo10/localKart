import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { OrderTimeline } from '../../components/OrderTimeline.jsx';
import { RatingModal } from '../../components/RatingModal.jsx';
import {
  Store,
  Phone,
  Bike,
  MapPin,
  ChevronLeft,
  Star,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000); // 6s poll for fast real-time status updates
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await api.post(`/orders/${id}/cancel`, { reason: 'Cancelled from tracking screen' });
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading order status...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-slate-800">Order Not Found</h3>
        <Link to="/orders" className="text-xs text-brand-600 font-bold mt-2 inline-block">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {order.status === 'PENDING' && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Order Status Tracker
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {order.status === 'DELIVERED' && !order.hasCustomerReviewed && (
          <button
            onClick={() => setIsRatingModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 self-start sm:self-center transition"
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            Rate Store & Vegetables
          </button>
        )}
      </div>

      {/* 1. Visual Progress Timeline */}
      <OrderTimeline
        status={order.status}
        statusHistory={order.statusHistory}
        deliveryOtp={order.deliveryOtp}
        isCustomerView={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store & Delivery Partner Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Store & Delivery Boy</h3>

          {/* Store Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                🏪
              </div>
              <div>
                <div className="font-bold text-slate-800">{order.vendorId?.shopName}</div>
                <div className="text-[11px] text-slate-400">{order.vendorId?.address?.area}, {order.vendorId?.address?.city}</div>
              </div>
            </div>
            {order.vendorId?.phone && (
              <a
                href={`tel:${order.vendorId.phone}`}
                className="p-2 bg-white text-brand-700 rounded-xl shadow-xs border border-slate-200 hover:bg-brand-50"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Delivery Boy Box (if assigned) */}
          {order.deliveryAgentId ? (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  🛵
                </div>
                <div>
                  <div className="font-bold text-emerald-950">
                    {order.deliveryAgentId?.name} (Assigned)
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    {order.deliveryAgentId?.vehicleType} • {order.deliveryAgentId?.vehicleNumber}
                  </div>
                </div>
              </div>
              {order.deliveryAgentId?.phone && (
                <a
                  href={`tel:${order.deliveryAgentId.phone}`}
                  className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs hover:bg-emerald-700"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-[11px]">
              Store will assign their registered delivery partner once items are packed fresh.
            </div>
          )}

          {/* Delivery Address */}
          <div className="border-t border-slate-100 pt-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Delivering To
            </span>
            <div className="font-bold text-slate-800">{order.deliveryAddress?.recipientName}</div>
            <div className="text-slate-600">{order.deliveryAddress?.streetAddress}</div>
            <div className="text-slate-400">{order.deliveryAddress?.city}, {order.deliveryAddress?.pincode} • Phone: {order.deliveryAddress?.phone}</div>
          </div>
        </div>

        {/* Order Items & Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Order Items ({order.items?.length})</h3>

          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50">
                <div>
                  <span className="font-bold text-slate-800">{item.name}</span>
                  <div className="text-[10px] text-slate-400">
                    {item.quantity} x ₹{item.finalPrice} / {item.unit}
                  </div>
                </div>
                <span className="font-bold text-slate-900">₹{item.total}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-800">₹{order.pricing?.itemsTotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-slate-800">₹{order.pricing?.deliveryFee}</span>
            </div>
            {order.pricing?.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Discount ({order.couponCode}):</span>
                <span>-₹{order.pricing?.couponDiscount}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
              <span>Total Paid:</span>
              <span>₹{order.pricing?.finalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        order={order}
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onReviewSubmitted={fetchOrder}
      />
    </div>
  );
};
