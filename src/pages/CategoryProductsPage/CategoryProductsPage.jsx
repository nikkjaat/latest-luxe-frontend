import React, { useState, useEffect, useMemo } from "react";
import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Loader,
  X,
  Eye,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import styles from "./CategoryProductsPage.module.css";
import { useProducts } from "../../context/ProductContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { Zap } from "lucide-react";
import { useCategory } from "../../context/CategoryContext";

// Product Image Slider Component (keep the same as before)
const ProductImageSlider = ({
  product,
  name,
  badge,
  onWishlistToggle,
  isInWishlist,
  onQuickView,
}) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Get current variant and its images
  const currentVariant = product.colorVariants?.[selectedVariantIndex];
  const images = currentVariant?.images || product.images || [];

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

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle();
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView();
  };

  if (!images || images.length === 0) {
    return (
      <div className={styles.imageContainer}>
        <img
          src="https://via.placeholder.com/300"
          alt={name}
          className={styles.productImage}
        />
      </div>
    );
  }

  return (
    <div
      className={styles.imageContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.imageWrapper}>
        <img
          src={images[currentImageIndex]?.url || images[currentImageIndex]}
          alt={name}
          className={`${styles.productImage} ${
            isTransitioning ? styles.fadeOut : styles.fadeIn
          }`}
        />

        {/* Badge */}
        {badge && <div className={styles.badge}>{badge}</div>}

        {/* Wishlist Button */}
        <button
          className={`${styles.wishlistButton} ${
            isInWishlist ? styles.inWishlist : ""
          }`}
          onClick={handleWishlistClick}
          title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={styles.wishlistIcon} />
        </button>

        {/* Quick View Button */}
        <button
          className={styles.quickViewButton}
          onClick={handleQuickViewClick}
          title="Quick View"
        >
          <Eye className={styles.quickViewIcon} />
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

const CategoryProductsPage = () => {
  const location = useLocation();
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, loading: productsLoading, getProducts } = useProducts();
  const { categories: contextCategories } = useCategory();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const {
    addToCart,
    removeFromCart,
    items: cartItems,
    updateQuantity,
  } = useCart();
  const { keyword, filterCategory, name, itemCount } = location.state || {};
  const [loadingItems, setLoadingItems] = useState({});

  // State management
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quantities, setQuantities] = useState({});
  const itemsPerPage = 12;

  useEffect(() => {
    getProducts();
  }, []);

  // Get current category from context categories
  const currentCategory = useMemo(() => {
    if (!categoryId) return null;

    // Find category by slug or ID
    const foundCategory = contextCategories.find(
      (cat) => cat.slug === categoryId || cat._id === categoryId
    );

    return foundCategory;
  }, [categoryId, contextCategories]);

  // Get all subcategories recursively for the current category
  const allSubcategories = useMemo(() => {
    if (!currentCategory) return [];

    const subcategories = [];

    const getHierarchyLevelFromNumber = (level) => {
      const hierarchyMap = {
        1: "main",
        2: "subcategory",
        3: "type",
        4: "variant",
        5: "style",
      };
      return hierarchyMap[level] || "main";
    };

    const collectSubcategories = (category, level = 2) => {
      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach((subCat) => {
          subcategories.push({
            _id: subCat._id,
            name: subCat.name,
            slug: subCat.slug,
            level: level,
            hierarchyLevel: getHierarchyLevelFromNumber(level),
          });
          // Recursively collect deeper subcategories
          collectSubcategories(subCat, level + 1);
        });
      }
    };

    collectSubcategories(currentCategory);
    return subcategories;
  }, [currentCategory]);

  // Filter products for current category (including nested subcategories)
  const categoryProducts = useMemo(() => {
    if (!currentCategory || products.length === 0) return [];

    // Get all category IDs to include (main category + all nested subcategories)
    const categoryIdsToInclude = [currentCategory._id];

    const collectCategoryIds = (categories) => {
      if (!categories || categories.length === 0) return;

      categories.forEach((cat) => {
        categoryIdsToInclude.push(cat._id);
        if (cat.subcategories && cat.subcategories.length > 0) {
          collectCategoryIds(cat.subcategories);
        }
      });
    };

    // Filter products that belong to any of these categories
    const filteredProducts = products.filter((product) => {
      const productCategory = product.category?.main;
      if (!productCategory) return false;

      // Handle both string and object category formats
      if (typeof productCategory === "string") {
        // Check if product category string matches current category slug
        return (
          productCategory.toLowerCase() === currentCategory.slug.toLowerCase()
        );
      } else if (typeof productCategory === "object") {
        // Check if product category ID matches current category or any subcategory
        return (
          categoryIdsToInclude.includes(productCategory._id) ||
          productCategory.slug === currentCategory.slug
        );
      }
      return false;
    });

    return filteredProducts;
  }, [products, currentCategory]);

  // Apply filters and search
  const filteredProducts = useMemo(() => {
    let filtered = [...categoryProducts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Price range filter
    if (priceRange.min !== "" || priceRange.max !== "") {
      filtered = filtered.filter((product) => {
        const price = product.price || 0;
        const min = priceRange.min === "" ? 0 : parseFloat(priceRange.min);
        const max =
          priceRange.max === "" ? Infinity : parseFloat(priceRange.max);
        return price >= min && price <= max;
      });
    }

    // Subcategory filter
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedSubcategories.some((subcatId) => {
          const productCategory = product.category?.main;
          if (typeof productCategory === "object") {
            return productCategory._id === subcatId;
          }
          return false;
        })
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "date":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case "name":
        default:
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
      }

      if (sortOrder === "desc") {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [
    categoryProducts,
    searchTerm,
    priceRange,
    selectedSubcategories,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems?.some(
      (item) => item.productId?._id === productId || item.id === productId
    );
  };

  // Get cart quantity
  const getCartQuantity = (productId) => {
    const cartItem = cartItems?.find(
      (item) => item.productId?._id === productId || item.id === productId
    );
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image,
      quantity: 1,
    });
  };

  // Handle buy now
  const handleBuyNow = (product) => {
    addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image,
      quantity: 1,
    });
    navigate("/cart");
  };

  useEffect(() => {
    setLoadingItems({});
  }, [cartItems]);

  // Handle remove from cart
  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
  };

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    setLoadingItems((prev) => ({ ...prev, [productId]: true }));
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (product) => {
    const productId = product._id || product.id;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  // Handle product quick view
  const handleQuickView = (product) => {
    navigate(`/product/${product._id || product.id}`);
  };

  // Handle subcategory filter
  const handleSubcategoryToggle = (subcategoryId) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((item) => item !== subcategoryId)
        : [...prev, subcategoryId]
    );
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setSelectedSubcategories([]);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (productsLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <Loader className={styles.spinner} />
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <h2>Category not found</h2>
            <p>The requested category could not be found.</p>
            <Link to="/categories" className={styles.backButton}>
              <ArrowLeft className={styles.backIcon} />
              Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <Link to="/categories" className={styles.backButton}>
              <ArrowLeft className={styles.backIcon} />
              Back to Categories
            </Link>
          </div>

          <div className={styles.headerContent}>
            <h1 className={styles.title}>{currentCategory.name}</h1>
            <p className={styles.categoryDescription}>
              {currentCategory.description ||
                `Explore our ${currentCategory.name} collection`}
            </p>
            <p className={styles.description}>
              {filteredProducts.length} products found
            </p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className={styles.controlsCard}>
          <div className={styles.searchRow}>
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
                className={`${styles.filterToggle} ${
                  showFilters ? styles.active : ""
                }`}
              >
                <SlidersHorizontal className={styles.filterIcon} />
                Filters
                {(selectedSubcategories.length > 0 ||
                  priceRange.min ||
                  priceRange.max) && (
                  <span className={styles.filterBadge}>
                    {selectedSubcategories.length +
                      (priceRange.min || priceRange.max ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className={styles.sortWrapper}>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split("-");
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className={styles.sortSelect}
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low to High</option>
                  <option value="price-desc">Price High to Low</option>
                  <option value="rating-desc">Rating High to Low</option>
                  <option value="date-desc">Newest First</option>
                </select>
              </div>

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

          {/* Filters Panel */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filtersHeader}>
                <h3>Filters</h3>
                <button onClick={clearFilters} className={styles.clearFilters}>
                  Clear All
                </button>
              </div>

              <div className={styles.filtersContent}>
                {/* Price Range */}
                <div className={styles.filterGroup}>
                  <h4>Price Range</h4>
                  <div className={styles.priceInputs}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }))
                      }
                      className={styles.priceInput}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }))
                      }
                      className={styles.priceInput}
                    />
                  </div>
                </div>

                {/* Subcategories */}
                {allSubcategories.length > 0 && (
                  <div className={styles.filterGroup}>
                    <h4>Subcategories</h4>
                    <div className={styles.subcategoryFilters}>
                      {allSubcategories.map((subcategory) => (
                        <label
                          key={subcategory._id}
                          className={styles.checkboxLabel}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubcategories.includes(
                              subcategory._id
                            )}
                            onChange={() =>
                              handleSubcategoryToggle(subcategory._id)
                            }
                            className={styles.checkbox}
                          />
                          {subcategory.name}
                          <span className={styles.subcategoryLevel}>
                            ({subcategory.hierarchyLevel})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(selectedSubcategories.length > 0 ||
          priceRange.min ||
          priceRange.max ||
          searchTerm) && (
          <div className={styles.activeFilters}>
            {searchTerm && (
              <span className={styles.filterTag}>
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm("")}>
                  <X className={styles.removeIcon} />
                </button>
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className={styles.filterTag}>
                Price: ${priceRange.min || "0"} - ${priceRange.max || "∞"}
                <button onClick={() => setPriceRange({ min: "", max: "" })}>
                  <X className={styles.removeIcon} />
                </button>
              </span>
            )}
            {selectedSubcategories.map((subcatId) => {
              const subcategory = allSubcategories.find(
                (sub) => sub._id === subcatId
              );
              return subcategory ? (
                <span key={subcatId} className={styles.filterTag}>
                  {subcategory.name}
                  <button onClick={() => handleSubcategoryToggle(subcatId)}>
                    <X className={styles.removeIcon} />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className={styles.productsGrid}>
                {paginatedProducts.map((product) => {
                  const productId = product._id || product.id;
                  const inCart = isInCart(productId);
                  const cartQuantity = getCartQuantity(productId);
                  const isLoading = loadingItems[productId];

                  return (
                    <div key={productId} className={styles.productCard}>
                      <Link
                        to={`/product/${productId}`}
                        className={styles.productLink}
                      >
                        <ProductImageSlider
                          product={product}
                          name={product.name}
                          badge={product.badge}
                          onWishlistToggle={() => handleWishlistToggle(product)}
                          isInWishlist={isInWishlist(productId)}
                          onQuickView={() => handleQuickView(product)}
                        />
                      </Link>

                      <div className={styles.productInfo}>
                        <Link
                          to={`/product/${productId}`}
                          className={styles.productLink}
                        >
                          <h3 className={styles.productName}>{product.name}</h3>
                          <p className={styles.productDescription}>
                            {product.description?.slice(0, 80)}
                            {product.description?.length > 80 ? "..." : ""}
                          </p>
                        </Link>

                        <div className={styles.productMeta}>
                          {product.rating && (
                            <div className={styles.rating}>
                              <Star className={styles.starIcon} />
                              <span>
                                {typeof product.rating === "number"
                                  ? product.rating.toFixed(1)
                                  : "0.0"}
                              </span>
                              {product.reviewCount && (
                                <span className={styles.reviewCount}>
                                  ({product.reviewCount})
                                </span>
                              )}
                            </div>
                          )}

                          <div className={styles.price}>
                            {product.originalPrice &&
                              product.originalPrice > product.price && (
                                <span className={styles.originalPrice}>
                                  ${product.originalPrice}
                                </span>
                              )}
                            <span className={styles.currentPrice}>
                              ${product.price}
                            </span>
                            {product.colorVariants &&
                              product.colorVariants.length > 1 && (
                                <span className={styles.colorVariantCount}>
                                  {product.colorVariants.length} colors
                                </span>
                              )}
                          </div>
                        </div>

                        {/* Add your cart buttons back here if needed */}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.productsList}>
                {paginatedProducts.map((product) => {
                  const productId = product._id || product.id;
                  const inCart = isInCart(productId);
                  const cartQuantity = getCartQuantity(productId);
                  const isLoading = loadingItems[productId];

                  return (
                    <div key={productId} className={styles.productListItem}>
                      <Link
                        to={`/product/${productId}`}
                        className={styles.listImageLink}
                      >
                        <div className={styles.productListImage}>
                          <ProductImageSlider
                            product={product}
                            name={product.name}
                            badge={product.badge}
                            onWishlistToggle={() =>
                              handleWishlistToggle(product)
                            }
                            isInWishlist={isInWishlist(productId)}
                            onQuickView={() => handleQuickView(product)}
                          />
                        </div>
                      </Link>

                      <div className={styles.productListInfo}>
                        <Link
                          to={`/product/${productId}`}
                          className={styles.productLink}
                        >
                          <h3 className={styles.productListName}>
                            {product.name}
                          </h3>
                          <p className={styles.productListDescription}>
                            {product.description}
                          </p>
                        </Link>

                        <div className={styles.productListMeta}>
                          {product.rating && (
                            <div className={styles.rating}>
                              <Star className={styles.starIcon} />
                              <span>
                                {typeof product.rating === "number"
                                  ? product.rating.toFixed(1)
                                  : "0.0"}
                              </span>
                              {product.reviewCount && (
                                <span className={styles.reviewCount}>
                                  ({product.reviewCount})
                                </span>
                              )}
                            </div>
                          )}

                          <div className={styles.price}>
                            {product.originalPrice &&
                              product.originalPrice > product.price && (
                                <span className={styles.originalPrice}>
                                  ${product.originalPrice}
                                </span>
                              )}
                            <span className={styles.currentPrice}>
                              ${product.price}
                            </span>
                            {product.colorVariants &&
                              product.colorVariants.length > 1 && (
                                <div className={styles.colorVariantInfo}>
                                  {product.colorVariants.length} color variants
                                </div>
                              )}
                          </div>
                        </div>

                        {product.tags && (
                          <div className={styles.productTags}>
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>

                <div className={styles.paginationNumbers}>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`${styles.paginationNumber} ${
                          currentPage === pageNumber ? styles.active : ""
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Search className={styles.emptyIconSvg} />
            </div>
            <h3 className={styles.emptyTitle}>No products found</h3>
            <p className={styles.emptyDescription}>
              {searchTerm ||
              selectedSubcategories.length > 0 ||
              priceRange.min ||
              priceRange.max
                ? "Try adjusting your filters to find more products."
                : "This category doesn't have any products yet."}
            </p>
            {(searchTerm ||
              selectedSubcategories.length > 0 ||
              priceRange.min ||
              priceRange.max) && (
              <button
                onClick={clearFilters}
                className={styles.clearFiltersButton}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
