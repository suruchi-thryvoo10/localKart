import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Store, MapPin, Clock, Bike, CheckCircle2 } from 'lucide-react';

export const VendorSettings = () => {
  const { vendor, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    description: '',
    deliveryRadiusKm: 5,
    minOrderAmount: 50,
    deliveryFee: 25,
    freeDeliveryAbove: 300,
    openingTime: '06:00',
    closingTime: '21:30',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendor) {
      setForm({
        shopName: vendor.shopName || '',
        ownerName: vendor.ownerName || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        description: vendor.description || '',
        deliveryRadiusKm: vendor.deliveryRadiusKm || 5,
        minOrderAmount: vendor.minOrderAmount || 50,
        deliveryFee: vendor.deliveryFee || 25,
        freeDeliveryAbove: vendor.freeDeliveryAbove || 300,
        openingTime: vendor.openingTime || '06:00',
        closingTime: vendor.closingTime || '21:30',
      });
    }
  }, [vendor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await api.put('/vendors/me/profile', form);
      if (res.data.success) {
        setSaved(true);
        await refreshProfile();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Store Policies & Hyperlocal Settings</h1>
        <p className="text-xs text-slate-500">
          Configure delivery radius, minimum order value, and store timings
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Store settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 text-xs">
        {/* Basic Shop Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Store Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Shop Name</label>
              <input
                type="text"
                required
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Owner Name</label>
              <input
                type="text"
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Store Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Hyperlocal Radius & Pricing Rules */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Delivery Radius & Order Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Delivery Radius (km)</label>
              <input
                type="number"
                required
                min="1"
                max="30"
                value={form.deliveryRadiusKm}
                onChange={(e) => setForm({ ...form, deliveryRadiusKm: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Min. Order Value (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={form.deliveryFee}
                onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Free Delivery Above (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={form.freeDeliveryAbove}
                onChange={(e) => setForm({ ...form, freeDeliveryAbove: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Store Operating Hours
          </h3>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Opening Time</label>
              <input
                type="time"
                value={form.openingTime}
                onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Closing Time</label>
              <input
                type="time"
                value={form.closingTime}
                onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="py-3.5 px-8 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs shadow-md transition"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};
