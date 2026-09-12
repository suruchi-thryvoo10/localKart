import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const Addresses = () => {
  const { user, refreshProfile } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
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
    if (user?.addresses) {
      setAddresses(user.addresses);
    }
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', form);
      if (res.data.success) {
        setAddresses(res.data.data);
        setShowAddModal(false);
        await refreshProfile();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await api.delete(`/users/addresses/${addressId}`);
      if (res.data.success) {
        setAddresses(res.data.data);
        await refreshProfile();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await api.patch(`/users/addresses/${addressId}/default`);
      if (res.data.success) {
        setAddresses(res.data.data);
        await refreshProfile();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set default');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Saved Addresses</h1>
          <p className="text-xs text-slate-500">Manage delivery locations for fast checkout</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`p-5 rounded-3xl bg-white border transition shadow-sm ${
              addr.isDefault ? 'border-brand-500 ring-2 ring-brand-400/20' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-bold">
                {addr.tag}
              </span>
              <div className="flex items-center gap-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-brand-600"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="font-bold text-sm text-slate-900">{addr.recipientName}</div>
            <div className="text-xs text-slate-600 mt-1">{addr.streetAddress}</div>
            {addr.landmark && <div className="text-xs text-slate-400">Landmark: {addr.landmark}</div>}
            <div className="text-xs text-slate-400 mt-0.5">
              {addr.city}, {addr.state} - {addr.pincode}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-2">📞 {addr.phone}</div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  required
                  value={form.recipientName}
                  onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <input
                type="text"
                placeholder="Street Address, Plot No"
                required
                value={form.streetAddress}
                onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Landmark"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  required
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
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
