import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header/Header";
import CategoryNavbar from "./components/CategoryNavbar/CategoryNavbar";
import Hero from "./components/Hero/Hero";
import FeaturedProducts from "./components/FeaturedProducts/FeaturedProducts";
import Categories from "./components/Categories/Categories";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter/Newsletter";
import Footer from "./components/Footer/Footer";
import SearchHistory from "./components/SearchHistory/SearchHistory";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import VendorSignupPage from "./pages/VendorSignupPage";
import CartPage from "./pages/CartPage/CartPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import CategoriesPage from "./pages/CategoriesPage/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage/CategoryProductsPage";
import SubCategoryPage from "./pages/SubCategoryPage/SubCategoryPage";
import ShopPage from "./pages/ShopPage/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SocialPage from "./pages/SocialPage";
import ARShowroom from "./pages/ARShowroom";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard";
import VendorApplications from "./pages/admin/VendorApplications";
import PromotionManagement from "./pages/admin/PromotionManagement";
import UserManagement from "./pages/admin/UserManagament/UserManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import OrdersPage from "./pages/OrderPage/OrderPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard/AnalyticsDashboard";
import CategoryManagement from "./pages/admin/CategoryManagement/CategoryManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import AddProduct from "./pages/vendor/AddProduct";
import NotificationCenter from "./pages/admin/NotificationCenter";
import ReportsCenter from "./pages/admin/ReportsCenter";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorProfile from "./pages/vendor/VendorProfile";
import RoleBasedRoute from "./components/RoleBasedRoute";
import PromotionBanner from "./components/PromotionBanner";
import LiveChat from "./components/LiveChat";
import SearchResults from "./components/SearchResults";
import SearchResultsPage from "./pages/SearchResultsPage/SearchResultsPage";
import ProtectedAuthRoute from "./ProtectedAuthRoute/ProtectedAuthRoute";

function HomePage() {
  return (
    <>
      <Hero />
      <SearchHistory />
      <FeaturedProducts />
      <Categories />
      <Testimonials />
      <Newsletter />
    </>
  );
}

function App() {
  const { isLoading, user } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading LUXE...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        {user?.role !== "admin" && <PromotionBanner />}
        <Header />
        {user?.role !== "admin" && <CategoryNavbar />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route
            path="/login"
            element={
              <ProtectedAuthRoute>
                <LoginPage />
              </ProtectedAuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedAuthRoute>
                <SignupPage />
              </ProtectedAuthRoute>
            }
          />
          <Route path="/vendor/signup" element={<VendorSignupPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route
            path="/subcategory/:categoryId"
            element={<SubCategoryPage />}
          />
          <Route
            path="/category/:categoryId"
            element={<CategoryProductsPage />}
          />
          <Route
            path="/category/:categoryId/subcategory/:subcategoryId"
            element={<SubCategoryPage />}
          />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/ar-showroom" element={<ARShowroom />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* User Routes */}
          <Route
            path="/cart"
            element={
              <RoleBasedRoute allowedRoles={["customer"]}>
                <CartPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <RoleBasedRoute allowedRoles={["customer"]}>
                <CheckoutPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <RoleBasedRoute allowedRoles={["customer"]}>
                <ProfilePage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <RoleBasedRoute allowedRoles={["customer"]}>
                <WishlistPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <RoleBasedRoute allowedRoles={["customer"]}>
                <OrdersPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/order/:orderId"
            element={
              <RoleBasedRoute allowedRoles={["customer"]}>
                <OrderDetailPage />
              </RoleBasedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/vendor-applications"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <VendorApplications />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/promotions"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <PromotionManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <ProductManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <OrderManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <AnalyticsDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <CategoryManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <SystemSettings />
              </RoleBasedRoute>
            }
          />

          {/* Vendor Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <RoleBasedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/vendor/add-product"
            element={
              <RoleBasedRoute allowedRoles={["vendor"]}>
                <AddProduct />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <RoleBasedRoute allowedRoles={["vendor"]}>
                <VendorOrders />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/vendor/analytics"
            element={
              <RoleBasedRoute allowedRoles={["vendor"]}>
                <VendorAnalytics />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/vendor/profile"
            element={
              <RoleBasedRoute allowedRoles={["vendor"]}>
                <VendorProfile />
              </RoleBasedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/notifications"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <NotificationCenter />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <ReportsCenter />
              </RoleBasedRoute>
            }
          />
        </Routes>
        {user?.role !== "admin" && <Footer />}
        {user?.role !== "admin" && <LiveChat />}
      </div>
    </Router>
  );
}

export default App;
