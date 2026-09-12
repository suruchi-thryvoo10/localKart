import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Plus, Edit2, Trash2, Sparkles, Minus, Package, Search } from 'lucide-react';

export const VendorProducts = () => {
  const { vendor } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: '',
    nameEn: '',
    nameHi: '',
    nameOd: '',
    price: '',
    discountPercent: 0,
    unit: 'kg',
    unitQuantity: 1,
    stockQuantity: 50,
    freshnessStatus: 'FRESH_TODAY',
    badge: 'FRESH_HARVEST',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?vendorId=${vendor?._id}&limit=100`),
        api.get('/categories'),
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.data.products || []);
      if (catRes.data.success) {
        setCategories(catRes.data.data);
        if (catRes.data.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor) {
      fetchProducts();
    }
  }, [vendor]);

  const handleToggleFreshness = async (productId) => {
    try {
      await api.patch(`/products/${productId}/toggle-fresh`);
      await fetchProducts();
    } catch (err) {
      alert('Failed to toggle freshness status');
    }
  };

  const handleUpdateStock = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await api.patch(`/products/${productId}/stock`, { stockQuantity: newStock });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, stockQuantity: newStock } : p))
      );
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product from your store?')) return;
    try {
      await api.delete(`/products/${productId}`);
      await fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        categoryId: formData.categoryId,
        name: {
          en: formData.nameEn,
          hi: formData.nameHi || formData.nameEn,
          od: formData.nameOd || formData.nameEn,
        },
        price: Number(formData.price),
        discountPercent: Number(formData.discountPercent),
        unit: formData.unit,
        unitQuantity: Number(formData.unitQuantity),
        stockQuantity: Number(formData.stockQuantity),
        freshnessStatus: formData.freshnessStatus,
        badge: formData.badge,
        images: [formData.image],
        vendorId: vendor._id,
      };

      const res = await api.post('/products', payload);
      if (res.data.success) {
        setShowAddModal(false);
        await fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const name = (p.name?.en || '').toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Store Products & Stock</h1>
          <p className="text-xs text-slate-500">
            Set daily stock, update prices, and mark morning fresh vegetables
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-600/30 flex items-center gap-2 self-start sm:self-center transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter products by name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-brand-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Click below to add your first product</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
          >
            + Add Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">Fresh Today Status</th>
                  <th className="p-4">Stock Quantity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const isFresh = product.freshnessStatus === 'FRESH_TODAY';
                  return (
                    <tr key={product._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=100&q=80'}
                            alt={product.name?.en}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{product.name?.en}</div>
                            <div className="text-[11px] text-slate-400">
                              {product.name?.hi && `${product.name.hi} • `}
                              {product.name?.od && `${product.name.od} • `}
                              {product.unitQuantity} {product.unit}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-slate-600">
                        {product.categoryId?.name?.en || 'General'}
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        ₹{product.price}
                        {product.discountPercent > 0 && (
                          <span className="ml-1 text-[10px] text-red-600 font-bold">
                            (-{product.discountPercent}%)
                          </span>
                        )}
                      </td>

                      {/* Fresh Today Toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleFreshness(product._id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                            isFresh
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>🥬</span>
                          <span>{isFresh ? 'Fresh Today' : 'Mark Fresh'}</span>
                        </button>
                      </td>

                      {/* Stock Adjuster */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden font-bold">
                            <button
                              onClick={() => handleUpdateStock(product._id, product.stockQuantity, -5)}
                              className="px-2.5 py-1 hover:bg-slate-200 transition text-slate-600"
                              title="Decrease 5"
                            >
                              -5
                            </button>
                            <span className="px-3 text-xs text-slate-900">
                              {product.stockQuantity} {product.unit}
                            </span>
                            <button
                              onClick={() => handleUpdateStock(product._id, product.stockQuantity, 5)}
                              className="px-2.5 py-1 hover:bg-slate-200 transition text-slate-600"
                              title="Increase 5"
                            >
                              +5
                            </button>
                          </div>
                          {product.stockQuantity === 0 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <h3 className="text-xl font-black text-slate-900">Add New Product to Store</h3>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Category
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name?.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Product Name (English)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Desi Tomato"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Hindi Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. देसी टमाटर"
                    value={formData.nameHi}
                    onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Odia Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ଦେଶୀ ଟମାଟୋ"
                    value={formData.nameOd}
                    onChange={(e) => setFormData({ ...formData, nameOd: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="40"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="piece">piece</option>
                    <option value="bundle">bundle</option>
                    <option value="packet">packet</option>
                    <option value="dozen">dozen</option>
                    <option value="litre">litre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs shadow-md"
                >
                  Save & Publish Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
