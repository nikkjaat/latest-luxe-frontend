import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductReviews from "../components/ProductReviews";
import ComparisonTool from "../components/ComparisonTool";
import styles from "./ProductDetailPage.module.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, getProduct } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState();
  const [selectedColorVariant, setSelectedColorVariant] = useState(null);
  const [selectedSizeVariant, setSelectedSizeVariant] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(product?.price || 0);
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
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(id);
        setProduct(productData.product);

        // Set initial color and size variants
        if (
          productData.product.colorVariants &&
          productData.product.colorVariants.length > 0
        ) {
          const firstColorVariant = productData.product.colorVariants[0];
          setSelectedColorVariant(firstColorVariant);
          setSelectedColor(firstColorVariant.colorName);

          // Set initial images based on first color variant
          if (firstColorVariant.images && firstColorVariant.images.length > 0) {
            setSelectedImage(0);
          }

          // Set initial size variant
          if (
            firstColorVariant.sizeVariants &&
            firstColorVariant.sizeVariants.length > 0
          ) {
            const firstSizeVariant = firstColorVariant.sizeVariants[0];
            setSelectedSizeVariant(firstSizeVariant);
            setSelectedSize(
              firstSizeVariant.size || firstSizeVariant.customSize
            );

            // Calculate initial price with size adjustment
            const adjustedPrice =
              productData.product.price +
              (firstSizeVariant.priceAdjustment || 0);
            setCurrentPrice(adjustedPrice);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product || !selectedColor) return;

    // Find the selected color variant
    const colorVariant = product.colorVariants.find(
      (variant) => variant.colorName === selectedColor
    );

    if (colorVariant) {
      setSelectedColorVariant(colorVariant);

      // Reset selected image to first image of the new color
      setSelectedImage(0);

      // Update size variants for the selected color
      if (colorVariant.sizeVariants && colorVariant.sizeVariants.length > 0) {
        const firstSizeVariant = colorVariant.sizeVariants[0];
        setSelectedSizeVariant(firstSizeVariant);
        setSelectedSize(firstSizeVariant.size || firstSizeVariant.customSize);

        // Update price with size adjustment
        const adjustedPrice =
          product.price + (firstSizeVariant.priceAdjustment || 0);
        setCurrentPrice(adjustedPrice);
      }
    }
  }, [selectedColor, product]);

  useEffect(() => {
    if (!product || !selectedSizeVariant || !selectedColorVariant) return;

    // Find the selected size variant within the current color variant
    const sizeVariant = selectedColorVariant.sizeVariants.find(
      (variant) =>
        variant.size === selectedSize || variant.customSize === selectedSize
    );

    if (sizeVariant) {
      setSelectedSizeVariant(sizeVariant);

      // Update price with size adjustment
      const adjustedPrice = product.price + (sizeVariant.priceAdjustment || 0);
      setCurrentPrice(adjustedPrice);
    }
  }, [selectedSize, selectedColorVariant, product]);

  useEffect(() => {
    const foundProduct = products.find((p) => p._id === id);
    if (foundProduct) {
      setProduct(foundProduct);

      if (foundProduct.specifications) {
        const { color, size } = foundProduct.specifications;
        if (color && color.length > 0 && !selectedColor) {
          setSelectedColor(color[0]);
        }
        if (size && size.length > 0 && !selectedSize) {
          setSelectedSize(size[0]);
        }
      }
    }
  }, [products, id, selectedColor, selectedSize]);

  // Handle sticky behavior
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

  // Validate selection before adding to cart
  const validateSelection = () => {
    setSelectionError("");

    if (hasColors && !selectedColor) {
      setSelectionError("Please select a color");
      return false;
    }

    if (hasSizes && !selectedSize) {
      setSelectionError("Please select a size");
      return false;
    }

    return true;
  };

  // Start/stop camera when AR mode is toggled
  useEffect(() => {
    if (showAR && cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
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
      console.error("Error accessing camera:", err);
      setCameraError("Unable to access camera. Please check permissions.");
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

  const toggleCamera = () => {
    if (cameraActive) {
      setCameraActive(false);
      stopCamera();
    } else {
      setCameraActive(true);
    }
  };

  const handleARButtonClick = () => {
    if (!showAR) {
      setShowAR(true);
      setCameraActive(true);
    } else {
      setShowAR(false);
      setCameraActive(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const relatedProducts = products
    .filter((p) => p?.category === product?.category && p?._id !== id)
    .slice(0, 4);

  // Auto-scroll images effect
  useEffect(() => {
    if (!product?.images || product.images.length <= 1 || !autoScroll) return;

    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [product?.images, autoScroll]);

  if (!product) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <h2 className={styles.notFoundTitle}>Product not found</h2>
          <Link to="/shop" className={styles.notFoundLink}>
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  // Check if product has colors and sizes
  const hasColors =
    product?.specifications?.color && product.specifications.color.length > 0;
  const hasSizes =
    product?.specifications?.size && product.specifications.size.length > 0;

  // Ensure rating is properly formatted
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
  ].includes(product?.category);

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    addToCart({
      id: product._id,
      name: product.name,
      price: currentPrice, // Use the adjusted price
      image: selectedColorVariant?.images[0]?.url || product.images[0].url,
      quantity,
      color: selectedColor,
      size: selectedSize,
      colorVariant: selectedColorVariant,
      sizeVariant: selectedSizeVariant,
    });
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    addToCart({
      id: product._id,
      name: product.name,
      price: currentPrice, // Use the adjusted price
      image: selectedColorVariant?.images[0]?.url || product.images[0].url,
      quantity,
      color: selectedColor,
      size: selectedSize,
      colorVariant: selectedColorVariant,
      sizeVariant: selectedSizeVariant,
    });
    navigate("/cart");
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  // Helper function to get icon based on specification category
  const getSpecIcon = (key) => {
    const iconMap = {
      size: <Ruler size={18} />,
      color: <Palette size={18} />,
      material: <Scissors size={18} />,
      warranty: <Shield size={18} />,
      connectivity: <Cpu size={18} />,
      skinType: <Droplets size={18} />,
      roomType: <Home size={18} />,
      closure: <Watch size={18} />,
      sportCategory: <Dumbbell size={18} />,
      ageGroup: <Baby size={18} />,
    };

    return iconMap[key] || <Check size={18} />;
  };

  // Check if specifications exist and have values
  const hasSpecifications =
    product?.specifications &&
    Object.keys(product.specifications).some((key) => {
      const value = product.specifications[key];
      return (
        value !== undefined &&
        value !== null &&
        !(typeof value === "object" && Object.keys(value).length === 0) &&
        !(Array.isArray(value) && value.length === 0) &&
        value !== ""
      );
    });

  // Render specification items
  const renderSpecifications = () => {
    if (!hasSpecifications) return null;

    return Object.entries(product?.specifications || {}).map(([key, value]) => {
      // Skip empty values
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "object" && Object.keys(value).length === 0) ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return null;
      }

      // Format the key for display
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

      // Render different value types appropriately
      const renderValue = () => {
        if (Array.isArray(value)) {
          return value.join(", ");
        } else if (typeof value === "object") {
          if (key === "dimensions") {
            return `${value.length || 0}"L x ${value.width || 0}"W x ${
              value.height || 0
            }"H`;
          }
          return JSON.stringify(value);
        } else if (typeof value === "boolean") {
          return value ? "Yes" : "No";
        }
        return value;
      };

      return (
        <div key={key} className={styles.specItem}>
          <div className={styles.specIcon}>{getSpecIcon(key)}</div>
          <div className={styles.specContent}>
            <span className={styles.specLabel}>{formattedKey}</span>
            <span className={styles.specValue}>{renderValue()}</span>
          </div>
        </div>
      );
    });
  };

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
              {selectedColorVariant &&
              selectedColorVariant.images.length > 0 ? (
                <img
                  src={selectedColorVariant.images[selectedImage].url}
                  alt={product.name}
                  className={styles.mainImage}
                />
              ) : (
                <img
                  src={product.colorVariants[0].images[selectedImage].url}
                  alt={product.name}
                  className={styles.mainImage}
                />
              )}
              {/* Image indicators */}
              {product.colorVariants[0].images.length > 1 && (
                <div className={styles.imageIndicators}>
                  {product.colorVariants[0].images.map((_, index) => (
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
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail images */}
            {selectedColorVariant && selectedColorVariant.images.length > 1 && (
              <div className={styles.thumbnailContainer}>
                {selectedColorVariant.images.map((image, index) => (
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
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className={styles.thumbnailImage}
                    />
                  </button>
                ))}
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

            {/* Color Selection */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className={styles.selectionSection}>
                <h3 className={styles.selectionTitle}>Color</h3>
                <div className={styles.colorOptions}>
                  {product.colorVariants.map((variant) => (
                    <button
                      key={variant.colorName}
                      className={
                        selectedColor === variant.colorName
                          ? `${styles.colorOption} ${styles.colorOptionSelected}`
                          : styles.colorOption
                      }
                      onClick={() => setSelectedColor(variant.colorName)}
                      aria-label={`Select color: ${variant.colorName}`}
                      style={{ backgroundColor: variant.colorCode || "#ccc" }}
                      title={variant.colorName}
                    >
                      {selectedColor === variant.colorName && (
                        <Check className={styles.checkIcon} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {selectedColorVariant &&
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
            {hasSpecifications && (
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
                    See how this {product.category} looks on you using augmented
                    reality
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
                  onClick={handleAddToCart}
                  className={styles.addToCartButton}
                >
                  <ShoppingCart className={styles.cartIcon} />
                  {!isSmallScreen && (
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
                      src={product.images[0].url}
                      alt={product.name}
                      className={styles.arProductImage}
                    />
                    <p className={styles.arProductName}>{product.name}</p>
                    <p className={styles.arProductPrice}>${product.price}</p>
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
                    src={relatedProduct.images[0].url}
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
