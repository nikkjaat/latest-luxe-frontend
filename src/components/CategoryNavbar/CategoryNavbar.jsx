import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  Shirt,
  Watch,
  Home,
  Smartphone,
  Dumbbell,
  Baby,
  BookOpen,
  Sparkles,
  Gift,
  Grid2x2 as Grid,
  ChevronRight,
} from "lucide-react";
import { useCategory } from "../../context/CategoryContext";
import styles from "./CategoryNavbar.module.css";

const CategoryNavbar = () => {
  const { categories, loading } = useCategory();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [navbarTop, setNavbarTop] = useState(0);
  const lastScrollY = useRef(0);
  const [expandedMobileSubcategory, setExpandedMobileSubcategory] = useState(
    {}
  );
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const subcategoryHoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setNavbarTop(0);
      } else {
        // Scrolling up
        setNavbarTop(60);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    if (
      name.includes("fashion") ||
      name.includes("clothing") ||
      name.includes("apparel")
    )
      return Shirt;
    if (name.includes("watch") || name.includes("accessories")) return Watch;
    if (name.includes("home") || name.includes("furniture")) return Home;
    if (name.includes("electronic") || name.includes("gadget"))
      return Smartphone;
    if (name.includes("sport") || name.includes("fitness")) return Dumbbell;
    if (name.includes("baby") || name.includes("kids") || name.includes("toy"))
      return Baby;
    if (name.includes("book") || name.includes("media")) return BookOpen;
    if (name.includes("beauty") || name.includes("cosmetic")) return Sparkles;
    if (name.includes("gift")) return Gift;
    return Grid;
  };

  // NEW: Function to build search query from category hierarchy
  // UPDATED: Function to build search query from category hierarchy
  const buildSearchQuery = (categoryHierarchy) => {
    const { main, sub, type, variant, style } = categoryHierarchy;

    const queryParts = [];

    // Add all available category levels in order
    if (main) queryParts.push(main.toLowerCase());
    if (sub) queryParts.push(sub.toLowerCase());
    if (type) queryParts.push(type.toLowerCase());
    if (variant) queryParts.push(variant.toLowerCase());
    if (style) queryParts.push(style.toLowerCase());

    // Join with spaces and clean up
    return queryParts
      .join(" ")
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  };

  // Add this function to enrich categories with level information
  const enrichCategoriesWithLevels = (categories, level = 1) => {
    return categories.map((category) => ({
      ...category,
      level: level,
      subcategories: category.subcategories
        ? enrichCategoriesWithLevels(category.subcategories, level + 1)
        : [],
    }));
  };

  const enrichedCategories = enrichCategoriesWithLevels(categories || []);

  // NEW: Function to handle category navigation with search query
  // UPDATED: Function to handle category navigation with search query
  const handleCategoryNavigation = (categoryData, parentHierarchy = {}) => {
    // Build the complete hierarchy including current category
    const currentHierarchy = getCategoryHierarchy(
      categoryData,
      categoryData.level || 1,
      parentHierarchy
    );

    // Build search query from complete hierarchy
    const searchQuery = buildSearchQuery(currentHierarchy);

    if (searchQuery.trim()) {
      // Navigate to search with the query
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);

      // Close menus
      setIsMobileMenuOpen(false);
      setHoveredCategory(null);
      setHoveredSubcategory({});
    }
  };

  // UPDATED: Helper function to get hierarchy level key
  const getHierarchyLevelKey = (level) => {
    const levelMap = {
      1: "main",
      2: "sub",
      3: "type",
      4: "variant",
      5: "style",
    };
    return levelMap[level] || "main";
  };

  // NEW: Function to get full hierarchy path for a category
  // UPDATED: Function to get full hierarchy path for a category
  const getCategoryHierarchy = (
    category,
    currentLevel = 1,
    parentHierarchy = {}
  ) => {
    const levelKey = getHierarchyLevelKey(currentLevel);

    // Create new hierarchy with current category
    const newHierarchy = {
      ...parentHierarchy,
      [levelKey]: category.name,
    };

    return newHierarchy;
  };

  // Add this to see the generated query in console
  const debugCategoryNavigation = (categoryData, parentHierarchy) => {
    const currentHierarchy = getCategoryHierarchy(
      categoryData,
      categoryData.level || 1,
      parentHierarchy
    );
    const searchQuery = buildSearchQuery(currentHierarchy);

    console.log("Category Navigation Debug:");
    console.log("Category Data:", categoryData);
    console.log("Parent Hierarchy:", parentHierarchy);
    console.log("Current Hierarchy:", currentHierarchy);
    console.log("Generated Query:", searchQuery);
    console.log("URL:", `/search?q=${encodeURIComponent(searchQuery)}`);

    return searchQuery;
  };

  const handleMouseEnter = (categoryId) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(categoryId);
    setHoveredSubcategory({}); // Reset all subcategory hovers
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(null);
    setHoveredSubcategory({});
  };

  const handleSubcategoryMouseEnter = (categoryId, subcategoryId, level) => {
    if (subcategoryHoverTimeoutRef.current) {
      clearTimeout(subcategoryHoverTimeoutRef.current);
    }
    if (hoveredCategory === categoryId) {
      setHoveredSubcategory((prev) => ({
        ...prev,
        [`${categoryId}-${level}-${subcategoryId}`]: true,
      }));
    }
  };

  const handleSubcategoryMouseLeave = (categoryId, subcategoryId, level) => {
    if (subcategoryHoverTimeoutRef.current) {
      clearTimeout(subcategoryHoverTimeoutRef.current);
    }
    setHoveredSubcategory((prev) => {
      const newState = { ...prev };
      delete newState[`${categoryId}-${level}-${subcategoryId}`];
      return newState;
    });
  };

  // UPDATED: Handle main category click
  const handleCategoryClick = (category) => {
    // Ensure main category has level 1
    const categoryWithLevel = {
      ...category,
      level: 1,
    };
    const hierarchy = getCategoryHierarchy(categoryWithLevel, 1);
    handleCategoryNavigation(categoryWithLevel, hierarchy);
  };

  const handleMobileCategoryToggle = (categoryId) => {
    setExpandedMobileCategory(
      expandedMobileCategory === categoryId ? null : categoryId
    );
  };

  const handleMobileSubcategoryToggle = (path) => {
    setExpandedMobileSubcategory((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // UPDATED: Recursive function to render desktop dropdown with search query navigation
  // UPDATED: Recursive function to render desktop dropdown with search query navigation
  const renderDesktopDropdown = (
    subcategories,
    categoryId,
    currentLevel = 2,
    parentHierarchy = {},
    parentCategory = null
  ) => {
    if (!subcategories || subcategories.length === 0) return null;

    return subcategories.map((subcategory, index) => {
      const hasChildren =
        subcategory.subcategories && subcategory.subcategories.length > 0;
      const uniqueKey =
        subcategory._id || `${categoryId}-${currentLevel}-${index}`;

      // Add level information to subcategory
      const subcategoryWithLevel = {
        ...subcategory,
        level: currentLevel,
      };

      const currentHierarchy = getCategoryHierarchy(
        subcategoryWithLevel,
        currentLevel,
        parentHierarchy
      );
      const isHovered =
        hoveredSubcategory[`${categoryId}-${currentLevel}-${uniqueKey}`];

      return (
        <div
          key={uniqueKey}
          className={styles.subcategoryWrapper}
          onMouseEnter={() =>
            handleSubcategoryMouseEnter(categoryId, uniqueKey, currentLevel)
          }
          onMouseLeave={() =>
            handleSubcategoryMouseLeave(categoryId, uniqueKey, currentLevel)
          }
        >
          <div
            className={styles.subcategoryItem}
            onClick={() =>
              handleCategoryNavigation(subcategoryWithLevel, parentHierarchy)
            }
            style={{ cursor: "pointer" }}
          >
            <div className={styles.subcategoryInfo}>
              <div className={styles.subcategoryHeader}>
                <span className={styles.subcategoryName}>
                  {subcategory.name || `Level ${currentLevel} Category`}
                </span>
                {hasChildren && (
                  <ChevronRight
                    size={14}
                    className={styles.subcategoryChevron}
                  />
                )}
              </div>
              {subcategory.productCount > 0 && (
                <span className={styles.productCount}>
                  {subcategory.productCount} items
                </span>
              )}
            </div>
          </div>

          {/* Recursive dropdown for children */}
          {hasChildren && isHovered && hoveredCategory === categoryId && (
            <div className={styles.nestedDropdown}>
              <div className={styles.nestedDropdownContent}>
                <div className={styles.nestedDropdownHeader}>
                  <h4>{subcategory.name}</h4>
                  <div
                    className={styles.viewAll}
                    onClick={() =>
                      handleCategoryNavigation(
                        subcategoryWithLevel,
                        parentHierarchy
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    View All
                  </div>
                </div>
                <div className={styles.nestedDropdownGrid}>
                  {renderDesktopDropdown(
                    subcategory.subcategories,
                    categoryId,
                    currentLevel + 1,
                    currentHierarchy,
                    subcategory
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  // UPDATED: Recursive function to render mobile menu with search query navigation
  const renderMobileSubcategories = (
    subcategories,
    categoryId,
    currentLevel = 2,
    parentPath = "",
    parentHierarchy = {}
  ) => {
    if (!subcategories || subcategories.length === 0) return null;

    return subcategories.map((subcategory, index) => {
      const hasChildren =
        subcategory.subcategories && subcategory.subcategories.length > 0;
      const uniqueKey =
        subcategory._id || `${categoryId}-${currentLevel}-${index}`;
      const currentPath = parentPath
        ? `${parentPath}-${uniqueKey}`
        : `${categoryId}-${uniqueKey}`;

      // Add level information to subcategory
      const subcategoryWithLevel = {
        ...subcategory,
        level: currentLevel,
      };

      const currentHierarchy = getCategoryHierarchy(
        subcategoryWithLevel,
        currentLevel,
        parentHierarchy
      );
      const isExpanded = expandedMobileSubcategory[currentPath];

      return (
        <div key={uniqueKey} className={styles.mobileSubcategoryWrapper}>
          <div className={styles.mobileSubcategoryItem}>
            <div
              className={styles.mobileSubcategoryLink}
              onClick={() => {
                handleCategoryNavigation(subcategoryWithLevel, parentHierarchy);
                setIsMobileMenuOpen(false);
              }}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.subcategoryIcon}>
                {subcategory.name
                  ? subcategory.name.charAt(0).toUpperCase()
                  : currentLevel}
              </div>
              <div className={styles.subcategoryInfo}>
                <span>
                  {subcategory.name || `Level ${currentLevel} Category`}
                </span>
                {subcategory.productCount > 0 && (
                  <span className={styles.productCount}>
                    {subcategory.productCount} items
                  </span>
                )}
              </div>
            </div>
            {hasChildren && (
              <button
                onClick={() => handleMobileSubcategoryToggle(currentPath)}
                className={styles.expandButton}
                aria-label={`Toggle level ${currentLevel + 1} categories`}
              >
                <ChevronDown
                  size={16}
                  className={isExpanded ? styles.rotated : ""}
                />
              </button>
            )}
          </div>

          {/* Recursive render for children */}
          {hasChildren && isExpanded && (
            <div className={getMobileSubcategoryClass(currentLevel)}>
              {renderMobileSubcategories(
                subcategory.subcategories,
                categoryId,
                currentLevel + 1,
                currentPath,
                currentHierarchy
              )}
            </div>
          )}
        </div>
      );
    });
  };

  // Helper function to get path segment for routing based on level
  const getPathForLevel = (level) => {
    const levelMap = {
      2: "subcategory",
      3: "type",
      4: "variant",
      5: "style",
    };
    return levelMap[level] || "subcategory";
  };

  // Helper function to get CSS class for mobile subcategories based on level
  const getMobileSubcategoryClass = (level) => {
    const classMap = {
      2: styles.mobileSubcategories,
      3: styles.mobileSubSubcategories,
      4: styles.mobileSubVariantCategories,
      5: styles.mobileSubStyleCategories,
    };
    return classMap[level] || styles.mobileSubcategories;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setHoveredCategory(null);
        setHoveredSubcategory({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (subcategoryHoverTimeoutRef.current) {
        clearTimeout(subcategoryHoverTimeoutRef.current);
      }
    };
  }, []);

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  if (loading) {
    return (
      <div className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav
        className={styles.navbar}
        ref={dropdownRef}
        style={{ top: `${navbarTop}px`, transition: "top 0.3s ease" }}
      >
        <div className={styles.container}>
          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            <span>Categories</span>
          </button>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav}>
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.name);
              const hasSubcategories =
                category.subcategories && category.subcategories.length > 0;
              const mainCategoryHierarchy = getCategoryHierarchy(category, 1);

              return (
                <div
                  key={category._id}
                  className={`${styles.categoryItem} ${
                    hasSubcategories ? styles.hasDropdown : ""
                  }`}
                  onMouseEnter={() => handleMouseEnter(category._id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className={styles.categoryLink}
                    onClick={() => handleCategoryClick(category)}
                    style={{ cursor: "pointer" }}
                  >
                    <Icon size={18} />
                    <span>{capitalizeFirstLetter(category.name)}</span>
                    {hasSubcategories && (
                      <ChevronDown size={16} className={styles.chevron} />
                    )}
                  </div>

                  {/* Main Dropdown - Level 2 */}
                  {hasSubcategories && hoveredCategory === category._id && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownContent}>
                        <div className={styles.dropdownHeader}>
                          <h3>{capitalizeFirstLetter(category.name)}</h3>
                          <div
                            className={styles.viewAll}
                            onClick={() => handleCategoryClick(category)}
                            style={{ cursor: "pointer" }}
                          >
                            View All
                          </div>
                        </div>
                        <div className={styles.subcategoryGrid}>
                          {renderDesktopDropdown(
                            category.subcategories,
                            category._id,
                            2,
                            mainCategoryHierarchy,
                            category
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileMenuOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={styles.mobileMenu}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileMenuHeader}>
              <h2>Categories</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={styles.closeButton}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.mobileMenuContent}>
              <div
                className={styles.mobileCategoryItem}
                onClick={() => {
                  navigate("/search");
                  setIsMobileMenuOpen(false);
                }}
                style={{ cursor: "pointer" }}
              >
                <Grid size={20} />
                <span>All Products</span>
              </div>

              {categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                const hasSubcategories =
                  category.subcategories && category.subcategories.length > 0;
                const isExpanded = expandedMobileCategory === category._id;
                const mainCategoryHierarchy = getCategoryHierarchy(category, 1);

                return (
                  <div
                    key={category._id}
                    className={styles.mobileCategoryWrapper}
                  >
                    <div className={styles.mobileCategoryItem}>
                      <div
                        className={styles.mobileCategoryLink}
                        onClick={() => handleCategoryClick(category)}
                        style={{ cursor: "pointer" }}
                      >
                        <Icon size={20} />
                        <span>{category.name}</span>
                      </div>
                      {hasSubcategories && (
                        <button
                          onClick={() =>
                            handleMobileCategoryToggle(category._id)
                          }
                          className={styles.expandButton}
                          aria-label="Toggle subcategories"
                        >
                          <ChevronDown
                            size={20}
                            className={isExpanded ? styles.rotated : ""}
                          />
                        </button>
                      )}
                    </div>

                    {/* Level 2+ Subcategories */}
                    {hasSubcategories && isExpanded && (
                      <div className={styles.mobileSubcategories}>
                        {renderMobileSubcategories(
                          category.subcategories,
                          category._id,
                          2,
                          `${category._id}`,
                          mainCategoryHierarchy
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryNavbar;
