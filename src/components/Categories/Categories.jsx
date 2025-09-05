import React, { useEffect, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Categories.module.css";
import { useProducts } from "../../context/ProductContext";

const Categories = () => {
  const { products, getProducts, isLoading, hasFetched } = useProducts();

  useEffect(() => {
    // Only fetch products if they haven't been fetched yet
    if (!hasFetched && !isLoading) {
      getProducts();
    }
  }, [hasFetched, isLoading, getProducts]);

  // Define categories with their IDs and images
  const categories = [
    {
      id: "women",
      name: "Women's Fashion",
      image:
        "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayPink,
    },
    {
      id: "men",
      name: "Men's Collection",
      image:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayBlue,
    },
    {
      id: "accessories",
      name: "Accessories",
      image:
        "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayPurple,
    },
    {
      id: "home",
      name: "Home & Living",
      image:
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayEmerald,
    },
    {
      id: "electronics",
      name: "Electronics",
      image:
        "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayOrange,
    },
    {
      id: "beauty",
      name: "Beauty & Care",
      image:
        "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=600",
      overlayClass: styles.overlayAmber,
    },
  ];

  // Calculate item counts for each category
  const categoriesWithCounts = useMemo(() => {
    return categories.map((category) => {
      // Count products that belong to this category
      const itemCount = products.filter(
        (product) => product.category === category.id
      ).length;

      return {
        ...category,
        itemCount,
      };
    });
  }, [products]);

  // Show loading state if products are being fetched
  if (isLoading && products.length === 0) {
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
          {categoriesWithCounts.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
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
