import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Heart, ShoppingCart, Eye, Zap } from "lucide-react";
import ProductColorSwatches from "./ProductColorSwatches";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const ProductCard = ({ product, showQuickActions = true }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const selectedVariant = product.colorVariants?.[selectedVariantIndex];
  const currentImages = selectedVariant?.images || product.images || [];
  const primaryImage =
    currentImages.find((img) => img.isPrimary) || currentImages[0];

  const handleColorChange = (variant, index) => {
    setSelectedVariantIndex(index);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const finalPrice =
        parseFloat(product.price) +
        parseFloat(selectedVariant?.priceAdjustment || 0);

      addToCart({
        id: product._id || product.id,
        name: product.name,
        price: finalPrice,
        image:
          primaryImage?.url ||
          product.images?.[0]?.url ||
          "https://via.placeholder.com/300",
        colorVariant: selectedVariant
          ? {
              colorName: selectedVariant.colorName,
              colorCode: selectedVariant.colorCode,
              priceAdjustment: selectedVariant.priceAdjustment || 0,
            }
          : null,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const productId = product._id || product.id;
      if (isInWishlist(productId)) {
        removeFromWishlist(productId);
      } else {
        addToWishlist(product);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const getCurrentPrice = () => {
    const basePrice = parseFloat(product.price);
    const adjustment = parseFloat(selectedVariant?.priceAdjustment || 0);
    return basePrice + adjustment;
  };

  const getCurrentStock = () => {
    return selectedVariant?.stock || product.stock || 0;
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product._id}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={
              primaryImage?.url ||
              product.images?.[0]?.url ||
              "https://via.placeholder.com/300"
            }
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {product.badge}
            </span>
          )}

          {/* Wishlist Button */}
          {showQuickActions && (
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                isInWishlist(product._id)
                  ? "bg-pink-500 text-white"
                  : "bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500"
              } ${isHovered ? "opacity-100" : "opacity-0"}`}
            >
              <Heart
                className={`h-4 w-4 ${
                  isInWishlist(product._id) ? "fill-current" : ""
                }`}
              />
            </button>
          )}

          {/* Quick View Button */}
          {showQuickActions && (
            <div
              className={`absolute bottom-3 left-3 right-3 transition-all ${
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <Link
                to={`/product/${product._id}`}
                className="w-full bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Quick View
              </Link>
            </div>
          )}

          {/* Stock Status */}
          {getCurrentStock() === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            ({product.reviews || 0})
          </span>
        </div>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Color Variants */}
        {product.colorVariants && product.colorVariants.length > 1 && (
          <div className="mb-3">
            <ProductColorSwatches
              colorVariants={product.colorVariants}
              selectedIndex={selectedVariantIndex}
              onColorChange={handleColorChange}
              size="sm"
              showNames={false}
              maxVisible={4}
            />
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-900">
              ${getCurrentPrice().toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
            {selectedVariant?.priceAdjustment > 0 && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                +${selectedVariant.priceAdjustment}
              </span>
            )}
          </div>
        </div>

        {/* Stock Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Stock:</span>
            <span
              className={`font-medium ${
                getCurrentStock() < 5 ? "text-red-600" : "text-green-600"
              }`}
            >
              {getCurrentStock()} available
            </span>
          </div>
          {selectedVariant && (
            <div className="text-xs text-gray-500 mt-1">
              Color: {selectedVariant.colorName}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showQuickActions && (
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              disabled={getCurrentStock() === 0}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </button>

            <button
              onClick={handleAddToCart}
              disabled={getCurrentStock() === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="h-4 w-4 mr-2" />
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
