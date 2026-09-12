import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Bike,
  Home,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

const STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock, desc: 'Sent to store' },
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2, desc: 'Store confirmed' },
  { key: 'PREPARING', label: 'Packing Fresh', icon: Package, desc: 'Selecting fresh veggies' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', icon: Bike, desc: 'Delivery partner on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: Home, desc: 'Delivered with OTP' },
];

export const OrderTimeline = ({ status, statusHistory = [], deliveryOtp, isCustomerView = true }) => {
  const getStepIndex = (s) => {
    if (s === 'READY_FOR_PICKUP') return 2.5;
    const idx = STEPS.findIndex((step) => step.key === s);
    return idx === -1 ? 0 : idx;
  };

  const currentIdx = getStepIndex(status);
  const isCancelled = status === 'CANCELLED' || status === 'REJECTED';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* OTP Callout Box (Only for Customer during active order) */}
      {isCustomerView && deliveryOtp && status !== 'DELIVERED' && !isCancelled && (
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-green-100">
                Delivery Verification Code
              </div>
              <div className="text-xs text-white/90">
                Share this OTP with your delivery partner only upon arrival
              </div>
            </div>
          </div>

          <div className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-black text-2xl tracking-[0.25em] shadow-inner self-end sm:self-center">
            {deliveryOtp}
          </div>
        </div>
      )}

      {isCancelled ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-bold text-sm">This order has been cancelled/rejected</div>
            <div className="text-xs">Refund or cancellation process has been triggered.</div>
          </div>
        </div>
      ) : (
        /* Stepper Progression */
        <div className="relative">
          <div className="grid grid-cols-5 gap-2 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = currentIdx >= idx;
              const isCurrent = Math.floor(currentIdx) === idx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-lg scale-110'
                        : isPassed
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-bold mt-2.5 line-clamp-1 ${
                      isPassed ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5 max-w-[90px]">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timestamp history log */}
      {statusHistory.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
            Status Activity Log
          </h4>
          <div className="space-y-1.5">
            {statusHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  {h.status.replace(/_/g, ' ')}: <span className="text-slate-500 font-normal">{h.note}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
