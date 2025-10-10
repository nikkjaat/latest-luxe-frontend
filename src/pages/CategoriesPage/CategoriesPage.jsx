import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid2x2 as Grid,
  List,
  ArrowRight,
  Loader,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CategoriesPage.module.css";
import { useProducts } from "../../context/ProductContext";
import { useCategory } from "../../context/CategoryContext";

const CategoriesPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const { products, loading: productsLoading, getProducts } = useProducts();
  const { categories: contextCategories, adminGetCategories } = useCategory();
  const navigate = useNavigate();

  console.log("Categories data:", products);

  useEffect(() => {
    getProducts();
    const initializeCategories = async () => {
      setIsLoading(false);
      try {
        await adminGetCategories();
      } catch (error) {
        console.error("Failed to fetch categories from API:", error);
      }
    };

    initializeCategories();
  }, []);

  // Define overlay classes for different categories
  const overlayClasses = {
    women: styles.overlayPink,
    men: styles.overlayBlue,
    accessories: styles.overlayPurple,
    home: styles.overlayEmerald,
    electronics: styles.overlayOrange,
    beauty: styles.overlayAmber,
    sports: styles.overlayGreen,
    kids: styles.overlayCyan,
  };

  // Function to get all subcategories recursively for display
  const getAllSubcategories = (category) => {
    const subcategories = [];

    const collectSubcategories = (cat, level) => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach((subCat) => {
          subcategories.push({
            name: subCat.name,
            slug: subCat.slug,
            level: level,
            hierarchyLevel: getHierarchyLevelFromNumber(level),
          });
          collectSubcategories(subCat, level + 1);
        });
      }
    };

    collectSubcategories(category, 2);
    return subcategories;
  };

  const getHierarchyLevelFromNumber = (level) => {
    const hierarchyMap = {
      1: "main",
      2: "subcategory",
      3: "type",
      4: "variant",
      5: "style",
    };
    return hierarchyMap[level] || "main";
  };

  // Count products in each category recursively
  const countProductsInCategory = (category) => {
    if (!products || products.length === 0) return 0;

    let count = 0;
    const categorySlug = category.slug?.toLowerCase();
    const categoryId = category._id;

    // Count products in main category
    count += products.filter((product) => {
      const productCategory = product.category?.main;
      if (!productCategory) return false;

      if (typeof productCategory === "string") {
        return productCategory.toLowerCase() === categorySlug;
      }

      if (typeof productCategory === "object") {
        return (
          productCategory.slug?.toLowerCase() === categorySlug ||
          productCategory._id === categoryId
        );
      }

      return false;
    }).length;

    // Recursively count products in nested subcategories
    const countNestedProducts = (categories) => {
      if (!categories || categories.length === 0) return 0;

      let nestedCount = 0;
      categories.forEach((subCat) => {
        const subCatSlug = subCat.slug?.toLowerCase();
        const subCatId = subCat._id;

        nestedCount += products.filter((product) => {
          const productCategory = product.category?.main;
          if (!productCategory) return false;

          if (typeof productCategory === "string") {
            return productCategory.toLowerCase() === subCatSlug;
          }

          if (typeof productCategory === "object") {
            return (
              productCategory.slug?.toLowerCase() === subCatSlug ||
              productCategory._id === subCatId
            );
          }

          return false;
        }).length;

        // Recursively count in deeper levels
        if (subCat.subcategories && subCat.subcategories.length > 0) {
          nestedCount += countNestedProducts(subCat.subcategories);
        }
      });

      return nestedCount;
    };

    count += countNestedProducts(category.subcategories);
    return count;
  };

  // Process categories data
  useEffect(() => {
    if (
      (products.length > 0 || !productsLoading) &&
      contextCategories.length > 0
    ) {
      const processedCategories = contextCategories
        .filter((category) => category.isActive !== false) // Only active categories
        .map((category) => {
          const productCount = countProductsInCategory(category);
          const allSubcategories = getAllSubcategories(category);

          // Get display subcategories (first level only for preview)
          const displaySubcategories = category.subcategories
            ? category.subcategories.slice(0, 5).map((sub) => sub.name)
            : [];

          const image =
            category.image ||
            (Array.isArray(category.images) && category.images.length > 0
              ? category.images[0].url
              : "/api/placeholder/400/300");

          return {
            ...category,
            id: category._id,
            image,
            itemCount: productCount,
            totalProductCount: productCount, // Using the same count for now
            overlayClass: overlayClasses[category.slug] || styles.overlayBlue,
            displaySubcategories, // For preview display
            allSubcategories, // All nested subcategories
            level: category.level || 1,
            hierarchyLevel: category.hierarchyLevel || "main",
          };
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      setCategories(processedCategories);
      setIsLoading(false);
    }
  }, [products, productsLoading, contextCategories]);

  const handleCategoryClick = (category) => {
    // Navigate to category page with the category data
    navigate(`/category/${category.slug}`, {
      state: {
        category: category,
        productCount: category.itemCount,
      },
    });
  };

  const handleSubcategoryClick = (mainCategory, subcategory) => {
    // Navigate to subcategory page
    navigate(`/category/${mainCategory.slug}/${subcategory.slug}`, {
      state: {
        mainCategory: mainCategory,
        subcategory: subcategory,
      },
    });
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower) ||
      category.allSubcategories.some((sub) =>
        sub.name.toLowerCase().includes(searchLower)
      )
    );
  });

  if (isLoading || productsLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <Loader className={styles.spinner} />
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Shop by Category</h1>
          <p className={styles.description}>
            Explore our diverse range of carefully curated categories and find
            exactly what you're looking for
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className={styles.searchCard}>
          <div className={styles.searchControls}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.controlsRight}>
              <button className={styles.filterButton}>
                <Filter className={styles.filterIcon} />
                Filter
              </button>

              <div className={styles.viewToggle}>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`${styles.viewButton} ${
                    viewMode === "grid" ? styles.active : styles.inactive
                  }`}
                >
                  <Grid className={styles.viewIcon} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`${styles.viewButton} ${
                    viewMode === "list" ? styles.active : styles.inactive
                  }`}
                >
                  <List className={styles.viewIcon} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid/List */}
        {categories.length > 0 ? (
          viewMode === "grid" ? (
            <div className={styles.gridView}>
              {filteredCategories.map((category) => (
                <div key={category.id} className={styles.categoryCard}>
                  <div
                    className={styles.imageContainer}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className={styles.categoryImage}
                      onError={(e) => {
                        e.target.src = "/api/placeholder/400/300";
                      }}
                    />
                    <div
                      className={`${styles.overlay} ${category.overlayClass}`}
                    ></div>

                    <div className={styles.content}>
                      <h3 className={styles.categoryName}>{category.name}</h3>
                      <p className={styles.itemCount}>
                        {category.totalProductCount} items
                      </p>

                      <div className={styles.exploreButton}>
                        Explore
                        <ArrowRight className={styles.exploreIcon} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.subcategories}>
                      {category.displaySubcategories
                        .slice(0, 3)
                        .map((sub, index) => (
                          <span key={index} className={styles.subcategoryTag}>
                            {sub}
                          </span>
                        ))}
                      {category.displaySubcategories.length > 3 && (
                        <span className={styles.moreCount}>
                          +{category.displaySubcategories.length - 3} more
                        </span>
                      )}
                    </div>

                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.listView}>
              {filteredCategories.map((category) => (
                <div key={category.id} className={styles.listCard}>
                  <div
                    className={styles.listContent}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className={styles.listImageContainer}>
                      <img
                        src={category.image}
                        alt={category.name}
                        className={styles.listImage}
                        onError={(e) => {
                          e.target.src = "/api/placeholder/400/300";
                        }}
                      />
                      <div
                        className={`${styles.listOverlay} ${category.overlayClass}`}
                      ></div>
                    </div>

                    <div className={styles.listInfo}>
                      <div className={styles.listHeader}>
                        <h3 className={styles.listCategoryName}>
                          {category.name}
                        </h3>
                        <span className={styles.listItemCount}>
                          {category.totalProductCount} items
                        </span>
                      </div>
                      <p className={styles.listDescription}>
                        {category.description ||
                          `Explore our ${category.name} collection`}
                      </p>
                      <div className={styles.listSubcategories}>
                        {category.displaySubcategories.map((sub, index) => (
                          <span
                            key={index}
                            className={styles.listSubcategoryTag}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.listExploreButton}>
                      Explore
                      <ArrowRight className={styles.listExploreIcon} />
                    </div>
                  </div>

                  {/* Nested categories in list view */}
                  {category.allSubcategories.length > 0 && (
                    <div className={styles.listNestedCategories}>
                      <button
                        onClick={() => toggleCategoryExpansion(category.id)}
                        className={styles.listExpandButton}
                      >
                        <ChevronRight
                          className={`${styles.listExpandIcon} ${
                            expandedCategories[category.id]
                              ? styles.expanded
                              : ""
                          }`}
                        />
                        {category.allSubcategories.length} subcategories
                        available
                      </button>

                      {expandedCategories[category.id] && (
                        <div className={styles.listNestedList}>
                          {category.allSubcategories.map((sub, index) => (
                            <div
                              key={index}
                              className={styles.listNestedItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubcategoryClick(category, sub);
                              }}
                            >
                              <span className={styles.listNestedName}>
                                {sub.name}
                              </span>
                              <span className={styles.listNestedLevel}>
                                {sub.hierarchyLevel}
                              </span>
                              <ArrowRight className={styles.listNestedArrow} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Search className={styles.emptyIconSvg} />
            </div>
            <h3 className={styles.emptyTitle}>No categories available</h3>
            <p className={styles.emptyDescription}>
              There are no product categories to display at the moment.
            </p>
          </div>
        )}

        {categories.length > 0 && filteredCategories.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Search className={styles.emptyIconSvg} />
            </div>
            <h3 className={styles.emptyTitle}>No categories found</h3>
            <p className={styles.emptyDescription}>
              Try adjusting your search terms to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
