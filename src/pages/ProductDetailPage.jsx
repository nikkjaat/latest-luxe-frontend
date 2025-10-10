import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Sparkles,
  Camera,
  CameraOff,
  ChevronDown,
  ChevronUp,
  Check,
  Ruler,
  Palette,
  Scissors,
  Cpu,
  Droplets,
  Home,
  Watch,
  Dumbbell,
  Baby,
  Loader,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductReviews from "../components/ProductReviews";
import ComparisonTool from "../components/ComparisonTool";
import styles from "./ProductDetailPage.module.css";

const ColorImageOption = ({ variant, isSelected, onSelect, isAutoScroll }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loadingItems, setLoadingItems] = useState({});

  const intervalRef = useRef(null);

  const variantImages = variant.images || [];
  const hasMultipleImages = variantImages.length > 1;

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start auto-scroll ONLY for NON-SELECTED colors
    // - There are multiple images
    // - Auto-scroll is enabled globally
    // - This color is NOT selected
    // - Not currently hovered (for better UX)
    if (hasMultipleImages && isAutoScroll && !isSelected && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % variantImages.length);
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    hasMultipleImages,
    isAutoScroll,
    isSelected,
    isHovered,
    variantImages.length,
  ]);

  // Reset to first image when variant changes or when selected
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [variant.colorName, isSelected]);

  // For selected color, always show the first image (no auto-scroll)
  // For non-selected colors, use the currentImageIndex
  const displayImageIndex = isSelected ? 0 : currentImageIndex;
  const currentImage = variantImages[displayImageIndex] || variantImages[0];

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      className={
        isSelected
          ? `${styles.colorImageOption} ${styles.colorImageOptionSelected}`
          : styles.colorImageOption
      }
      onClick={onSelect}
      aria-label={`Select color: ${variant.colorName}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.colorImageContainer}>
        {currentImage && (
          <img
            src={currentImage.url || currentImage.secure_url}
            alt={variant.colorName}
            className={styles.colorImage}
          />
        )}

        {/* Show image count badge if multiple images */}
        {hasMultipleImages && (
          <div className={styles.imageCountBadge}>
            +{variantImages.length - 1}
          </div>
        )}

        {/* Image indicators only for NON-SELECTED colors with multiple images */}
        {hasMultipleImages && !isSelected && (
          <div className={styles.colorImageIndicators}>
            {variantImages.map((_, index) => (
              <div
                key={index}
                className={
                  index === currentImageIndex
                    ? `${styles.colorImageIndicator} ${styles.colorImageIndicatorActive}`
                    : styles.colorImageIndicator
                }
              />
            ))}
          </div>
        )}

        {/* Selection checkmark - only for selected color */}
        {isSelected && (
          <div className={styles.colorSelectionCheck}>
            <Check className={styles.colorCheckIcon} />
          </div>
        )}

        {/* Pause indicator when hovered on non-selected colors */}
        {isHovered && hasMultipleImages && !isSelected && (
          <div className={styles.pauseOverlay}>
            <div className={styles.pauseIcon}>⏸️</div>
          </div>
        )}
      </div>

      <span className={styles.colorName}>{variant.colorName}</span>
    </button>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, getProduct } = useProducts();
  const {
    addToCart,
    removeFromCart,
    items: cartItems,
    updateQuantity,
  } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  console.log(cartItems)

  // State coming from navigate
  const { keyword, filterCategory, name, itemCount } = location.state || {};

  const [product, setProduct] = useState();
  const [selectedColorVariant, setSelectedColorVariant] = useState(null);
  const [selectedSizeVariant, setSelectedSizeVariant] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showComparison, setShowComparison] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    specifications: false,
    shipping: false,
  });
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectionError, setSelectionError] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const stickyBoundaryRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(id);
        setProduct(productData.product);

        if (productData.product.colorVariants?.length > 0) {
          const firstColorVariant = productData.product.colorVariants[0];
          setSelectedColorVariant(firstColorVariant);
          setSelectedColor(firstColorVariant.colorName);

          if (firstColorVariant.sizeVariants?.length > 0) {
            const firstSizeVariant = firstColorVariant.sizeVariants[0];
            setSelectedSizeVariant(firstSizeVariant);
            setSelectedSize(
              firstSizeVariant.size || firstSizeVariant.customSize
            );
            setCurrentPrice(
              productData.product.price +
                (firstSizeVariant.priceAdjustment || 0)
            );
          } else {
            setCurrentPrice(productData.product.price);
          }
        } else {
          setCurrentPrice(productData.product.price);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    fetchProduct();
  }, [id, getProduct]);

  useEffect(() => {
    if (!product || !selectedColor) return;

    const colorVariant = product.colorVariants.find(
      (variant) => variant.colorName === selectedColor
    );

    if (colorVariant) {
      setSelectedColorVariant(colorVariant);

      // Set selected image to primary image or first image
      const sortedImages = getSortedImages(colorVariant.images);
      const primaryIndex = sortedImages.findIndex((img) => img.isPrimary);
      setSelectedImage(primaryIndex >= 0 ? primaryIndex : 0);

      if (colorVariant.sizeVariants?.length > 0) {
        const firstSizeVariant = colorVariant.sizeVariants[0];
        setSelectedSizeVariant(firstSizeVariant);
        setSelectedSize(firstSizeVariant.size || firstSizeVariant.customSize);
        setCurrentPrice(
          product.price + (firstSizeVariant.priceAdjustment || 0)
        );
      }
    }
  }, [selectedColor, product]);

  useEffect(() => {
    if (!product || !selectedSizeVariant || !selectedColorVariant) return;
    const sizeVariant = selectedColorVariant.sizeVariants.find(
      (variant) =>
        variant.size === selectedSize || variant.customSize === selectedSize
    );
    if (sizeVariant) {
      setSelectedSizeVariant(sizeVariant);
      setCurrentPrice(product.price + (sizeVariant.priceAdjustment || 0));
    }
  }, [selectedSize, selectedColorVariant, product]);

  useEffect(() => {
    const foundProduct = products.find((p) => p._id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [products, id]);

  useEffect(() => {
    const handleScroll = () => {
      if (stickyBoundaryRef.current) {
        const boundary = stickyBoundaryRef.current.getBoundingClientRect();
        setIsSticky(boundary.top <= 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const validateSelection = () => {
    setSelectionError("");
    if (
      product.colorVariants &&
      product.colorVariants.length > 0 &&
      !selectedColor
    ) {
      setSelectionError("Please select a color");
      return false;
    }
    if (
      selectedColorVariant &&
      selectedColorVariant.sizeVariants &&
      selectedColorVariant.sizeVariants.length > 0 &&
      !selectedSize
    ) {
      setSelectionError("Please select a size");
      return false;
    }
    return true;
  };
  const getCartQuantity = () => {
    const cartItem = cartItems?.find(
      (item) =>
        item?.productId?._id === id &&
        item.color === selectedColor &&
        item.size === selectedSize
    );
    return cartItem ? cartItem.quantity : 0;
  };
  const inCart = getCartQuantity();

  useEffect(() => {
    if (showAR && cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showAR, cameraActive]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setCameraError("Unable to access camera");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => setCameraActive((prev) => !prev);
  const handleARButtonClick = () => setShowAR((prev) => !prev);

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const relatedProducts = products
    .filter(
      (p) => p?.category?.main === product?.category?.main && p?._id !== id
    )
    .slice(0, 4);

  // Add this function to sort images with primary image first
  const getSortedImages = (images) => {
    if (!images || images.length === 0) return [];

    // Create a copy to avoid mutating the original array
    const sortedImages = [...images];

    // Find the primary image index
    const primaryIndex = sortedImages.findIndex((img) => img.isPrimary);

    // If primary image exists and it's not already first, move it to the beginning
    if (primaryIndex > 0) {
      const [primaryImage] = sortedImages.splice(primaryIndex, 1);
      sortedImages.unshift(primaryImage);
    }

    return sortedImages;
  };

  useEffect(() => {
    const images = selectedColorVariant?.images || [];
    const sortedImages = getSortedImages(images);

    if (sortedImages.length <= 1 || !autoScroll) return;

    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % sortedImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedColorVariant?.images, autoScroll]);

  // Function to render specifications based on category
  const renderSpecifications = () => {
    if (!product) return null;

    const specs = [];

    // Add common specifications
    if (product.commonSpecs) {
      if (product.commonSpecs.weight && product.commonSpecs.weight.value) {
        specs.push({
          name: "Weight",
          value: `${product.commonSpecs.weight.value} ${
            product.commonSpecs.weight.unit || "kg"
          }`,
          icon: <Dumbbell className={styles.specIcon} />,
        });
      }

      if (product.commonSpecs.material) {
        specs.push({
          name: "Material",
          value: product.commonSpecs.material,
          icon: <Scissors className={styles.specIcon} />,
        });
      }

      if (product.commonSpecs.warranty) {
        specs.push({
          name: "Warranty",
          value: product.commonSpecs.warranty,
          icon: <Shield className={styles.specIcon} />,
        });
      }

      if (
        product.commonSpecs.features &&
        product.commonSpecs.features.length > 0
      ) {
        specs.push({
          name: "Features",
          value: product.commonSpecs.features.join(", "),
          icon: <Sparkles className={styles.specIcon} />,
        });
      }
    }

    // Add category-specific fields
    if (product.categoryFields) {
      const category = product.category?.main;

      // Electronics
      if (category === "electronics") {
        if (product.categoryFields.brand)
          specs.push({
            name: "Brand",
            value: product.categoryFields.brand,
            icon: <Cpu className={styles.specIcon} />,
          });
        if (product.categoryFields.model)
          specs.push({
            name: "Model",
            value: product.categoryFields.model,
            icon: <Cpu className={styles.specIcon} />,
          });
        if (product.categoryFields.screenSize)
          specs.push({
            name: "Screen Size",
            value: product.categoryFields.screenSize,
            icon: <Cpu className={styles.specIcon} />,
          });
        if (product.categoryFields.resolution)
          specs.push({
            name: "Resolution",
            value: product.categoryFields.resolution,
            icon: <Cpu className={styles.specIcon} />,
          });
        if (product.categoryFields.ram)
          specs.push({
            name: "RAM",
            value: product.categoryFields.ram,
            icon: <Cpu className={styles.specIcon} />,
          });
        if (product.categoryFields.storage)
          specs.push({
            name: "Storage",
            value: product.categoryFields.storage,
            icon: <Cpu className={styles.specIcon} />,
          });
        if (product.categoryFields.processor)
          specs.push({
            name: "Processor",
            value: product.categoryFields.processor,
            icon: <Cpu className={styles.specIcon} />,
          });
        if (product.categoryFields.battery)
          specs.push({
            name: "Battery",
            value: product.categoryFields.battery,
            icon: <Cpu className={styles.specIcon} />,
          });
      }

      // Clothing (Men & Women)
      if (category === "men" || category === "women") {
        if (product.categoryFields.fabric)
          specs.push({
            name: "Fabric",
            value: product.categoryFields.fabric,
            icon: <Scissors className={styles.specIcon} />,
          });
        if (product.categoryFields.fit)
          specs.push({
            name: "Fit",
            value: product.categoryFields.fit,
            icon: <Ruler className={styles.specIcon} />,
          });
        if (product.categoryFields.sleeveType)
          specs.push({
            name: "Sleeve Type",
            value: product.categoryFields.sleeveType,
            icon: <Scissors className={styles.specIcon} />,
          });
        if (product.categoryFields.neckType)
          specs.push({
            name: "Neck Type",
            value: product.categoryFields.neckType,
            icon: <Scissors className={styles.specIcon} />,
          });
        if (product.categoryFields.occasion)
          specs.push({
            name: "Occasion",
            value: product.categoryFields.occasion,
            icon: <Sparkles className={styles.specIcon} />,
          });
        if (product.categoryFields.pattern)
          specs.push({
            name: "Pattern",
            value: product.categoryFields.pattern,
            icon: <Scissors className={styles.specIcon} />,
          });
      }

      // Books
      if (category === "books") {
        if (product.categoryFields.author)
          specs.push({
            name: "Author",
            value: product.categoryFields.author,
            icon: <Sparkles className={styles.specIcon} />,
          });
        if (product.categoryFields.publisher)
          specs.push({
            name: "Publisher",
            value: product.categoryFields.publisher,
            icon: <Sparkles className={styles.specIcon} />,
          });
        if (product.categoryFields.isbn)
          specs.push({
            name: "ISBN",
            value: product.categoryFields.isbn,
            icon: <Sparkles className={styles.specIcon} />,
          });
        if (product.categoryFields.language)
          specs.push({
            name: "Language",
            value: product.categoryFields.language,
            icon: <Sparkles className={styles.specIcon} />,
          });
        if (product.categoryFields.pages)
          specs.push({
            name: "Pages",
            value: product.categoryFields.pages,
            icon: <Sparkles className={styles.specIcon} />,
          });
        if (product.categoryFields.genre)
          specs.push({
            name: "Genre",
            value: product.categoryFields.genre,
            icon: <Sparkles className={styles.specIcon} />,
          });
      }

      // Furniture
      if (category === "furniture") {
        if (product.categoryFields.material)
          specs.push({
            name: "Material",
            value: product.categoryFields.material,
            icon: <Home className={styles.specIcon} />,
          });
        if (product.categoryFields.dimensions)
          specs.push({
            name: "Dimensions",
            value: product.categoryFields.dimensions,
            icon: <Ruler className={styles.specIcon} />,
          });
        if (product.categoryFields.roomType)
          specs.push({
            name: "Room Type",
            value: product.categoryFields.roomType,
            icon: <Home className={styles.specIcon} />,
          });
        if (product.categoryFields.assembly)
          specs.push({
            name: "Assembly",
            value: product.categoryFields.assembly,
            icon: <Home className={styles.specIcon} />,
          });
        if (product.categoryFields.weightCapacity)
          specs.push({
            name: "Weight Capacity",
            value: product.categoryFields.weightCapacity,
            icon: <Dumbbell className={styles.specIcon} />,
          });
      }

      // Grocery
      if (category === "grocery") {
        if (product.categoryFields.expiryDate)
          specs.push({
            name: "Expiry Date",
            value: new Date(
              product.categoryFields.expiryDate
            ).toLocaleDateString(),
            icon: <Sparkles className={styles.specIcon} />,
          });
        if (product.categoryFields.weight)
          specs.push({
            name: "Weight",
            value: product.categoryFields.weight,
            icon: <Dumbbell className={styles.specIcon} />,
          });
        if (product.categoryFields.ingredients)
          specs.push({
            name: "Ingredients",
            value: product.categoryFields.ingredients,
            icon: <Droplets className={styles.specIcon} />,
          });
        if (product.categoryFields.nutritionFacts)
          specs.push({
            name: "Nutrition Facts",
            value: product.categoryFields.nutritionFacts,
            icon: <Droplets className={styles.specIcon} />,
          });
      }

      // Toys
      if (category === "toys") {
        if (product.categoryFields.ageRange)
          specs.push({
            name: "Age Range",
            value: product.categoryFields.ageRange,
            icon: <Baby className={styles.specIcon} />,
          });
        if (product.categoryFields.material)
          specs.push({
            name: "Material",
            value: product.categoryFields.material,
            icon: <Scissors className={styles.specIcon} />,
          });
        if (product.categoryFields.batteryRequired !== undefined)
          specs.push({
            name: "Battery Required",
            value: product.categoryFields.batteryRequired ? "Yes" : "No",
            icon: <Cpu className={styles.specIcon} />,
          });
        if (product.categoryFields.safetyInfo)
          specs.push({
            name: "Safety Info",
            value: product.categoryFields.safetyInfo,
            icon: <Shield className={styles.specIcon} />,
          });
      }

      // Sports
      if (category === "sports") {
        if (product.categoryFields.sportType)
          specs.push({
            name: "Sport Type",
            value: product.categoryFields.sportType,
            icon: <Dumbbell className={styles.specIcon} />,
          });
        if (product.categoryFields.material)
          specs.push({
            name: "Material",
            value: product.categoryFields.material,
            icon: <Scissors className={styles.specIcon} />,
          });
        if (product.categoryFields.size)
          specs.push({
            name: "Size",
            value: product.categoryFields.size,
            icon: <Ruler className={styles.specIcon} />,
          });
        if (product.categoryFields.weight)
          specs.push({
            name: "Weight",
            value: product.categoryFields.weight,
            icon: <Dumbbell className={styles.specIcon} />,
          });
      }

      // Beauty
      if (category === "beauty") {
        if (product.categoryFields.skinType)
          specs.push({
            name: "Skin Type",
            value: product.categoryFields.skinType,
            icon: <Droplets className={styles.specIcon} />,
          });
        if (product.categoryFields.ingredients)
          specs.push({
            name: "Ingredients",
            value: product.categoryFields.ingredients,
            icon: <Droplets className={styles.specIcon} />,
          });
        if (product.categoryFields.volume)
          specs.push({
            name: "Volume",
            value: product.categoryFields.volume,
            icon: <Droplets className={styles.specIcon} />,
          });
        if (product.categoryFields.benefits)
          specs.push({
            name: "Benefits",
            value: product.categoryFields.benefits,
            icon: <Sparkles className={styles.specIcon} />,
          });
      }
    }

    return specs.map((spec, index) => (
      <div key={index} className={styles.specItem}>
        <div className={styles.specIconContainer}>{spec.icon}</div>
        <div className={styles.specContent}>
          <span className={styles.specName}>{spec.name}:</span>
          <span className={styles.specValue}>{spec.value}</span>
        </div>
      </div>
    ));
  };

  // Check if there are any specifications to show
  const hasSpecifications = () => {
    if (!product) return false;

    // Check common specs
    if (product.commonSpecs) {
      if (product.commonSpecs.weight && product.commonSpecs.weight.value)
        return true;
      if (product.commonSpecs.material) return true;
      if (product.commonSpecs.warranty) return true;
      if (
        product.commonSpecs.features &&
        product.commonSpecs.features.length > 0
      )
        return true;
    }

    // Check category fields
    if (product.categoryFields) {
      return Object.values(product.categoryFields).some(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      );
    }

    return false;
  };

  if (!product) {
    return (
      <div className={styles.notFoundContainer}>
        <h2 className={styles.notFoundTitle}>Product not found</h2>
        <Link to="/shop" className={styles.notFoundLink}>
          Return to shop
        </Link>
      </div>
    );
  }

  const rating =
    typeof product?.rating === "object"
      ? product.rating.average
      : product?.rating || 0;
  const reviewsCount =
    typeof product?.rating === "object"
      ? product.rating.count
      : product?.reviews || 0;

  const isARCompatible = [
    "accessories",
    "jewelry",
    "watches",
    "eyewear",
    "hats",
  ].includes(product?.category?.main);

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addToCart({
      id: product._id,
      name: product.name,
      price: currentPrice,
      image:
        selectedColorVariant?.images?.[0]?.url ||
        product.images?.[0]?.url ||
        "",
      quantity,
      color: selectedColor,
      size: selectedSize,
    });
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    addToCart({
      id: product._id,
      name: product.name,
      price: currentPrice,
      image:
        selectedColorVariant?.images?.[0]?.url ||
        product.images?.[0]?.url ||
        "",
      quantity,
      color: selectedColor,
      size: selectedSize,
    });
    navigate("/checkout");
  };

  const handleWishlistToggle = () =>
    isInWishlist(id) ? removeFromWishlist(product._id) : addToWishlist(product);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/shop" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            Back to Shop
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Product Images */}
          <div
            className={`${styles.imageGallery} ${
              isSticky ? styles.sticky : ""
            }`}
          >
            <div
              className={styles.mainImageContainer}
              onMouseEnter={() => setAutoScroll(false)}
              onMouseLeave={() => setAutoScroll(true)}
            >
              {(() => {
                const imagesToShow =
                  selectedColorVariant?.images || product.images || [];
                const sortedImages = getSortedImages(imagesToShow);

                return sortedImages.length > 0 ? (
                  <>
                    <img
                      src={
                        sortedImages[selectedImage]?.url ||
                        sortedImages[selectedImage]?.secure_url
                      }
                      alt={product.name}
                      className={styles.mainImage}
                    />
                  </>
                ) : (
                  <div className={styles.noImage}>No Image Available</div>
                );
              })()}
              {/* Image indicators */}
              {selectedColorVariant &&
                selectedColorVariant.images &&
                selectedColorVariant.images.length > 1 && (
                  <div className={styles.imageIndicators}>
                    {getSortedImages(selectedColorVariant.images).map(
                      (_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={
                            selectedImage === index
                              ? `${styles.indicator} ${styles.indicatorActive}`
                              : `${styles.indicator} ${styles.indicatorInactive}`
                          }
                          aria-label={`Go to image ${index + 1}`}
                        />
                      )
                    )}
                  </div>
                )}
            </div>
            {/* Thumbnail images */}
            {selectedColorVariant &&
              selectedColorVariant.images &&
              selectedColorVariant.images.length > 1 && (
                <div className={styles.thumbnailContainer}>
                  {getSortedImages(selectedColorVariant.images).map(
                    (image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={
                          selectedImage === index
                            ? `${styles.thumbnail} ${styles.thumbnailActive}`
                            : styles.thumbnail
                        }
                      >
                        <img
                          src={image.url || image.secure_url}
                          alt={`Thumbnail ${index + 1}`}
                          className={styles.thumbnailImage}
                        />
                      </button>
                    )
                  )}
                </div>
              )}
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <div>
              <div className={styles.badgeContainer}>
                {product.badge && (
                  <span className={styles.badge}>{product.badge}</span>
                )}
                <span className={styles.vendorName}>
                  {product.vendorName && `by ${product.vendorName}`}
                </span>
              </div>
              <h1 className={styles.productTitle}>{product.name}</h1>

              <div className={styles.ratingContainer}>
                <div className={styles.starContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.floor(rating)
                          ? `${styles.star} ${styles.starFilled}`
                          : `${styles.star} ${styles.starEmpty}`
                      }
                    />
                  ))}
                  <span className={styles.ratingText}>
                    {rating.toFixed(1)} ({reviewsCount} reviews)
                  </span>
                </div>
              </div>

              <div className={styles.priceContainer}>
                <span className={styles.currentPrice}>
                  ${currentPrice.toFixed(2)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > currentPrice && (
                    <>
                      <span className={styles.originalPrice}>
                        ${product.originalPrice}
                      </span>
                      <span className={styles.discountBadge}>
                        Save $
                        {(product.originalPrice - currentPrice).toFixed(2)}
                      </span>
                    </>
                  )}
                {selectedSizeVariant?.priceAdjustment > 0 && (
                  <span className={styles.sizeAdjustment}>
                    +${selectedSizeVariant.priceAdjustment} for {selectedSize}
                  </span>
                )}
              </div>
            </div>

            {/* Updated color selection section in main component */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className={styles.selectionSection}>
                <h3 className={styles.selectionTitle}>Color</h3>
                <div className={styles.colorImageOptions}>
                  {product.colorVariants.map((variant) => (
                    <ColorImageOption
                      key={variant.colorName}
                      variant={variant}
                      isSelected={selectedColor === variant.colorName}
                      onSelect={() => setSelectedColor(variant.colorName)}
                      isAutoScroll={autoScroll}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {selectedColorVariant &&
              selectedColorVariant.sizeVariants &&
              selectedColorVariant.sizeVariants.length > 0 && (
                <div className={styles.selectionSection}>
                  <h3 className={styles.selectionTitle}>Size</h3>
                  <div className={styles.sizeOptions}>
                    {selectedColorVariant.sizeVariants.map((sizeVariant) => (
                      <button
                        key={sizeVariant.size || sizeVariant.customSize}
                        className={
                          selectedSize ===
                          (sizeVariant.size || sizeVariant.customSize)
                            ? `${styles.sizeOption} ${styles.sizeOptionSelected}`
                            : styles.sizeOption
                        }
                        onClick={() =>
                          setSelectedSize(
                            sizeVariant.size || sizeVariant.customSize
                          )
                        }
                        disabled={sizeVariant.stock <= 0}
                      >
                        {sizeVariant.size || sizeVariant.customSize}
                        {sizeVariant.stock <= 0 && " (Out of stock)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            {/* Selection Error */}
            {selectionError && (
              <div className={styles.selectionError}>{selectionError}</div>
            )}
            {/* Description Section */}
            <div className={styles.section}>
              <button
                className={styles.sectionHeader}
                onClick={() => toggleSection("description")}
              >
                <h3 className={styles.sectionTitle}>Product Description</h3>
                {expandedSections.description ? (
                  <ChevronUp className={styles.sectionIcon} />
                ) : (
                  <ChevronDown className={styles.sectionIcon} />
                )}
              </button>
              {expandedSections.description && (
                <div className={styles.sectionContent}>
                  <p className={styles.description}>
                    {product.description ||
                      "Experience luxury and sophistication with this premium product. Crafted with the finest materials and attention to detail, this item represents the perfect blend of style and functionality."}
                  </p>
                </div>
              )}
            </div>
            {/* Specifications Section */}
            {hasSpecifications() && (
              <div className={styles.section}>
                <button
                  className={styles.sectionHeader}
                  onClick={() => toggleSection("specifications")}
                >
                  <h3 className={styles.sectionTitle}>Specifications</h3>
                  {expandedSections.specifications ? (
                    <ChevronUp className={styles.sectionIcon} />
                  ) : (
                    <ChevronDown className={styles.sectionIcon} />
                  )}
                </button>
                {expandedSections.specifications && (
                  <div className={styles.sectionContent}>
                    <div className={styles.specificationsGrid}>
                      {renderSpecifications()}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* AR Try-On Button */}
            {isARCompatible && (
              <div className={styles.arSection}>
                <div className={styles.arBanner}>
                  <div className={styles.arBannerHeader}>
                    <Sparkles className={styles.arBannerIcon} />
                    <span className={styles.arBannerTitle}>
                      AR Try-On Available
                    </span>
                  </div>
                  <p className={styles.arBannerText}>
                    See how this {product.category?.main} looks on you using
                    augmented reality
                  </p>
                </div>
                <button
                  onClick={handleARButtonClick}
                  className={
                    showAR
                      ? `${styles.arButton} ${styles.arButtonActive}`
                      : `${styles.arButton} ${styles.arButtonInactive}`
                  }
                >
                  <Sparkles className={styles.arButtonIcon} />
                  {showAR ? "Close AR Try-On" : "Try with AR"}
                </button>
              </div>
            )}
            {/* Quantity and Actions */}
            <div className={styles.actionsSection}>
              <div className={styles.quantityContainer}>
                <label className={styles.quantityLabel}>Quantity:</label>
                <div className={styles.quantitySelector}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={styles.quantityButton}
                  >
                    -
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
                <span className={styles.stockInfo}>
                  {product.stock} items available
                </span>
              </div>

              <div className={styles.actionButtons}>
                <button
                  onClick={
                    inCart > 0 ? () => navigate("/cart") : handleAddToCart
                  }
                  className={styles.addToCartButton}
                >
                  <ShoppingCart className={styles.cartIcon} />
                  {inCart > 0 ? (
                    <span className={styles.inCartBadge}>{inCart} in Cart</span>
                  ) : (
                    <span className={styles.cartText}>Add to Cart</span>
                  )}
                </button>
                <button onClick={handleBuyNow} className={styles.buyNowButton}>
                  <Zap className={styles.buyNowIcon} />
                  Buy Now
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={
                    isInWishlist(product._id)
                      ? `${styles.wishlistButton} ${styles.wishlistButtonActive}`
                      : `${styles.wishlistButton} ${styles.wishlistButtonInactive}`
                  }
                >
                  <Heart
                    className={
                      isInWishlist(product._id)
                        ? `${styles.wishlistIcon} ${styles.wishlistIconFilled}`
                        : styles.wishlistIcon
                    }
                  />
                </button>
                <button className={styles.shareButton}>
                  <Share2 className={styles.shareIcon} />
                </button>
              </div>

              <button
                onClick={() => setShowComparison(true)}
                className={styles.compareButton}
              >
                Compare with Similar Products
              </button>
            </div>
            {/* Features - This is the boundary for sticky behavior */}
            <div ref={stickyBoundaryRef} className={styles.featuresSection}>
              <div className={styles.featuresGrid}>
                <div className={styles.featureItem}>
                  <Truck
                    className={`${styles.featureIcon} ${styles.shippingIcon}`}
                  />
                  <div className={styles.featureText}>
                    <p className={styles.featureTitle}>Free Shipping</p>
                    <p className={styles.featureDescription}>
                      On orders over $100
                    </p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <Shield
                    className={`${styles.featureIcon} ${styles.securityIcon}`}
                  />
                  <div className={styles.featureText}>
                    <p className={styles.featureTitle}>Secure Payment</p>
                    <p className={styles.featureDescription}>SSL encrypted</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <RotateCcw
                    className={`${styles.featureIcon} ${styles.returnsIcon}`}
                  />
                  <div className={styles.featureText}>
                    <p className={styles.featureTitle}>Easy Returns</p>
                    <p className={styles.featureDescription}>30-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AR Try-On Section */}
        {showAR && isARCompatible && (
          <div className={styles.arExperience}>
            <div className={styles.arHeader}>
              <h2 className={styles.arTitle}>AR Try-On Experience</h2>
              <button
                onClick={toggleCamera}
                className={
                  cameraActive
                    ? `${styles.cameraToggle} ${styles.cameraToggleActive}`
                    : `${styles.cameraToggle} ${styles.cameraToggleInactive}`
                }
              >
                {cameraActive ? (
                  <>
                    <CameraOff className={styles.cameraIcon} />
                    Turn Off Camera
                  </>
                ) : (
                  <>
                    <Camera className={styles.cameraIcon} />
                    Turn On Camera
                  </>
                )}
              </button>
            </div>

            {cameraError && (
              <div className={styles.cameraError}>{cameraError}</div>
            )}

            <div className={styles.arViewer}>
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={styles.video}
                />
              ) : (
                <div className={styles.cameraOff}>
                  <CameraOff className={styles.cameraOffIcon} />
                  <p className={styles.cameraOffTitle}>Camera is off</p>
                  <p className={styles.cameraOffText}>
                    Click "Turn On Camera" to start the AR experience
                  </p>
                </div>
              )}

              {/* Product overlay for AR - this is where you'd integrate with a real AR library */}
              {cameraActive && (
                <div className={styles.arOverlay}>
                  <div className={styles.arProductPreview}>
                    <img
                      src={
                        getSortedImages(
                          selectedColorVariant?.images || product.images
                        )?.[0]?.url ||
                        getSortedImages(
                          selectedColorVariant?.images || product.images
                        )?.[0]?.secure_url ||
                        ""
                      }
                      alt={product.name}
                      className={styles.arProductImage}
                    />
                    <p className={styles.arProductName}>{product.name}</p>
                    <p className={styles.arProductPrice}>
                      ${currentPrice.toFixed(2)}
                    </p>
                    <p className={styles.arProductHint}>
                      Move your device to see how this product looks on you
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.arInstructions}>
              <p>
                For best results, allow camera access and use in a well-lit area
              </p>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ProductReviews productId={product._id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className={styles.relatedProducts}>
            <h2 className={styles.relatedTitle}>Related Products</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/product/${relatedProduct._id}`}
                  className={styles.relatedProductCard}
                >
                  <img
                    src={relatedProduct.colorVariants[0].images[0]?.url || ""}
                    alt={relatedProduct.name}
                    className={styles.relatedProductImage}
                  />
                  <div className={styles.relatedProductInfo}>
                    <h3 className={styles.relatedProductName}>
                      {relatedProduct.name}
                    </h3>
                    <div className={styles.relatedProductPriceContainer}>
                      <span className={styles.relatedProductPrice}>
                        ${relatedProduct.price}
                      </span>
                      <div className={styles.relatedProductRating}>
                        <Star className={styles.relatedStar} />
                        <span className={styles.relatedRatingText}>
                          {typeof relatedProduct.rating === "object"
                            ? relatedProduct.rating.average.toFixed(1)
                            : relatedProduct.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Tool */}
        {showComparison && (
          <ComparisonTool
            products={[product, ...relatedProducts]}
            onClose={() => setShowComparison(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
