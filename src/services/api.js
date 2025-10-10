const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      let data;
      try {
        data = await response.json(); // ✅ Safely attempt JSON parse
      } catch (parseError) {
        data = null; // fallback if it's not JSON
      }

      // console.log("API Response:", {
      //   endpoint,
      //   status: response.status,
      //   ok: response.ok,
      //   data,
      // });

      if (!response.ok) {
        const error = new Error(data?.message || "Something went wrong");
        error.status = response.status;
        error.response = { data, status: response.status };
        throw error;
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", {
        endpoint,
        error: error.message,
        status: error.status,
      });
      throw error;
    }
  }

  //Admin route

  async getAllUsers() {
    return this.request("/admin/getallusers");
  }

  // Auth endpoints
  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async googleAuth(idToken, role) {
    return this.request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken, role }),
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getMe() {
    try {
      return await this.request("/auth/me");
    } catch (error) {
      // Only clear token for specific auth errors, not network errors
      if (error.status === 401 || error.status === 403) {
        console.log("Token invalid, clearing from ApiService");
        this.setToken(null);
      }
      throw error;
    }
  }

  async updateProfile(profileData) {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  // Product endpoints
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    // For FormData (file uploads), don't set Content-Type header
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/products`, {
      method: "POST",
      headers,
      body: productData, // FormData object
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Failed to create product");
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async updateProduct(id, productData) {
    console.log(id, productData);
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/products/${id}`, {
      method: "PUT",
      headers,
      body: productData, // FormData object
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Failed to update product");
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  async getVendorProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products/vendor/my-products?${queryString}`);
  }

  async searchProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products/search?${queryString}`);
  }

  // cart endpoints
  async getCartItems() {
    return this.request("/customer/cart");
  }

  async addToCart(item) {
    console.log(item);
    return this.request(`/customer/addtocart`, {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async updateQuantity(id, quantity) {
    return this.request(`/customer/cart/update/${id}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(id) {
    return this.request(`/customer/cart/remove/${id}`, {
      method: "DELETE",
    });
  }

  //wishlist endpoints
  async getWishlistItems() {
    return this.request("/customer/wishlist");
  }

  async addToWishlist(item) {
    const id = item._id || item.id; // Ensure we use the correct ID field
    return this.request(`/customer/wishlist/add`, {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }
  async removeFromWishlist(id) {
    console.log(id);
    return this.request(`/customer/wishlist/remove/${id}`, {
      method: "DELETE",
    });
  }
  async clearWishlist() {
    return this.request("/customer/wishlist/clear", {
      method: "DELETE",
    });
  }

  // Review endpoints
  async getProductReviews(productId) {
    return this.request(`/products/${productId}/reviews`);
  }

  async addProductReview(productId, reviewData) {
    return this.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId, reviewData) {
    return this.request(`/products/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/products/reviews/${reviewId}`, {
      method: "DELETE",
    });
  }

  // Order endpoints
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Vendor endpoints
  async getVendors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/vendors`);
  }

  async getVendorApplications() {
    return this.request("/vendors/applications");
  }

  async approveApplication(vendorId) {
    return this.request(`/vendors/${vendorId}/approve`, {
      method: "PUT",
    });
  }

  async rejectVendor(vendorId, reason) {
    return this.request(`/vendors/${vendorId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  // Promotion endpoints
  async getPromotions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/promotions?${queryString}`);
  }

  async createPromotion(promotionData) {
    return this.request("/promotions", {
      method: "POST",
      body: JSON.stringify(promotionData),
    });
  }

  async updatePromotion(id, promotionData) {
    return this.request(`/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(promotionData),
    });
  }

  async deletePromotion(id) {
    return this.request(`/promotions/${id}`, {
      method: "DELETE",
    });
  }

  async validateCoupon(code, orderValue) {
    return this.request("/promotions/validate", {
      method: "POST",
      body: JSON.stringify({ code, orderValue }),
    });
  }

  // Analytics endpoints

  async adminGetProducts() {
    return this.request("/admin/products");
  }

  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics?${queryString}`);
  }

  async getVendorAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/vendor?${queryString}`);
  }

  // Admin-specific endpoints
  async adminUpdateProduct(id, productData) {
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/admin/products/${id}`, {
      method: "PUT",
      headers,
      body: productData, // FormData object
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Failed to update product");
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async adminDeleteProduct(id) {
    return this.request(`/admin/products/${id}`, {
      method: "DELETE",
    });
  }

  async adminGetUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${queryString}`);
  }

  async adminUpdateUser(id, userData) {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async adminDeleteUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  async adminSuspendUser(id) {
    return this.request(`/admin/users/${id}/suspend`, {
      method: "PUT",
    });
  }

  async adminActivateUser(id) {
    return this.request(`/admin/users/${id}/activate`, {
      method: "PUT",
    });
  }

  async adminGetProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/products?${queryString}`);
  }

  async adminGetOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders?${queryString}`);
  }

  async adminUpdateOrderStatus(id, status) {
    return this.request(`/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async adminGetAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/analytics?${queryString}`);
  }

  async adminGetDashboardStats() {
    return this.request("/admin/dashboard/stats");
  }

  async adminCreateProduct(productData) {
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/admin/products`, {
      method: "POST",
      headers,
      body: productData, // FormData object
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Failed to create product");
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async adminGetVendors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/vendors?${queryString}`);
  }

  async adminApproveVendor(vendorId) {
    return this.request(`/admin/vendors/${vendorId}/approve`, {
      method: "PUT",
    });
  }

  async adminRejectVendor(vendorId, reason) {
    return this.request(`/admin/vendors/${vendorId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  async adminSuspendVendor(vendorId) {
    return this.request(`/admin/vendors/${vendorId}/suspend`, {
      method: "PUT",
    });
  }

  async adminActivateVendor(vendorId) {
    return this.request(`/admin/vendors/${vendorId}/activate`, {
      method: "PUT",
    });
  }

  // Enhanced Admin Analytics
  async adminGetSalesAnalytics(timeframe = "monthly") {
    return this.request(`/admin/analytics/sales?timeframe=${timeframe}`);
  }

  async adminGetUserAnalytics() {
    return this.request("/admin/analytics/users");
  }

  async adminGetProductAnalytics() {
    return this.request("/admin/analytics/products");
  }

  async adminGetRevenueAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/analytics/revenue?${queryString}`);
  }

  // Admin Inventory Management
  async adminGetInventoryReport() {
    return this.request("/admin/inventory/report");
  }

  async adminGetLowStockProducts() {
    return this.request("/admin/inventory/low-stock");
  }

  async adminUpdateInventory(productId, stockData) {
    return this.request(`/admin/inventory/${productId}`, {
      method: "PUT",
      body: JSON.stringify(stockData),
    });
  }

  // Admin Customer Management
  async adminGetCustomerAnalytics() {
    return this.request("/admin/customers/analytics");
  }

  async adminGetCustomerOrders(customerId) {
    return this.request(`/admin/customers/${customerId}/orders`);
  }

  async adminSendCustomerNotification(customerId, notificationData) {
    return this.request(`/admin/customers/${customerId}/notify`, {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
  }

  // Admin Financial Reports
  async adminGetFinancialReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/financial/report?${queryString}`);
  }

  async adminGetTaxReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/financial/tax-report?${queryString}`);
  }

  async adminGetVendorPayouts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/financial/vendor-payouts?${queryString}`);
  }

  // Admin Reports
  async adminGenerateReport(reportType, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/${reportType}?${queryString}`);
  }

  async adminExportData(dataType, format = "csv") {
    return this.request(`/admin/export/${dataType}?format=${format}`);
  }

  // Admin Settings
  async adminGetSettings() {
    return this.request("/admin/settings");
  }

  async adminUpdateSettings(settings) {
    return this.request("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // Admin Notifications
  async adminGetNotifications() {
    return this.request("/admin/notifications");
  }

  async adminSendNotification(notificationData) {
    return this.request("/admin/notifications/send", {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
  }

  // Admin Bulk Operations
  async adminBulkUpdateProducts(productIds, updates) {
    return this.request("/admin/products/bulk-update", {
      method: "PUT",
      body: JSON.stringify({ productIds, updates }),
    });
  }

  async adminBulkDeleteProducts(productIds) {
    return this.request("/admin/products/bulk-delete", {
      method: "DELETE",
      body: JSON.stringify({ productIds }),
    });
  }

  async adminBulkUpdateUsers(userIds, updates) {
    return this.request("/admin/users/bulk-update", {
      method: "PUT",
      body: JSON.stringify({ userIds, updates }),
    });
  }

  // Admin Category Management
  async adminGetCategories() {
    try {
      return await this.request("/admin/categories");
    } catch (error) {
      // Return mock data if API fails
      return {
        success: true,
        categories: [
          {
            _id: "1",
            name: "Women's Fashion",
            slug: "women",
            description: "Latest trends in women's clothing and accessories",
            image:
              "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600",
            isActive: true,
            productCount: 0,
            sortOrder: 1,
            subcategories: [
              "Dresses",
              "Tops",
              "Bottoms",
              "Outerwear",
              "Activewear",
            ],
            specifications: {
              required: ["size", "color", "material"],
              optional: ["brand", "care_instructions", "fit_type"],
              size: {
                type: "select",
                options: ["XS", "S", "M", "L", "XL", "XXL"],
                multiple: true,
              },
              color: {
                type: "select",
                options: [
                  "Black",
                  "White",
                  "Red",
                  "Blue",
                  "Green",
                  "Pink",
                  "Purple",
                  "Yellow",
                  "Orange",
                  "Gray",
                  "Brown",
                ],
                multiple: true,
              },
              material: {
                type: "select",
                options: [
                  "Cotton",
                  "Polyester",
                  "Silk",
                  "Wool",
                  "Linen",
                  "Denim",
                  "Leather",
                  "Synthetic",
                ],
                multiple: false,
              },
            },
          },
          {
            _id: "2",
            name: "Men's Collection",
            slug: "men",
            description: "Premium men's fashion and accessories",
            image:
              "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600",
            isActive: true,
            productCount: 0,
            sortOrder: 2,
            subcategories: [
              "Shirts",
              "Suits",
              "Casual Wear",
              "Accessories",
              "Shoes",
            ],
            specifications: {
              required: ["size", "color", "material"],
              optional: ["brand", "care_instructions", "fit_type"],
            },
          },
          {
            _id: "3",
            name: "Accessories",
            slug: "accessories",
            description: "Complete your look with luxury accessories",
            image:
              "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=600",
            isActive: true,
            productCount: 0,
            sortOrder: 3,
            subcategories: [
              "Jewelry",
              "Bags",
              "Watches",
              "Sunglasses",
              "Scarves",
            ],
            specifications: {
              required: ["material", "color"],
              optional: ["brand", "size", "care_instructions"],
            },
          },
        ],
      };
    }
  }

  async adminCreateCategory(categoryData) {
    // Handle both FormData (file upload) and JSON (URL) data
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Don't set Content-Type for FormData, let browser set it
    if (!(categoryData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseURL}/admin/create-category`, {
      method: "POST",
      headers,
      body:
        categoryData instanceof FormData
          ? categoryData
          : JSON.stringify(categoryData),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Failed to create category");
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async adminUpdateCategory(id, categoryData) {
    // Handle both FormData (file upload) and JSON (URL) data
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Don't set Content-Type for FormData, let browser set it
    if (!(categoryData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
      `${this.baseURL}/admin/update-category/${id}`,
      {
        method: "PUT",
        headers,
        body:
          categoryData instanceof FormData
            ? categoryData
            : JSON.stringify(categoryData),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Failed to update category");
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async adminDeleteCategory(id) {
    return this.request(`/admin/delete-category/${id}`, {
      method: "DELETE",
    });
  }

  // Admin Notification Management
  async adminSendNotification(notificationData) {
    return this.request("/admin/notifications/send", {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
  }

  async adminDeleteNotification(id) {
    return this.request(`/admin/notifications/${id}`, {
      method: "DELETE",
    });
  }

  // Admin Reports
  async adminGenerateReport(reportType, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/${reportType}?${queryString}`);
  }

  // Vendor specific endpoints
  async getVendorOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/vendor/orders?${queryString}`);
  }

  async getVendorAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/vendor/analytics?${queryString}`);
  }

  async updateVendorProfile(profileData) {
    return this.request("/vendor/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Notification endpoints
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications?${queryString}`);
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request("/notifications/mark-all-read", {
      method: "PUT",
    });
  }

  // Social endpoints
  async getSocialPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/social/posts?${queryString}`);
  }

  async createSocialPost(postData) {
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/social/posts`, {
      method: "POST",
      headers,
      body: postData, // FormData object
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Failed to create post");
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async likeSocialPost(postId) {
    return this.request(`/social/posts/${postId}/like`, {
      method: "POST",
    });
  }

  async commentOnSocialPost(postId, comment) {
    return this.request(`/social/posts/${postId}/comment`, {
      method: "POST",
      body: JSON.stringify({ text: comment }),
    });
  }

  async shareSocialPost(postId) {
    return this.request(`/social/posts/${postId}/share`, {
      method: "POST",
    });
  }

  // Search endpoints - Updated with better error handling
  async searchProducts(searchParams = {}) {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const endpoint = `/search/products${
        queryString ? `?${queryString}` : ""
      }`;
      return await this.request(endpoint);
    } catch (error) {
      console.error("Search products error:", error);
      return {
        success: true,
        products: [],
        total: 0,
        page: 1,
        pages: 0,
        filters: {},
      };
    }
  }

  async smartSearchProducts(searchParams = {}) {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const endpoint = `/search/smart/products${
        queryString ? `?${queryString}` : ""
      }`;
      return await this.request(endpoint);
    } catch (error) {
      console.error("Smart search products error:", error);
      return {
        success: true,
        products: [],
        total: 0,
        page: 1,
        pages: 0,
        filters: {},
      };
    }
  }

  async getSearchSuggestions(query) {
    try {
      if (!query || query.length < 2) {
        return { success: true, suggestions: [] };
      }

      const endpoint = `/search/suggestions?q=${encodeURIComponent(
        query
      )}&limit=8`;
      return await this.request(endpoint);
    } catch (error) {
      console.error("All search suggestions failed:", error);
      return this.getFallbackSuggestions(query);
    }
  }

  async getSmartSearchSuggestions(query) {
    try {
      if (!query || query.length < 2) {
        return { success: true, suggestions: [] };
      }

      const endpoint = `/search/smart/suggestions?q=${encodeURIComponent(
        query
      )}&limit=10`;
      return await this.request(endpoint);
    } catch (error) {
      console.error("Smart search suggestions failed:", error);
      return this.getFallbackSuggestions(query);
    }
  }

  // Get popular searches
  async getPopularSearches(type = "terms") {
    try {
      const endpoint = `/search/popular?type=${type}&limit=5`;
      return await this.request(endpoint);
    } catch (error) {
      console.error("Popular searches error:", error);
      // Fallback to default popular searches
      return {
        success: true,
        data: [
          "luxury handbags",
          "smart watches",
          "winter fashion",
          "designer shoes",
          "cosmetics",
        ],
      };
    }
  }

  async getSearchAutocomplete(query) {
    try {
      if (!query || query.length < 2) {
        return { success: true, suggestions: [] };
      }

      const endpoint = `/search/autocomplete?q=${encodeURIComponent(
        query
      )}&limit=5`;
      return await this.request(endpoint);
    } catch (error) {
      console.error("Autocomplete error:", error);
      return { success: true, suggestions: [] };
    }
  }

  async getSmartSearchAutocomplete(query) {
    try {
      if (!query || query.length < 2) {
        return { success: true, suggestions: [] };
      }

      const endpoint = `/search/smart/autocomplete?q=${encodeURIComponent(
        query
      )}&limit=8`;
      return await this.request(endpoint);
    } catch (error) {
      console.error("Smart autocomplete error:", error);
      return { success: true, suggestions: [] };
    }
  }

  // Fallback suggestions when API is not available
  getFallbackSuggestions(query) {
    const commonSuggestions = [
      "shirt",
      "dress",
      "jeans",
      "shoes",
      "watch",
      "bag",
      "mobile",
      "laptop",
      "cosmetics",
      "furniture",
      "handbag",
      "perfume",
      "jewelry",
      "sunglasses",
      "jacket",
    ];

    const filtered = commonSuggestions.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    const suggestions = filtered.map((item) => ({
      display: item,
      name: item,
      type: "suggestion",
      count: Math.floor(Math.random() * 100) + 10,
    }));

    // Add some contextual suggestions
    if (query.length > 1) {
      suggestions.unshift(
        {
          display: `${query} for men`,
          name: `${query} for men`,
          type: "category",
        },
        {
          display: `${query} for women`,
          name: `${query} for women`,
          type: "category",
        }
      );
    }

    return {
      success: true,
      suggestions: suggestions.slice(0, 8),
    };
  }
}

export default new ApiService();
