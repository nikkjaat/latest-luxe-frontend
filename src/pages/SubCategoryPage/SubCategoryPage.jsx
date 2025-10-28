import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Home,
  ChevronRight,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Star,
  Heart,
  ShoppingCart,
  TrendingUp,
  Eye,
  Grid,
  Filter,
} from "lucide-react";
import styles from "./SubCategoryPage.module.css";
import { useProducts } from "../../context/ProductContext";
import { useCategory } from "../../context/CategoryContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

const SubCategoryPage = () => {
  const { categoryId, subcategoryId, typeId, variantId, styleId } = useParams();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategory();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  console.log(products);

  // Debug logging
  // useEffect(() => {
  //   console.log("Current URL Params:", {
  //     categoryId,
  //     subcategoryId,
  //     typeId,
  //     variantId,
  //     styleId,
  //   });
  //   console.log("All Categories:", categories);
  //   console.log("All Products:", products);
  // }, [
  //   categoryId,
  //   subcategoryId,
  //   typeId,
  //   variantId,
  //   styleId,
  //   categories,
  //   products,
  // ]);

  const getLevelName = (level) => {
    const levelMap = {
      1: "main",
      2: "subcategory",
      3: "type",
      4: "variant",
      5: "style",
    };
    return levelMap[level] || "category";
  };

  // Find current category and subcategory hierarchy
  const {
    currentCategory,
    currentSubcategory,
    breadcrumbPath,
    targetCategory,
  } = useMemo(() => {
    if (!categories.length) return {};

    // Find main category
    const mainCategory = categories.find(
      (cat) => cat.slug === categoryId || cat._id === categoryId
    );
    if (!mainCategory) return {};

    let targetCategory = mainCategory;
    const breadcrumb = [
      { name: mainCategory.name, slug: mainCategory.slug, level: "main" },
    ];

    // Recursive function to find subcategory by ID/slug
    const findSubcategory = (categories, targetId, level = 2) => {
      for (const category of categories) {
        if (category.slug === targetId || category._id === targetId) {
          return { category, level };
        }
        if (category.subcategories && category.subcategories.length > 0) {
          const found = findSubcategory(
            category.subcategories,
            targetId,
            level + 1
          );
          if (found) {
            breadcrumb.push({
              name: category.name,
              slug: category.slug,
              level: getLevelName(level),
            });
            return found;
          }
        }
      }
      return null;
    };

    // Determine current level based on URL params
    let currentSubcat = null;

    if (styleId) {
      const found = findSubcategory(mainCategory.subcategories, styleId, 2);
      if (found) {
        currentSubcat = found.category;
        targetCategory = found.category;
        breadcrumb.push({
          name: currentSubcat.name,
          slug: currentSubcat.slug,
          level: "style",
        });
      }
    } else if (variantId) {
      const found = findSubcategory(mainCategory.subcategories, variantId, 2);
      if (found) {
        currentSubcat = found.category;
        targetCategory = found.category;
        breadcrumb.push({
          name: currentSubcat.name,
          slug: currentSubcat.slug,
          level: "variant",
        });
      }
    } else if (typeId) {
      const found = findSubcategory(mainCategory.subcategories, typeId, 2);
      if (found) {
        currentSubcat = found.category;
        targetCategory = found.category;
        breadcrumb.push({
          name: currentSubcat.name,
          slug: currentSubcat.slug,
          level: "type",
        });
      }
    } else if (subcategoryId) {
      const found = findSubcategory(
        mainCategory.subcategories,
        subcategoryId,
        2
      );
      if (found) {
        currentSubcat = found.category;
        targetCategory = found.category;
        breadcrumb.push({
          name: currentSubcat.name,
          slug: currentSubcat.slug,
          level: "subcategory",
        });
      }
    }

    return {
      currentCategory: mainCategory,
      currentSubcategory: currentSubcat,
      targetCategory: targetCategory,
      breadcrumbPath: breadcrumb,
    };
  }, [categories, categoryId, subcategoryId, typeId, variantId, styleId]);

  // Get all subcategories for current level
  const availableSubcategories = useMemo(() => {
    if (!currentSubcategory) {
      // At main category level, show level 2 subcategories
      return currentCategory?.subcategories || [];
    } else {
      // At subcategory level, show next level subcategories
      return currentSubcategory.subcategories || [];
    }
  }, [currentCategory, currentSubcategory]);

  // NEW: Improved product filtering logic
  const categoryProducts = useMemo(() => {
    if (!targetCategory || products.length === 0) {
      console.log("No target category or products");
      return [];
    }

    console.log("Target Category:", targetCategory);
    console.log("Filtering products for category:", targetCategory.name);

    // Get all category IDs to include (current category + all nested subcategories)
    const categoryIdsToInclude = [targetCategory._id];

    // Recursively collect all subcategory IDs
    const collectCategoryIds = (categories) => {
      if (!categories || categories.length === 0) return;
      categories.forEach((cat) => {
        categoryIdsToInclude.push(cat._id);
        if (cat.subcategories && cat.subcategories.length > 0) {
          collectCategoryIds(cat.subcategories);
        }
      });
    };

    collectCategoryIds(targetCategory.subcategories);

    console.log("Category IDs to include:", categoryIdsToInclude);

    // Filter products
    const filteredProducts = products.filter((product) => {
      const productCategory = product.category?.main;

      if (!productCategory) {
        console.log("Product has no category:", product.name);
        return false;
      }

      // Handle string category (slug)
      if (typeof productCategory === "string") {
        const matches =
          productCategory.toLowerCase() === targetCategory.slug.toLowerCase();
        if (matches) {
          console.log("String category match:", product.name, productCategory);
        }
        return matches;
      }

      // Handle object category
      if (typeof productCategory === "object") {
        const matches =
          categoryIdsToInclude.includes(productCategory._id) ||
          productCategory.slug?.toLowerCase() ===
            targetCategory.slug.toLowerCase();

        if (matches) {
          console.log(
            "Object category match:",
            product.name,
            productCategory.name || productCategory.slug
          );
        }
        return matches;
      }

      return false;
    });

    console.log("Filtered products count:", filteredProducts.length);
    console.log("Filtered products:", filteredProducts);
    return filteredProducts;
  }, [products, targetCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = [...categoryProducts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Sort products
    if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "popular") {
      // Sort by popularity (you might want to use actual popularity data)
      filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    return filtered;
  }, [categoryProducts, searchTerm, sortBy]);

  const handleWishlistToggle = (product) => {
    const productId = product._id || product.id;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image,
      quantity: 1,
    });
  };

  const handleSubcategoryClick = (subcategory) => {
    // Navigate to the next level
    const currentLevel = currentSubcategory
      ? getLevelFromHierarchy(currentSubcategory.hierarchyLevel) + 1
      : 2;
    const levelPath = getLevelPath(currentLevel);

    navigate(`/category/${categoryId}/${levelPath}/${subcategory.slug}`);
  };

  const getLevelFromHierarchy = (hierarchyLevel) => {
    const levelMap = {
      main: 1,
      subcategory: 2,
      type: 3,
      variant: 4,
      style: 5,
    };
    return levelMap[hierarchyLevel] || 1;
  };

  const getLevelPath = (level) => {
    const levelMap = {
      2: "subcategory",
      3: "type",
      4: "variant",
      5: "style",
    };
    return levelMap[level] || "subcategory";
  };

  const getNextLevelName = () => {
    if (!currentSubcategory) return "Subcategory";
    const currentLevel = getLevelFromHierarchy(
      currentSubcategory.hierarchyLevel
    );
    const nextLevel = currentLevel + 1;
    return (
      getLevelPath(nextLevel).charAt(0).toUpperCase() +
      getLevelPath(nextLevel).slice(1)
    );
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <h2>Category not found</h2>
            <Link to="/categories" className={styles.backLink}>
              Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>
            <Home className={styles.breadcrumbIcon} />
            Home
          </Link>
          <ChevronRight className={styles.breadcrumbSeparator} />
          <Link to="/categories" className={styles.breadcrumbLink}>
            Categories
          </Link>
          {breadcrumbPath.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className={styles.breadcrumbSeparator} />
              {index === breadcrumbPath.length - 1 ? (
                <span className={styles.breadcrumbCurrent}>{item.name}</span>
              ) : (
                <Link
                  to={`/category/${item.slug}`}
                  className={styles.breadcrumbLink}
                >
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              {targetCategory?.name || currentCategory.name}
            </h1>
            <p className={styles.description}>
              {targetCategory?.description || currentCategory.description}
            </p>
            <div className={styles.stats}>
              <span className={styles.statItem}>
                {categoryProducts.length} Products
              </span>
              <span className={styles.statDivider}>•</span>
              <span className={styles.statItem}>
                {availableSubcategories.length} {getNextLevelName()}s
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder={`Search in ${
                targetCategory?.name || currentCategory.name
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterControls}>
            <button
              className={styles.filterButton}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="latest">Latest Products</option>
            </select>
          </div>
        </div>

        {/* Subcategories Section */}
        {availableSubcategories.length > 0 && (
          <div className={styles.subcategoriesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Explore {getNextLevelName()}s
              </h2>
              <p className={styles.sectionDescription}>
                Browse our curated {getNextLevelName().toLowerCase()}{" "}
                collections
              </p>
            </div>

            <div className={styles.subcategoriesGrid}>
              {availableSubcategories.map((subcategory, index) => {
                // Count products in this subcategory and its children
                const subcategoryProductCount = categoryProducts.filter(
                  (product) => {
                    const productCategory = product.category?.main;
                    if (typeof productCategory === "object") {
                      return productCategory._id === subcategory._id;
                    }
                    return false;
                  }
                ).length;

                return (
                  <div
                    key={subcategory._id}
                    className={styles.subcategoryCard}
                    onClick={() => handleSubcategoryClick(subcategory)}
                  >
                    <div className={styles.subcategoryIcon}>
                      <Grid />
                    </div>
                    <h3 className={styles.subcategoryName}>
                      {subcategory.name}
                    </h3>
                    <p className={styles.subcategoryCount}>
                      {subcategoryProductCount} items
                    </p>
                    <ArrowRight className={styles.subcategoryArrow} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className={styles.productsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                {targetCategory?.name || currentCategory.name} Products
              </h2>
              <p className={styles.sectionDescription}>
                {filteredProducts.length} products found
              </p>
            </div>
            {categoryProducts.length > 8 && (
              <Link
                to={`/category/${categoryId}`}
                className={styles.seeAllButton}
              >
                See All Products
                <ArrowRight className={styles.seeAllIcon} />
              </Link>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => {
                const productId = product._id || product.id;
                const inWishlist = isInWishlist(productId);

                return (
                  <div key={productId} className={styles.productCard}>
                    <div className={styles.productImageContainer}>
                      <img
                        src={
                          product.colorVariants[0].images?.[0]?.url ||
                          product.image ||
                          "https://via.placeholder.com/300"
                        }
                        alt={product.name}
                        className={styles.productImage}
                        onClick={() => navigate(`/product/${productId}`)}
                      />
                      {product.badge && (
                        <div className={styles.badge}>{product.badge}</div>
                      )}
                      <button
                        className={`${styles.wishlistButton} ${
                          inWishlist ? styles.inWishlist : ""
                        }`}
                        onClick={() => handleWishlistToggle(product)}
                      >
                        <Heart className={styles.wishlistIcon} />
                      </button>
                      <button
                        className={styles.quickViewButton}
                        onClick={() => navigate(`/product/${productId}`)}
                      >
                        <Eye className={styles.quickViewIcon} />
                      </button>
                    </div>

                    <div className={styles.productInfo}>
                      <h3
                        className={styles.productName}
                        onClick={() => navigate(`/product/${productId}`)}
                      >
                        {product.name}
                      </h3>
                      <p className={styles.productDescription}>
                        {product.description?.slice(0, 60)}
                        {product.description?.length > 60 ? "..." : ""}
                      </p>

                      <div className={styles.productMeta}>
                        {product.rating && (
                          <div className={styles.rating}>
                            <Star className={styles.starIcon} />
                            {/* <span>{product?.rating?.toFixed(1) || "4.9"}</span> */}
                          </div>
                        )}
                        <div className={styles.price}>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className={styles.originalPrice}>
                                ${product.originalPrice}
                              </span>
                            )}
                          <span className={styles.currentPrice}>
                            ${product.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Search />
              </div>
              <h3>No products found</h3>
              <p>
                {categoryProducts.length === 0
                  ? "No products are assigned to this category yet."
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubCategoryPage;
