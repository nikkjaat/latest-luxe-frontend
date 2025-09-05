import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  LogOut,
  Settings,
  Store,
  Sparkles,
  Users,
  Phone,
  Info,
  Bell,
  FileText,
  TrendingUp,
  Package,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useNotifications } from "../../context/NotificationContext";
import SmartSearch from "../SmartSearch";
import styles from "./Header.module.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSearchBarBelow, setShowSearchBarBelow] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { getUserNotifications, getUnreadCount } = useNotifications();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchBarRef = useRef(null);

  // Get notifications and unread count
  useEffect(() => {
    if (user) {
      const userId =
        user?.role === "admin" ? "admin" : user?.vendorId || "customer";
      setUnreadCount(getUnreadCount(userId));
    }
  }, [user, getUnreadCount]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }

      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowSearchBarBelow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle escape key for search bar
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showSearchBarBelow) {
        setShowSearchBarBelow(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showSearchBarBelow]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    // Navigate immediately since logout is now instant
    setTimeout(() => navigate("/"), 0);
  };

  const handleSearch = (query) => {
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setShowSearchBarBelow(false);
  };

  const handleMobileNavClick = (path) => {
    setIsMenuOpen(false);
    if (path) {
      navigate(path);
    }
  };

  const handleUserMenuClick = (path) => {
    setIsUserMenuOpen(false);
    if (path) {
      navigate(path);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "vendor") return "/vendor/dashboard";
    return "/profile";
  };

  const getDashboardLabel = () => {
    if (user?.role === "admin") return "Admin Dashboard";
    if (user?.role === "vendor") return "Vendor Dashboard";
    return "Profile";
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Main Navigation Row */}
          <div className={styles.mainNav}>
            {/* Logo */}
            <div className={styles.logo}>
              <Link to="/" className={styles.logoLink}>
                <span className={styles.logoText}>LUXE</span>
              </Link>
            </div>

            <div className={styles.navAndActions}>
              {" "}
              {/* Desktop Navigation - Only show on large screens */}
              <nav className={styles.desktopNav}>
                <Link to="/" className={styles.navLink}>
                  <span>Home</span>
                </Link>
                <Link to="/shop" className={styles.navLink}>
                  <span>Shop</span>
                </Link>
                <Link to="/categories" className={styles.navLink}>
                  <span>Categories</span>
                </Link>
              </nav>
              {/* Always Visible Buttons - AR Showroom and Social */}
              <div className={styles.alwaysVisibleButtons}>
                <Link to="/ar-showroom" className={styles.alwaysVisibleButton}>
                  <Sparkles className="h-4 w-4" />
                  <span className={styles.alwaysVisibleButtonText}>
                    AR Showroom
                  </span>
                </Link>
                <Link to="/social" className={styles.alwaysVisibleButton}>
                  <Users className="h-4 w-4" />
                  <span className={styles.alwaysVisibleButtonText}>Social</span>
                </Link>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className={styles.desktopActions}>
              {/* Search Button - Shows on laptop/tablet */}
              <button
                onClick={() => setShowSearchBarBelow(!showSearchBarBelow)}
                className={styles.searchButton}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist - Show on all screens for users */}
              {user?.role === "customer" && (
                <Link
                  to="/wishlist"
                  className={`${styles.actionButton} ${styles.hideOnSmallScreen}`}
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <span className={`${styles.badge} ${styles.wishlistBadge}`}>
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart - Show on all screens for users */}
              {user?.role === "customer" && (
                <Link
                  to="/cart"
                  className={styles.actionButton}
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className={`${styles.badge} ${styles.cartBadge}`}>
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {/* User Menu */}
              {user ? (
                <div className={styles.userMenu} ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={styles.userButton}
                    aria-label="User Menu"
                  >
                    <div className={styles.avatarContainer}>
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className={styles.avatar}
                      />
                      {unreadCount > 0 && (
                        <span className={styles.notificationDot}></span>
                      )}
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className={styles.dropdownAvatar}
                        />
                        <div className={styles.dropdownUserInfo}>
                          <span className={styles.dropdownUserName}>
                            {user.name}
                          </span>
                          <span className={styles.dropdownUserRole}>
                            {user.role === "admin"
                              ? "Administrator"
                              : user.role === "vendor"
                              ? "Vendor"
                              : "Customer"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.dropdownDivider}></div>

                      <Link
                        to={getDashboardLink()}
                        className={styles.dropdownItem}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>{getDashboardLabel()}</span>
                      </Link>

                      {/* Notifications */}
                      <Link
                        to="/notifications"
                        className={styles.dropdownItem}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Bell className="h-4 w-4" />
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className={styles.notificationCount}>
                            {unreadCount}
                          </span>
                        )}
                      </Link>

                      {user.role === "customer" && (
                        <>
                          <Link
                            to="/vendor/signup"
                            onClick={() => setIsUserMenuOpen(false)}
                            className={styles.dropdownItem}
                          >
                            <Store className="h-4 w-4" />
                            <span>Become a Vendor</span>
                          </Link>
                        </>
                      )}

                      {/* Admin-specific items */}
                      {user.role === "admin" && (
                        <>
                          <Link
                            to="/admin/vendor-applications"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Store className="h-4 w-4" />
                            <span>Vendor Applications</span>
                          </Link>
                          <Link
                            to="/admin/promotions"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>Promotions</span>
                          </Link>
                        </>
                      )}

                      {/* Vendor-specific items */}
                      {user.role === "vendor" && (
                        <>
                          <Link
                            to="/vendor/add-product"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Store className="h-4 w-4" />
                            <span>Add Product</span>
                          </Link>
                          <Link
                            to="/vendor/orders"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="h-4 w-4" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/vendor/analytics"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <TrendingUp className="h-4 w-4" />
                            <span>Analytics</span>
                          </Link>
                          <Link
                            to="/vendor/profile"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>Store Profile</span>
                          </Link>
                        </>
                      )}

                      <div className={styles.dropdownDivider}></div>

                      <Link
                        to="/about"
                        className={styles.dropdownItem}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Info className="h-4 w-4" />
                        <span>About</span>
                      </Link>
                      <Link
                        to="/contact"
                        className={styles.dropdownItem}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Phone className="h-4 w-4" />
                        <span>Contact</span>
                      </Link>

                      <div className={styles.dropdownDivider}></div>

                      <button
                        onClick={handleLogout}
                        className={styles.dropdownButton}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className={styles.actionButton}
                  aria-label="Login"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              {/* Mobile Menu Button - Show on tablet/mobile */}
              <button
                className={styles.mobileMenuButton}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Only on mobile */}
          <div className={styles.mobileSearchBar}>
            <div className={styles.mobileSearchContainer}>
              <SmartSearch onSearch={handleSearch} />
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Navigation Menu */}
        {isMenuOpen && (
          <div
            className={styles.mobileMenuOverlay}
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className={styles.mobileMenu}
              ref={mobileMenuRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.mobileNavLinks}>
                <button
                  onClick={() => handleMobileNavClick("/")}
                  className={styles.mobileNavLink}
                >
                  <span>Home</span>
                </button>
                <button
                  onClick={() => handleMobileNavClick("/shop")}
                  className={styles.mobileNavLink}
                >
                  <span>Shop</span>
                </button>
                <button
                  onClick={() => handleMobileNavClick("/categories")}
                  className={styles.mobileNavLink}
                >
                  <span>Categories</span>
                </button>

                {/* Social and Wishlist buttons - only show on very small screens */}
                <div className={styles.smallScreenButtons}>
                  <button
                    onClick={() => handleMobileNavClick("/social")}
                    className={styles.mobileNavLink}
                  >
                    <Users className="h-4 w-4" />
                    <span>Social</span>
                  </button>

                  {user?.role === "customer" && (
                    <button
                      onClick={() => handleMobileNavClick("/wishlist")}
                      className={styles.mobileNavLink}
                    >
                      <Heart className="h-4 w-4" />
                      <span>Wishlist</span>
                      {wishlistItems.length > 0 && (
                        <span
                          className={`${styles.badge} ${styles.wishlistBadge}`}
                        >
                          {wishlistItems.length}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Bar Below Header */}
      {showSearchBarBelow && (
        <div className={styles.searchBarBelowHeader} ref={searchBarRef}>
          <div className={styles.searchBarContainer}>
            <div className={styles.searchBarContent}>
              <SmartSearch onSearch={handleSearch} autoFocus />
              <button
                onClick={() => setShowSearchBarBelow(false)}
                className={styles.closeSearchBarButton}
                aria-label="Close Search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
