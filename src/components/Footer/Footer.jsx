import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brandSection}>
            <Link to="/" className={styles.logo}>LUXE</Link>
            <p className={styles.brandDescription}>
              Your premier destination for luxury shopping. Discover curated collections of premium products that define elegance and sophistication.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={`${styles.socialLink} ${styles.facebook}`}>
                <Facebook className={styles.socialIcon} />
              </a>
              <a href="#" className={`${styles.socialLink} ${styles.twitter}`}>
                <Twitter className={styles.socialIcon} />
              </a>
              <a href="#" className={`${styles.socialLink} ${styles.instagram}`}>
                <Instagram className={styles.socialIcon} />
              </a>
              <a href="#" className={`${styles.socialLink} ${styles.youtube}`}>
                <Youtube className={styles.socialIcon} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link to="/" className={styles.link}>Home</Link>
              </li>
              <li className={styles.linkItem}>
                <Link to="/shop" className={styles.link}>Shop</Link>
              </li>
              <li className={styles.linkItem}>
                <Link to="/categories" className={styles.link}>Categories</Link>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>About Us</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Contact</a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Customer Service</h3>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Help Center</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Shipping Info</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Returns</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Size Guide</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Track Order</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact Info</h3>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <MapPin className={styles.contactIcon} />
                <span className={styles.contactText}>123 Luxury Avenue, Fashion District, NY 10001</span>
              </div>
              <div className={styles.contactItem}>
                <Phone className={styles.contactIcon} />
                <span className={styles.contactText}>+1 (555) 123-4567</span>
              </div>
              <div className={styles.contactItem}>
                <Mail className={styles.contactIcon} />
                <span className={styles.contactText}>support@luxe.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.divider}>
          <div className={styles.bottomSection}>
            <p className={styles.copyright}>
              © 2025 LUXE. All rights reserved.
            </p>
            <div className={styles.legalLinks}>
              <a href="#" className={styles.legalLink}>Privacy Policy</a>
              <a href="#" className={styles.legalLink}>Terms of Service</a>
              <a href="#" className={styles.legalLink}>Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;