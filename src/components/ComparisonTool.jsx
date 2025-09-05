import React, { useState } from "react";
import { X, Star, Check, Minus } from "lucide-react";

const ComparisonTool = ({ products, onClose }) => {
  const [selectedProducts, setSelectedProducts] = useState(
    products.slice(0, 3)
  );

  const features = [
    "Price",
    "Rating",
    "Reviews",
    "Category",
    "Brand",
    "Warranty",
    "Shipping",
    "Return Policy",
  ];

  // Helper function to extract rating value
  const getRatingValue = (product) => {
    return typeof product.rating === "object"
      ? product.rating.average
      : product.rating;
  };

  // Helper function to extract reviews count
  const getReviewsCount = (product) => {
    return typeof product.rating === "object"
      ? product.rating.count
      : product.reviews || 0;
  };

  const getFeatureValue = (product, feature) => {
    switch (feature) {
      case "Price":
        return `$${product.price}`;
      case "Rating":
        const ratingValue = getRatingValue(product);
        return (
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            {ratingValue.toFixed(1)}
          </div>
        );
      case "Reviews":
        return `${getReviewsCount(product)} reviews`;
      case "Category":
        return product.category;
      case "Brand":
        return product.vendorName || "LUXE";
      case "Warranty":
        return product.warranty || "1 Year";
      case "Shipping":
        return product.shipping || "Free";
      case "Return Policy":
        return product.returnPolicy || "30 Days";
      default:
        return "-";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Product Comparison
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Features Column */}
            <div className="space-y-4">
              <div className="h-48"></div> {/* Spacer for product images */}
              {features.map((feature) => (
                <div key={feature} className="h-12 flex items-center">
                  <span className="font-medium text-gray-900">{feature}</span>
                </div>
              ))}
            </div>

            {/* Product Columns */}
            {selectedProducts.map((product) => (
              <div key={product._id || product.id} className="space-y-4">
                {/* Product Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <img
                    src={product.images?.[0]?.url || product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">
                    {product.name}
                  </h3>
                  <div className="text-lg font-bold text-blue-600">
                    ${product.price}
                  </div>
                </div>

                {/* Feature Values */}
                {features.map((feature) => (
                  <div key={feature} className="h-12 flex items-center">
                    <span className="text-sm text-gray-700">
                      {getFeatureValue(product, feature)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            {selectedProducts.map((product) => (
              <button
                key={product._id || product.id}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Cart
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTool;
