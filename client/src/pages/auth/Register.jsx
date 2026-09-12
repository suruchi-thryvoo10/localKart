import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShoppingBag, Store, Bike, ArrowRight } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'CUSTOMER';

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopType, setShopType] = useState('VEGETABLES');
  const [vehicleType, setVehicleType] = useState('MOTORCYCLE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name,
      email,
      phone,
      password,
      role,
      shopDetails: role === 'VENDOR' ? { shopName, shopType } : undefined,
      vehicleDetails: role === 'DELIVERY_AGENT' ? { vehicleType } : undefined,
    };

    try {
      await register(payload);
      if (role === 'VENDOR') navigate('/vendor/dashboard');
      else if (role === 'DELIVERY_AGENT') navigate('/delivery/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 text-2xl shadow-xl shadow-brand-500/30">
            🥬
          </div>
          <h2 className="text-2xl font-black text-slate-900">Create LocalKart Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose your profile and join the hyperlocal ecosystem
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              role === 'CUSTOMER'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('VENDOR')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              role === 'VENDOR'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            Vendor Owner
          </button>
          <button
            type="button"
            onClick={() => setRole('DELIVERY_AGENT')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              role === 'DELIVERY_AGENT'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            Delivery Boy
          </button>
        </div>

        {error && (
          <div className="p-3.5 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Full Name / Contact Person
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Sahoo"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Phone Number (Mobile)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98610 12345"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Set Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          {/* Role specific inputs */}
          {role === 'VENDOR' && (
            <div className="p-4 bg-brand-50/70 border border-brand-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                🏪 Store & Mandi Details
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Maa Tarini Fresh Vegetables"
                  className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Primary Category
                </label>
                <select
                  value={shopType}
                  onChange={(e) => setShopType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="VEGETABLES">Fresh Vegetables & Herbs</option>
                  <option value="ORGANIC_PRODUCE">Organic Produce & Fruits</option>
                  <option value="GROCERY">Kirana & Daily Grocery</option>
                  <option value="DAIRY">Dairy & Farm Eggs</option>
                </select>
              </div>
            </div>
          )}

          {role === 'DELIVERY_AGENT' && (
            <div className="p-4 bg-brand-50/70 border border-brand-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                🛵 Delivery Fleet Details
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="MOTORCYCLE">Motorcycle / Bike</option>
                  <option value="EV_SCOOTER">Electric Scooter (EV)</option>
                  <option value="SCOOTER">Scooter / Activa</option>
                  <option value="BICYCLE">Bicycle</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-extrabold rounded-2xl shadow-xl shadow-brand-600/30 text-sm flex items-center justify-center gap-2 transition mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
