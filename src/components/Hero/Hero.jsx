import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.backgroundPattern}></div>
      
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Content */}
          <div className={styles.content}>
            <div className={styles.badge}>
              <Sparkles className={styles.badgeIcon} />
              <span className={styles.badgeText}>Premium Collection</span>
            </div>
            
            <h1 className={styles.title}>
              Discover
              <span className={styles.titleGradient}>Luxury</span>
              Like Never Before
            </h1>
            
            <p className={styles.description}>
              Curated collections of premium products that define elegance and sophistication. 
              Experience shopping reimagined with our exclusive luxury marketplace.
            </p>
            
            <div className={styles.buttonGroup}>
              <Link to="/shop" className={styles.primaryButton}>
                Shop Collection
                <ArrowRight className={styles.primaryButtonIcon} />
              </Link>
              
              <Link to="/categories" className={styles.secondaryButton}>
                Browse Categories
              </Link>
            </div>
            
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>10K+</div>
                <div className={styles.statLabel}>Happy Customers</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>500+</div>
                <div className={styles.statLabel}>Premium Products</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>4.9★</div>
                <div className={styles.statLabel}>Customer Rating</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className={styles.imageContainer}>
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Luxury Fashion"
                className={styles.heroImage}
              />
              <div className={styles.shippingBadge}>
                <div className={styles.shippingTitle}>Free Shipping</div>
                <div className={styles.shippingText}>On orders over $100</div>
              </div>
              <div className={styles.newBadge}>
                <span className={styles.newBadgeText}>NEW</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className={styles.floatingElements}>
        <div className={styles.floatingElement1}></div>
        <div className={styles.floatingElement2}></div>
        <div className={styles.floatingElement3}></div>
      </div>
    </section>
  );
};

export default Hero;