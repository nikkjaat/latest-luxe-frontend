import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Categories.module.css";
import { useProducts } from "../../context/ProductContext";
import { useCategory } from "../../context/CategoryContext";

const Categories = () => {
  const { products, getProducts, isLoading, hasFetched } = useProducts();
  const { categories: contextCategories, adminGetCategories } = useCategory();
  const [localCategories, setLocalCategories] = useState([]);

  useEffect(() => {
    // Only fetch products if they haven't been fetched yet
    if (!hasFetched && !isLoading) {
      getProducts();
    }

    // Fetch categories from backend and set fallback
    const fetchCategoriesWithFallback = async () => {
      try {
        await adminGetCategories();
      } catch (error) {
        console.error("Failed to fetch categories, using fallback:", error);
        // Set fallback categories if API fails
        setLocalCategories(getDefaultCategories());
      }
    };

    fetchCategoriesWithFallback();
  }, [hasFetched, isLoading, getProducts, adminGetCategories]);

  // Default categories as fallback
  const getDefaultCategories = () => [
    {
      _id: "1",
      id: "women",
      name: "Women's Fashion",
      slug: "women",
      description: "Latest trends in women's clothing and accessories",
      image:
        "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600",
      isActive: true,
      productCount: 0,
      sortOrder: 1,
    },
    {
      _id: "2",
      id: "men",
      name: "Men's Collection",
      slug: "men",
      description: "Premium men's fashion and accessories",
      image:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600",
      isActive: true,
      productCount: 0,
      sortOrder: 2,
    },
    {
      _id: "3",
      id: "accessories",
      name: "Accessories",
      slug: "accessories",
      description: "Complete your look with luxury accessories",
      image:
        "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=600",
      isActive: true,
      productCount: 0,
      sortOrder: 3,
    },
    {
      _id: "4",
      id: "home",
      name: "Home & Living",
      slug: "home",
      description: "Transform your space with elegant home decor",
      image:
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
      isActive: true,
      productCount: 0,
      sortOrder: 4,
    },
    {
      _id: "5",
      id: "electronics",
      name: "Electronics",
      slug: "electronics",
      description: "Latest technology and gadgets",
      image:
        "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600",
      isActive: true,
      productCount: 0,
      sortOrder: 5,
    },
    {
      _id: "6",
      id: "beauty",
      name: "Beauty & Care",
      slug: "beauty",
      description: "Premium beauty products and personal care",
      image:
        "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=600",
      isActive: true,
      productCount: 0,
      sortOrder: 6,
    },
  ];

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

  // Calculate item counts for each category
  const categoriesWithCounts = useMemo(() => {
    // Use categories from context if available, otherwise use local fallback
    const categoriesToUse =
      contextCategories && contextCategories.length > 0
        ? contextCategories
        : localCategories;

    return categoriesToUse.map((category) => {
      // Count products that belong to this category
      const itemCount = products.filter((product) => {
        // Check if product category matches category slug or ID
        const productCategory = (product.category || "").toLowerCase().trim();
        const categorySlug = (category.slug || "").toLowerCase().trim();
        const categoryName = (category.name || "").toLowerCase().trim();

        return (
          productCategory === categorySlug ||
          productCategory === categoryName ||
          productCategory.includes(categorySlug) ||
          categorySlug.includes(productCategory)
        );
      }).length;

      return {
        ...category,
        id: category.slug || category._id,
        itemCount,
        overlayClass: overlayClasses[category.slug] || styles.overlayBlue,
      };
    });
  }, [products, contextCategories, localCategories]);

  // Show loading state if products are being fetched
  if (isLoading && products.length === 0 && categoriesWithCounts.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Shop by Category</h2>
            <p className={styles.description}>
              Explore our diverse range of carefully curated categories
            </p>
          </div>
          <div className={styles.loading}>Loading categories...</div>
        </div>
      </section>
    );
  }

  // Ensure we always have categories to display
  const displayCategories =
    categoriesWithCounts.length > 0
      ? categoriesWithCounts
      : getDefaultCategories().map((cat) => ({
          ...cat,
          itemCount: 0,
          overlayClass: overlayClasses[cat.slug] || styles.overlayBlue,
        }));

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Shop by Category</h2>
          <p className={styles.description}>
            Explore our diverse range of carefully curated categories
          </p>
        </div>

        <div className={styles.grid}>
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`} // Use the actual slug from the database
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
                  <p className={styles.itemCount}>{category.itemCount} items</p>

                  <div className={styles.exploreButton}>
                    <span>Explore</span>
                    <ArrowRight className={styles.exploreIcon} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.viewAllContainer}>
          <Link to="/categories" className={styles.viewAllButton}>
            View All Categories
            <ArrowRight className={styles.viewAllIcon} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
