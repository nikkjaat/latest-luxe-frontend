import React, { useState } from "react";
import {
  Sparkles,
  Camera,
  RotateCcw,
  Share2,
  Download,
  Home,
  Laptop,
  Palette,
  Dumbbell,
  Baby,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import ARTryOn from "../components/ARTryOn";

const ARShowroom = () => {
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Products", icon: Sparkles },
    { id: "accessories", name: "Accessories", icon: Camera },
    { id: "women", name: "Women", icon: Sparkles },
    { id: "men", name: "Men", icon: RotateCcw },
    { id: "home", name: "Home", icon: Home },
    { id: "electronics", name: "Electronics", icon: Laptop },
    { id: "beauty", name: "Beauty", icon: Palette },
    { id: "sports", name: "Sports", icon: Dumbbell },
    { id: "kids", name: "Kids", icon: Baby },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-purple-600 mr-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AR Showroom
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of shopping with Augmented Reality. Try on
            products virtually before you buy.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Real-time Try-on
            </div>
            <div className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Share Your Look
            </div>
            <div className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Save Photos
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-3 py-2 rounded-lg transition-all text-sm ${
                  activeCategory === category.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Choose a Product to Try On
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id}>
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedProduct?.id === product.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">
                          ${product.price}
                        </span>
                        <div className="flex items-center">
                          <Sparkles className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            AR Ready
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AR Try-On for mobile/tablet - appears below selected product */}
                    {selectedProduct?.id === product.id && (
                      <div className="xl:hidden mt-6">
                        <ARTryOn product={selectedProduct} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-500">
                    No products available in this category.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AR Try-On - Only visible on XL screens and above */}
          <div className="hidden xl:block xl:col-span-1">
            {selectedProduct ? (
              <div className="sticky top-4">
                <ARTryOn product={selectedProduct} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center sticky top-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Product
                </h3>
                <p className="text-gray-600">
                  Choose any product from the left to start your AR try-on
                  experience
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Preview
            </h3>
            <p className="text-gray-600">
              See how products look on you in real-time with advanced AR
              technology
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Share & Get Feedback
            </h3>
            <p className="text-gray-600">
              Share your virtual try-on photos with friends and get their
              opinions
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Save Your Looks
            </h3>
            <p className="text-gray-600">
              Download and save your favorite try-on photos for future reference
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARShowroom;
