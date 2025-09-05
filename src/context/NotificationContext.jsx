import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #ORD-001 has been placed',
      time: '2 minutes ago',
      read: false,
      userId: 'vendor_1'
    },
    {
      id: '2',
      type: 'vendor',
      title: 'New Vendor Application',
      message: 'Tech Gadgets Pro has applied to become a vendor',
      time: '1 hour ago',
      read: false,
      userId: 'admin'
    },
    {
      id: '3',
      type: 'promotion',
      title: 'Flash Sale Started',
      message: '50% off on selected items - Limited time!',
      time: '3 hours ago',
      read: true,
      userId: 'all'
    }
  ]);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const getUnreadCount = (userId) => {
    return notifications.filter(notif => 
      !notif.read && (notif.userId === userId || notif.userId === 'all')
    ).length;
  };

  const getUserNotifications = (userId) => {
    return notifications.filter(notif => 
      notif.userId === userId || notif.userId === 'all'
    );
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      getUnreadCount,
      getUserNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};