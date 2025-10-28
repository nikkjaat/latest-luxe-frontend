import React, { useEffect, useState } from "react";
import { Clock, X, Trash2, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./SearchHistory.module.css";

const SearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSearchHistory(20); // Get more items to sort locally
      if (response.success) {
        // Sort by createdAt descending (most recent first)
        const sortedHistory = response.history.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setHistory(sortedHistory);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === "search") {
      navigate(`/search?q=${encodeURIComponent(item.searchQuery)}`);
    } else if (item.type === "product_view" && item.productId) {
      navigate(`/product/${item.productId._id || item.productId}`);
    }

    // Move clicked item to top of history
    setHistory((prevHistory) => {
      const filteredHistory = prevHistory.filter((h) => h._id !== item._id);
      return [item, ...filteredHistory];
    });
  };

  const handleDeleteItem = async (e, itemId) => {
    e.stopPropagation();
    try {
      await apiService.deleteHistoryItem(itemId);
      setHistory(history.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Failed to delete history item:", error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Clear all search history?")) {
      try {
        await apiService.clearSearchHistory();
        setHistory([]);
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  if (!isAuthenticated || history.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Clock className={styles.titleIcon} />
          <h2 className={styles.title}>Recent Activity</h2>
        </div>
        {history.length > 0 && (
          <button onClick={handleClearAll} className={styles.clearButton}>
            <Trash2 className={styles.clearIcon} />
            Clear All
          </button>
        )}
      </div>

      <div className={styles.scrollContainer}>
        <div className={styles.historyList}>
          {history.map((item) => (
            <div
              key={item._id}
              onClick={() => handleItemClick(item)}
              className={styles.historyItem}
            >
              <button
                onClick={(e) => handleDeleteItem(e, item._id)}
                className={styles.deleteButton}
              >
                <X className={styles.deleteIcon} />
              </button>

              {item.type === "search" ? (
                <div className={styles.searchItem}>
                  <div className={styles.searchIcon}>
                    <Search size={18} />
                  </div>
                  <div className={styles.searchContent}>
                    <p className={styles.searchQuery}>{item.searchQuery}</p>
                    <div className={styles.itemMeta}>
                      <span className={styles.searchLabel}>Search</span>
                      <span className={styles.timeAgo}>
                        {formatRelativeTime(item.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.productItem}>
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className={styles.productImage}
                    />
                  )}
                  <div className={styles.productContent}>
                    <p className={styles.productName}>
                      {item.productName || "Product"}
                    </p>
                    {item.productPrice && (
                      <p className={styles.productPrice}>
                        ₹{item.productPrice.toFixed(2)}
                      </p>
                    )}
                    <div className={styles.itemMeta}>
                      <div className={styles.viewLabel}>
                        <Eye size={12} />
                        <span>Viewed</span>
                      </div>
                      <span className={styles.timeAgo}>
                        {formatRelativeTime(item.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchHistory;
