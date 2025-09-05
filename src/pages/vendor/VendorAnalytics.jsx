import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  Star,
  Calendar,
  Download,
  RefreshCw,
  ArrowLeft,
  BarChart3,
  PieChart,
  Activity,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductContext";
import apiService from "../../services/api";

const VendorAnalytics = () => {
  const { user } = useAuth();
  const { products, getProductsByVendor } = useProducts();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");
  const [exportLoading, setExportLoading] = useState({});

  const vendorProducts = getProductsByVendor(user?._id);

  useEffect(() => {
    fetchVendorAnalytics();
  }, [selectedTimeframe]);

  const fetchVendorAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVendorAnalytics({
        timeframe: selectedTimeframe,
      });
      setAnalytics(response.analytics || generateMockAnalytics());
    } catch (error) {
      console.error("Failed to fetch vendor analytics:", error);
      setAnalytics(generateMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics = () => ({
    revenue: {
      total: 45670,
      growth: 15.3,
      monthly: [3200, 3800, 4200, 4800, 5200, 5800, 6200],
      daily: Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 500) + 100
      ),
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
      topPerforming: vendorProducts.slice(0, 5).map((p) => ({
        ...p,
        sales: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      })),
    },
    customers: {
      total: 156,
      returning: 89,
      newCustomers: 67,
      satisfaction: 4.8,
    },
  });

  const handleExportAnalytics = async (reportType) => {
    try {
      setExportLoading((prev) => ({ ...prev, [reportType]: "exporting" }));

      let csvContent = "";
      let filename = "";

      switch (reportType) {
        case "revenue":
          csvContent = [
            ["Period", "Revenue"].join(","),
            ...analytics.revenue.monthly.map((revenue, index) =>
              [`Month ${index + 1}`, revenue].join(",")
            ),
          ].join("\n");
          filename = `vendor-revenue-${selectedTimeframe}-${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
        case "products":
          csvContent = [
            ["Product", "Sales", "Revenue", "Views"].join(","),
            ...analytics.products.topPerforming.map((product) =>
              [
                `"${product.name}"`,
                product.sales,
                product.revenue,
                Math.floor(Math.random() * 1000) + 100,
              ].join(",")
            ),
          ].join("\n");
          filename = `vendor-products-${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
        default:
          return;
      }

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export analytics:", error);
      alert("Failed to export analytics");
    } finally {
      setExportLoading((prev) => ({ ...prev, [reportType]: null }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
            <div className="flex items-center">
              <Link
                to="/vendor/dashboard"
                className="text-blue-600 hover:text-blue-700 mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Track your store's performance and growth
                </p>
              </div>
            </div>
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
              <button
                onClick={fetchVendorAnalytics}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics?.revenue?.total?.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{analytics?.revenue?.growth}% growth
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
                  {analytics?.orders?.total}
                </p>
                <p className="text-sm text-blue-600">
                  +{analytics?.orders?.growth}% growth
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Active Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.products?.active}
                </p>
                <p className="text-sm text-purple-600">
                  {analytics?.products?.views?.toLocaleString()} views
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.customers?.total}
                </p>
                <p className="text-sm text-orange-600">
                  {analytics?.customers?.returning} returning
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Revenue Trend
              </h3>
              <button
                onClick={() => handleExportAnalytics("revenue")}
                disabled={exportLoading.revenue}
                className="text-green-600 hover:text-green-700 flex items-center text-sm"
              >
                {exportLoading.revenue ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                Export
              </button>
            </div>
            <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Revenue Chart</p>
                <p className="text-sm text-gray-500">
                  Current: $
                  {analytics?.revenue?.monthly?.slice(-1)[0]?.toLocaleString()}
                </p>
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {analytics?.revenue?.monthly?.map((value, index) => (
                    <div
                      key={index}
                      className="bg-green-500 rounded-sm"
                      style={{
                        height: `${
                          (value / Math.max(...analytics.revenue.monthly)) * 40
                        }px`,
                      }}
                      title={`Month ${index + 1}: $${value}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Order Status Distribution
            </h3>
            <div className="space-y-4">
              {[
                {
                  status: "Completed",
                  count: analytics?.orders?.completed,
                  color: "bg-green-500",
                },
                {
                  status: "Pending",
                  count: analytics?.orders?.pending,
                  color: "bg-yellow-500",
                },
                {
                  status: "Cancelled",
                  count: analytics?.orders?.cancelled,
                  color: "bg-red-500",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-3 ${item.color}`}
                    ></div>
                    <span className="text-gray-700">{item.status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-2">
                      {item.count}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{
                          width: `${
                            (item.count / analytics?.orders?.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-600" />
              Top Performing Products
            </h3>
            <button
              onClick={() => handleExportAnalytics("products")}
              disabled={exportLoading.products}
              className="text-purple-600 hover:text-purple-700 flex items-center text-sm"
            >
              {exportLoading.products ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Export
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics?.products?.topPerforming?.map((product, index) => (
              <div
                key={product._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-3">
                  <img
                    src={
                      product.images?.[0]?.url ||
                      "https://via.placeholder.com/60"
                    }
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover mr-3"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-1">
                      {product.name}
                    </h4>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">
                        {typeof product.rating === "object"
                          ? product.rating.average?.toFixed(1)
                          : product.rating?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Sales</p>
                    <p className="font-bold text-blue-600">{product.sales}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="font-bold text-green-600">
                      ${product.revenue}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Stock</p>
                    <p className="font-medium text-gray-900">{product.stock}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Views</p>
                    <p className="font-medium text-gray-900">
                      {Math.floor(Math.random() * 500) + 100}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/product/${product._id}`}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Product
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Customer Insights
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Customers</span>
                <span className="font-bold text-gray-900">
                  {analytics?.customers?.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Returning Customers</span>
                <span className="font-bold text-green-600">
                  {analytics?.customers?.returning}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Customers</span>
                <span className="font-bold text-blue-600">
                  {analytics?.customers?.newCustomers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Satisfaction Rate</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-bold text-gray-900">
                    {analytics?.customers?.satisfaction}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/vendor/add-product"
                className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Package className="h-4 w-4 mr-2" />
                Add New Product
              </Link>

              <Link
                to="/vendor/orders"
                className="w-full flex items-center justify-center p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Manage Orders
              </Link>

              <button
                onClick={() => handleExportAnalytics("revenue")}
                disabled={exportLoading.revenue}
                className="w-full flex items-center justify-center p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {exportLoading.revenue ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Revenue Report
              </button>

              <button
                onClick={() => handleExportAnalytics("products")}
                disabled={exportLoading.products}
                className="w-full flex items-center justify-center p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {exportLoading.products ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Product Report
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Performance Overview
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  $
                  {(
                    analytics?.revenue?.total / analytics?.orders?.total || 0
                  ).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Average Order Value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {(
                    (analytics?.customers?.returning /
                      analytics?.customers?.total) *
                      100 || 0
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm text-gray-600">
                  Customer Retention Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {(
                    (analytics?.orders?.completed / analytics?.orders?.total) *
                      100 || 0
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm text-gray-600">
                  Order Completion Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
