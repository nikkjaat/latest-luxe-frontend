import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  TrendingUp,
  Clock,
  X,
  Mic,
  Camera,
  Package,
  Tag,
  User,
  Sparkles,
} from "lucide-react";
import { useAI } from "../context/AIContext";
import { useAuth } from "../context/AuthContext";
import VoiceSearch from "./VoiceSearch";
import VisualSearch from "./VisualSearch";
import apiService from "../services/api";

const SmartSearch = ({
  onSearch,
  autoFocus = false,
  placeholder = "Search for products, brands, categories...",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [voiceText, setVoiceText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { getSmartSearchSuggestions } = useAI();
  const { isAuthenticated } = useAuth();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Load popular searches from backend
  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const data = await apiService.getPopularSearches("terms");
        setPopularSearches(data.data || []);
      } catch (error) {
        console.error("Failed to load popular searches:", error);
        // Fallback to default trends
        setPopularSearches([
          "luxury handbags",
          "smart watches",
          "winter fashion",
        ]);
      }
    };
    loadPopularSearches();
  }, []);

  // Auto focus when requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions from backend when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setSelectedIndex(-1);
        return;
      }

      setIsLoading(true);
      try {
        const data = await apiService.getSearchSuggestions(query);
        const suggestionsData = data.suggestions || [];
        setSuggestions(suggestionsData);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Update query when voice text changes
  useEffect(() => {
    if (voiceText) {
      setQuery(voiceText);
    }
  }, [voiceText]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    if (showSuggestions) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showSuggestions, suggestions, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const handleSearch = async (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // Save to recent searches
      const updatedRecent = [
        finalQuery.trim(),
        ...recentSearches.filter((s) => s !== finalQuery.trim()),
      ].slice(0, 5);

      setRecentSearches(updatedRecent);
      localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

      if (isAuthenticated) {
        await apiService.addSearchHistory(finalQuery.trim()).catch((err) => {
          console.error("Failed to record search history:", err);
        });
      }

      // Execute search
      onSearch(finalQuery);
      setQuery("");
      setVoiceText("");
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const searchText = suggestion.display || suggestion.name || suggestion;
    setQuery(searchText);
    handleSearch(searchText);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleVoiceSearch = (transcript) => {
    setVoiceText(transcript);
    setQuery(transcript);
    handleSearch(transcript);
  };

  const handleVisualSearchResults = (results) => {
    console.log("Visual search results:", results);
    // You can implement visual search integration here
  };

  // In your SmartSearch component, update the getSuggestionIcon function:
  const getSuggestionIcon = (type) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "brand":
        return <Tag className="h-4 w-4 text-purple-500" />;
      case "category":
      case "subcategory":
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case "trending":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case "popular":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "tag":
        return <Tag className="h-4 w-4 text-indigo-500" />;
      case "recent":
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  // And update the suggestion rendering to show analytics data:
  {
    suggestions.map((suggestion, index) => (
      <button
        key={index}
        onClick={() => handleSuggestionClick(suggestion)}
        className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors group ${
          selectedIndex === index
            ? "bg-blue-50 border-l-4 border-blue-500"
            : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center flex-1">
          {getSuggestionIcon(suggestion.type)}
          <div className="ml-3 flex-1">
            <span
              className={`text-sm font-medium ${
                selectedIndex === index
                  ? "text-blue-700"
                  : "text-gray-800 group-hover:text-blue-600"
              }`}
            >
              {suggestion.display || suggestion.name}
            </span>

            {/* Show additional info for different types */}
            {suggestion.type === "product" && suggestion.price && (
              <div className="text-xs text-gray-500">${suggestion.price}</div>
            )}

            {suggestion.type === "trending" && (
              <div className="text-xs text-orange-600 font-medium">
                🔥 Trending
              </div>
            )}

            {suggestion.type === "popular" && suggestion.count && (
              <div className="text-xs text-gray-500">
                {suggestion.count} searches
              </div>
            )}

            {suggestion.type === "category" && suggestion.count && (
              <div className="text-xs text-gray-500">
                {suggestion.count} products
              </div>
            )}
          </div>
        </div>

        {/* Show popularity indicators */}
        {suggestion.trending && (
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3 text-orange-500" />
            <span className="text-xs text-orange-600 font-medium">
              Trending
            </span>
          </div>
        )}

        {suggestion.count > 1000 && !suggestion.trending && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            Popular
          </span>
        )}
      </button>
    ));
  }

  const clearSearch = () => {
    setQuery("");
    setVoiceText("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={searchRef}>
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
          className="block w-full pl-10 pr-20 py-2.5 md:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all duration-200 bg-gray-50 focus:bg-white"
          placeholder={placeholder}
        />

        {/* Voice Text Display */}
        {voiceText && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-blue-50 border border-blue-200 rounded-lg p-2 z-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                Voice: "{voiceText}"
              </span>
              <button
                onClick={() => {
                  setVoiceText("");
                  setQuery("");
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {/* Voice and Visual Search */}
          <div className="flex items-center space-x-1">
            <VoiceSearch
              onSearch={handleVoiceSearch}
              onTranscript={setVoiceText}
            />
            <div className="hidden sm:block">
              <VisualSearch onResults={handleVisualSearchResults} />
            </div>
            <div className="block sm:hidden">
              <button
                className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label="Visual Search"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
          </div>

          {query && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Loading State */}
          {isLoading && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          )}

          {/* Backend Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Search Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors group ${
                    selectedIndex === index
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center flex-1">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="ml-3 flex-1">
                      <span
                        className={`text-sm font-medium ${
                          selectedIndex === index
                            ? "text-blue-700"
                            : "text-gray-800 group-hover:text-blue-600"
                        }`}
                      >
                        {suggestion.display || suggestion.name}
                      </span>
                      {suggestion.type === "product" && suggestion.price && (
                        <div className="text-xs text-gray-500">
                          ${suggestion.price}
                        </div>
                      )}
                      {suggestion.type === "subcategory" &&
                        suggestion.parentCategory && (
                          <div className="text-xs text-gray-500">
                            in {suggestion.parentCategory}
                          </div>
                        )}
                    </div>
                  </div>
                  {suggestion.count !== undefined && suggestion.count > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        selectedIndex === index
                          ? "text-blue-600 bg-blue-100"
                          : "text-gray-500 bg-gray-100"
                      }`}
                    >
                      search {suggestion.count}{" "}
                      {suggestion.type === "product" ? "matches" : "times"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches - Show when no query */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors group ${
                    selectedIndex === index ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="ml-3 text-sm text-gray-800 group-hover:text-blue-600">
                    {search}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches from Backend */}
          {popularSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Trending Now
              </div>
              {popularSearches.map((trend, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(trend)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors group ${
                    selectedIndex === index
                      ? "bg-orange-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="ml-3 text-sm text-gray-800 group-hover:text-blue-600">
                    {trend}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No suggestions found for "{query}"</p>
              <button
                onClick={() => handleSearch()}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Search anyway
              </button>
            </div>
          )}

          {/* Search Tips */}
          {!query &&
            suggestions.length === 0 &&
            recentSearches.length === 0 && (
              <div className="p-4 text-center">
                <div className="text-xs text-gray-500 mb-2">Search Tips:</div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>• Try "red dress" or "men's watches"</div>
                  <div>• Use brand names like "Nike" or "Apple"</div>
                  <div>• Search by category like "electronics"</div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
