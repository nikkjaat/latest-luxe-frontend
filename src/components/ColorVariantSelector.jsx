import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const ColorVariantSelector = ({
  colorVariants = [],
  selectedVariant,
  onVariantChange,
  showPriceAdjustment = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!colorVariants || colorVariants.length === 0) {
    return null;
  }

  const handleVariantSelect = (variant, index) => {
    onVariantChange(variant, index);
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Color: {selectedVariant?.colorName || "Select a color"}
        {showPriceAdjustment && selectedVariant?.priceAdjustment > 0 && (
          <span className="text-green-600 ml-2">
            (+${selectedVariant.priceAdjustment})
          </span>
        )}
      </label>

      {/* Color Options */}
      <div className="flex flex-wrap gap-3">
        {colorVariants.map((variant, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleVariantSelect(variant, index)}
            className={`relative flex items-center space-x-3 p-3 border-2 rounded-lg transition-all ${
              selectedVariant === variant
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Color Circle */}
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: variant.colorCode }}
            />

            {/* Color Info */}
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {variant.colorName}
              </div>
              <div className="text-sm text-gray-500">
                Stock: {variant.stock}
                {showPriceAdjustment && variant.priceAdjustment > 0 && (
                  <span className="text-green-600 ml-1">
                    (+${variant.priceAdjustment})
                  </span>
                )}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedVariant === variant && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}

            {/* Out of Stock Overlay */}
            {variant.stock === 0 && (
              <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Stock Warning */}
      {selectedVariant &&
        selectedVariant.stock < 5 &&
        selectedVariant.stock > 0 && (
          <div className="mt-2 text-sm text-orange-600">
            Only {selectedVariant.stock} left in stock!
          </div>
        )}
    </div>
  );
};

export default ColorVariantSelector;
