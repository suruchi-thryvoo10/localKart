import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { FreshTodayBadge } from './FreshTodayBadge.jsx';
import { Plus, Minus, Star, Clock } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { lang } = useLanguage();

  const cartItem = cart.items?.find(
    (i) => i.productId === product._id || i.productId?._id === product._id
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const displayName = product.name?.[lang] || product.name?.en || 'Fresh Product';
  const displayDesc = product.description?.[lang] || product.description?.en || '';

  const finalPrice = product.discountPercent > 0
    ? Math.round((product.price - (product.price * product.discountPercent) / 100) * 100) / 100
    : product.price;

  const isFresh = product.freshnessStatus === 'FRESH_TODAY';
  const isOutOfStock = product.stockQuantity === 0 || !product.isAvailable;

  return (
    <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col justify-between group relative">
      {/* Badges on top of image */}
      <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-100 mb-3">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {isFresh && <FreshTodayBadge harvestTime={product.harvestedDate} />}
          {product.badge === 'ORGANIC' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow">
              🌱 ORGANIC
            </span>
          )}
          {product.badge === 'LOCAL_SPECIAL' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow">
              ⭐ LOCAL
            </span>
          )}
        </div>

        {product.discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-600 text-white shadow">
            {product.discountPercent}% OFF
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor / Harvest tag */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md truncate max-w-[130px]">
              {product.vendorId?.shopName || 'Local Mandi'}
            </span>
            <span className="text-slate-500 font-medium">
              {product.unitQuantity || 1} {product.unit}
            </span>
          </div>

          <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight mb-1 group-hover:text-brand-700 transition-colors">
            {displayName}
          </h4>

          {displayDesc && (
            <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-normal">
              {displayDesc}
            </p>
          )}
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="pt-2 border-t border-slate-50 flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{finalPrice}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              per {product.unit}
            </span>
          </div>

          {/* Cart Quantity Action Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center bg-brand-700 text-white rounded-xl shadow-md overflow-hidden font-bold">
              <button
                onClick={() => updateQuantity(product._id, quantityInCart - 1)}
                className="px-2.5 py-1.5 hover:bg-brand-800 transition active:scale-95"
                title="Reduce"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 text-xs select-none">{quantityInCart}</span>
              <button
                onClick={() => updateQuantity(product._id, quantityInCart + 1)}
                className="px-2.5 py-1.5 hover:bg-brand-800 transition active:scale-95"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="px-4 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-300 hover:border-brand-600 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
