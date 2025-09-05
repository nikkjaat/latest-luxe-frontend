import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
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

  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState();
  const [quantity, setQuantity] = useState(1);
  const [showComparison, setShowComparison] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 450);
    };

    // Set initial value
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(id);
        setProduct(productData.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProduct();
  }, []);

  useEffect(() => {
    const foundProduct = products.find((p) => p._id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [products, id]);

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

  const relatedProducts = products
    .filter((p) => p.category === product?.category && p._id !== id)
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

  // Ensure rating is properly formatted
  const rating =
    typeof product.rating === "object"
      ? product.rating.average
      : product.rating;
  const reviewsCount =
    typeof product.rating === "object" ? product.rating.count : product.reviews;

  const isARCompatible = [
    "accessories",
    "jewelry",
    "watches",
    "eyewear",
    "hats",
  ].includes(product.category);

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0].url,
      quantity,
    });
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
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
          <div className={styles.imageGallery}>
            <div
              className={styles.mainImageContainer}
              onMouseEnter={() => setAutoScroll(false)}
              onMouseLeave={() => setAutoScroll(true)}
            >
              <img
                src={product.images[selectedImage].url}
                alt={product.name}
                className={styles.mainImage}
              />
              {/* Image indicators */}
              {product.images.length > 1 && (
                <div className={styles.imageIndicators}>
                  {product.images.map((_, index) => (
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
                <span className={styles.currentPrice}>${product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className={styles.originalPrice}>
                      ${product.originalPrice}
                    </span>
                    <span className={styles.discountBadge}>
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className={styles.descriptionSection}>
              <h3 className={styles.descriptionTitle}>Product Description</h3>
              <p className={styles.description}>
                {product.description ||
                  "Experience luxury and sophistication with this premium product. Crafted with the finest materials and attention to detail, this item represents the perfect blend of style and functionality."}
              </p>
            </div>

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

            {/* Features */}
            <div className={styles.featuresSection}>
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
