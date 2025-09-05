import React, { useState, useEffect, useMemo } from "react";
import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
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

// Product Image Slider Component
const ProductImageSlider = ({
  images,
  name,
  badge,
  onWishlistToggle,
  isInWishlist,
  onQuickView,
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
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, loading: productsLoading, getProducts } = useProducts();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart, cartItems } = useCart();

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

  // Category definitions
  const categoryDefinitions = {
    women: {
      name: "Women's Fashion",
      description:
        "Discover the latest trends in women's clothing, from casual wear to elegant evening dresses.",
      subcategories: ["Dresses", "Tops", "Bottoms", "Outerwear", "Activewear"],
    },
    men: {
      name: "Men's Collection",
      description:
        "Premium men's fashion featuring sophisticated styles for the modern gentleman.",
      subcategories: ["Shirts", "Suits", "Casual Wear", "Accessories", "Shoes"],
    },
    accessories: {
      name: "Accessories",
      description:
        "Complete your look with our curated selection of luxury accessories.",
      subcategories: ["Jewelry", "Bags", "Watches", "Sunglasses", "Scarves"],
    },
    "home-living": {
      name: "Home & Living",
      description:
        "Transform your space with our elegant home decor and living essentials.",
      subcategories: ["Furniture", "Decor", "Lighting", "Textiles", "Kitchen"],
    },
    electronics: {
      name: "Electronics",
      description:
        "Latest technology and gadgets to enhance your digital lifestyle.",
      subcategories: [
        "Smartphones",
        "Laptops",
        "Audio",
        "Smart Home",
        "Gaming",
      ],
    },
    "beauty-care": {
      name: "Beauty & Care",
      description:
        "Premium beauty products and personal care essentials for your daily routine.",
      subcategories: [
        "Skincare",
        "Makeup",
        "Fragrance",
        "Hair Care",
        "Wellness",
      ],
    },
    "sports-fitness": {
      name: "Sports & Fitness",
      description:
        "High-performance gear and apparel for your active lifestyle.",
      subcategories: [
        "Activewear",
        "Equipment",
        "Footwear",
        "Outdoor",
        "Fitness",
      ],
    },
    "kids-baby": {
      name: "Kids & Baby",
      description:
        "Safe, comfortable, and stylish products for children of all ages.",
      subcategories: ["Baby Clothes", "Toys", "Shoes", "Accessories", "Gear"],
    },
  };

  // Get category from URL params or search params
  const currentCategoryId = categoryId || searchParams.get("category");
  const currentCategory = categoryDefinitions[currentCategoryId];

  // Initialize search term from URL
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  // Filter products for current category
  const categoryProducts = useMemo(() => {
    if (!currentCategoryId || products.length === 0) return [];

    return products.filter((product) => {
      const productCategory = product.category;
      if (!productCategory) return false;

      if (typeof productCategory === "string") {
        return (
          productCategory.toLowerCase() === currentCategoryId.toLowerCase() ||
          productCategory.toLowerCase() === currentCategory?.name.toLowerCase()
        );
      } else if (typeof productCategory === "object") {
        return (
          productCategory._id === currentCategoryId ||
          productCategory.name?.toLowerCase() ===
            currentCategory?.name.toLowerCase() ||
          productCategory.slug === currentCategoryId
        );
      }
      return false;
    });
  }, [products, currentCategoryId, currentCategory]);

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
        selectedSubcategories.some(
          (subcat) =>
            product.subcategory?.toLowerCase().includes(subcat.toLowerCase()) ||
            product.tags?.some((tag) =>
              tag.toLowerCase().includes(subcat.toLowerCase())
            )
        )
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
    return cartItems?.some((item) => item.id === productId);
  };

  // Get cart quantity
  const getCartQuantity = (productId) => {
    const cartItem = cartItems?.find((item) => item.id === productId);
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

  // Handle remove from cart
  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
  };

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      // Update quantity in cart
      const cartItem = cartItems.find((item) => item.id === productId);
      if (cartItem) {
        addToCart({ ...cartItem, quantity: newQuantity });
      }
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
  const handleSubcategoryToggle = (subcategory) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((item) => item !== subcategory)
        : [...prev, subcategory]
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
              {currentCategory.description}
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
                <div className={styles.filterGroup}>
                  <h4>Subcategories</h4>
                  <div className={styles.subcategoryFilters}>
                    {currentCategory.subcategories.map((subcategory) => (
                      <label key={subcategory} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={selectedSubcategories.includes(subcategory)}
                          onChange={() => handleSubcategoryToggle(subcategory)}
                          className={styles.checkbox}
                        />
                        {subcategory}
                      </label>
                    ))}
                  </div>
                </div>
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
            {selectedSubcategories.map((subcategory) => (
              <span key={subcategory} className={styles.filterTag}>
                {subcategory}
                <button onClick={() => handleSubcategoryToggle(subcategory)}>
                  <X className={styles.removeIcon} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Products Grid/List */}
        {paginatedProducts.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className={styles.productsGrid}>
                {paginatedProducts.map((product) => {
                  const productId = product._id || product.id;
                  const inCart = isInCart(productId);
                  const cartQuantity = getCartQuantity(productId);

                  return (
                    <div key={productId} className={styles.productCard}>
                      <Link
                        to={`/product/${productId}`}
                        className={styles.productLink}
                      >
                        <ProductImageSlider
                          images={product.images || [product.image]}
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
                          </div>
                        </div>

                        {inCart ? (
                          <div className={styles.quantityControls}>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  productId,
                                  cartQuantity - 1
                                )
                              }
                              className={styles.quantityButton}
                            >
                              <Minus className={styles.quantityIcon} />
                            </button>
                            <span className={styles.quantityDisplay}>
                              {cartQuantity} in cart
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  productId,
                                  cartQuantity + 1
                                )
                              }
                              className={styles.quantityButton}
                            >
                              <Plus className={styles.quantityIcon} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.addToCartButton}
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className={styles.cartIcon} />
                            Add to Cart
                          </button>
                        )}
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

                  return (
                    <div key={productId} className={styles.productListItem}>
                      <Link
                        to={`/product/${productId}`}
                        className={styles.listImageLink}
                      >
                        <div className={styles.productListImage}>
                          <ProductImageSlider
                            images={product.images || [product.image]}
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

                      <div className={styles.productListActions}>
                        {inCart ? (
                          <div className={styles.listQuantityControls}>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  productId,
                                  cartQuantity - 1
                                )
                              }
                              className={styles.quantityButton}
                            >
                              <Minus className={styles.quantityIcon} />
                            </button>
                            <span className={styles.quantityDisplay}>
                              {cartQuantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  productId,
                                  cartQuantity + 1
                                )
                              }
                              className={styles.quantityButton}
                            >
                              <Plus className={styles.quantityIcon} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.addToCartButton}
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className={styles.cartIcon} />
                            Add to Cart
                          </button>
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
