import React, { useState } from "react";
import {
  Sparkles,
  Camera,
  RotateCcw,
  Share2,
  Download,
  Home,
  Laptop,
  Palette,
  Dumbbell,
  Baby,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import ARTryOn from "../components/ARTryOn";
import styles from "./ARShowroom.module.css";

const ARShowroom = () => {
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Products", icon: Sparkles },
    { id: "accessories", name: "Accessories", icon: Camera },
    { id: "women", name: "Women", icon: Sparkles },
    { id: "men", name: "Men", icon: RotateCcw },
    { id: "home", name: "Home", icon: Home },
    { id: "electronics", name: "Electronics", icon: Laptop },
    { id: "beauty", name: "Beauty", icon: Palette },
    { id: "sports", name: "Sports", icon: Dumbbell },
    { id: "kids", name: "Kids", icon: Baby },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Sparkles className={styles.sparklesIcon} />
            <h1 className={styles.title}>AR Showroom</h1>
          </div>
          <p className={styles.subtitle}>
            Experience the future of shopping with Augmented Reality. Try on
            products virtually before you buy.
          </p>
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <Camera className={styles.featureIcon} />
              Real-time Try-on
            </div>
            <div className={styles.featureItem}>
              <Share2 className={styles.featureIcon} />
              Share Your Look
            </div>
            <div className={styles.featureItem}>
              <Download className={styles.featureIcon} />
              Save Photos
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className={styles.categoryFilter}>
          <div className={styles.categoryButtons}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`${styles.categoryButton} ${
                  activeCategory === category.id
                    ? styles.categoryButtonActive
                    : styles.categoryButtonInactive
                }`}
              >
                <category.icon className={styles.categoryIcon} />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Layout */}
        <div className={styles.mainLayout}>
          {/* Product Selection */}
          <div>
            <div className={styles.productSection}>
              <h2 className={styles.productSectionTitle}>
                Choose a Product to Try On
              </h2>
              <div className={styles.productGrid}>
                {filteredProducts.map((product) => (
                  <div key={product.id}>
                    <div
                      className={`${styles.productCard} ${
                        selectedProduct?.id === product.id
                          ? styles.productCardActive
                          : ""
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className={styles.productImageContainer}>
                        <img
                          src={product.colorVariants[0].images[0].url}
                          alt={product.name}
                          className={styles.productImage}
                        />
                      </div>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <div className={styles.productInfo}>
                        <span className={styles.productPrice}>
                          ${product.price}
                        </span>
                        <div className={styles.arBadge}>
                          <Sparkles className={styles.arIcon} />
                          <span>AR Ready</span>
                        </div>
                      </div>
                    </div>

                    {/* AR Try-On for mobile/tablet */}
                    {selectedProduct?.id === product.id && (
                      <div className={styles.mobileAr}>
                        <ARTryOn product={selectedProduct} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className={styles.noProducts}>
                  <Sparkles className={styles.noProductsIcon} />
                  <h3 className={styles.noProductsTitle}>No Products Found</h3>
                  <p className={styles.noProductsText}>
                    No products available in this category.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AR Try-On - Only visible on XL screens and above */}
          <div className={styles.arSection}>
            {selectedProduct ? (
              <div className={styles.arContainer}>
                <ARTryOn product={selectedProduct} />
              </div>
            ) : (
              <div className={styles.arPlaceholder}>
                <div className={styles.placeholderIcon}>
                  <Sparkles className={styles.sparklesIcon} />
                </div>
                <h3 className={styles.placeholderText}>Select a Product</h3>
                <p className={styles.placeholderSubtext}>
                  Choose any product from the left to start your AR try-on
                  experience
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className={styles.featuresSection}>
          <div className={styles.featureCard}>
            <div
              className={`${styles.featureIconContainer} ${styles.featureIconContainerBlue}`}
            >
              <Camera className={styles.featureCardIcon} />
            </div>
            <h3 className={styles.featureCardTitle}>Real-time Preview</h3>
            <p className={styles.featureCardText}>
              See how products look on you in real-time with advanced AR
              technology
            </p>
          </div>
          <div className={styles.featureCard}>
            <div
              className={`${styles.featureIconContainer} ${styles.featureIconContainerGreen}`}
            >
              <Share2 className={styles.featureCardIcon} />
            </div>
            <h3 className={styles.featureCardTitle}>Share & Get Feedback</h3>
            <p className={styles.featureCardText}>
              Share your virtual try-on photos with friends and get their
              opinions
            </p>
          </div>
          <div className={styles.featureCard}>
            <div
              className={`${styles.featureIconContainer} ${styles.featureIconContainerPurple}`}
            >
              <Download className={styles.featureCardIcon} />
            </div>
            <h3 className={styles.featureCardTitle}>Save Your Looks</h3>
            <p className={styles.featureCardText}>
              Download and save your favorite try-on photos for future reference
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARShowroom;
