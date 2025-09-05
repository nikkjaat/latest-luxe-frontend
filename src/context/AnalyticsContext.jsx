import React, { createContext, useContext, useState } from 'react';

const AnalyticsContext = createContext(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState({
    sales: {
      daily: [120, 150, 180, 200, 170, 190, 220],
      weekly: [1200, 1400, 1600, 1800, 1500, 1700, 1900],
      monthly: [15000, 18000, 22000, 25000, 20000, 23000, 28000]
    },
    visitors: {
      daily: [500, 650, 720, 800, 600, 750, 900],
      weekly: [3500, 4200, 4800, 5200, 4000, 4600, 5500],
      monthly: [25000, 28000, 32000, 35000, 30000, 33000, 38000]
    },
    topProducts: [
      { id: '1', name: 'Premium Leather Handbag', sales: 45, revenue: 13455 },
      { id: '2', name: 'Designer Watch Collection', sales: 32, revenue: 19168 },
      { id: '3', name: 'Silk Scarf Set', sales: 28, revenue: 4172 }
    ],
    topCategories: [
      { name: 'Accessories', sales: 156, percentage: 35 },
      { name: 'Fashion', sales: 134, percentage: 30 },
      { name: 'Electronics', sales: 89, percentage: 20 },
      { name: 'Home', sales: 67, percentage: 15 }
    ],
    customerMetrics: {
      totalCustomers: 2543,
      newCustomers: 156,
      returningCustomers: 2387,
      averageOrderValue: 185.50,
      customerLifetimeValue: 450.75
    }
  });

  const trackEvent = (event, data) => {
    // In a real app, this would send data to analytics service
    console.log('Analytics Event:', event, data);
  };

  const getRevenueGrowth = () => {
    const current = analytics.sales.monthly[analytics.sales.monthly.length - 1];
    const previous = analytics.sales.monthly[analytics.sales.monthly.length - 2];
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getVisitorGrowth = () => {
    const current = analytics.visitors.monthly[analytics.visitors.monthly.length - 1];
    const previous = analytics.visitors.monthly[analytics.visitors.monthly.length - 2];
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <AnalyticsContext.Provider value={{
      analytics,
      trackEvent,
      getRevenueGrowth,
      getVisitorGrowth
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};