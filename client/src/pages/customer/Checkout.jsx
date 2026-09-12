import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import {
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Store,
  ChevronLeft,
  Plus,
  ArrowRight,
} from 'lucide-react';

export const Checkout = () => {
  const { cart, summary, refreshCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [customerNotes, setCustomerNotes] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // New address state
  const [newAddr, setNewAddr] = useState({
    tag: 'Home',
    recipientName: user?.name || '',
    phone: user?.phone || '',
    streetAddress: '',
    landmark: '',
    city: 'Bhubaneswar',
    state: 'Odisha',
    pincode: '751007',
  });

  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
      const defaultIdx = user.addresses.findIndex((a) => a.isDefault);
      setSelectedAddressIndex(defaultIdx > -1 ? defaultIdx : 0);
    } else {
      setShowNewAddressForm(true);
    }
  }, [user]);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          🛒
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your basket is empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Add fresh groceries and vegetables to proceed with checkout.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-lg"
        >
          Discover Fresh Produce
        </Link>
      </div>
    );
  }

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', newAddr);
      if (res.data.success) {
        setAddresses(res.data.data);
        setSelectedAddressIndex(res.data.data.length - 1);
        setShowNewAddressForm(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    const targetAddress = addresses[selectedAddressIndex];
    if (!targetAddress) {
      setError('Please select or enter a delivery address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        deliveryAddress: {
          recipientName: targetAddress.recipientName,
          phone: targetAddress.phone,
          streetAddress: targetAddress.streetAddress,
          landmark: targetAddress.landmark || '',
          city: targetAddress.city,
          state: targetAddress.state,
          pincode: targetAddress.pincode,
          coordinates: targetAddress.location?.coordinates || [85.8340, 20.2980],
        },
        paymentMethod,
        customerNotes,
      });

      if (res.data.success) {
        await refreshCart();
        navigate(`/order-success/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Shopping
      </Link>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
        Review & Place Order
      </h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Delivery Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-100 text-brand-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Delivery Address</h3>
              </div>

              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Address
                </button>
              )}
            </div>

            {showNewAddressForm ? (
              <form onSubmit={handleAddNewAddress} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddr.recipientName}
                      onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    House / Plot / Street Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 104, BDA Colony, Saheed Nagar"
                    value={newAddr.streetAddress}
                    onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Landmark</label>
                    <input
                      type="text"
                      placeholder="Near College"
                      value={newAddr.landmark}
                      onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs"
                  >
                    Save & Use Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr, idx) => {
                  const isSelected = selectedAddressIndex === idx;
                  return (
                    <div
                      key={addr._id || idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-400/30'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold uppercase text-brand-700">
                          {addr.tag}
                        </span>
                        {isSelected && <span className="text-xs font-extrabold text-brand-600">✓ Selected</span>}
                      </div>
                      <div className="font-bold text-xs text-slate-900">{addr.recipientName}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{addr.streetAddress}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{addr.city}, {addr.pincode} • {addr.phone}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Payment Method Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-brand-100 text-brand-700 rounded-xl">
                <Banknote className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Select Payment Method</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                  paymentMethod === 'COD'
                    ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-400/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Pay via cash or UPI to delivery agent at door</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                  paymentMethod === 'ONLINE'
                    ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-400/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Simulated Online Payment</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">UPI / Cards / Net Banking Instant confirmation</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Delivery Instructions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
            <label className="block font-bold text-xs text-slate-700 uppercase tracking-wider">
              Special Delivery Notes (Optional)
            </label>
            <input
              type="text"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Please ring the doorbell twice and leave packet at door"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Right Col: Order Summary & Place Order */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl space-y-5 sticky top-24">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Store className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-xs text-slate-900 truncate">
                {cart.vendorId?.shopName || 'Local Store'}
              </span>
            </div>

            {/* Items snippet */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 truncate max-w-[170px]">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{Math.round(item.finalPrice * item.quantity * 100) / 100}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Item Subtotal</span>
                <span className="font-semibold text-slate-900">₹{summary.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Partner Fee</span>
                <span className={summary.deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'font-semibold text-slate-900'}>
                  {summary.deliveryFee === 0 ? 'FREE' : `₹${summary.deliveryFee}`}
                </span>
              </div>
              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({cart.couponCode})</span>
                  <span>-₹{summary.discountAmount}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span>₹{summary.finalAmount}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white rounded-2xl font-black shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 text-sm transition"
            >
              {submitting ? 'Placing Order...' : `Place Order (₹${summary.finalAmount})`}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct dispatch from neighborhood vendor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
