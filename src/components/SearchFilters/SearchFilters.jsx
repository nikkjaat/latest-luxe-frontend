// components/SearchFilters.jsx
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./SearchFilters.module.css";

const SearchFilters = ({ filters, onFilterChange, searchQuery }) => {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || "",
    max: filters.maxPrice || "",
  });

  const [openSections, setOpenSections] = useState({
    price: true,
    category: true,
    brand: true,
    rating: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = () => {
    onFilterChange({
      ...filters,
      minPrice: priceRange.min || undefined,
      maxPrice: priceRange.max || undefined,
    });
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className={styles.filters}>
      {/* Price Range */}
      <div className={styles.filterSection}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection("price")}
        >
          <span>Price Range</span>
          {openSections.price ? <ChevronUp /> : <ChevronDown />}
        </button>

        {openSections.price && (
          <div className={styles.sectionContent}>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    min: e.target.value,
                  }))
                }
                className={styles.priceInput}
              />
              <span className={styles.priceSeparator}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    max: e.target.value,
                  }))
                }
                className={styles.priceInput}
              />
            </div>
            <button onClick={handlePriceChange} className={styles.applyButton}>
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className={styles.filterSection}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection("category")}
        >
          <span>Category</span>
          {openSections.category ? <ChevronUp /> : <ChevronDown />}
        </button>

        {openSections.category && (
          <div className={styles.sectionContent}>
            {["electronics", "men", "women", "books", "sports"].map(
              (category) => (
                <label key={category} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category}
                    onChange={() => handleFilterChange("category", category)}
                  />
                  <span className={styles.optionLabel}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </label>
              )
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className={styles.filterSection}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection("rating")}
        >
          <span>Rating</span>
          {openSections.rating ? <ChevronUp /> : <ChevronDown />}
        </button>

        {openSections.rating && (
          <div className={styles.sectionContent}>
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className={styles.filterOption}>
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === rating.toString()}
                  onChange={() =>
                    handleFilterChange("minRating", rating.toString())
                  }
                />
                <span className={styles.optionLabel}>{rating}+ Stars</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* In Stock */}
      <div className={styles.filterSection}>
        <label className={styles.filterOption}>
          <input
            type="checkbox"
            checked={filters.inStock === "true"}
            onChange={(e) =>
              handleFilterChange(
                "inStock",
                e.target.checked ? "true" : undefined
              )
            }
          />
          <span className={styles.optionLabel}>In Stock Only</span>
        </label>
      </div>
    </div>
  );
};

export default SearchFilters;
