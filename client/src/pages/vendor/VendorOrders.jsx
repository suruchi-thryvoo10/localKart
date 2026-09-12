import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShoppingBag, Eye, CheckCircle2, Clock, Phone, MapPin } from 'lucide-react';

export const VendorOrders = () => {
  const { vendor } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/vendor/all');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load vendor orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor) fetchOrders();
  }, [vendor]);

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const statuses = ['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">All Store Orders</h1>
        <p className="text-xs text-slate-500">History and fulfillment ledger for {vendor?.shopName}</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === st
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <span className="text-3xl block mb-2">📋</span>
          <h3 className="text-base font-bold text-slate-800">No orders found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Order No</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Earnings / Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Delivery Partner</th>
                  <th className="p-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">
                      #{order.orderNumber}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-800">{order.customerId?.name}</div>
                      <div className="text-[11px] text-slate-400">{order.deliveryAddress?.area}</div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800">
                        {order.items?.length} items
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-emerald-700">₹{order.pricing?.vendorEarnings}</div>
                      <div className="text-[10px] text-slate-400">Total: ₹{order.pricing?.finalAmount}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-800">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="p-4">
                      {order.deliveryAgentId ? (
                        <span className="text-brand-700 font-semibold">
                          🛵 {order.deliveryAgentId?.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Order #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
                <div className="font-bold text-slate-800">
                  Customer: {selectedOrder.customerId?.name} ({selectedOrder.deliveryAddress?.phone})
                </div>
                <div className="text-slate-500">
                  Address: {selectedOrder.deliveryAddress?.streetAddress}, {selectedOrder.deliveryAddress?.area}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-[10px] tracking-wider">
                  Item Details
                </h4>
                <div className="space-y-1.5 border border-slate-100 p-3 rounded-2xl">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.quantity}x {it.name} ({it.unit})</span>
                      <span className="font-bold">₹{it.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-950 rounded-2xl space-y-1">
                <div className="flex justify-between">
                  <span>Gross Sales:</span>
                  <span>₹{selectedOrder.pricing?.itemsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Commission ({selectedOrder.pricing?.platformCommissionPercentage}%):</span>
                  <span>-₹{selectedOrder.pricing?.platformCommissionAmount}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-emerald-200">
                  <span>Your Store Net Earnings:</span>
                  <span>₹{selectedOrder.pricing?.vendorEarnings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
