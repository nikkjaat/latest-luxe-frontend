import React from "react";
import { Check } from "lucide-react";

const ProductColorSwatches = ({
  colorVariants = [],
  selectedIndex = 0,
  onColorChange,
  size = "md",
  showNames = true,
  maxVisible = 5,
}) => {
  if (!colorVariants || colorVariants.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  const visibleVariants = colorVariants.slice(0, maxVisible);
  const remainingCount = colorVariants.length - maxVisible;

  return (
    <div className="flex items-center space-x-2">
      {visibleVariants.map((variant, index) => (
        <button
          key={index}
          onClick={() => onColorChange && onColorChange(variant, index)}
          className={`relative ${
            sizeClasses[size]
          } rounded-full border-2 transition-all ${
            selectedIndex === index
              ? "border-blue-500 ring-2 ring-blue-200"
              : "border-gray-300 hover:border-gray-400"
          }`}
          style={{ backgroundColor: variant.colorCode }}
          title={variant.colorName}
        >
          {selectedIndex === index && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="h-3 w-3 text-white drop-shadow-lg" />
            </div>
          )}

          {variant.stock === 0 && (
            <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="w-0.5 h-full bg-red-500 transform rotate-45"></div>
            </div>
          )}
        </button>
      ))}

      {remainingCount > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center`}
        >
          <span className="text-xs font-medium text-gray-600">
            +{remainingCount}
          </span>
        </div>
      )}

      {showNames && selectedIndex < visibleVariants.length && (
        <span className="text-sm text-gray-600 ml-2">
          {visibleVariants[selectedIndex]?.colorName}
        </span>
      )}
    </div>
  );
};

export default ProductColorSwatches;
