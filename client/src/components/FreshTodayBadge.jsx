import React from 'react';
import { Sparkles, Leaf } from 'lucide-react';

export const FreshTodayBadge = ({ size = 'sm', harvestTime = 'Today Morning' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full text-white bg-gradient-to-r from-emerald-600 to-green-500 shadow-md ${
        size === 'lg' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-0.5 text-[10px]'
      }`}
    >
      <span className="text-xs">🥬</span>
      <span>Fresh Today</span>
      {harvestTime && size === 'lg' && (
        <span className="opacity-90 font-normal lowercase">• {harvestTime}</span>
      )}
    </div>
  );
};
