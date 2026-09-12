import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Store,
  Bike,
} from 'lucide-react';

export const CartDrawer = () => {
  const {
    cart,
    summary,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    clearCart,
    applyCouponCode,
  } = useCart();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await applyCouponCode(couponInput.trim());
      setCouponSuccess(res.message);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    setIsDrawerOpen(false);
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-100 text-brand-700 rounded-2xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('cart.title')}</h2>
                <p className="text-xs text-slate-500">
                  {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'} in basket
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {cart.items?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center text-3xl">
                  🛒
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{t('cart.empty')}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">{t('cart.emptySub')}</p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="py-2.5 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-md transition"
                >
                  {t('cart.browseItems')}
                </button>
              </div>
            ) : (
              <>
                {/* Store Tag */}
                {cart.vendorId && (
                  <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-800">
                      <Store className="w-4 h-4 text-brand-600" />
                      <span>{cart.vendorId?.shopName || 'Local Store'}</span>
                    </div>
                    <button
                      onClick={clearCart}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=100&q=80'}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          ₹{item.finalPrice} / {item.unit}
                        </div>
                        <div className="text-xs font-extrabold text-slate-900 mt-1">
                          ₹{Math.round(item.finalPrice * item.quantity * 100) / 100}
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center bg-white border border-slate-200 text-slate-800 rounded-xl shadow-sm overflow-hidden font-bold">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-slate-100 transition text-slate-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:bg-slate-100 transition text-slate-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Box */}
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-2">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span>Have a Coupon Code?</span>
                  </div>

                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FRESH50"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-xs uppercase font-bold bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>

                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-2">
                      ✅ {couponSuccess}
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-red-600 font-semibold mt-2">
                      ⚠️ {couponError}
                    </p>
                  )}
                  {cart.couponCode && (
                    <div className="mt-2 text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold flex items-center justify-between">
                      <span>Applied: {cart.couponCode}</span>
                      <span>-₹{cart.discountAmount}</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-semibold text-slate-800">₹{summary.subtotal}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-slate-400" />
                      {t('cart.deliveryFee')}
                    </span>
                    <span className={`font-semibold ${summary.deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'text-slate-800'}`}>
                      {summary.deliveryFee === 0 ? 'FREE' : `₹${summary.deliveryFee}`}
                    </span>
                  </div>

                  {summary.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>{t('cart.discount')}</span>
                      <span>-₹{summary.discountAmount}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>{t('cart.total')}</span>
                    <span>₹{summary.finalAmount}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {cart.items?.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white space-y-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white rounded-2xl font-bold shadow-xl shadow-brand-600/30 flex items-center justify-between px-6 transition-all"
              >
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider opacity-80">Total to Pay</div>
                  <div className="text-base font-extrabold">₹{summary.finalAmount}</div>
                </div>
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <span>{t('cart.proceedToCheckout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Safe & Verified Hyperlocal Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
