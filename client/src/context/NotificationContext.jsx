import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        showToast,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-medium ${
              toast.type === 'error'
                ? 'bg-red-600'
                : toast.type === 'warning'
                ? 'bg-amber-600'
                : 'bg-emerald-600'
            }`}
          >
            <span>{toast.type === 'error' ? '⚠️' : '🥬'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
