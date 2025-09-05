import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Camera, Hash, User, CheckCircle } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';

const SocialFeed = () => {
  const { socialPosts, influencers, likePost, sharePost, followUser, userFollowing } = useSocial();
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ caption: '', image: null });

  const handleLike = (postId) => {
    likePost(postId);
  };

  const handleShare = (postId) => {
    sharePost(postId);
    // In real app, would open share dialog
  };

  const handleFollow = (userId) => {
    followUser(userId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      {user && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 bg-gray-100 text-left px-4 py-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              Share your latest purchase...
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Camera className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Influencer Suggestions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Suggested Influencers</h3>
        <div className="space-y-3">
          {influencers.map((influencer) => (
            <div key={influencer.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={influencer.avatar}
                  alt={influencer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center">
                    <h4 className="font-semibold text-gray-900">{influencer.name}</h4>
                    {influencer.verified && (
                      <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{influencer.followers} followers</p>
                  <p className="text-xs text-gray-500">{influencer.bio}</p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(influencer.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  userFollowing.includes(influencer.id)
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {userFollowing.includes(influencer.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Posts */}
      {socialPosts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={post.userAvatar}
                alt={post.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{post.userName}</h4>
                <p className="text-sm text-gray-500">{post.timestamp}</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {/* Post Image */}
          <img
            src={post.image}
            alt="Post"
            className="w-full h-64 object-cover"
          />

          {/* Post Actions */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Heart className="h-6 w-6" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                  <span>{post.comments}</span>
                </button>
                <button
                  onClick={() => handleShare(post.id)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition-colors"
                >
                  <Share2 className="h-6 w-6" />
                  <span>{post.shares}</span>
                </button>
              </div>
            </div>

            {/* Post Caption */}
            <p className="text-gray-900 mb-2">{post.caption}</p>

            {/* Product Tag */}
            <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3">
              <img
                src={post.productImage}
                alt={post.productName}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{post.productName}</h5>
                <p className="text-sm text-gray-600">Tap to view product</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Shop Now
              </button>
            </div>

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-blue-600 text-sm hover:underline cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SocialFeed;