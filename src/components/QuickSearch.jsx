import React, { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickSearch = ({
  suggestions = [
    "luxury handbags",
    "smart watches",
    "winter fashion",
    "designer shoes",
    "premium accessories",
  ],
  className = "",
  onSearch,
}) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      if (onSearch) {
        onSearch(finalQuery.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
      }
      setQuery("");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h3>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What are you looking for?"
          />
        </div>
      </form>

      {/* Popular Suggestions */}
      <div>
        <div className="flex items-center mb-3">
          <TrendingUp className="h-4 w-4 text-orange-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            Trending Searches
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickSearch;
