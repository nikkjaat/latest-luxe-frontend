import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Categories.module.css";
import { useProducts } from "../../context/ProductContext";
import { useCategory } from "../../context/CategoryContext";

const Categories = () => {
  const { products, getProducts, isLoading, hasFetched } = useProducts();
  const { categories: contextCategories, adminGetCategories } = useCategory();
  const [localCategories, setLocalCategories] = useState([]);
  const navigate = useNavigate();

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

  // Default subcategories for fallback (same as CategoriesPage)
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

  const handleCategoryClick = (category) => {
    navigate(`/subcategory/${category.slug}`);
  };

  // Calculate item counts for each category - USE SAME LOGIC AS CategoriesPage
  const categoriesWithCounts = useMemo(() => {
    // Use categories from context if available, otherwise use local fallback
    const categoriesToUse =
      contextCategories && contextCategories.length > 0
        ? contextCategories
        : localCategories;

    return categoriesToUse.map((category) => {
      const slug = category.slug?.toLowerCase();

      // Count products that belong to this category - USE EXACT MATCHING LIKE CategoriesPage
      const itemCount = products.filter((product) => {
        const productCategory = product.category?.main;

        if (!productCategory) return false;

        if (typeof productCategory === "string") {
          return productCategory.toLowerCase() === slug;
        }

        if (typeof productCategory === "object") {
          return productCategory.slug?.toLowerCase() === slug;
        }

        return false;
      }).length;

      // Get image URL - SAME LOGIC AS CategoriesPage
      const image =
        category.image ||
        (Array.isArray(category.images) && category.images.length > 0
          ? category.images[0].url
          : "");

      return {
        ...category,
        id: category.slug || category._id,
        image,
        itemCount,
        overlayClass: overlayClasses[category.slug] || styles.overlayBlue,
        subcategories:
          category.subcategories || defaultSubcategories[category.slug] || [],
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
          subcategories: defaultSubcategories[cat.slug] || [],
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
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={styles.categoryCard}
              style={{ cursor: "pointer" }}
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
            </div>
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
