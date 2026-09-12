import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState({ items: [], vendorId: null, couponCode: null, discountAmount: 0 });
  const [summary, setSummary] = useState({
    itemCount: 0,
    subtotal: 0,
    deliveryFee: 0,
    discountAmount: 0,
    finalAmount: 0,
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [vendorConflict, setVendorConflict] = useState(null); // { message, currentVendor, newVendor, pendingProduct, pendingQty }
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      // Local cart fallback
      const saved = localStorage.getItem('lk_local_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCart(parsed);
          calculateLocalSummary(parsed);
        } catch (e) {}
      }
      return;
    }

    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.data.cart);
        setSummary(res.data.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const calculateLocalSummary = (localCart) => {
    const items = localCart.items || [];
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.finalPrice * i.quantity, 0);
    const deliveryFee = subtotal > 0 ? (subtotal >= 300 ? 0 : 25) : 0;
    const discountAmount = localCart.discountAmount || 0;
    const finalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    setSummary({
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      discountAmount,
      finalAmount: Math.round(finalAmount * 100) / 100,
      minOrderMet: true,
      minOrderAmount: 0,
    });
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  const addToCart = async (product, quantity = 1, forceClear = false) => {
    if (!isAuthenticated) {
      // Prompt user to login or handle locally
    }

    setLoading(true);
    try {
      const res = await api.post('/cart/items', {
        productId: product._id,
        quantity,
        forceClear,
      });

      if (res.data.success) {
        setCart(res.data.data.cart);
        setSummary(res.data.data.summary);
        setVendorConflict(null);
        setIsDrawerOpen(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 409 && err.response.data.conflict) {
        setVendorConflict({
          message: err.response.data.message,
          currentVendor: err.response.data.currentVendor,
          newVendor: err.response.data.newVendor,
          pendingProduct: product,
          pendingQty: quantity,
        });
      } else {
        alert(err.response?.data?.message || 'Failed to add product');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmVendorSwitch = async () => {
    if (vendorConflict && vendorConflict.pendingProduct) {
      await addToCart(vendorConflict.pendingProduct, vendorConflict.pendingQty, true);
    }
    setVendorConflict(null);
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put('/cart/items', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.data.cart);
        setSummary(res.data.data.summary);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.data.success) {
        setCart({ items: [], vendorId: null, couponCode: null, discountAmount: 0 });
        setSummary({ itemCount: 0, subtotal: 0, deliveryFee: 0, discountAmount: 0, finalAmount: 0 });
      }
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const applyCouponCode = async (code) => {
    try {
      const res = await api.post('/cart/apply-coupon', { code });
      if (res.data.success) {
        await fetchCart();
        return res.data;
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        summary,
        isDrawerOpen,
        setIsDrawerOpen,
        vendorConflict,
        setVendorConflict,
        confirmVendorSwitch,
        addToCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        refreshCart: fetchCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
