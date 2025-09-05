import React from 'react';
import { Users, TrendingUp, Hash, Camera } from 'lucide-react';
import SocialFeed from '../components/SocialFeed';
import AIRecommendations from '../components/AIRecommendations';

const SocialPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">LUXE Social</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover how others style their LUXE purchases, get inspired, and share your own looks
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Hashtags */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Hash className="h-5 w-5 mr-2 text-blue-600" />
                Trending
              </h3>
              <div className="space-y-3">
                {[
                  { tag: '#LuxeStyle', posts: '2.4K' },
                  { tag: '#OOTD', posts: '1.8K' },
                  { tag: '#LuxeFashion', posts: '1.2K' },
                  { tag: '#StyleInspo', posts: '956' },
                  { tag: '#LuxeLife', posts: '743' }
                ].map((item) => (
                  <div key={item.tag} className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium">{item.tag}</span>
                    <span className="text-sm text-gray-500">{item.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Community
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">12.5K</div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">3.2K</div>
                  <div className="text-sm text-gray-600">Posts Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">89%</div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            <SocialFeed />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <AIRecommendations />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPage;