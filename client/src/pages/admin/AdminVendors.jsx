import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { Store, Check, X, Shield, Phone, MapPin, ChevronLeft } from 'lucide-react';

export const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingCommission, setEditingCommission] = useState({});

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/admin/vendors?status=${statusFilter}` : '/admin/vendors';
      const res = await api.get(url);
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const handleUpdateStatus = async (vendorId, status) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/status`, { status });
      await fetchVendors();
    } catch (err) {
      alert('Failed to update vendor status');
    }
  };

  const handleSaveCommission = async (vendorId) => {
    const percentage = editingCommission[vendorId];
    if (percentage === undefined) return;
    try {
      await api.patch(`/admin/vendors/${vendorId}/status`, { commissionPercentage: Number(percentage) });
      await fetchVendors();
      setEditingCommission((prev) => ({ ...prev, [vendorId]: undefined }));
    } catch (err) {
      alert('Failed to update commission rate');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Admin Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Vendor Management & Moderation</h1>
          <p className="text-xs text-slate-500">
            Review onboarding shops, manage approval status, and set custom commission rates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['', 'APPROVED', 'PENDING', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st || 'All Vendors'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading vendor records...</div>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No vendors matching criteria</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Store & Owner</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Platform Commission (%)</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {vendors.map((v) => {
                  const isApproved = v.status === 'APPROVED';
                  const isPending = v.status === 'PENDING';
                  const isSuspended = v.status === 'SUSPENDED';

                  return (
                    <tr key={v._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{v.shopName}</div>
                        <div className="text-[11px] text-slate-400">
                          Owner: {v.ownerName} • Phone: {v.phone}
                        </div>
                      </td>

                      <td className="p-4">
                        <div>{v.address?.area}, {v.address?.city}</div>
                        <div className="text-[10px] text-slate-400">Radius: {v.deliveryRadiusKm}km</div>
                      </td>

                      <td className="p-4 font-semibold text-slate-800">
                        {v.shopType?.replace(/_/g, ' ')}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>

                      {/* Commission rate editor */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={
                              editingCommission[v._id] !== undefined
                                ? editingCommission[v._id]
                                : v.commissionPercentage || 5
                            }
                            onChange={(e) =>
                              setEditingCommission({ ...editingCommission, [v._id]: e.target.value })
                            }
                            className="w-16 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-xs"
                          />
                          <span className="text-slate-500 font-bold">%</span>
                          {editingCommission[v._id] !== undefined && (
                            <button
                              onClick={() => handleSaveCommission(v._id)}
                              className="px-2 py-1 bg-brand-600 text-white rounded-md text-[10px] font-bold"
                            >
                              Save
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <button
                              onClick={() => handleUpdateStatus(v._id, 'APPROVED')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleUpdateStatus(v._id, 'SUSPENDED')}
                              className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-bold rounded-xl text-xs"
                            >
                              Suspend
                            </button>
                          )}

                          {isSuspended && (
                            <button
                              onClick={() => handleUpdateStatus(v._id, 'APPROVED')}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-xl text-xs"
                            >
                              Re-activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
