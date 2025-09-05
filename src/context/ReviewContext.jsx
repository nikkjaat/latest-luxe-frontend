import React, { createContext, useContext, useState } from 'react';

const ReviewContext = createContext(undefined);

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([
    {
      id: '1',
      productId: '1',
      userId: 'user_1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5,
      title: 'Excellent Quality!',
      comment: 'This handbag exceeded my expectations. The leather is premium quality and the craftsmanship is outstanding.',
      date: '2025-01-15',
      verified: true,
      helpful: 12,
      images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=300']
    },
    {
      id: '2',
      productId: '1',
      userId: 'user_2',
      userName: 'Michael Chen',
      userAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4,
      title: 'Great purchase',
      comment: 'Beautiful handbag, exactly as described. Fast shipping too!',
      date: '2025-01-10',
      verified: true,
      helpful: 8,
      images: []
    }
  ]);

  const addReview = (review) => {
    const newReview = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      verified: true
    };
    setReviews(prev => [...prev, newReview]);
  };

  const getProductReviews = (productId) => {
    return reviews.filter(review => review.productId === productId);
  };

  const getAverageRating = (productId) => {
    const productReviews = getProductReviews(productId);
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / productReviews.length).toFixed(1);
  };

  const markHelpful = (reviewId) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review
    ));
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      addReview,
      getProductReviews,
      getAverageRating,
      markHelpful
    }}>
      {children}
    </ReviewContext.Provider>
  );
};