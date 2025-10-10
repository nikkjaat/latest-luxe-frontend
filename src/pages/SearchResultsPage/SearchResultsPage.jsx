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

  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query, page, sortBy, filters]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        q: query,
        page,
        limit: 12,
        sortBy,
        ...filters,
      };

      const response = await apiService.searchProducts(params);

      if (response.success) {
        setProducts(response.products || []);
        setTotal(response.total || 0);

        if (response.filters) {
          setAvailableFilters({
            brands: response.filters.brands || [],
            categories: response.filters.categories || [],
            priceRange: response.filters.priceRange?.[0] || {
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

  const handleSearch = (newQuery) => {
    if (newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery.trim())}`);
      setPage(1);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
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
                Found {total} {total === 1 ? "product" : "products"}
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
                    {availableFilters.brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand._id} ({brand.count})
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
                    {availableFilters.categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat._id} ({cat.count})
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
              </button>

              <div className={styles.controlsRight}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <Search className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No products found</h3>
                <p className={styles.emptyText}>
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
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
                  {products.map((product) => (
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
                          <span className={styles.price}>${product.price}</span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className={styles.originalPrice}>
                                ${product.originalPrice}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {total > 12 && (
                  <div className={styles.pagination}>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={styles.paginationButton}
                    >
                      Previous
                    </button>
                    <span className={styles.pageInfo}>
                      Page {page} of {Math.ceil(total / 12)}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil(total / 12)}
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
