import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Bike, CheckCircle2 } from 'lucide-react';
import { FreshTodayBadge } from './FreshTodayBadge.jsx';

export const VendorCard = ({ vendor }) => {
  const isFresh = vendor.hasFreshStockToday;

  return (
    <Link
      to={`/store/${vendor._id}`}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:border-brand-200 transition-all duration-300 flex flex-col group"
    >
      {/* Banner & Badges */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
        <img
          src={vendor.banner || 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80'}
          alt={vendor.shopName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Fresh Stock Badge */}
        {isFresh && (
          <div className="absolute top-3 left-3">
            <FreshTodayBadge size="lg" />
          </div>
        )}

        {/* Delivery ETA Badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-slate-900 shadow-lg flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          <span>25-35 mins</span>
        </div>

        {/* Distance Badge */}
        {vendor.distanceKm !== undefined && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-semibold text-white shadow-lg flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{vendor.distanceKm} km away</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors line-clamp-1">
              {vendor.shopName}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-700 text-xs font-extrabold flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{vendor.rating || 4.8}</span>
              <span className="text-[10px] text-slate-400 font-normal">({vendor.totalRatings || 24})</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 line-clamp-1 mb-3">
            {vendor.description || 'Fresh produce and groceries direct from local market'}
          </p>

          <div className="text-xs text-slate-600 space-y-1 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Location:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                {vendor.address?.area || 'Saheed Nagar'}, {vendor.address?.city || 'Bhubaneswar'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Free Delivery:</span>
              <span className="font-bold text-emerald-600">
                Above ₹{vendor.freeDeliveryAbove || 300}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-brand-600" />
            Vendor's Own Delivery Boy
          </span>
          <span className="font-bold text-brand-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Shop Now →
          </span>
        </div>
      </div>
    </Link>
  );
};
