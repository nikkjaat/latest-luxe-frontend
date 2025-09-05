import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, Users, Eye, Star, ShoppingCart } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const AIRecommendations = () => {
  const { getPersonalizedRecommendations, recommendations } = useAI();
  const { user } = useAuth();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getPersonalizedRecommendations(user.id);
      setTimeout(() => setLoading(false), 1500);
    }
  }, [user]);

  const getRecommendationIcon = (reason) => {
    if (reason.includes('recent views')) return <Eye className="h-5 w-5 text-blue-500" />;
    if (reason.includes('also bought')) return <Users className="h-5 w-5 text-green-500" />;
    if (reason.includes('trending')) return <TrendingUp className="h-5 w-5 text-purple-500" />;
    return <Brain className="h-5 w-5 text-orange-500" />;
  };

  if (!user || loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
            <div className="h-6 bg-gray-300 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Brain className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
          <p className="text-sm text-gray-600">Personalized just for you</p>
        </div>
      </div>

      <div className="space-y-8">
        {recommendations.map((recommendation) => {
          const recommendedProducts = products.filter(p => 
            recommendation.products.includes(p.id)
          ).slice(0, 3);

          return (
            <div key={recommendation.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getRecommendationIcon(recommendation.reason)}
                  <span className="ml-2 font-medium text-gray-900">
                    {recommendation.reason}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${recommendation.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(recommendation.confidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-blue-600">${product.price}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIRecommendations;