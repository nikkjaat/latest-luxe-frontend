import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid2x2 as Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
  X,
  ChevronDown,
  SlidersHorizontal,
  Package,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import ProductGrid from "./ProductGrid";
import SmartSearch from "./SmartSearch";
import apiService from "../services/api";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchMeta, setSearchMeta] = useState({});
  const [availableFilters, setAvailableFilters] = useState({});

  // Filter state
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minRating: searchParams.get("minRating") || "",
    inStock: searchParams.get("inStock") || "",
    sortBy: searchParams.get("sortBy") || "relevance",
  });

  // UI state
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Perform search when query or filters change
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setTotalResults(0);
    }
  }, [searchQuery, filters, currentPage]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.minRating) params.set("minRating", filters.minRating);
    if (filters.inStock) params.set("inStock", filters.inStock);
    if (filters.sortBy !== "relevance") params.set("sortBy", filters.sortBy);
    if (currentPage > 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [searchQuery, filters, currentPage, setSearchParams]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const searchParams = {
        q: searchQuery,
        page: currentPage,
        limit: 12,
        ...filters,
      };

      // Remove empty filters
      Object.keys(searchParams).forEach((key) => {
        if (!searchParams[key]) {
          delete searchParams[key];
        }
      });

      const response = await apiService.searchProducts(searchParams);

      if (response.success) {
        setSearchResults(response.products || []);
        setTotalResults(response.total || 0);
        setTotalPages(response.pages || 0);
        setSearchMeta(response.searchMeta || {});
        setAvailableFilters(response.filters || {});
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setTotalResults(0);
      setSearchMeta({});
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, sortBy: "relevance" }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      inStock: "",
      sortBy: "relevance",
    });
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setTotalResults(0);
    clearFilters();
    navigate("/shop");
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && value !== "relevance"
  ).length;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render filter section
  const renderFilters = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        {availableFilters.priceRange && availableFilters.priceRange[0] && (
          <div className="text-xs text-gray-500 mt-1">
            Range: ${availableFilters.priceRange[0].minPrice} - $
            {availableFilters.priceRange[0].maxPrice}
          </div>
        )}
      </div>

      {/* Categories */}
      {availableFilters.categories &&
        availableFilters.categories.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={!filters.category}
                  onChange={() => handleFilterChange("category", "")}
                  className="mr-2"
                />
                <span className="text-sm">All Categories</span>
              </label>
              {availableFilters.categories.map((cat) => (
                <label key={cat._id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={cat._id}
                    checked={filters.category === cat._id}
                    onChange={() => handleFilterChange("category", cat._id)}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">
                    {cat._id} ({cat.count})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

      {/* Brands */}
      {availableFilters.brands && availableFilters.brands.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Brands</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <label className="flex items-center">
              <input
                type="radio"
                name="brand"
                value=""
                checked={!filters.brand}
                onChange={() => handleFilterChange("brand", "")}
                className="mr-2"
              />
              <span className="text-sm">All Brands</span>
            </label>
            {availableFilters.brands.map((brand) => (
              <label key={brand._id} className="flex items-center">
                <input
                  type="radio"
                  name="brand"
                  value={brand._id}
                  checked={filters.brand === brand._id}
                  onChange={() => handleFilterChange("brand", brand._id)}
                  className="mr-2"
                />
                <span className="text-sm">
                  {brand._id} ({brand.count})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Rating</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="rating"
              value=""
              checked={!filters.minRating}
              onChange={() => handleFilterChange("minRating", "")}
              className="mr-2"
            />
            <span className="text-sm">All Ratings</span>
          </label>
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating.toString()}
                checked={filters.minRating === rating.toString()}
                onChange={() =>
                  handleFilterChange("minRating", rating.toString())
                }
                className="mr-2"
              />
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock === "true"}
            onChange={(e) =>
              handleFilterChange("inStock", e.target.checked ? "true" : "")
            }
            className="mr-2"
          />
          <span className="text-sm font-medium">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <SmartSearch
              onSearch={handleNewSearch}
              placeholder="Search products, brands, categories..."
            />
          </div>

          {searchQuery && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Search Results for "{searchQuery}"
              </h1>
              <p className="text-gray-600">
                {loading ? "Searching..." : `${totalResults} products found`}
              </p>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(searchQuery || activeFiltersCount > 0) && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {searchQuery && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <Search className="h-3 w-3 mr-1" />"{searchQuery}"
                  <button
                    onClick={clearSearch}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === "relevance") return null;

                let label = "";
                switch (key) {
                  case "category":
                    label = `Category: ${value}`;
                    break;
                  case "brand":
                    label = `Brand: ${value}`;
                    break;
                  case "minPrice":
                    label = `Min: $${value}`;
                    break;
                  case "maxPrice":
                    label = `Max: $${value}`;
                    break;
                  case "minRating":
                    label = `${value}+ stars`;
                    break;
                  case "inStock":
                    label = "In Stock";
                    break;
                  default:
                    return null;
                }

                return (
                  <div
                    key={key}
                    className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {label}
                    <button
                      onClick={() => handleFilterChange(key, "")}
                      className="ml-2 hover:text-gray-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {renderFilters()}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Sort Dropdown */}
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="popularity">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {totalResults} results
                  </span>

                  {/* View Toggle */}
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${
                        viewMode === "grid"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${
                        viewMode === "list"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-lg animate-pulse"
                  >
                    <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <ProductGrid
                  products={searchResults}
                  loading={loading}
                  emptyMessage="No products match your search criteria"
                  searchTerms={
                    searchMeta.searchTerms ||
                    (searchQuery ? searchQuery.trim().split(/\s+/) : [])
                  }
                  columns={
                    viewMode === "grid"
                      ? { sm: 1, md: 2, lg: 3, xl: 4 }
                      : { sm: 1, md: 1, lg: 1, xl: 1 }
                  }
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex space-x-2">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
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
                              className={`px-3 py-2 rounded-md ${
                                currentPage === pageNumber
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found for "{searchQuery}"
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <div className="space-y-2">
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <div className="text-sm text-gray-500">
                    <p>Search suggestions:</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {[
                        "luxury handbags",
                        "smart watches",
                        "winter fashion",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleNewSearch(suggestion)}
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start your search
                </h3>
                <p className="text-gray-500">
                  Enter a search term to find products
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto h-full pb-20">
                {renderFilters()}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                <div className="flex gap-2">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
