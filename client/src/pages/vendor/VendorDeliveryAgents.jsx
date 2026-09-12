import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Bike, Plus, Phone, Star, CheckCircle2, AlertCircle } from 'lucide-react';

export const VendorDeliveryAgents = () => {
  const { vendor } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'Delivery@123',
    vehicleType: 'MOTORCYCLE',
    vehicleNumber: 'OD-02-XX-1234',
  });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendors/me/delivery-agents');
      if (res.data.success) {
        setAgents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load agents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor) fetchAgents();
  }, [vendor]);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/vendors/me/delivery-agents', form);
      if (res.data.success) {
        setShowAddModal(false);
        setForm({
          name: '',
          phone: '',
          email: '',
          password: 'Delivery@123',
          vehicleType: 'MOTORCYCLE',
          vehicleNumber: '',
        });
        await fetchAgents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add delivery boy');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Store Delivery Boys Fleet</h1>
          <p className="text-xs text-slate-500">
            Unlike centralized warehouses, your store dispatches your own trusted delivery boys.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-center transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Delivery Boy</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading delivery fleet...</div>
      ) : agents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <Bike className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No delivery boys registered yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Add your delivery staff to dispatch customer orders directly.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
          >
            + Add Delivery Boy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-black text-lg">
                    🛵
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{agent.name}</h3>
                    <span className="text-xs text-slate-500">📞 {agent.phone}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                    agent.isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {agent.isAvailable ? '🟢 Ready for Pickup' : '🔴 On Delivery'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-bold text-slate-800">{agent.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle Number:</span>
                  <span className="font-bold text-slate-800">{agent.vehicleNumber || 'OD-02-XX-XXXX'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Deliveries:</span>
                  <span className="font-black text-emerald-700">{agent.completedDeliveries || 0}</span>
                </div>
              </div>

              <a
                href={`tel:${agent.phone}`}
                className="w-full py-2.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Delivery Partner</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Store Delivery Boy</h3>
            <form onSubmit={handleAddAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manoj Jena"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="97770 12345"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Login Email</label>
                  <input
                    type="email"
                    required
                    placeholder="manoj@delivery.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Vehicle Type</label>
                  <select
                    value={form.vehicleType}
                    onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="EV_SCOOTER">EV Scooter</option>
                    <option value="SCOOTER">Scooter</option>
                    <option value="BICYCLE">Bicycle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="OD-02-AK-9821"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md"
                >
                  Create & Link to Store
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
