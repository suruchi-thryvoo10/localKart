import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ProductCard } from '../../components/ProductCard.jsx';
import { FreshTodayBadge } from '../../components/FreshTodayBadge.jsx';
import {
  Star,
  MapPin,
  Clock,
  Bike,
  ShieldCheck,
  Phone,
  Store,
  ChevronLeft,
} from 'lucide-react';

export const VendorDetail = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        const [vendorRes, prodRes, reviewRes] = await Promise.all([
          api.get(`/vendors/${id}`),
          api.get(`/products?vendorId=${id}&limit=100`),
          api.get(`/reviews/vendor/${id}`),
        ]);

        if (vendorRes.data.success) setVendor(vendorRes.data.data);
        if (prodRes.data.success) setProducts(prodRes.data.data.products || []);
        if (reviewRes.data.success) setReviews(reviewRes.data.data || []);
      } catch (err) {
        console.error('Failed to load store data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading store...</div>;
  }

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-slate-800">Store Not Found</h3>
        <Link to="/" className="text-xs text-brand-600 font-bold mt-2 inline-block">
          Return to Markets
        </Link>
      </div>
    );
  }

  // Extract unique categories from this vendor's products
  const availableCategories = ['ALL', ...new Set(products.map((p) => p.categoryId?.name?.en || 'Others'))];

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter((p) => (p.categoryId?.name?.en || 'Others') === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Local Markets
      </Link>

      {/* Store Header Banner */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl">
        <div className="relative h-48 sm:h-64 w-full bg-slate-900">
          <img
            src={vendor.banner || 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80'}
            alt={vendor.shopName}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Fresh Stock Badge */}
          {vendor.hasFreshStockToday && (
            <div className="absolute top-4 left-4">
              <FreshTodayBadge size="lg" />
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-300 font-bold mb-1">
                <Store className="w-4 h-4" />
                <span>{vendor.shopType?.replace(/_/g, ' ')}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black">{vendor.shopName}</h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {vendor.description || 'Fresh produce and groceries direct from local market.'}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-end">
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{vendor.rating || 4.8}</span>
                </div>
                <div className="text-[10px] text-slate-300">{vendor.totalRatings || 0} reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Quick Info Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Location</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span className="truncate">{vendor.address?.area}, {vendor.address?.city}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Store Hours</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span>{vendor.openingTime} - {vendor.closingTime}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Delivery Fee</span>
            <span className="font-bold text-emerald-600 block mt-0.5">
              ₹{vendor.deliveryFee} (Free above ₹{vendor.freeDeliveryAbove})
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Min. Order</span>
            <span className="font-bold text-slate-800 block mt-0.5">
              ₹{vendor.minOrderAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {availableCategories.map((catName) => (
          <button
            key={catName}
            onClick={() => setSelectedCategory(catName)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === catName
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {catName}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Store Products ({filteredProducts.length})
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-6">
            <span className="text-3xl block mb-2">📦</span>
            <h4 className="text-sm font-bold text-slate-700">No products in this category</h4>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Customer Ratings & Freshness Reviews</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg font-bold">
              ★ {vendor.rating}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{r.customerName}</span>
                  <div className="flex items-center text-amber-500 text-xs">
                    {'★'.repeat(r.rating)}
                  </div>
                </div>
                {r.comment && <p className="text-xs text-slate-600">{r.comment}</p>}
                {r.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-bold text-brand-700 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
