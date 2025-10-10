import { useState, useEffect, useCallback } from "react";
import apiService from "../services/api";

export const useSearch = (initialQuery = "") => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({});
  const [searchMeta, setSearchMeta] = useState({});

  // Debounced search function
  const performSearch = useCallback(
    async (searchQuery = query, searchFilters = filters, page = 1) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotalResults(0);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const searchParams = {
          q: searchQuery,
          page,
          limit: 12,
          ...searchFilters,
        };

        // Remove empty filters
        Object.keys(searchParams).forEach((key) => {
          if (!searchParams[key]) {
            delete searchParams[key];
          }
        });

        const response = await apiService.searchProducts(searchParams);

        if (response.success) {
          setResults(response.products || []);
          setTotalResults(response.total || 0);
          setTotalPages(response.pages || 0);
          setSearchMeta(response.searchMeta || {});
          setCurrentPage(page);
        } else {
          throw new Error("Search failed");
        }
      } catch (err) {
        setError(err.message);
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    },
    [query, filters]
  );

  // Get search suggestions
  const getSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await apiService.getSearchSuggestions(searchQuery);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    setTotalResults(0);
    setFilters({});
    setCurrentPage(1);
    setError(null);
  }, []);

  // Search with new query
  const search = useCallback((newQuery) => {
    setQuery(newQuery);
    setCurrentPage(1);
  }, []);

  // Go to page
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Auto-search when query or filters change
  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        performSearch(query, filters, currentPage);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [query, filters, currentPage, performSearch]);

  return {
    // State
    query,
    results,
    suggestions,
    loading,
    error,
    totalResults,
    currentPage,
    totalPages,
    filters,
    searchMeta,

    // Actions
    setQuery,
    search,
    performSearch,
    getSuggestions,
    updateFilters,
    clearSearch,
    goToPage,
  };
};

export default useSearch;
