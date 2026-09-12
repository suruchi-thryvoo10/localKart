import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { DollarSign, Plus, CheckCircle2, ChevronLeft, Store } from 'lucide-react';

export const AdminSettlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [form, setForm] = useState({
    vendorId: '',
    periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settleRes, vendorRes] = await Promise.all([
        api.get('/admin/settlements'),
        api.get('/admin/vendors'),
      ]);

      if (settleRes.data.success) setSettlements(settleRes.data.data);
      if (vendorRes.data.success) {
        setVendors(vendorRes.data.data);
        if (vendorRes.data.data.length > 0 && !form.vendorId) {
          setForm((prev) => ({ ...prev, vendorId: vendorRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load settlements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/settlements/generate', form);
      if (res.data.success) {
        setShowGenerateModal(false);
        await fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate settlement');
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
          <h1 className="text-2xl font-black text-slate-900">Vendor Settlements & Payouts</h1>
          <p className="text-xs text-slate-500">
            Accounting ledger and automated vendor bank/UPI transfer calculation
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-5 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-center transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Generate Settlement</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading settlements...</div>
      ) : settlements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No settlements generated yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Generate your first settlement ledger for vendor payouts</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold"
          >
            + Generate Settlement
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Reference #</th>
                  <th className="p-4">Vendor Store</th>
                  <th className="p-4">Settlement Period</th>
                  <th className="p-4">Orders Count</th>
                  <th className="p-4">Gross Sales</th>
                  <th className="p-4">Platform Commission</th>
                  <th className="p-4">Net Payout (₹)</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {settlements.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">{s.referenceNumber}</td>
                    <td className="p-4 font-bold text-slate-800">{s.vendorId?.shopName}</td>
                    <td className="p-4 text-[11px] text-slate-500">
                      {new Date(s.periodStart).toLocaleDateString()} to{' '}
                      {new Date(s.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-semibold">{s.totalOrders} deliveries</td>
                    <td className="p-4">₹{s.grossSales}</td>
                    <td className="p-4 text-brand-700 font-bold">
                      -₹{s.platformCommissionDeducted}
                    </td>
                    <td className="p-4 font-black text-emerald-700 text-sm">
                      ₹{s.netPayoutAmount}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Generate Vendor Payout</h3>
            <form onSubmit={handleGenerate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Select Vendor Store</label>
                <select
                  required
                  value={form.vendorId}
                  onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {vendors.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.shopName} ({v.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Period Start</label>
                  <input
                    type="date"
                    required
                    value={form.periodStart}
                    onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Period End</label>
                  <input
                    type="date"
                    required
                    value={form.periodEnd}
                    onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md"
                >
                  Calculate & Settle Payout
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold"
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
