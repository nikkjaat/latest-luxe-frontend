import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Clock, X, Mic, Camera } from 'lucide-react';
import { useAI } from '../context/AIContext';
import VoiceSearch from './VoiceSearch';
import VisualSearch from './VisualSearch';

const SmartSearch = ({ onSearch, autoFocus = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'leather handbag',
    'designer watch',
    'silk scarf'
  ]);
  const { getSmartSearchSuggestions } = useAI();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const suggestions = getSmartSearchSuggestions(query);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query, getSmartSearchSuggestions]);

  // Update query when voice text changes
  useEffect(() => {
    if (voiceText) {
      setQuery(voiceText);
    }
  }, [voiceText]);

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      onSearch(finalQuery);
      setRecentSearches(prev => [finalQuery, ...prev.filter(s => s !== finalQuery)].slice(0, 5));
      setQuery('');
      setVoiceText('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleVoiceSearch = (transcript) => {
    setVoiceText(transcript);
    setQuery(transcript);
    handleSearch(transcript);
  };

  const handleVisualSearchResults = (results) => {
    console.log('Visual search results:', results);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'trending': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'recent': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Search className="h-4 w-4 text-gray-500" />;
    }
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
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => setShowSuggestions(true)}
          className="block w-full pl-10 pr-20 py-2.5 md:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all duration-200 bg-gray-50 focus:bg-white"
          placeholder="Search for products..."
        />
        
        {/* Voice Text Display */}
        {voiceText && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-blue-50 border border-blue-200 rounded-lg p-2 z-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Voice: "{voiceText}"</span>
              <button
                onClick={() => {
                  setVoiceText('');
                  setQuery('');
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
            <VoiceSearch onSearch={handleVoiceSearch} onTranscript={setVoiceText} />
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
              onClick={() => {
                setQuery('');
                setVoiceText('');
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Smart Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center px-3 py-2.5 hover:bg-gray-50 rounded-lg text-left transition-colors"
                >
                  {getSuggestionIcon(suggestion.type)}
                  <span className="ml-3 flex-1 text-sm">{suggestion.text}</span>
                  <span className="text-xs text-gray-500">
                    {suggestion.count} items
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center px-3 py-2.5 hover:bg-gray-50 rounded-lg text-left transition-colors"
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="ml-3 text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          <div className="p-2 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 px-3 py-2">
              Trending Now
            </div>
            {['luxury handbags', 'smart watches', 'winter fashion'].map((trend, index) => (
              <button
                key={index}
                onClick={() => handleSearch(trend)}
                className="w-full flex items-center px-3 py-2.5 hover:bg-gray-50 rounded-lg text-left transition-colors"
              >
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="ml-3 text-sm">{trend}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;