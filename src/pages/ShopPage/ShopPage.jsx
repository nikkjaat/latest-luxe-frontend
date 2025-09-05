import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProducts } from "../../context/ProductContext";
import styles from "./ShopPage.module.css";
import { Link } from "react-router-dom";

const ProductImageSlider = ({
  images,
  name,
  badge,
  onWishlistToggle,
  isInWishlist,
}) => {
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
          setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
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
    setProgress(0);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setProgress(0);
      setIsTransitioning(false);
    }, 300);
  };

  const goToPrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
      setProgress(0);
      setIsTransitioning(false);
    }, 300);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    onWishlistToggle();
  };

  if (!images || images.length === 0) {
    return <div className={styles.imageContainer}></div>;
  }

  return (
    <div
      className={styles.imageContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.imageWrapper}>
        <img
          src={images[currentImageIndex]?.url}
          alt={name}
          className={`${styles.productImage} ${
            isTransitioning ? styles.fadeOut : styles.fadeIn
          }`}
        />

        {/* Badge */}
        {badge && <div className={styles.badge}>{badge}</div>}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`${styles.wishlistButton} ${
            isInWishlist ? styles.active : styles.inactive
          }`}
        >
          <Heart
            className={`${styles.wishlistIcon} ${
              isInWishlist ? styles.filled : ""
            }`}
          />
        </button>
      </div>

      {/* Progress Bar - only show if there are multiple images */}
      {images.length > 1 && (
        <div className={styles.progressContainer}>
          <div
            className={`${styles.progressBar} ${isPaused ? styles.paused : ""}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className={styles.imageIndicators}>
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

const ShopPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { getProducts, products } = useProducts();

  const getNextHundred = (price) => {
    return Math.ceil(price / 100) * 100;
  };

  const setDynamicPriceRange = (productList) => {
    if (productList.length === 0) return;

    const prices = productList.map((product) => product.price);
    const maxProductPrice = Math.max(...prices);
    const dynamicMaxPrice = getNextHundred(maxProductPrice);

    setMaxPrice(dynamicMaxPrice);
    setPriceRange([0, dynamicMaxPrice]);
  };

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setDynamicPriceRange(products);
    }
  }, [products]);

  const categories = [
    { id: "all", name: "All Products" },
    { id: "women", name: "Women's Fashion" },
    { id: "men", name: "Men's Collection" },
    { id: "accessories", name: "Accessories" },
    { id: "home", name: "Home & Living" },
    { id: "electronics", name: "Electronics" },
    { id: "beauty", name: "Beauty & Care" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const handleAddToCart = (product, e) => {
    e?.stopPropagation(); // Prevent navigation if called from list view
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
    });
  };

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Shop All Products</h1>
          <p className={styles.description}>
            Discover our complete collection of premium products curated for
            luxury and style
          </p>
        </div>

        <div className={styles.layout}>
          {/* Sidebar Filters */}
          <div
            className={`${styles.sidebar} ${showFilters ? styles.visible : ""}`}
          >
            <div className={styles.filtersCard}>
              <h3 className={styles.filtersTitle}>Filters</h3>

              {/* Categories */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterSectionTitle}>Categories</h4>
                <div className={styles.categoryList}>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`${styles.categoryButton} ${
                        selectedCategory === category.id
                          ? styles.active
                          : styles.inactive
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterSectionTitle}>Price Range</h4>
                <div className={styles.priceSection}>
                  <div className={styles.priceRange}>
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className={styles.priceSlider}
                  />
                  <div className={styles.priceInputs}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          parseInt(e.target.value) || 0,
                          priceRange[1],
                        ])
                      }
                      className={styles.priceInput}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          parseInt(e.target.value) || maxPrice,
                        ])
                      }
                      className={styles.priceInput}
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterSectionTitle}>Rating</h4>
                <div className={styles.ratingList}>
                  {[4, 3, 2, 1].map((rating) => (
                    <button key={rating} className={styles.ratingButton}>
                      <div className={styles.ratingStars}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`${styles.ratingStar} ${
                              i < rating ? styles.filled : styles.empty
                            }`}
                          />
                        ))}
                      </div>
                      & up
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Search and Controls */}
            <div className={styles.controlsCard}>
              <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.controlsRight}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={styles.filtersToggle}
                  >
                    <SlidersHorizontal className={styles.filtersIcon} />
                    Filters
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={styles.sortSelect}
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>

                  <div className={styles.viewToggle}>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`${styles.viewButton} ${
                        viewMode === "grid" ? styles.active : styles.inactive
                      }`}
                    >
                      <Grid className={styles.viewIcon} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`${styles.viewButton} ${
                        viewMode === "list" ? styles.active : styles.inactive
                      }`}
                    >
                      <List className={styles.viewIcon} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className={styles.resultsCount}>
              <p className={styles.resultsText}>
                Showing {sortedProducts.length} of {products.length} products
              </p>
            </div>

            {/* Products Grid/List */}
            {viewMode === "grid" ? (
              <div className={styles.productsGrid}>
                {sortedProducts.map((product) => (
                  <div key={product._id} className={styles.productCard}>
                    <Link to={`/product/${product._id}`} className={styles.productLink}>
                      <ProductImageSlider
                        images={product.images}
                        name={product.name}
                        badge={product.badge}
                        onWishlistToggle={() => handleWishlistToggle(product)}
                        isInWishlist={isInWishlist(product._id)}
                      />
                    </Link>

                    <div className={styles.productContent}>
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

                      <Link to={`/product/${product._id}`} className={styles.productLink}>
                        <h3 className={styles.productName}>{product.name}</h3>
                      </Link>

                      <div className={styles.priceContainer}>
                        <div className={styles.priceGroup}>
                          <span className={styles.price}>${product.price}</span>
                          {product.originalPrice && (
                            <span className={styles.originalPrice}>
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className={styles.addToCartButton}
                      >
                        <ShoppingCart className={styles.cartIcon} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.productsList}>
                {sortedProducts.map((product) => (
                  <div key={product._id} className={styles.listCard}>
                    <div className={styles.listContent}>
                      <Link to={`/product/${product._id}`} className={styles.listImageLink}>
                        <div className={styles.listImageContainer}>
                          <ProductImageSlider
                            images={product.images}
                            name={product.name}
                            badge={product.badge}
                            onWishlistToggle={() => handleWishlistToggle(product)}
                            isInWishlist={isInWishlist(product._id)}
                          />
                        </div>
                      </Link>

                      <div className={styles.listInfo}>
                        <Link to={`/product/${product._id}`} className={styles.productLink}>
                          <div className={styles.listRating}>
                            <div className={styles.listStars}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`${styles.listStar} ${
                                    i < Math.floor(product.rating)
                                      ? styles.filled
                                      : styles.empty
                                  }`}
                                />
                              ))}
                            </div>
                            <span className={styles.listReviewCount}>
                              ({product.reviews} reviews)
                            </span>
                          </div>
                          <h3 className={styles.listProductName}>
                            {product.name}
                          </h3>
                        </Link>
                        <div className={styles.listPriceGroup}>
                          <span className={styles.listPrice}>
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className={styles.listOriginalPrice}>
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.listActions}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className={styles.listAddToCartButton}
                        >
                          <ShoppingCart className={styles.listCartIcon} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sortedProducts.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Search className={styles.emptyIconSvg} />
                </div>
                <h3 className={styles.emptyTitle}>No products found</h3>
                <p className={styles.emptyDescription}>
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;