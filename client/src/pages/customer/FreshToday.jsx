import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ProductCard } from '../../components/ProductCard.jsx';
import { FreshTodayBadge } from '../../components/FreshTodayBadge.jsx';
import { Sparkles, Clock, Leaf } from 'lucide-react';

export const FreshToday = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchFresh = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products/fresh-today?limit=50');
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load fresh items', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFresh();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <FreshTodayBadge size="lg" harvestTime="Today 5:00 AM Harvest" />
          <h1 className="text-3xl sm:text-4xl font-black">
            Today's Fresh Harvest Direct From Mandi
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Every item in this section was harvested today morning by local farmers and brought fresh to the mandis. Crispiest vegetables, farm-plucked greens, and seasonal fruits.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading fresh harvests...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl p-8 border border-slate-100">
          <span className="text-4xl block mb-2">🥬</span>
          <h3 className="text-lg font-bold text-slate-800">Fresh harvest batch updating</h3>
          <p className="text-xs text-slate-500 mt-1">Vendors update their morning harvest stock between 5:30 AM and 7:00 AM.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
