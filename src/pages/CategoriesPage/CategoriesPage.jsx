import React, { useState, useEffect } from "react";
import { Search, Filter, Grid, List, ArrowRight, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CategoriesPage.module.css";
import { useProducts } from "../../context/ProductContext";

const CategoriesPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { products, loading: productsLoading, getProducts } = useProducts();
  const navigate = useNavigate();

  useEffect(() => {
    getProducts();
  }, []);

  // Define all possible categories with their properties
  const allCategories = [
    {
      id: "women",
      name: "Women's Fashion",
      image:
        "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayPink,
      description:
        "Discover the latest trends in women's clothing, from casual wear to elegant evening dresses.",
      subcategories: ["Dresses", "Tops", "Bottoms", "Outerwear", "Activewear"],
    },
    {
      id: "men",
      name: "Men's Collection",
      image:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayBlue,
      description:
        "Premium men's fashion featuring sophisticated styles for the modern gentleman.",
      subcategories: ["Shirts", "Suits", "Casual Wear", "Accessories", "Shoes"],
    },
    {
      id: "accessories",
      name: "Accessories",
      image:
        "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayPurple,
      description:
        "Complete your look with our curated selection of luxury accessories.",
      subcategories: ["Jewelry", "Bags", "Watches", "Sunglasses", "Scarves"],
    },
    {
      id: "home",
      name: "Home & Living",
      image:
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayEmerald,
      description:
        "Transform your space with our elegant home decor and living essentials.",
      subcategories: ["Furniture", "Decor", "Lighting", "Textiles", "Kitchen"],
    },
    {
      id: "electronics",
      name: "Electronics",
      image:
        "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayOrange,
      description:
        "Latest technology and gadgets to enhance your digital lifestyle.",
      subcategories: [
        "Smartphones",
        "Laptops",
        "Audio",
        "Smart Home",
        "Gaming",
      ],
    },
    {
      id: "beauty",
      name: "Beauty & Care",
      image:
        "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayAmber,
      description:
        "Premium beauty products and personal care essentials for your daily routine.",
      subcategories: [
        "Skincare",
        "Makeup",
        "Fragrance",
        "Hair Care",
        "Wellness",
      ],
    },
    {
      id: "sports",
      name: "Sports & Fitness",
      image:
        "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayGreen,
      description:
        "High-performance gear and apparel for your active lifestyle.",
      subcategories: [
        "Activewear",
        "Equipment",
        "Footwear",
        "Outdoor",
        "Fitness",
      ],
    },
    {
      id: "kids",
      name: "Kids & Baby",
      image:
        "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayCyan,
      description:
        "Safe, comfortable, and stylish products for children of all ages.",
      subcategories: ["Baby Clothes", "Toys", "Shoes", "Accessories", "Gear"],
    },
  ];

  const getProductByCategory = (id, name, itemCount) => {
    const keyword = id.split("-")[0];
    const filterCategory = products.filter(
      (product) => product.category === keyword
    );
    navigate(`/category/${id}`, {
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
    if (products.length > 0 || !productsLoading) {
      const categoriesWithCounts = allCategories.map((category) => {
        // Extract the first part of the category ID to match with backend
        const categoryKeyword = category.id.split("-")[0];

        // Count products that match this category
        const productCount = products.filter((product) => {
          // Handle different category field structures
          const productCategory = product.category;
          if (!productCategory) return false;

          // Check if category matches by the first part of the ID
          if (typeof productCategory === "string") {
            return (
              productCategory.toLowerCase() === categoryKeyword.toLowerCase()
            );
          } else if (typeof productCategory === "object") {
            return (
              productCategory._id === categoryKeyword ||
              productCategory.name?.toLowerCase() ===
                categoryKeyword.toLowerCase() ||
              productCategory.slug === categoryKeyword
            );
          }
          return false;
        }).length;

        return {
          ...category,
          itemCount: productCount,
        };
      });

      setCategories(categoriesWithCounts);
      setIsLoading(false);
    }
  }, [products, productsLoading]);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some((sub) =>
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
                      {category.subcategories.slice(0, 3).map((sub, index) => (
                        <span key={index} className={styles.subcategoryTag}>
                          {sub}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className={styles.moreCount}>
                          +{category.subcategories.length - 3} more
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
                        {category.subcategories.map((sub, index) => (
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
