import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, X, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SmartSearch from "./SmartSearch";

const SearchBar = ({
  onSearch,
  showFilters = false,
  className = "",
  size = "md",
  autoFocus = false,
}) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const sizeClasses = {
    sm: "py-2 px-3 text-sm",
    md: "py-2.5 px-4 text-base",
    lg: "py-3 px-5 text-lg",
  };

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      if (onSearch) {
        onSearch(finalQuery.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
      }
      setQuery("");
      setIsExpanded(false);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      searchRef.current?.focus();
    }, 100);
  };

  const handleCollapse = () => {
    if (!query) {
      setIsExpanded(false);
    }
  };

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && autoFocus && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isExpanded, autoFocus]);

  if (isExpanded) {
    return (
      <div className={`relative ${className}`}>
        <SmartSearch onSearch={handleSearch} autoFocus={true} />
        <button
          onClick={handleCollapse}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleExpand}
      className={`
        flex items-center gap-2 bg-gray-100 hover:bg-gray-200 
        transition-all duration-200 rounded-lg border border-gray-200
        ${sizeClasses[size]} ${className}
      `}
    >
      <Search className="h-4 w-4 text-gray-500" />
      <span className="text-gray-500">Search products...</span>
      {showFilters && <Filter className="h-4 w-4 text-gray-400 ml-auto" />}
    </button>
  );
};

export default SearchBar;
