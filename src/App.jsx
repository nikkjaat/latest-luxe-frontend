import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import FeaturedProducts from "./components/FeaturedProducts/FeaturedProducts";
import Categories from "./components/Categories/Categories";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter/Newsletter";
import Footer from "./components/Footer/Footer";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import VendorSignupPage from "./pages/VendorSignupPage";
import CartPage from "./pages/CartPage/CartPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import CategoriesPage from "./pages/CategoriesPage/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage/CategoryProductsPage";
import ShopPage from "./pages/ShopPage/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SocialPage from "./pages/SocialPage";
import ARShowroom from "./pages/ARShowroom";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import AdminDashboard from "./pages/admin//AdminDashboard/AdminDashboard";
import VendorApplications from "./pages/admin/VendorApplications";
import PromotionManagement from "./pages/admin/PromotionManagement";
import UserManagement from "./pages/admin/UserManagament/UserManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard/AnalyticsDashboard";
import CategoryManagement from "./pages/admin//CategoryManagement/CategoryManagement";
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
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductProvider } from "./context/ProductContext";
import { VendorProvider } from "./context/VendorContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PromotionProvider } from "./context/PromotionContext";
import { ReviewProvider } from "./context/ReviewContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import { AIProvider } from "./context/AIContext";
import { SocialProvider } from "./context/SocialContext";
import { ARProvider } from "./context/ARContext";
import { AuthProvider } from "./context/AuthContext";
import { CategoryProvider } from "./context/CategoryContext";

function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Categories />
      <Testimonials />
      <Newsletter />
    </>
  );
}

function AppContent() {
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
    <AIProvider>
      <SocialProvider>
        <ARProvider>
          <NotificationProvider>
            <PromotionProvider>
              <ReviewProvider>
                <AnalyticsProvider>
                  <ProductProvider>
                    <VendorProvider>
                      <CartProvider>
                        <WishlistProvider>
                          <CategoryProvider>
                            <Router>
                              <div className="min-h-screen bg-white">
                                {user?.role !== "admin" && <PromotionBanner />}
                                <Header />
                                <Routes>
                                  {/* Public Routes */}
                                  <Route path="/" element={<HomePage />} />
                                  <Route
                                    path="/login"
                                    element={<LoginPage />}
                                  />
                                  <Route
                                    path="/signup"
                                    element={<SignupPage />}
                                  />
                                  <Route
                                    path="/vendor/signup"
                                    element={<VendorSignupPage />}
                                  />
                                  <Route path="/shop" element={<ShopPage />} />
                                  <Route
                                    path="/product/:id"
                                    element={<ProductDetailPage />}
                                  />
                                  <Route
                                    path="/categories"
                                    element={<CategoriesPage />}
                                  />
                                  <Route
                                    path="/category/:categoryId"
                                    element={<CategoryProductsPage />}
                                  />
                                  <Route
                                    path="/social"
                                    element={<SocialPage />}
                                  />
                                  <Route
                                    path="/ar-showroom"
                                    element={<ARShowroom />}
                                  />
                                  <Route
                                    path="/unauthorized"
                                    element={<UnauthorizedPage />}
                                  />

                                  {/* User Routes */}
                                  <Route
                                    path="/cart"
                                    element={
                                      <RoleBasedRoute
                                        allowedRoles={["customer"]}
                                      >
                                        <CartPage />
                                      </RoleBasedRoute>
                                    }
                                  />
                                  <Route
                                    path="/profile"
                                    element={
                                      <RoleBasedRoute
                                        allowedRoles={["customer"]}
                                      >
                                        <ProfilePage />
                                      </RoleBasedRoute>
                                    }
                                  />
                                  <Route
                                    path="/wishlist"
                                    element={
                                      <RoleBasedRoute
                                        allowedRoles={["customer"]}
                                      >
                                        <WishlistPage />
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
                          </CategoryProvider>
                        </WishlistProvider>
                      </CartProvider>
                    </VendorProvider>
                  </ProductProvider>
                </AnalyticsProvider>
              </ReviewProvider>
            </PromotionProvider>
          </NotificationProvider>
        </ARProvider>
      </SocialProvider>
    </AIProvider>
  );
}
function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <AppContent />
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
