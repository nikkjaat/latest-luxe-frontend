import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  X,
  TrendingUp,
  Loader,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import SmartSearch from "../../components/SmartSearch";
import apiService from "../../services/api";
import styles from "./SearchResultsPage.module.css";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [allProducts, setAllProducts] = useState([]); // All products from initial search
  const [filteredProducts, setFilteredProducts] = useState([]); // Products after local filtering
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    brand: "",
    category: "",
    minRating: "",
    inStock: false,
  });

  const [availableFilters, setAvailableFilters] = useState({
    brands: [],
    categories: [],
    priceRange: { minPrice: 0, maxPrice: 1000 },
  });

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Initial search when query changes
  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  // Local filtering when filters or sort change
  useEffect(() => {
    if (allProducts.length > 0) {
      applyLocalFilters();
    }
  }, [filters, sortBy, allProducts]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = {
        query,
        page: 1, // Always get first page for local filtering
        limit: 100, // Get more products for local filtering
        sortBy: "relevance", // We'll handle sorting locally
      };

      const response = await apiService.intelligentSearchProducts(params);

      if (response.success) {
        setAllProducts(response.products || []);
        setFilteredProducts(response.products || []);
        setTotal(response.pagination?.totalProducts || 0);

        if (response.filters) {
          setAvailableFilters({
            brands: response.filters.brands || [],
            categories: response.filters.categories || [],
            priceRange: response.filters.priceRange || {
              minPrice: 0,
              maxPrice: 1000,
            },
          });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyLocalFilters = () => {
    let filtered = [...allProducts];

    // Apply price filter
    if (filters.minPrice) {
      filtered = filtered.filter(
        (product) => product.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (product) => product.price <= parseFloat(filters.maxPrice)
      );
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(
        (product) =>
          product.brand?.toLowerCase() === filters.brand.toLowerCase()
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) =>
          product.category?.main?.toLowerCase() ===
          filters.category.toLowerCase()
      );
    }

    // Apply rating filter
    if (filters.minRating) {
      filtered = filtered.filter(
        (product) => product.rating?.average >= parseFloat(filters.minRating)
      );
    }

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    // Apply sorting
    filtered = applySorting(filtered, sortBy);

    setFilteredProducts(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const applySorting = (products, sortType) => {
    const sorted = [...products];

    switch (sortType) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort(
          (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0)
        );
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "popularity":
        return sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
      case "relevance":
      default:
        // For relevance, maintain the original search order
        return sorted;
    }
  };

  const handleSearch = (newQuery) => {
    if (newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery.trim())}`);
      setPage(1);
      // Reset filters when new search is performed
      setFilters({
        minPrice: "",
        maxPrice: "",
        brand: "",
        category: "",
        minRating: "",
        inStock: false,
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // No API call here - local filtering will handle it
  };

  const handleClearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      brand: "",
      category: "",
      minRating: "",
      inStock: false,
    });
    setPage(1);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    // Sorting is handled in the local filtering effect
  };

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (product, e) => {
    e?.stopPropagation();
    const image = product.colorVariants?.[0]?.images?.[0]?.url || "";
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image,
    });
  };

  const getPrimaryImage = (product) => {
    return product.colorVariants?.[0]?.images?.[0]?.url || "";
  };

  // Pagination logic
  const productsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (page - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.searchHeader}>
          <div className={styles.searchBarWrapper}>
            <SmartSearch
              onSearch={handleSearch}
              placeholder="Search for products, brands, categories..."
              autoFocus={false}
            />
          </div>

          {query && (
            <div className={styles.searchInfo}>
              <h1 className={styles.searchTitle}>
                Search results for "
                <span className={styles.query}>{query}</span>"
              </h1>
              <p className={styles.resultCount}>
                Showing {currentProducts.length} of {filteredProducts.length}{" "}
                products
                {allProducts.length !== filteredProducts.length &&
                  ` (filtered from ${allProducts.length} total)`}
              </p>
            </div>
          )}
        </div>

        <div className={styles.layout}>
          <div
            className={`${styles.sidebar} ${showFilters ? styles.visible : ""}`}
          >
            <div className={styles.filtersCard}>
              <div className={styles.filtersHeader}>
                <h3 className={styles.filtersTitle}>Filters</h3>
                <button
                  onClick={handleClearFilters}
                  className={styles.clearButton}
                >
                  Clear All
                </button>
              </div>

              <div className={styles.filterSection}>
                <h4 className={styles.filterLabel}>Price Range</h4>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className={styles.priceInput}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className={styles.priceInput}
                  />
                </div>
              </div>

              {availableFilters.brands.length > 0 && (
                <div className={styles.filterSection}>
                  <h4 className={styles.filterLabel}>Brand</h4>
                  <select
                    value={filters.brand}
                    onChange={(e) =>
                      handleFilterChange("brand", e.target.value)
                    }
                    className={styles.filterSelect}
                  >
                    <option value="">All Brands</option>
                    {availableFilters.brands.map((brand, index) => (
                      <option key={brand + index} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {availableFilters.categories.length > 0 && (
                <div className={styles.filterSection}>
                  <h4 className={styles.filterLabel}>Category</h4>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className={styles.filterSelect}
                  >
                    <option value="">All Categories</option>
                    {availableFilters.categories.map((cat, index) => (
                      <option
                        key={`${cat._id?.main || "cat"}-${index}`}
                        value={cat._id?.main}
                      >
                        {cat._id?.main} {cat._id?.sub && `> ${cat._id.sub}`} (
                        {cat.count})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.filterSection}>
                <h4 className={styles.filterLabel}>Rating</h4>
                <select
                  value={filters.minRating}
                  onChange={(e) =>
                    handleFilterChange("minRating", e.target.value)
                  }
                  className={styles.filterSelect}
                >
                  <option value="">All Ratings</option>
                  <option value="4">4 Stars & Up</option>
                  <option value="3">3 Stars & Up</option>
                  <option value="2">2 Stars & Up</option>
                </select>
              </div>

              <div className={styles.filterSection}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) =>
                      handleFilterChange("inStock", e.target.checked)
                    }
                    className={styles.checkbox}
                  />
                  In Stock Only
                </label>
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.controlsBar}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={styles.filtersToggle}
              >
                <SlidersHorizontal className={styles.icon} />
                Filters
                {(filters.minPrice ||
                  filters.maxPrice ||
                  filters.brand ||
                  filters.category ||
                  filters.minRating ||
                  filters.inStock) && (
                  <span className={styles.activeFiltersDot}></span>
                )}
              </button>

              <div className={styles.controlsRight}>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="popularity">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>

                <div className={styles.viewToggle}>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`${styles.viewButton} ${
                      viewMode === "grid" ? styles.active : ""
                    }`}
                  >
                    <Grid className={styles.icon} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`${styles.viewButton} ${
                      viewMode === "list" ? styles.active : ""
                    }`}
                  >
                    <List className={styles.icon} />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <Loader className={styles.spinner} />
                <p>Searching products...</p>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <Search className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>
                  {allProducts.length === 0
                    ? "No products found"
                    : "No products match your filters"}
                </h3>
                <p className={styles.emptyText}>
                  {allProducts.length === 0
                    ? "Try adjusting your search to find what you're looking for."
                    : "Try adjusting your filters to see more products."}
                </p>
                {allProducts.length > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className={styles.clearFiltersButton}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? styles.productsGrid
                      : styles.productsList
                  }
                >
                  {currentProducts.map((product) => (
                    <div
                      key={product._id}
                      className={
                        viewMode === "grid"
                          ? styles.productCard
                          : styles.productListItem
                      }
                    >
                      <Link
                        to={`/product/${product._id}`}
                        className={styles.productLink}
                      >
                        <div className={styles.imageContainer}>
                          <img
                            src={getPrimaryImage(product)}
                            alt={product.name}
                            className={styles.productImage}
                          />
                          {product.badge && (
                            <span className={styles.badge}>
                              {product.badge}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleWishlistToggle(product);
                            }}
                            className={`${styles.wishlistButton} ${
                              isInWishlist(product._id) ? styles.active : ""
                            }`}
                          >
                            <Heart
                              className={`${styles.heartIcon} ${
                                isInWishlist(product._id) ? styles.filled : ""
                              }`}
                            />
                          </button>
                        </div>
                      </Link>

                      <div className={styles.productInfo}>
                        <Link
                          to={`/product/${product._id}`}
                          className={styles.productLink}
                        >
                          <h3 className={styles.productName}>{product.name}</h3>
                        </Link>

                        <div className={styles.rating}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`${styles.star} ${
                                i < Math.floor(product.rating?.average || 0)
                                  ? styles.filled
                                  : ""
                              }`}
                            />
                          ))}
                          <span className={styles.ratingCount}>
                            ({product.rating?.count || 0})
                          </span>
                        </div>

                        <div className={styles.priceContainer}>
                          <span className={styles.price}>₹{product.price}</span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className={styles.originalPrice}>
                                ₹{product.originalPrice}
                              </span>
                            )}
                        </div>

                        {product.stock === 0 && (
                          <p style={{ textAlign: "right", color: "red" }}>
                            Out of Stock
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={styles.paginationButton}
                    >
                      Previous
                    </button>
                    <span className={styles.pageInfo}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages}
                      className={styles.paginationButton}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
