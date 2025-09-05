import React, { useEffect, useState } from "react";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProducts } from "../../context/ProductContext";
import styles from "./FeaturedProducts.module.css";

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const { items, addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlist();
  const { products, getProducts } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products first
        await getProducts();
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filter and limit to top 8 featured products
  useEffect(() => {
    if (products.length > 0) {
      // Sort products by rating, popularity, or any other criteria
      const sortedProducts = [...products]
        .sort((a, b) => {
          // Sort by rating (highest first)
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          // If ratings are equal, sort by number of reviews
          return b.reviews - a.reviews;
        })
        .slice(0, 8); // Take only top 8 products

      setFeaturedProducts(sortedProducts);
    }
  }, [products]);

  const handleAddToCart = (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0].url,
    });
  };

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const ProductImageSlider = ({ images, name, badge }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
      if (images.length <= 1) return;

      let progressInterval;
      let imageInterval;

      if (!isPaused) {
        // Progress bar animation
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              return 0;
            }
            return prev + 100 / 30; // 30 steps for 3 seconds (100ms intervals)
          });
        }, 100);

        // Image change every 3 seconds
        imageInterval = setInterval(() => {
          setIsTransitioning(true);

          setTimeout(() => {
            setCurrentImageIndex(
              (prevIndex) => (prevIndex + 1) % images.length
            );
            setProgress(0);
            setIsTransitioning(false);
          }, 300); // 300ms fade transition
        }, 3000);
      }

      return () => {
        clearInterval(progressInterval);
        clearInterval(imageInterval);
      };
    }, [images.length, isPaused]);

    const handleMouseEnter = () => {
      setIsPaused(true);
    };

    const handleMouseLeave = () => {
      setIsPaused(false);
      // Reset progress when resuming
      setProgress(0);
    };

    if (!images || images.length === 0) {
      return <div className={styles.imageContainer}></div>;
    }

    return (
      <div className={styles.imageContainer}>
        <div
          className={styles.imageWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={images[currentImageIndex].url}
            alt={name}
            className={`${styles.productImage} ${
              isTransitioning ? styles.fadeOut : styles.fadeIn
            }`}
          />
          {badge && <div className={styles.badge}>{badge}</div>}
        </div>

        {/* Progress Bar - only show if there are multiple images */}
        {images.length > 1 && (
          <div className={styles.progressContainer}>
            <div
              className={`${styles.progressBar} ${
                isPaused ? styles.paused : ""
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className={styles.indicators}>
            {images.map((_, index) => (
              <div
                key={index}
                className={`${styles.indicator} ${
                  index === currentImageIndex ? styles.active : ""
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Featured Products</h2>
          <p className={styles.description}>
            Discover our handpicked selection of premium products that embody
            luxury and sophistication
          </p>
        </div>

        {featuredProducts.length === 0 ? (
          <div className={styles.loadingState}>
            <p>Loading featured products...</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {featuredProducts.map((product) => {
              const isWishlisted = isInWishlist(product._id);

              return (
                <div key={product._id} className={styles.productCard}>
                  <Link to={`/product/${product._id}`}>
                    <ProductImageSlider
                      images={product.images}
                      name={product.name}
                      badge={product.badge}
                    />
                  </Link>
                  <button
                    onClick={() => handleWishlistToggle(product)}
                    className={`${styles.wishlistButton} ${
                      isWishlisted ? styles.active : styles.inactive
                    }`}
                  >
                    <Heart
                      className={`${styles.wishlistIcon} ${
                        isWishlisted ? styles.filled : ""
                      }`}
                      fill={isWishlisted ? "currentColor" : "none"}
                    />
                  </button>

                  <div className={styles.content}>
                    <div className={styles.rating}>
                      <div className={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`${styles.star} ${
                              i < Math.floor(product.rating)
                                ? styles.filled
                                : styles.empty
                            }`}
                          />
                        ))}
                      </div>
                      <span className={styles.reviewCount}>
                        ({product.reviews})
                      </span>
                    </div>

                    <Link to={`/product/${product._id}`}>
                      <h3 className={styles.productName}>{product.name}</h3>
                    </Link>

                    <div className={styles.priceContainer}>
                      <div className={styles.priceGroup}>
                        <span className={styles.price}>${product.price}</span>
                        <span className={styles.originalPrice}>
                          ${product.originalPrice}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className={styles.addToCartButton}
                    >
                      <ShoppingCart className={styles.cartIcon} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
