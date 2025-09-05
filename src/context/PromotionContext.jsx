import React, { createContext, useContext, useState } from 'react';

const PromotionContext = createContext(undefined);

export const usePromotions = () => {
  const context = useContext(PromotionContext);
  if (context === undefined) {
    throw new Error('usePromotions must be used within a PromotionProvider');
  }
  return context;
};

export const PromotionProvider = ({ children }) => {
  const [promotions, setPromotions] = useState([
    {
      id: '1',
      title: 'Flash Sale',
      description: '50% off on selected items',
      discountType: 'percentage',
      discountValue: 50,
      code: 'FLASH50',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      isActive: true,
      applicableProducts: ['1', '2', '3'],
      minOrderValue: 100
    },
    {
      id: '2',
      title: 'New Customer Discount',
      description: '$20 off on first order',
      discountType: 'fixed',
      discountValue: 20,
      code: 'WELCOME20',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      isActive: true,
      applicableProducts: [],
      minOrderValue: 50
    }
  ]);

  const [coupons, setCoupons] = useState([
    {
      id: '1',
      code: 'SAVE15',
      discount: 15,
      type: 'percentage',
      minOrder: 75,
      expiryDate: '2025-06-30',
      isActive: true,
      usageLimit: 100,
      usedCount: 23
    }
  ]);

  const addPromotion = (promotion) => {
    const newPromotion = {
      ...promotion,
      id: Date.now().toString()
    };
    setPromotions(prev => [...prev, newPromotion]);
  };

  const updatePromotion = (id, updates) => {
    setPromotions(prev => prev.map(promo => 
      promo.id === id ? { ...promo, ...updates } : promo
    ));
  };

  const deletePromotion = (id) => {
    setPromotions(prev => prev.filter(promo => promo.id !== id));
  };

  const validateCoupon = (code, orderValue) => {
    const coupon = coupons.find(c => c.code === code && c.isActive);
    if (!coupon) return { valid: false, message: 'Invalid coupon code' };
    if (orderValue < coupon.minOrder) {
      return { valid: false, message: `Minimum order value is $${coupon.minOrder}` };
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit exceeded' };
    }
    return { valid: true, coupon };
  };

  const applyCoupon = (code) => {
    setCoupons(prev => prev.map(coupon => 
      coupon.code === code ? { ...coupon, usedCount: coupon.usedCount + 1 } : coupon
    ));
  };

  return (
    <PromotionContext.Provider value={{
      promotions,
      coupons,
      addPromotion,
      updatePromotion,
      deletePromotion,
      validateCoupon,
      applyCoupon
    }}>
      {children}
    </PromotionContext.Provider>
  );
};