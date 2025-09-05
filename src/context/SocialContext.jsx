import React, { createContext, useContext, useState } from 'react';

const SocialContext = createContext(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

export const SocialProvider = ({ children }) => {
  const [socialPosts, setSocialPosts] = useState([
    {
      id: '1',
      userId: 'user_1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      productId: '1',
      productName: 'Premium Leather Handbag',
      productImage: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
      caption: 'Absolutely love my new handbag! Perfect for work and weekend. #LuxeStyle #Fashion',
      image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600',
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: '2 hours ago',
      tags: ['#LuxeStyle', '#Fashion', '#Handbag']
    },
    {
      id: '2',
      userId: 'user_2',
      userName: 'Michael Chen',
      userAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      productId: '2',
      productName: 'Designer Watch Collection',
      productImage: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400',
      caption: 'Time to upgrade! This watch is a game-changer. ⌚✨',
      image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600',
      likes: 31,
      comments: 12,
      shares: 5,
      timestamp: '5 hours ago',
      tags: ['#Watch', '#Style', '#Luxury']
    }
  ]);

  const [userFollowing, setUserFollowing] = useState(['user_1', 'user_2']);
  const [influencers, setInfluencers] = useState([
    {
      id: 'inf_1',
      name: 'Emma Style',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      followers: '125K',
      category: 'Fashion',
      verified: true,
      bio: 'Fashion enthusiast & style curator'
    },
    {
      id: 'inf_2',
      name: 'Tech Reviewer Pro',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      followers: '89K',
      category: 'Electronics',
      verified: true,
      bio: 'Latest tech reviews & recommendations'
    }
  ]);

  const createPost = (postData) => {
    const newPost = {
      ...postData,
      id: Date.now().toString(),
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: 'Just now'
    };
    setSocialPosts(prev => [newPost, ...prev]);
  };

  const likePost = (postId) => {
    setSocialPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const sharePost = (postId) => {
    setSocialPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, shares: post.shares + 1 } : post
    ));
  };

  const followUser = (userId) => {
    setUserFollowing(prev => [...prev, userId]);
  };

  const unfollowUser = (userId) => {
    setUserFollowing(prev => prev.filter(id => id !== userId));
  };

  return (
    <SocialContext.Provider value={{
      socialPosts,
      userFollowing,
      influencers,
      createPost,
      likePost,
      sharePost,
      followUser,
      unfollowUser
    }}>
      {children}
    </SocialContext.Provider>
  );
};