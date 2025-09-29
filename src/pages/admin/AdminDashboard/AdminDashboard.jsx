import React, { useState, useEffect } from "react";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  UserCheck,
  Store,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  Grid,
  Gift,
  Settings,
  Bell,
  FileText,
  Zap,
  RefreshCw,
  Ban,
} from "lucide-react";
import { useVendors } from "../../../context/VendorContext";
import { useProducts } from "../../../context/ProductContext";
import { useAnalytics } from "../../../context/AnalyticsContext";
import { Link } from "react-router-dom";
import apiService from "../../../services/api";
import UserDetails from "../UserDetails";
import EditProductModal from "../EditProductModal "; // Import the EditProductModal

const AdminDashboard = () => {
  const { vendors, vendorApplications, getVendors, getVendorApplications } =
    useVendors();
  const { analytics, getRevenueGrowth, getVisitorGrowth } = useAnalytics();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");
  const [allUsers, setAllUsers] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  // Add user management state
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Add product edit modal state
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [isActive, setIsActive] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchVendors();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiService.adminGetProducts();
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (apiError) {
        console.error("API call failed:", apiError);
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  console.log(products);

  const fetchVendors = async () => {
    try {
      try {
        const response = await apiService.getAllUsers();
        const vendorUsers = response.users.filter(
          (user) => user.role === "vendor"
        );
      } catch (apiError) {
        console.error("API call failed:", apiError);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // setLoading(true);
      const response = await apiService.getAllUsers();
      // Filter out admin users for security
      const filteredUsers = response.users.filter(
        (user) => user.role !== "admin"
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeUsers = users.filter((user) => user.isActive === true);
    setIsActive(activeUsers.length);

    const thisMonthUsers = users.filter((user) => {
      const createdAt = new Date(user.createdAt); // assuming this field exists
      const now = new Date();
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    });

    setActiveUserCount(thisMonthUsers.length);
  }, [users]);

  const loadData = async () => {
    try {
      await Promise.all([
        getVendors(),
        getVendorApplications(),
        fetchProducts(),
      ]);
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    getAllUsers();
  }, []);

  const getAllUsers = async () => {
    try {
      const response = await apiService.getAllUsers();
      const filterUsers = response.users.filter(
        (user) => user.role === "customer"
      );
      const filterVendors = response.users.filter(
        (user) => user.role === "vendor"
      );
      setAllUsers(filterUsers);
      setAllVendors(filterVendors);
      setUsers([...filterUsers, ...filterVendors]); // Set combined users for stats
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setAllUsers([]);
      setAllVendors([]);
      setUsers([]);
    }
  };

  // Add product edit handler
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditProductModal(true);
  };

  // Add product delete handler
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setActionLoading((prev) => ({ ...prev, [productId]: "deleting" }));
        await apiService.deleteProduct(productId);
        // Refresh products after deletion
        await fetchProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Failed to delete product");
      } finally {
        setActionLoading((prev) => ({ ...prev, [productId]: null }));
      }
    }
  };

  // Add user action handler
  const handleUserAction = async (userId, action) => {
    try {
      // setActionLoading((prev) => ({ ...prev, [userId]: action }));

      if (action === "activate") {
        await apiService.adminActivateUser(userId);
      } else if (action === "suspend") {
        await apiService.adminSuspendUser(userId);
      } else if (action === "delete") {
        if (window.confirm("Are you sure you want to delete this user?")) {
          await apiService.adminDeleteUser(userId);
        } else {
          setActionLoading((prev) => ({ ...prev, [userId]: null }));
          return;
        }
      }

      // Refresh ALL data
      await Promise.all([
        // Refresh users and vendors lists
        (async () => {
          const response = await apiService.getAllUsers();
          const filterUsers = response.users.filter(
            (user) => user.role === "customer"
          );
          const filterVendors = response.users.filter(
            (user) => user.role === "vendor"
          );
          setAllUsers(filterUsers);
          setAllVendors(filterVendors);
          setUsers([...filterUsers, ...filterVendors]);
        })(),
        // Refresh vendors from context
        getVendors(),
        getVendorApplications(),
      ]);

      // CRITICAL: Update the selectedUser if it's the same user
      if (selectedUser && selectedUser._id === userId) {
        const response = await apiService.getAllUsers();
        const updatedUser = response.users.find((user) => user._id === userId);
        if (updatedUser) {
          setSelectedUser(updatedUser); // This updates the modal
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const stats = [
    {
      name: "Total Users",
      value: allUsers.length,
      change: "+12%",
      icon: Users,
      color: "bg-blue-500",
      trend: "up",
    },
    {
      name: "Active Vendors",
      value: allVendors.length,
      change: "+8%",
      icon: Store,
      color: "bg-green-500",
      trend: "up",
    },
    {
      name: "Total Products",
      value: products.length.toString(),
      change: "+23%",
      icon: Package,
      color: "bg-purple-500",
      trend: "up",
    },
    {
      name: "Total Revenue",
      value: "$124,563",
      change: `+${getRevenueGrowth()}%`,
      icon: DollarSign,
      color: "bg-yellow-500",
      trend: "up",
    },
  ];

  const pendingApplications = vendorApplications.filter(
    (app) => app.vendorInfo?.status === "pending"
  );

  const recentActivities = [
    {
      id: 1,
      type: "vendor_approved",
      message: "Tech Gadgets Pro vendor application approved",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "product_added",
      message: "New product 'Premium Headphones' added",
      time: "4 hours ago",
      icon: Package,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "order_completed",
      message: "Order #ORD-1234 completed successfully",
      time: "6 hours ago",
      icon: ShoppingBag,
      color: "text-purple-600",
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      inactive: { bg: "bg-gray-100", text: "text-gray-800", label: "Inactive" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatProductRating = (rating) => {
    if (typeof rating === "object" && rating !== null) {
      return rating.average ? rating.average.toFixed(1) : "0.0";
    }
    return typeof rating === "number" ? rating.toFixed(1) : "0.0";
  };

  const formatProductReviews = (rating) => {
    if (typeof rating === "object" && rating !== null) {
      return rating.count || 0;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your e-commerce platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    <span
                      className={`ml-2 text-sm flex items-center ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="mb-8 space-y-4">
          {pendingApplications.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Pending Vendor Applications
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You have {pendingApplications.length} vendor application(s)
                    waiting for review.
                  </p>
                </div>
                <Link
                  to="/admin/vendor-applications"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Review Now
                </Link>
              </div>
            </div>
          )}

          {products.filter((p) => p.stock < 10).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-red-600 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Low Stock Alert
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {products.filter((p) => p.stock < 10).length} products are
                    running low on stock.
                  </p>
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  View Products
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: Activity },
              { id: "vendors", name: "Vendors", icon: Store },
              { id: "products", name: "Products", icon: Package },
              { id: "users", name: "Users", icon: Users },
              { id: "analytics", name: "Analytics", icon: TrendingUp },
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Activities
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-3"
                      >
                        <activity.icon
                          className={`h-5 w-5 ${activity.color}`}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    Top Products
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div key={product._id} className="flex items-center">
                        <img
                          src={
                            product.colorVariants[0].images[0]?.url ||
                            "https://via.placeholder.com/48"
                          }
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${product.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ★ {formatProductRating(product.rating)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatProductReviews(product.rating)} reviews
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-orange-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/admin/vendor-applications"
                  className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all"
                >
                  <UserCheck className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Review Applications
                    </p>
                    <p className="text-sm text-gray-500">
                      {pendingApplications.length} pending
                    </p>
                  </div>
                </Link>
                <Link
                  to="/admin/promotions"
                  className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all"
                >
                  <Gift className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Manage Promotions
                    </p>
                    <p className="text-sm text-gray-500">
                      Create & edit offers
                    </p>
                  </div>
                </Link>
                <Link
                  to="/admin/analytics"
                  className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all"
                >
                  <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View Analytics</p>
                    <p className="text-sm text-gray-500">Sales & performance</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "vendors" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Vendor Management
              </h3>
              <div className="flex space-x-2">
                <span className="text-sm text-gray-500">
                  Total: {vendors.length} vendors
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => {
                    const vendorProducts = products.filter(
                      (p) => p.vendor === vendor._id
                    );
                    return (
                      <tr key={vendor._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={
                                vendor.avatar ||
                                "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
                              }
                              alt={vendor.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {vendor.vendorInfo?.shopName || vendor.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vendor.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor.vendorInfo?.businessType || "Not specified"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(
                            vendor.vendorInfo?.status || "pending"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendorProducts.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(
                            vendor.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(vendor);
                                setShowUserDetails(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleUserAction(
                                  vendor._id,
                                  vendor.vendorInfo?.status === "approved"
                                    ? "suspend"
                                    : "activate"
                                )
                              }
                              disabled={actionLoading[vendor._id]}
                              className="text-green-600 hover:text-green-900"
                            >
                              {actionLoading[vendor._id] ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : vendor.vendorInfo?.status === "approved" ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleUserAction(vendor._id, "delete")
                              }
                              disabled={actionLoading[vendor._id]}
                              className="text-red-600 hover:text-red-900"
                            >
                              {actionLoading[vendor._id] === "delete" ? (
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
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Product Management
              </h3>
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin/products"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Manage All Products
                </Link>
                <span className="text-sm text-gray-500">
                  Total: {products.length} products
                </span>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>All Categories</option>
                  <option>Women</option>
                  <option>Men</option>
                  <option>Accessories</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={
                        product.colorVariants[0].images?.[0]?.url ||
                        "https://via.placeholder.com/200"
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 line-clamp-2 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        by {product.vendorName || "Unknown Vendor"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          ${product.price}
                        </span>
                        {getStatusBadge(product.status || "active")}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Stock: {product.stock || 0}</span>
                        <span>★ {formatProductRating(product.rating)}</span>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          <Eye className="h-4 w-4 inline mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={actionLoading[product._id] === "deleting"}
                          className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                        >
                          {actionLoading[product._id] === "deleting" ? (
                            <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 inline mr-1" />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                User Management
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {users.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">
                        Active Users
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {isActive}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-900">
                        New This Month
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {activeUserCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  User Overview
                </h4>
                <p className="text-gray-500 mb-4">
                  Quick user statistics and management
                </p>
                <Link
                  to="/admin/users"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Manage All Users
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Analytics Controls */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Analytics Overview
                </h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <Link
                    to="/admin/analytics"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Detailed Analytics
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sales Analytics
                </h3>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Sales Chart</p>
                    <p className="text-sm text-gray-500">
                      Revenue: $
                      {analytics.sales[selectedTimeframe]?.slice(-1)[0] || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Visitor Analytics */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Visitor Analytics
                </h3>
                <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Visitor Chart</p>
                    <p className="text-sm text-gray-500">
                      Growth: +{getVisitorGrowth()}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.topCategories.map((category, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">
                      {category.name}
                    </h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {category.sales}
                    </p>
                    <p className="text-sm text-gray-500">
                      {category.percentage}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigation to Other Admin Pages */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <Grid className="h-5 w-5 mr-2 text-indigo-600" />
            Admin Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Link
              to="/admin/users"
              className="flex items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all transform hover:scale-105"
            >
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">User Management</p>
                <p className="text-sm text-gray-500">Manage all users</p>
              </div>
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all transform hover:scale-105"
            >
              <Package className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Product Management</p>
                <p className="text-sm text-gray-500">Manage all products</p>
              </div>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all transform hover:scale-105"
            >
              <ShoppingBag className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Order Management</p>
                <p className="text-sm text-gray-500">Track all orders</p>
              </div>
            </Link>
            <Link
              to="/admin/vendor-applications"
              className="flex items-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all transform hover:scale-105"
            >
              <Store className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Vendor Applications</p>
                <p className="text-sm text-gray-500">Review applications</p>
              </div>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-indigo-200 transition-all transform hover:scale-105"
            >
              <Grid className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Category Management</p>
                <p className="text-sm text-gray-500">Organize categories</p>
              </div>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl hover:from-pink-100 hover:to-pink-200 transition-all transform hover:scale-105"
            >
              <TrendingUp className="h-8 w-8 text-pink-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Analytics Dashboard</p>
                <p className="text-sm text-gray-500">Detailed insights</p>
              </div>
            </Link>
            <Link
              to="/admin/promotions"
              className="flex items-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl hover:from-yellow-100 hover:to-yellow-200 transition-all transform hover:scale-105"
            >
              <Gift className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Promotions</p>
                <p className="text-sm text-gray-500">Manage offers</p>
              </div>
            </Link>
            <Link
              to="/admin/notifications"
              className="flex items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all transform hover:scale-105"
            >
              <Bell className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Notification Center</p>
                <p className="text-sm text-gray-500">Send notifications</p>
              </div>
            </Link>
            <Link
              to="/admin/reports"
              className="flex items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all transform hover:scale-105"
            >
              <FileText className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Reports Center</p>
                <p className="text-sm text-gray-500">Generate reports</p>
              </div>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all transform hover:scale-105"
            >
              <Settings className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">System Settings</p>
                <p className="text-sm text-gray-500">Configure platform</p>
              </div>
            </Link>
          </div>
        </div>

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <UserDetails
            selectedUser={selectedUser}
            users={allUsers.concat(allVendors)}
            setShowUserDetails={setShowUserDetails}
            fetchUsers={getAllUsers}
            setSelectedUser={setSelectedUser}
            onUserAction={handleUserAction}
          />
        )}

        {/* Edit Product Modal */}
        {showEditProductModal && editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => setShowEditProductModal(false)}
            onUpdate={fetchProducts}
            loading={actionLoading[editingProduct._id] === "updating"}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
