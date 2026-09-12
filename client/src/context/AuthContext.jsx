import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [deliveryAgent, setDeliveryAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('lk_access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        setVendor(res.data.data.vendor);
        setDeliveryAgent(res.data.data.deliveryAgent);
      }
    } catch (err) {
      console.error('Failed to restore session', err);
      localStorage.removeItem('lk_access_token');
      localStorage.removeItem('lk_refresh_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleLogoutEvent = () => {
      setUser(null);
      setVendor(null);
      setDeliveryAgent(null);
    };

    window.addEventListener('lk_auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('lk_auth_logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: loggedUser, vendor: loggedVendor, deliveryAgent: loggedAgent, tokens } = res.data.data;
      localStorage.setItem('lk_access_token', tokens.accessToken);
      localStorage.setItem('lk_refresh_token', tokens.refreshToken);
      setUser(loggedUser);
      setVendor(loggedVendor);
      setDeliveryAgent(loggedAgent);
      return res.data;
    }
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      const { user: newUser, vendor: newVendor, deliveryAgent: newAgent, tokens } = res.data.data;
      localStorage.setItem('lk_access_token', tokens.accessToken);
      localStorage.setItem('lk_refresh_token', tokens.refreshToken);
      setUser(newUser);
      setVendor(newVendor);
      setDeliveryAgent(newAgent);
      return res.data;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('lk_refresh_token');
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      // Ignore network error on logout
    } finally {
      localStorage.removeItem('lk_access_token');
      localStorage.removeItem('lk_refresh_token');
      setUser(null);
      setVendor(null);
      setDeliveryAgent(null);
    }
  };

  // Quick switcher for demo and testing
  const switchDemoAccount = async (role) => {
    const credentials = {
      CUSTOMER: { email: 'customer@localkart.com', password: 'Customer@123' },
      VENDOR: { email: 'ramesh@localkart.com', password: 'Vendor@123' },
      DELIVERY_AGENT: { email: 'delivery@localkart.com', password: 'Delivery@123' },
      ADMIN: { email: 'admin@localkart.com', password: 'Admin@localkart2026' },
    };

    const target = credentials[role];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        deliveryAgent,
        loading,
        login,
        register,
        logout,
        switchDemoAccount,
        refreshProfile: fetchCurrentUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
