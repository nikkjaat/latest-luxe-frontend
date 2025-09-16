import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

const ProductImageGallery = ({
  colorVariants = [],
  selectedVariant,
  selectedVariantIndex = 0,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get images for the selected color variant
  const currentImages = selectedVariant?.images || [];

  // Reset image index when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariantIndex]);

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === currentImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? currentImages.length - 1 : prev - 1
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "Escape") setIsFullscreen(false);
  };

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  if (!currentImages || currentImages.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={
              currentImages[selectedImageIndex]?.url ||
              currentImages[selectedImageIndex]?.secure_url
            }
            alt={currentImages[selectedImageIndex]?.alt || "Product image"}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setIsFullscreen(true)}
          />
        </div>

        {/* Navigation Arrows */}
        {currentImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="h-4 w-4 text-gray-700" />
        </button>

        {/* Image Counter */}
        {currentImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
            {selectedImageIndex + 1} / {currentImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {currentImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {currentImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImageIndex === index
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={image.url || image.secure_url}
                alt={image.alt || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Color Variant Thumbnails */}
      {colorVariants.length > 1 && (
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Other Colors:
          </p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {colorVariants.map((variant, index) => {
              if (index === selectedVariantIndex) return null;

              const primaryImage =
                variant.images.find((img) => img.isPrimary) ||
                variant.images[0];

              return (
                <div
                  key={index}
                  className="flex-shrink-0 text-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 group-hover:border-gray-300 transition-colors">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url || primaryImage.secure_url}
                        alt={variant.colorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: variant.colorCode }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate w-12">
                    {variant.colorName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={
                currentImages[selectedImageIndex]?.url ||
                currentImages[selectedImageIndex]?.secure_url
              }
              alt={currentImages[selectedImageIndex]?.alt || "Product image"}
              className="max-w-full max-h-full object-contain"
            />

            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation in Fullscreen */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image Counter in Fullscreen */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full">
              {selectedImageIndex + 1} of {currentImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
