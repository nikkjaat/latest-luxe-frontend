import React, { useState, useEffect } from 'react';
import { X, Gift, Clock, Tag } from 'lucide-react';
import { usePromotions } from '../context/PromotionContext';

const PromotionBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const { promotions } = usePromotions();

  const activePromotion = promotions.find(p => p.isActive);

  useEffect(() => {
    if (!activePromotion) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(activePromotion.endDate).getTime();
      const distance = endTime - now;

      if (distance < 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, [activePromotion]);

  if (!isVisible || !activePromotion) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Gift className="h-5 w-5 animate-bounce" />
            <span className="font-bold text-lg">{activePromotion.title}</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm opacity-90">{activePromotion.description}</span>
            <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <Tag className="h-4 w-4" />
              <span className="font-mono font-bold">{activePromotion.code}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-sm">{timeLeft}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PromotionBanner;