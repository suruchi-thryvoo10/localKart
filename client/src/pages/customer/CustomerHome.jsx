import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useLocation } from '../../context/LocationContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ProductCard } from '../../components/ProductCard.jsx';
import { VendorCard } from '../../components/VendorCard.jsx';
import { FreshTodayBadge } from '../../components/FreshTodayBadge.jsx';
import {
  Search,
  Sparkles,
  Store,
  Bike,
  ShieldCheck,
  Tag,
  ArrowRight,
  Filter,
  Layers,
} from 'lucide-react';

export const CustomerHome = () => {
  const { selectedLocation, setIsLocationModalOpen } = useLocation();
  const { t, lang } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [freshProducts, setFreshProducts] = useState([]);
  const [nearbyVendors, setNearbyVendors] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lng, lat] = selectedLocation?.coordinates || [85.8340, 20.2980];

      const [catRes, freshRes, vendorRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products/fresh-today?limit=8'),
        api.get(`/vendors/nearby?lat=${lat}&lng=${lng}&radius=10`),
        api.get('/products?limit=24'),
      ]);

      if (catRes.data.success) setCategories(catRes.data.data);
      if (freshRes.data.success) setFreshProducts(freshRes.data.data);
      if (vendorRes.data.success) setNearbyVendors(vendorRes.data.data);
      if (prodRes.data.success) setAllProducts(prodRes.data.data.products || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLocation]);

  const filteredProducts = allProducts.filter((product) => {
    const matchesCat = !selectedCategory || product.categoryId?._id === selectedCategory || product.categoryId === selectedCategory;
    const name = (product.name?.[lang] || product.name?.en || '').toLowerCase();
    const tags = (product.tags || []).join(' ').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || name.includes(query) || tags.includes(query);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-950 text-white p-6 sm:p-12 shadow-2xl mx-4 sm:mx-6 lg:mx-8 mt-4 border border-brand-700/50">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 top-0 w-64 h-64 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-brand-200">
            <span>🥬</span>
            <span>Direct Farm Harvests from Local Nimapada Mandi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {t('home.heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-brand-100 font-normal leading-relaxed max-w-2xl">
            {t('home.heroSubtitle')}
          </p>

          {/* Quick Search Bar */}
          <div className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="w-full pl-12 pr-28 py-4 bg-white text-slate-900 rounded-2xl shadow-xl font-medium text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-brand-400/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick USP Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl text-xs font-bold text-brand-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">⚡</div>
              <span>25-35 Mins Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">🥬</div>
              <span>Daily Fresh Mandi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">🏪</div>
              <span>Direct Local Vendors</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. Categories Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t('home.categories')}
              </h2>
              <p className="text-xs text-slate-500">Pick from fresh produce and grocery essentials</p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl transition"
              >
                Show All Categories
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat._id;
              const catName = cat.name?.[lang] || cat.name?.en;

              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat._id)}
                  className={`p-4 rounded-3xl border transition-all text-center flex flex-col items-center justify-between gap-3 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xl shadow-brand-600/25 scale-102'
                      : 'bg-white text-slate-800 border-slate-100 hover:border-brand-200 hover:shadow-lg'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 ${
                      isSelected ? 'bg-white/20' : 'bg-slate-50'
                    }`}
                  >
                    {cat.image ? (
                      <img src={cat.image} alt={catName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🥦</span>
                    )}
                  </div>
                  <span className="text-xs font-bold leading-snug line-clamp-1">
                    {catName}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Fresh Today Spotlight Section */}
        {!selectedCategory && !searchQuery && (
          <section className="bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent p-6 sm:p-8 rounded-3xl border border-emerald-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FreshTodayBadge size="lg" />
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Morning Harvest Alert
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {t('home.freshTodayBanner')}
                </h3>
                <p className="text-xs text-slate-500">{t('home.freshTodaySub')}</p>
              </div>

              <Link
                to="/fresh-today"
                className="self-start sm:self-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
              >
                <span>View All Fresh Harvests</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {freshProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Nearby Local Vendors */}
        {!searchQuery && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {t('home.nearbyVendors')}
                </h2>
                <p className="text-xs text-slate-500">
                  Open shops within delivery range of {selectedLocation?.area || 'Saheed Nagar'}
                </p>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl transition"
              >
                Change Location
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nearbyVendors.map((vendor) => (
                <VendorCard key={vendor._id} vendor={vendor} />
              ))}
            </div>
          </section>
        )}

        {/* 5. Main Product Catalog Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {selectedCategory
                  ? categories.find((c) => c._id === selectedCategory)?.name?.[lang] || 'Selected Category'
                  : searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : 'All Local Market Products'}
              </h2>
              <p className="text-xs text-slate-500">
                {filteredProducts.length} items available from local shops
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching for something else or clearing the active category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
