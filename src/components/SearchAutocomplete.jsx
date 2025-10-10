import React, { useState, useEffect, useRef } from "react";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import apiService from "../services/api";

const SearchAutocomplete = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className = "",
  showRecentSearches = true,
  maxSuggestions = 5,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const containerRef = useRef(null);

  // Load recent searches
  useEffect(() => {
    if (showRecentSearches) {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [showRecentSearches]);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setSelectedIndex(-1);
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiService.getSearchAutocomplete(value);
        setSuggestions(response.suggestions || []);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Autocomplete error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(timeoutId);
  }, [value]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions) return;

      const totalSuggestions =
        suggestions.length + (value.length < 2 ? recentSearches.length : 0);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < totalSuggestions - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            const allSuggestions =
              value.length >= 2 ? suggestions : recentSearches;
            if (allSuggestions[selectedIndex]) {
              handleSuggestionSelect(allSuggestions[selectedIndex]);
            }
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSuggestions, suggestions, recentSearches, selectedIndex, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (value.trim()) {
      // Save to recent searches
      if (showRecentSearches) {
        const updatedRecent = [
          value.trim(),
          ...recentSearches.filter((s) => s !== value.trim()),
        ].slice(0, 5);
        setRecentSearches(updatedRecent);
        localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));
      }

      onSearch(value.trim());
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    const searchText = typeof suggestion === "string" ? suggestion : suggestion;
    onChange(searchText);
    onSearch(searchText);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setSelectedIndex(-1);
    if (!showSuggestions) {
      setShowSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const clearInput = () => {
    onChange("");
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
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
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />

        {value && (
          <button
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {!isLoading && value.length >= 2 && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">
                Suggestions
              </div>
              {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`w-full flex items-center px-2 py-2 text-left transition-colors rounded ${
                    selectedIndex === index
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Search className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!isLoading &&
            value.length < 2 &&
            recentSearches.length > 0 &&
            showRecentSearches && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-2 py-1">
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(search)}
                    className={`w-full flex items-center px-2 py-2 text-left transition-colors rounded ${
                      selectedIndex === index
                        ? "bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            )}

          {/* No Results */}
          {!isLoading && value.length >= 2 && suggestions.length === 0 && (
            <div className="p-3 text-center text-gray-500">
              <p className="text-sm">No suggestions found</p>
              <button
                onClick={handleSearch}
                className="mt-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Search for "{value}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
