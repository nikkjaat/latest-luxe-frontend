import React, { useState, useEffect, useRef } from "react";
import { Search, Loader, Package, Tag, Sparkles, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

const InstantSearch = ({
  placeholder = "Search instantly...",
  className = "",
  onResultClick,
  maxResults = 6,
  showImages = true,
  compact = false,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch instant results and suggestions
  useEffect(() => {
    const fetchInstantResults = async () => {
      if (query.length < 2) {
        setResults([]);
        setSuggestions([]);
        setSelectedIndex(-1);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch both search results and suggestions in parallel
        const [searchResponse, suggestionsResponse] = await Promise.all([
          apiService.searchProducts({ q: query, limit: maxResults }),
          apiService.getSearchSuggestions(query),
        ]);

        setResults(searchResponse.products || []);
        setSuggestions(suggestionsResponse.suggestions || []);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Instant search error:", error);
        setResults([]);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchInstantResults, 200);
    return () => clearTimeout(timeoutId);
  }, [query, maxResults]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showDropdown) return;

      const totalItems = results.length + suggestions.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            if (selectedIndex < results.length) {
              handleProductClick(results[selectedIndex]);
            } else {
              const suggestionIndex = selectedIndex - results.length;
              handleSuggestionClick(suggestions[suggestionIndex]);
            }
          } else {
            handleViewAllResults();
          }
          break;
        case "Escape":
          setShowDropdown(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showDropdown, results, suggestions, selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    if (!showDropdown) {
      setShowDropdown(true);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const handleProductClick = (product) => {
    if (onResultClick) {
      onResultClick(product);
    } else {
      navigate(`/product/${product._id}`);
    }
    setShowDropdown(false);
    setQuery("");
  };

  const handleSuggestionClick = (suggestion) => {
    const searchText = suggestion.display || suggestion.name || suggestion;
    setQuery(searchText);
    handleViewAllResults(searchText);
  };

  const handleViewAllResults = (searchQuery = query) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
      setQuery("");
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "brand":
        return <Tag className="h-4 w-4 text-purple-500" />;
      case "category":
      case "subcategory":
        return <Sparkles className="h-4 w-4 text-green-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          placeholder={placeholder}
        />

        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader className="h-4 w-4 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Instant Results Dropdown */}
      {showDropdown && (query.length >= 2 || suggestions.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
        >
          {/* Product Results */}
          {results.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Products
              </div>
              <div className="max-h-64 overflow-y-auto">
                {results.map((product, index) => (
                  <button
                    key={product._id}
                    onClick={() => handleProductClick(product)}
                    className={`w-full flex items-center p-3 text-left transition-colors ${
                      selectedIndex === index
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {showImages && (
                      <img
                        src={
                          product.colorVariants?.[0]?.images?.[0]?.url ||
                          product.image
                        }
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg mr-3 flex-shrink-0"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/48";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-600">
                          ${product.price}
                        </span>
                        {product.rating && (
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500">
                              ★{" "}
                              {typeof product.rating === "object"
                                ? product.rating.average?.toFixed(1)
                                : product.rating?.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      {!compact && product.brand && (
                        <div className="text-xs text-gray-500">
                          by {product.brand}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Search Suggestions
              </div>
              <div className="max-h-32 overflow-y-auto">
                {suggestions.slice(0, 4).map((suggestion, index) => {
                  const adjustedIndex = index + results.length;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full flex items-center p-2 text-left transition-colors ${
                        selectedIndex === adjustedIndex
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {getSuggestionIcon(suggestion.type)}
                      <span className="ml-2 text-sm text-gray-700">
                        {suggestion.display || suggestion.name}
                      </span>
                      {suggestion.count > 0 && (
                        <span className="ml-auto text-xs text-gray-500">
                          {suggestion.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* View All Results */}
          {query.length >= 2 && (
            <div className="border-t border-gray-100">
              <button
                onClick={() => handleViewAllResults()}
                className="w-full p-3 text-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-sm transition-colors"
              >
                View all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstantSearch;
