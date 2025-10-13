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
      const response = await apiService.getSearchHistory(10);
      if (response.success) {
        setHistory(response.history);
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
                    <span className={styles.searchLabel}>Search</span>
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
                        ${item.productPrice.toFixed(2)}
                      </p>
                    )}
                    <div className={styles.viewLabel}>
                      <Eye size={12} />
                      <span>Viewed</span>
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
