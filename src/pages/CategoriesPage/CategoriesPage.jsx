import React, { useState, useEffect } from "react";
import { Search, Filter, Grid, List, ArrowRight, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CategoriesPage.module.css";
import { useProducts } from "../../context/ProductContext";
import { useCategory } from "../../context/CategoryContext";

const CategoriesPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { products, loading: productsLoading, getProducts } = useProducts();
  const { categories: contextCategories, adminGetCategories } = useCategory();
  const navigate = useNavigate();

  useEffect(() => {
    getProducts();
    // Initialize with default categories and then fetch from API
    const initializeCategories = async () => {
      // Set default categories immediately
      setIsLoading(false);

      // Then try to fetch from API
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

  // Default subcategories for fallback
  const defaultSubcategories = {
    women: ["Dresses", "Tops", "Bottoms", "Outerwear", "Activewear"],
    men: ["Shirts", "Suits", "Casual Wear", "Accessories", "Shoes"],
    accessories: ["Jewelry", "Bags", "Watches", "Sunglasses", "Scarves"],
    home: ["Furniture", "Decor", "Lighting", "Textiles", "Kitchen"],
    electronics: ["Smartphones", "Laptops", "Audio", "Smart Home", "Gaming"],
    beauty: ["Skincare", "Makeup", "Fragrance", "Hair Care", "Wellness"],
    sports: ["Activewear", "Equipment", "Footwear", "Outdoor", "Fitness"],
    kids: ["Baby Clothes", "Toys", "Shoes", "Accessories", "Gear"],
  };

  const getProductByCategory = (id, name, itemCount, category) => {
    const keyword =
      category.slug?.toLowerCase() || category.name?.toLowerCase();

    const filterCategory = products.filter((product) => {
      const productCat = product.category.main;
      if (!productCat) return false;

      if (typeof productCat === "string") {
        return productCat.toLowerCase() === keyword;
      }

      if (typeof productCat === "object") {
        return (
          productCat.slug?.toLowerCase() === keyword ||
          productCat.name?.toLowerCase() === keyword
        );
      }

      return false;
    });
    // console.log(filterCategory);

    navigate(`/category/${category.slug}`, {
      state: {
        keyword,
        filterCategory,
        name,
        itemCount,
      },
    });
  };

  // Count products in each category
  useEffect(() => {
    if (
      (products.length > 0 || !productsLoading) &&
      (contextCategories.length > 0 || categories.length > 0)
    ) {
      const categoriesToProcess =
        contextCategories.length > 0 ? contextCategories : categories;

      const categoriesWithCounts = categoriesToProcess.map((category) => {
        const slug = category.slug?.toLowerCase();

        const productCount = products.filter((product) => {
          const productCategory = product.category.main;

          if (!productCategory) return false;

          if (typeof productCategory === "string") {
            return productCategory.toLowerCase() === slug;
          }

          if (typeof productCategory === "object") {
            return productCategory.slug?.toLowerCase() === slug;
          }

          return false;
        }).length;

        const image =
          category.image ||
          (Array.isArray(category.images) && category.images.length > 0
            ? category.images[0].url
            : "");

        return {
          ...category,
          id: category.slug || category._id,
          image,
          itemCount: productCount,
          overlayClass: overlayClasses[category.slug] || styles.overlayBlue,
          subcategories:
            category.subcategories || defaultSubcategories[category.slug] || [],
        };
      });

      setCategories(categoriesWithCounts);
      setIsLoading(false);
    }
  }, [products, productsLoading, contextCategories]);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.subcategories || []).some((sub) =>
        sub.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

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
                <div
                  onClick={() => {
                    getProductByCategory(
                      category.id,
                      category.name,
                      category.itemCount,
                      category
                    );
                  }}
                  key={category.id}
                  className={styles.categoryCard}
                >
                  <div className={styles.imageContainer}>
                    <img
                      src={category.image}
                      alt={category.name}
                      className={styles.categoryImage}
                    />
                    <div
                      className={`${styles.overlay} ${category.overlayClass}`}
                    ></div>

                    <div className={styles.content}>
                      <h3 className={styles.categoryName}>{category.name}</h3>
                      <p className={styles.itemCount}>
                        {category.itemCount} items
                      </p>

                      <div className={styles.exploreButton}>
                        Explore
                        <ArrowRight className={styles.exploreIcon} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.subcategories}>
                      {(category.subcategories || [])
                        .slice(0, 3)
                        .map((sub, index) => (
                          <span key={index} className={styles.subcategoryTag}>
                            {sub}
                          </span>
                        ))}
                      {(category.subcategories || []).length > 3 && (
                        <span className={styles.moreCount}>
                          +{(category.subcategories || []).length - 3} more
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
                <div
                  key={category.id}
                  className={styles.listCard}
                  onClick={() => {
                    getProductByCategory(
                      category.id,
                      category.name,
                      category.itemCount,
                      category
                    );
                  }}
                >
                  <div className={styles.listContent}>
                    <div className={styles.listImageContainer}>
                      <img
                        src={category.image}
                        alt={category.name}
                        className={styles.listImage}
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
                          {category.itemCount} items
                        </span>
                      </div>
                      <p className={styles.listDescription}>
                        {category.description}
                      </p>
                      <div className={styles.listSubcategories}>
                        {(category.subcategories || []).map((sub, index) => (
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
