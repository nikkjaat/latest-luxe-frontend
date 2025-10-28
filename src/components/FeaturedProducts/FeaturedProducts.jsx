import React, { useEffect, useState } from "react";
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Minus,
  Plus,
  Loader,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProducts } from "../../context/ProductContext";
import styles from "./FeaturedProducts.module.css";

const FeaturedProducts = () => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const { items, addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlist();
  const { products, getProducts } = useProducts();
  const {
    addToCart,
    removeFromCart,
    items: cartItems,
    updateQuantity,
  } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingItems, setLoadingItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await getProducts();
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, [products]);

  // Reset loading state when cart items change
  useEffect(() => {
    setLoadingItems({});
  }, [cartItems]);

  const isInCart = (productId) => {
    return cartItems?.some(
      (item) => item.productId?._id === productId || item.id === productId
    );
  };

  const getCartQuantity = (productId) => {
    const cartItem = cartItems?.find(
      (item) => item.productId?._id === productId || item.id === productId
    );
    return cartItem ? cartItem.quantity : 0;
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    setLoadingItems((prev) => ({ ...prev, [productId]: true }));
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setLoadingItems((prev) => ({ ...prev, [productId]: true }));
    await updateQuantity(productId, newQuantity);
    // Loading state will be reset automatically by the useEffect above
  };

  // Filter and limit to top 8 featured products
  useEffect(() => {
    if (products.length > 0) {
      const sortedProducts = [...products]
        .sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return b.reviews - a.reviews;
        })
        .slice(0, 8);

      setFeaturedProducts(sortedProducts);
    }
  }, [products]);

  const handleAddToCart = async (product) => {
    const productId = product._id || product.id;
    setLoadingItems((prev) => ({ ...prev, [productId]: true }));

    await addToCart({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.colorVariants[0].images[0].url,
    });
  };

  const handleBuyNow = async (product) => {
    const productId = product._id || product.id;
    setLoadingItems((prev) => ({ ...prev, [productId]: true }));

    // await addToCart({
    //   id: productId,
    //   name: product.name,
    //   price: product.price,
    //   image: product.colorVariants[0].images[0].url,
    // });
    navigate("/checkout");
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
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              return 0;
            }
            return prev + 100 / 30;
          });
        }, 100);

        imageInterval = setInterval(() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentImageIndex(
              (prevIndex) => (prevIndex + 1) % images.length
            );
            setProgress(0);
            setIsTransitioning(false);
          }, 300);
        }, 3000);
      }

      return () => {
        clearInterval(progressInterval);
        clearInterval(imageInterval);
      };
    }, [images.length, isPaused]);

    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => {
      setIsPaused(false);
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

        {images.length > 1 && (
          <>
            <div className={styles.progressContainer}>
              <div
                className={`${styles.progressBar} ${
                  isPaused ? styles.paused : ""
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
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
          </>
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
              const productId = product._id || product.id;
              const isWishlisted = isInWishlist(productId);
              const inCart = isInCart(productId);
              const cartQuantity = getCartQuantity(productId);
              const isLoading = loadingItems[productId];

              return (
                <div key={productId} className={styles.productCard}>
                  <Link to={`/product/${productId}`}>
                    <ProductImageSlider
                      images={product.colorVariants[0].images || []}
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

                    <Link to={`/product/${productId}`}>
                      <h3 className={styles.productName}>{product.name}</h3>
                    </Link>

                    <div className={styles.priceContainer}>
                      <div className={styles.priceGroup}>
                        <span className={styles.price}>₹{product.price}</span>
                        {product.originalPrice && (
                          <span className={styles.originalPrice}>
                            ₹{product.originalPrice}
                          </span>
                        )}
                        {product.colorVariants &&
                          product.colorVariants.length > 1 && (
                            <span className={styles.colorCount}>
                              {product.colorVariants.length} colors
                            </span>
                          )}
                      </div>
                    </div>
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
