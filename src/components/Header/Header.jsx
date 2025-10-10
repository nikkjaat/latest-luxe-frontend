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
  ShoppingBag,
  ShoppingBag as ShoppingBagIcon,
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
  const [navbarTop, setNavbarTop] = useState(0);
  const lastScrollY = useRef(0);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { getUserNotifications, getUnreadCount } = useNotifications();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchBarRef = useRef(null);

  console.log(user);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setNavbarTop(-70);
      } else {
        // Scrolling up
        setNavbarTop(0);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    if (!query.trim()) return;

    // Navigate to search page with search query
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
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
      <header
        className={styles.header}
        ref={dropdownRef}
        style={{ top: `${navbarTop}px`, transition: "top 0.3s ease" }}
      >
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
              {user?.role === "admin" ? (
                <nav className={styles.desktopNav}>
                  <Link to="/admin/dashboard" className={styles.navLink}>
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/admin/users" className={styles.navLink}>
                    <span>Users</span>
                  </Link>
                  <Link to="/admin/products" className={styles.navLink}>
                    <span>Products</span>
                  </Link>
                  <Link to="/admin/orders" className={styles.navLink}>
                    <span>Orders</span>
                  </Link>
                  <Link to="/admin/analytics" className={styles.navLink}>
                    <span>Analytics</span>
                  </Link>
                </nav>
              ) : (
                <>
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
                    <Link
                      to="/ar-showroom"
                      className={styles.alwaysVisibleButton}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className={styles.alwaysVisibleButtonText}>
                        AR Showroom
                      </span>
                    </Link>
                    <Link to="/social" className={styles.alwaysVisibleButton}>
                      <Users className="h-4 w-4" />
                      <span className={styles.alwaysVisibleButtonText}>
                        Social
                      </span>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Desktop Actions */}
            <div className={styles.desktopActions}>
              {/* Search Button - Shows on laptop/tablet */}
              {user?.role !== "admin" && (
                <button
                  onClick={() => setShowSearchBarBelow(!showSearchBarBelow)}
                  className={styles.searchButton}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              {/* Wishlist - Show on all screens for users */}
              {/* Admin-specific actions */}
              {user?.role === "admin" && (
                <>
                  <Link
                    to="/admin/notifications"
                    className={styles.actionButton}
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span
                        className={`${styles.badge} ${styles.notificationBadge}`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Customer-specific actions */}
              {user?.role === "customer" && (
                <>
                  <Link
                    to="/wishlist"
                    className={`${styles.actionButton} ${styles.hideOnSmallScreen}`}
                    aria-label="Wishlist"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistItems.length > 0 && (
                      <span
                        className={`${styles.badge} ${styles.wishlistBadge}`}
                      >
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>

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
                </>
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
                        src={
                          user.avatar ||
                          "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
                        }
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

                      {/* Role-specific menu items */}
                      {user.role === "admin" && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link
                            to="/admin/users"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Users className="h-4 w-4" />
                            <span>User Management</span>
                          </Link>
                          <Link
                            to="/admin/products"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="h-4 w-4" />
                            <span>Product Management</span>
                          </Link>
                          <Link
                            to="/admin/orders"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ShoppingBag className="h-4 w-4" />
                            <span>Order Management</span>
                          </Link>
                          <Link
                            to="/admin/vendor-applications"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Store className="h-4 w-4" />
                            <span>Vendor Applications</span>
                          </Link>
                          <Link
                            to="/admin/analytics"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <TrendingUp className="h-4 w-4" />
                            <span>Analytics</span>
                          </Link>
                          <Link
                            to="/admin/settings"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>System Settings</span>
                          </Link>
                        </>
                      )}

                      {user.role === "vendor" && (
                        <>
                          <Link
                            to="/vendor/dashboard"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Vendor Dashboard</span>
                          </Link>
                          <Link
                            to="/vendor/add-product"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="h-4 w-4" />
                            <span>Add Product</span>
                          </Link>
                          <Link
                            to="/vendor/orders"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ShoppingBag className="h-4 w-4" />
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

                      {user.role === "customer" && (
                        <>
                          <Link
                            to="/profile"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                          <Link
                            to="/orders"
                            className={styles.dropdownItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ShoppingBagIcon className="h-4 w-4" />
                            <span>My Orders</span>
                          </Link>
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
          {user?.role !== "admin" && (
            <div className={styles.mobileSearchBar}>
              <div className={styles.mobileSearchContainer}>
                <SmartSearch onSearch={handleSearch} />
              </div>
            </div>
          )}
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
                {user?.role === "admin" ? (
                  <>
                    <button
                      onClick={() => handleMobileNavClick("/admin/dashboard")}
                      className={styles.mobileNavLink}
                    >
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => handleMobileNavClick("/admin/users")}
                      className={styles.mobileNavLink}
                    >
                      <span>Users</span>
                    </button>
                    <button
                      onClick={() => handleMobileNavClick("/admin/products")}
                      className={styles.mobileNavLink}
                    >
                      <span>Products</span>
                    </button>
                    <button
                      onClick={() => handleMobileNavClick("/admin/orders")}
                      className={styles.mobileNavLink}
                    >
                      <span>Orders</span>
                    </button>
                    <button
                      onClick={() => handleMobileNavClick("/admin/analytics")}
                      className={styles.mobileNavLink}
                    >
                      <span>Analytics</span>
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                {/* Social and Wishlist buttons - only show on very small screens */}
                {user?.role === "customer" && (
                  <div className={styles.smallScreenButtons}>
                    <button
                      onClick={() => handleMobileNavClick("/social")}
                      className={styles.mobileNavLink}
                    >
                      <Users className="h-4 w-4" />
                      <span>Social</span>
                    </button>

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
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Bar Below Header */}
      {showSearchBarBelow && user?.role !== "admin" && (
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
