import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Users,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Download,
  Search,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductContext";
import apiService from "../../services/api";

const VendorDashboard = () => {
  const { user } = useAuth();
  const { products, getProducts } = useProducts();
  const navigate = useNavigate();

  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [vendorAnalytics, setVendorAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (user?.role === "vendor") {
      fetchVendorData();
    }
  }, [user]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);

      // Fetch vendor products
      try {
        const productsResponse = await apiService.getVendorProducts();
        setVendorProducts(productsResponse.products || []);
      } catch (error) {
        console.error("Failed to fetch vendor products:", error);
        setVendorProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch vendor data:", error);

      // Use filtered products from context as fallback
      const filteredProducts = products.filter((p) => p.vendor === user?._id);
      setVendorProducts(filteredProducts);

      // Generate mock data for demonstration
      setVendorOrders(generateMockOrders());
      setVendorAnalytics(generateMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = () => [
    {
      _id: "ORD-V001",
      orderNumber: "ORD-V001",
      customer: { name: "Sarah Johnson", email: "sarah@example.com" },
      status: "processing",
      total: 299.99,
      items: [{ name: "Premium Leather Handbag", quantity: 1, price: 299.99 }],
      createdAt: "2025-01-20T10:30:00Z",
    },
    {
      _id: "ORD-V002",
      orderNumber: "ORD-V002",
      customer: { name: "Michael Chen", email: "michael@example.com" },
      status: "shipped",
      total: 599.99,
      items: [{ name: "Designer Watch", quantity: 1, price: 599.99 }],
      createdAt: "2025-01-19T14:20:00Z",
    },
  ];

  const generateMockAnalytics = () => ({
    revenue: {
      total: 45670,
      growth: 15.3,
      monthly: [3200, 3800, 4200, 4800, 5200, 5800, 6200],
    },
    orders: {
      total: 234,
      pending: 12,
      completed: 198,
      cancelled: 24,
      growth: 8.7,
    },
    products: {
      total: vendorProducts.length,
      active: vendorProducts.filter((p) => p.status === "active").length,
      views: 12450,
    },
    customers: {
      total: 156,
      returning: 89,
      satisfaction: 4.8,
    },
  });

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setActionLoading((prev) => ({ ...prev, [productId]: "deleting" }));
        const response = await apiService.deleteProduct(productId);
        if (response.success) {
          setVendorProducts((prev) => prev.filter((p) => p._id !== productId));
        } else {
          throw new Error(response.message || "Failed to delete product");
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Failed to delete product");
      } finally {
        setActionLoading((prev) => ({ ...prev, [productId]: null }));
      }
    }
  };

  //   const handleEditProduct = (productId) => {
  //   navigate("/vendor/add-product?edit=true", {
  //     state: { productId },
  //   });
  // };

  const handleEditProduct = (product) => {
    navigate("/vendor/add-product?edit=true", {
      state: { productId: product._id },
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: Package,
        label: "Processing",
      },
      shipped: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: ShoppingBag,
        label: "Shipped",
      },
      delivered: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
        label: "Delivered",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: AlertTriangle,
        label: "Cancelled",
      },
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
        label: "Active",
      },
      inactive: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: AlertTriangle,
        label: "Inactive",
      },
    };
    return configs[status] || configs.pending;
  };

  const formatProductRating = (rating) => {
    if (typeof rating === "object" && rating !== null) {
      return rating.average ? rating.average.toFixed(1) : "0.0";
    }
    return typeof rating === "number" ? rating.toFixed(1) : "0.0";
  };

  const filteredProducts = vendorProducts.filter((product) => {
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalRevenue = vendorAnalytics?.revenue?.total || 0;
  const totalOrders = vendorOrders.length;
  const pendingOrders = vendorOrders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;
  const lowStockProducts = vendorProducts.filter(
    (p) => (p.stock || 0) < 10
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.vendorInfo?.shopName || user?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your store and track performance
              </p>
            </div>
            <Link
              to="/vendor/add-product"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{vendorAnalytics?.revenue?.growth || 0}% growth
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders}
                </p>
                <p className="text-sm text-blue-600">{pendingOrders} pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendorProducts.length}
                </p>
                <p className="text-sm text-purple-600">
                  {vendorProducts.filter((p) => p.status === "active").length}{" "}
                  active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendorAnalytics?.customers?.satisfaction || 4.8}
                </p>
                <p className="text-sm text-yellow-600">Customer satisfaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {lowStockProducts > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Stock Alert
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {lowStockProducts} of your products are running low on stock.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("products")}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                View Products
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: Activity },
              { id: "products", name: "My Products", icon: Package },
              { id: "orders", name: "Orders", icon: ShoppingBag },
              { id: "analytics", name: "Analytics", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/vendor/add-product"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Add New Product</p>
                    <p className="text-sm text-gray-500">
                      Create a new product listing
                    </p>
                  </div>
                </Link>

                <Link
                  to="/vendor/orders"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Orders</p>
                    <p className="text-sm text-gray-500">
                      {pendingOrders} pending orders
                    </p>
                  </div>
                </Link>

                <Link
                  to="/vendor/analytics"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View Analytics</p>
                    <p className="text-sm text-gray-500">Track performance</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Orders
                </h3>
                <Link
                  to="/vendor/orders"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="p-6">
                {vendorOrders.slice(0, 5).map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div
                      key={order._id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.customer?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          {statusConfig.label}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ${order.total}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Top Products
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendorProducts.slice(0, 6).map((product) => (
                    <div
                      key={product._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <img
                        src={
                          product.colorVariants[0].images?.[0]?.url ||
                          "https://via.placeholder.com/150"
                        }
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          ${product.price}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm">
                            {formatProductRating(product.rating)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Stock: {product.stock || 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Product Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${
                        viewMode === "grid"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600"
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${
                        viewMode === "list"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} products
                  </span>
                </div>
              </div>
            </div>

            {/* Products Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const statusConfig = getStatusConfig(product.status);
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={
                            product.colorVariants[0]?.images?.[0]?.url ||
                            "https://via.placeholder.com/300"
                          }
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        {(product.stock || 0) < 10 && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Low Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-blue-600">
                            ${product.price}
                          </span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm">
                              {formatProductRating(product.rating)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Stock: {product.stock || 0}
                        </p>

                        <div className="flex space-x-2">
                          <Link
                            to={`/product/${product._id}`}
                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 flex items-center justify-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            disabled={actionLoading[product._id]}
                            className="bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading[product._id] === "deleting" ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => {
                      const statusConfig = getStatusConfig(product.status);
                      return (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={
                                  product.images?.[0]?.url ||
                                  "https://via.placeholder.com/60"
                                }
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                            ${product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${
                                (product.stock || 0) < 10
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {product.stock || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm">
                                {formatProductRating(product.rating)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                to={`/product/${product._id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                disabled={actionLoading[product._id]}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                {actionLoading[product._id] === "deleting" ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Start by adding your first product."}
                </p>
                <Link
                  to="/vendor/add-product"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Product
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Orders
              </h3>
              <Link
                to="/vendor/orders"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                View All Orders
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorOrders.slice(0, 10).map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Revenue Growth
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      +{vendorAnalytics?.revenue?.growth || 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Total Customers
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {vendorAnalytics?.customers?.total || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Product Views
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {vendorAnalytics?.products?.views || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Satisfaction
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {vendorAnalytics?.customers?.satisfaction || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Revenue Trend
              </h3>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">Revenue Analytics</p>
                  <Link
                    to="/vendor/analytics"
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
                  >
                    View Detailed Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
