import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const WishlistPage = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart({
      id: item.productId._id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Save items you love to your wishlist and shop them later.
            </p>
            <Link
              to="/shop"
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Continue Shopping
          </Link>
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-pink-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-2">{items.length} items saved</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.productId.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="relative">
                <img
                  src={item.productId.images[0].url}
                  alt={item.productId.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => removeFromWishlist(item.productId._id)}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors group"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(item.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({item.productId.reviews})
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.productId.name}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-blue-900">
                      ${item.productId.price}
                    </span>
                    {item.productId.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${item.productId.originalPrice}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <Heart className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Share Your Wishlist
            </h3>
            <p className="text-gray-600 mb-4">
              Let friends and family know what you're wishing for
            </p>
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              Share Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
