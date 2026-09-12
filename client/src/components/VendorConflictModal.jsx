import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { AlertCircle, ArrowRight, Store, Trash2 } from 'lucide-react';

export const VendorConflictModal = () => {
  const { vendorConflict, setVendorConflict, confirmVendorSwitch } = useCart();

  if (!vendorConflict) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Replace items already in your cart?
        </h3>
        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          LocalKart delivers directly from individual neighborhood stores to ensure freshest harvest. Your basket can only contain items from one store at a time.
        </p>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold uppercase">Current Store</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-500" />
              {vendorConflict.currentVendor?.shopName || 'Previous Store'}
            </span>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-600 font-semibold uppercase">New Store</span>
            <span className="font-bold text-brand-700 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-brand-600" />
              {vendorConflict.newVendor?.shopName || 'New Store'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={confirmVendorSwitch}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            Discard Previous & Add From New Store
          </button>
          <button
            onClick={() => setVendorConflict(null)}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-sm transition"
          >
            Keep My Current Basket
          </button>
        </div>
      </div>
    </div>
  );
};
