import React from 'react';
import { useLocation } from '../context/LocationContext.jsx';
import { MapPin, Navigation, X, Check } from 'lucide-react';

export const LocationModal = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    selectedLocation,
    setSelectedLocation,
    popularLocations,
    useCurrentGps,
  } = useLocation();

  if (!isLocationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={() => setIsLocationModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-brand-100 text-brand-700 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Select Your Location</h3>
            <p className="text-xs text-slate-500">Discover fresh vegetables & shops near you</p>
          </div>
        </div>

        <button
          onClick={useCurrentGps}
          className="w-full mb-5 py-3 px-4 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 rounded-2xl font-semibold flex items-center justify-center gap-2 text-sm transition"
        >
          <Navigation className="w-4 h-4 text-brand-600" />
          Use Current Device GPS Location
        </button>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Popular Hyperlocal Hubs (Bhubaneswar)
          </p>
          <div className="space-y-2">
            {popularLocations.map((loc) => {
              const isSelected = selectedLocation?.name === loc.name;
              return (
                <button
                  key={loc.name}
                  onClick={() => setSelectedLocation(loc)}
                  className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between border transition ${
                    isSelected
                      ? 'bg-brand-50/70 border-brand-400 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-sm font-bold text-slate-800">{loc.name}</div>
                      <div className="text-xs text-slate-500">{loc.area} • Pincode: {loc.pincode}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-brand-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
