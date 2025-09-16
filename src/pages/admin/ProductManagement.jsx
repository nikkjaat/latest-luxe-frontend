import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Upload,
  X,
  Save,
  ArrowLeft,
  Download,
  RefreshCw,
  Grid,
  List,
  MoreVertical,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import EditProductModal from "./EditProductModal "; // Import the new component

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVendor, setFilterVendor] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState({});

  const categories = [
    "all",
    "women",
    "men",
    "accessories",
    "home",
    "electronics",
    "beauty",
    "sports",
    "kids",
  ];

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

  const fetchVendors = async () => {
    try {
      try {
        const response = await apiService.getAllUsers();
        const vendorUsers = response.users.filter(
          (user) => user.role === "vendor"
        );
        setVendors(vendorUsers);
      } catch (apiError) {
        console.error("API call failed:", apiError);
        setVendors([]);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      setVendors([]);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setActionLoading((prev) => ({ ...prev, [productId]: "deleting" }));
        const response = await apiService.deleteProduct(productId);
        if (response.success) {
          await fetchProducts(); // Refresh the entire list
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

  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedProducts.length} products?`
      )
    ) {
      try {
        setActionLoading((prev) => ({ ...prev, bulk: "deleting" }));
        await Promise.all(
          selectedProducts.map((id) => apiService.deleteProduct(id))
        );
        await fetchProducts();
        setSelectedProducts([]);
      } catch (error) {
        console.error("Failed to delete products:", error);
        alert("Failed to delete some products");
      } finally {
        setActionLoading((prev) => ({ ...prev, bulk: null }));
      }
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedProducts.length === 0) return;

    try {
      setActionLoading((prev) => ({ ...prev, bulk: "updating" }));
      await Promise.all(
        selectedProducts.map((id) => {
          const formData = new FormData();
          formData.append("status", status);
          return apiService.updateProduct(id, formData);
        })
      );
      await fetchProducts();
      setSelectedProducts([]);
    } catch (error) {
      console.error("Failed to update product status:", error);
      alert("Failed to update product status");
    } finally {
      setActionLoading((prev) => ({ ...prev, bulk: null }));
    }
  };

  const handleExportProducts = async () => {
    try {
      setActionLoading((prev) => ({ ...prev, export: "exporting" }));
      // Create CSV content
      const csvContent = [
        [
          "Name",
          "Category",
          "Price",
          "Stock",
          "Status",
          "Vendor",
          "Rating",
        ].join(","),
        ...filteredProducts.map((product) =>
          [
            `"${product.name}"`,
            product.category,
            product.price,
            product.stock,
            product.status,
            `"${product.vendorName || "Unknown"}"`,
            formatProductRating(product.rating),
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export products:", error);
      alert("Failed to export products");
    } finally {
      setActionLoading((prev) => ({ ...prev, export: null }));
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p._id));
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || product.category === filterCategory;
      const matchesStatus =
        filterStatus === "all" || product.status === filterStatus;
      const matchesVendor =
        filterVendor === "all" || product.vendor === filterVendor;

      return matchesSearch && matchesCategory && matchesStatus && matchesVendor;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "stock":
          aValue = a.stock || 0;
          bValue = b.stock || 0;
          break;
        case "rating":
          aValue =
            typeof a.rating === "object" ? a.rating.average : a.rating || 0;
          bValue =
            typeof b.rating === "object" ? b.rating.average : b.rating || 0;
          break;
        case "date":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
      }

      if (sortOrder === "desc") {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { color: "text-red-600", label: "Out of Stock", icon: XCircle };
    if (stock < 10)
      return {
        color: "text-yellow-600",
        label: "Low Stock",
        icon: AlertTriangle,
      };
    return { color: "text-green-600", label: "In Stock", icon: CheckCircle };
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

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      inactive: { bg: "bg-red-100", text: "text-red-800", label: "Inactive" },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
    };
    const statusConfig = config[status] || config.active;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center mb-2">
              <Link
                to="/admin/dashboard"
                className="text-blue-600 hover:text-blue-700 mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Product Management
              </h1>
            </div>
            <p className="text-gray-600">
              Manage all products across the platform
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportProducts}
              disabled={actionLoading.export}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {actionLoading.export ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </button>
            <Link
              to="/vendor/add-product"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Active Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter((p) => p.status === "active").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter((p) => (p.stock || 0) < 10).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {products.length > 0
                    ? (
                        products.reduce((sum, p) => sum + (p.price || 0), 0) /
                        products.length
                      ).toFixed(0)
                    : "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="relative md:col-span-2">
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.vendorInfo?.shopName || vendor.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split("-");
                setSortBy(sort);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="stock-asc">Stock Low-High</option>
              <option value="stock-desc">Stock High-Low</option>
              <option value="rating-desc">Rating High-Low</option>
              <option value="date-desc">Newest First</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Showing {paginatedProducts.length} of {filteredProducts.length}{" "}
                products
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded ${
                    viewMode === "table"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-800">
                  {selectedProducts.length} selected
                </span>
                <button
                  onClick={() => handleBulkStatusUpdate("active")}
                  disabled={actionLoading.bulk}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate("inactive")}
                  disabled={actionLoading.bulk}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                >
                  Deactivate
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={actionLoading.bulk}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading.bulk === "deleting" ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Display */}
        {viewMode === "table" ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedProducts.length ===
                            paginatedProducts.length &&
                          paginatedProducts.length > 0
                        }
                        onChange={selectAllProducts}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
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
                  {paginatedProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock || 0);

                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => toggleProductSelection(product._id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </td>
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
                              {product.badge && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="capitalize">{product.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.vendorName || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-600">
                            ${product.price}
                          </div>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <div className="text-xs text-gray-500 line-through">
                                ${product.originalPrice}
                              </div>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`flex items-center ${stockStatus.color}`}
                          >
                            <stockStatus.icon className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">
                              {product.stock || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(product.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm">
                              {formatProductRating(product.rating)}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">
                              ({formatProductReviews(product.rating)})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Product"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              disabled={actionLoading[product._id]}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete Product"
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock || 0);

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={
                        product.images?.[0]?.url ||
                        "https://via.placeholder.com/300"
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {product.badge}
                      </span>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(product.status)}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 capitalize">
                      by {product.vendorName || "Unknown"}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-blue-600">
                          ${product.price}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ${product.originalPrice}
                            </span>
                          )}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm">
                          {formatProductRating(product.rating)}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center mb-3 ${stockStatus.color}`}
                    >
                      <stockStatus.icon className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        Stock: {product.stock || 0}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === pageNumber
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* View Product Modal */}
        {showViewModal && viewingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Product Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={
                        viewingProduct.images?.[0]?.url ||
                        "https://via.placeholder.com/400"
                      }
                      alt={viewingProduct.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {viewingProduct.images &&
                      viewingProduct.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {viewingProduct.images
                            .slice(1, 5)
                            .map((image, index) => (
                              <img
                                key={index}
                                src={image.url}
                                alt={`${viewingProduct.name} ${index + 2}`}
                                className="w-full h-16 object-cover rounded"
                              />
                            ))}
                        </div>
                      )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {viewingProduct.name}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {viewingProduct.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Price</span>
                        <p className="text-xl font-bold text-blue-600">
                          ${viewingProduct.price}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Stock</span>
                        <p className="text-lg font-semibold">
                          {viewingProduct.stock || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Category</span>
                        <p className="capitalize">{viewingProduct.category}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Vendor</span>
                        <p>{viewingProduct.vendorName || "Unknown"}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Rating</span>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold">
                          {formatProductRating(viewingProduct.rating)}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({formatProductReviews(viewingProduct.rating)}{" "}
                          reviews)
                        </span>
                      </div>
                    </div>

                    {viewingProduct.specifications && (
                      <div>
                        <span className="text-sm text-gray-500">
                          Specifications
                        </span>
                        <div className="mt-2 space-y-1 text-sm">
                          {viewingProduct.specifications.material && (
                            <p>
                              <strong>Material:</strong>{" "}
                              {viewingProduct.specifications.material}
                            </p>
                          )}
                          {viewingProduct.specifications.weight && (
                            <p>
                              <strong>Weight:</strong>{" "}
                              {viewingProduct.specifications.weight} kg
                            </p>
                          )}
                          {viewingProduct.specifications.color &&
                            viewingProduct.specifications.color.length > 0 && (
                              <p>
                                <strong>Colors:</strong>{" "}
                                {viewingProduct.specifications.color.join(", ")}
                              </p>
                            )}
                          {viewingProduct.specifications.size &&
                            viewingProduct.specifications.size.length > 0 && (
                              <p>
                                <strong>Sizes:</strong>{" "}
                                {viewingProduct.specifications.size.join(", ")}
                              </p>
                            )}
                        </div>
                      </div>
                    )}

                    {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Tags</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {viewingProduct.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link
                    to={`/product/${viewingProduct._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View on Site
                  </Link>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditProduct(viewingProduct);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => setShowEditModal(false)}
            onUpdate={fetchProducts}
            loading={actionLoading[editingProduct._id] === "updating"}
          />
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
