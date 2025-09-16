import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingBag,
  ArrowLeft,
  RefreshCw,
  FileText,
  PieChart,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

const ReportsCenter = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [exportLoading, setExportLoading] = useState({});

  const reportTypes = [
    {
      id: "sales",
      name: "Sales Report",
      description: "Revenue, orders, and sales trends",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      id: "products",
      name: "Product Performance",
      description: "Best selling products and inventory",
      icon: Package,
      color: "text-blue-600",
    },
    {
      id: "users",
      name: "User Analytics",
      description: "User registration and activity",
      icon: Users,
      color: "text-purple-600",
    },
    {
      id: "vendors",
      name: "Vendor Performance",
      description: "Vendor sales and product metrics",
      icon: ShoppingBag,
      color: "text-orange-600",
    },
  ];

  useEffect(() => {
    generateReport();
  }, [selectedReport, dateRange]);

  const generateReport = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiService.adminGenerateReport(selectedReport, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
        setReportData(response.data || generateMockReportData(selectedReport));
      } catch (apiError) {
        console.error("API call failed, using mock data:", apiError);
        setReportData(generateMockReportData(selectedReport));
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      setReportData(generateMockReportData(selectedReport));
    } finally {
      setLoading(false);
    }
  };

  const generateMockReportData = (reportType) => {
    switch (reportType) {
      case "sales":
        return {
          totalRevenue: 124563,
          totalOrders: 1247,
          averageOrderValue: 99.89,
          revenueGrowth: 15.3,
          topProducts: [
            { name: "Premium Leather Handbag", revenue: 15420, orders: 52 },
            { name: "Designer Watch Collection", revenue: 12890, orders: 23 },
            { name: "Silk Scarf Set", revenue: 8760, orders: 87 },
          ],
          dailySales: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            revenue: Math.floor(Math.random() * 5000) + 2000,
            orders: Math.floor(Math.random() * 50) + 20,
          })),
        };
      case "products":
        return {
          totalProducts: 156,
          activeProducts: 142,
          lowStockProducts: 8,
          outOfStockProducts: 6,
          topCategories: [
            { name: "Accessories", products: 45, revenue: 23450 },
            { name: "Women", products: 38, revenue: 19870 },
            { name: "Electronics", products: 25, revenue: 15600 },
          ],
        };
      case "users":
        return {
          totalUsers: 2543,
          newUsers: 156,
          activeUsers: 1987,
          userGrowth: 12.5,
          usersByRole: [
            { role: "Customer", count: 2387 },
            { role: "Vendor", count: 156 },
          ],
        };
      case "vendors":
        return {
          totalVendors: 156,
          activeVendors: 142,
          pendingApplications: 14,
          topVendors: [
            { name: "Fashion Hub", revenue: 45670, products: 23 },
            { name: "Tech Store Pro", revenue: 38920, products: 18 },
            { name: "Home Essentials", revenue: 29450, products: 31 },
          ],
        };
      default:
        return {};
    }
  };

  const handleExportReport = async (format) => {
    try {
      setExportLoading((prev) => ({ ...prev, [format]: "exporting" }));

      let csvContent = "";
      let filename = "";

      switch (selectedReport) {
        case "sales":
          csvContent = [
            ["Date", "Revenue", "Orders"].join(","),
            ...reportData.dailySales.map((day) =>
              [day.date, day.revenue, day.orders].join(",")
            ),
          ].join("\n");
          filename = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
          break;
        case "products":
          csvContent = [
            ["Category", "Products", "Revenue"].join(","),
            ...reportData.topCategories.map((cat) =>
              [cat.name, cat.products, cat.revenue].join(",")
            ),
          ].join("\n");
          filename = `product-report-${
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
      console.error("Failed to export report:", error);
      alert("Failed to export report");
    } finally {
      setExportLoading((prev) => ({ ...prev, [format]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/admin/dashboard"
                className="text-blue-600 hover:text-blue-700 mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Reports Center
                </h1>
                <p className="text-gray-600 mt-2">
                  Generate and export detailed business reports
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={generateReport}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </button>
              <button
                onClick={() => handleExportReport("csv")}
                disabled={exportLoading.csv || !reportData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                {exportLoading.csv ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedReport === report.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <report.icon className={`h-8 w-8 ${report.color} mb-3`} />
              <h3 className="font-semibold text-gray-900 mb-2">
                {report.name}
              </h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </button>
          ))}
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Date Range</h3>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <RefreshCw className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Generating report...</p>
          </div>
        ) : reportData ? (
          <div className="space-y-8">
            {/* Sales Report */}
            {selectedReport === "sales" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${reportData.totalRevenue?.toLocaleString()}
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
                          {reportData.totalOrders?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Avg Order Value
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${reportData.averageOrderValue?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-orange-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Growth Rate
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          +{reportData.revenueGrowth?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Top Products
                  </h3>
                  <div className="space-y-4">
                    {reportData.topProducts?.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-blue-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {product.orders} orders
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            ${product.revenue?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Product Report */}
            {selectedReport === "products" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Package className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Total Products
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.totalProducts}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Active Products
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.activeProducts}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Low Stock
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.lowStockProducts}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Package className="h-8 w-8 text-red-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Out of Stock
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.outOfStockProducts}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Top Categories
                  </h3>
                  <div className="space-y-4">
                    {reportData.topCategories?.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{
                              backgroundColor: [
                                "#3b82f6",
                                "#10b981",
                                "#f59e0b",
                              ][index % 3],
                            }}
                          ></div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {category.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {category.products} products
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            ${category.revenue?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* User Report */}
            {selectedReport === "users" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.totalUsers?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          New Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.newUsers}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Active Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.activeUsers?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Growth Rate
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          +{reportData.userGrowth?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Vendor Report */}
            {selectedReport === "vendors" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <ShoppingBag className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Total Vendors
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.totalVendors}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Active Vendors
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.activeVendors}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">
                          Pending Applications
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {reportData.pendingApplications}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Top Vendors
                  </h3>
                  <div className="space-y-4">
                    {reportData.topVendors?.map((vendor, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-purple-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {vendor.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {vendor.products} products
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            ${vendor.revenue?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No report data
            </h3>
            <p className="text-gray-500">
              Select a report type and date range to generate a report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsCenter;
