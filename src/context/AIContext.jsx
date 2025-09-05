import React, { createContext, useContext, useState } from 'react';

const AIContext = createContext(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);

  // AI-powered product recommendations
  const getPersonalizedRecommendations = (userId, browsedProducts = [], purchaseHistory = []) => {
    // Simulate AI recommendations based on user behavior
    const mockRecommendations = [
      {
        id: '1',
        reason: 'Based on your recent views',
        confidence: 0.95,
        products: ['2', '3', '4']
      },
      {
        id: '2',
        reason: 'Customers who bought this also bought',
        confidence: 0.87,
        products: ['5', '6', '7']
      },
      {
        id: '3',
        reason: 'Trending in your category',
        confidence: 0.78,
        products: ['8', '1', '2']
      }
    ];
    
    setRecommendations(mockRecommendations);
    return mockRecommendations;
  };

  // Smart search with auto-complete
  const getSmartSearchSuggestions = (query) => {
    const suggestions = [
      { text: `${query} handbag`, type: 'product', count: 45 },
      { text: `${query} accessories`, type: 'category', count: 120 },
      { text: `${query} leather`, type: 'material', count: 67 },
      { text: `${query} premium`, type: 'quality', count: 89 }
    ];
    
    setSearchSuggestions(suggestions);
    return suggestions;
  };

  // Price prediction and alerts
  const predictPriceChange = (productId) => {
    // Simulate AI price prediction
    const prediction = {
      currentPrice: 299,
      predictedPrice: 279,
      confidence: 0.82,
      timeframe: '7 days',
      trend: 'decreasing'
    };
    
    return prediction;
  };

  const createPriceAlert = (productId, targetPrice) => {
    const alert = {
      id: Date.now().toString(),
      productId,
      targetPrice,
      currentPrice: 299,
      created: new Date().toISOString(),
      active: true
    };
    
    setPriceAlerts(prev => [...prev, alert]);
    return alert;
  };

  // Visual search simulation
  const searchByImage = (imageFile) => {
    // Simulate visual search results
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', similarity: 0.95, name: 'Similar Leather Handbag' },
          { id: '2', similarity: 0.87, name: 'Matching Style Bag' },
          { id: '3', similarity: 0.78, name: 'Related Accessory' }
        ]);
      }, 2000);
    });
  };

  // Style matching
  const getStyleMatches = (productId) => {
    return [
      { id: '2', matchScore: 0.92, reason: 'Similar color palette' },
      { id: '3', matchScore: 0.85, reason: 'Complementary style' },
      { id: '4', matchScore: 0.78, reason: 'Same occasion wear' }
    ];
  };

  return (
    <AIContext.Provider value={{
      recommendations,
      searchSuggestions,
      priceAlerts,
      getPersonalizedRecommendations,
      getSmartSearchSuggestions,
      predictPriceChange,
      createPriceAlert,
      searchByImage,
      getStyleMatches
    }}>
      {children}
    </AIContext.Provider>
  );
};