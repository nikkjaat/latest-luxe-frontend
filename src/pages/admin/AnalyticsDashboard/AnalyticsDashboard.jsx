import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ShoppingBag,
  Calendar,
  Download,
  RefreshCw,
  ArrowLeft,
  BarChart3,
  PieChart,
  Activity,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAnalytics } from "../../../context/AnalyticsContext";
import apiService from "../../../services/api";
import styles from "./AnalyticsDashboard.module.css";

const AnalyticsDashboard = () => {
  const { analytics, getRevenueGrowth, getVisitorGrowth } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.adminGetAnalytics({
        timeframe: selectedTimeframe,
      });
      setAnalyticsData(response.analytics || analytics);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Use context analytics as fallback
      setAnalyticsData(analytics);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType) => {
    try {
      setActionLoading((prev) => ({ ...prev, [reportType]: "exporting" }));

      let csvContent = "";
      let filename = "";

      switch (reportType) {
        case "sales":
          csvContent = [
            ["Date", "Sales", "Revenue"].join(","),
            ...analyticsData.sales[selectedTimeframe].map((sale, index) =>
              [
                `Day ${index + 1}`,
                sale,
                sale * 150, // Estimated revenue per sale
              ].join(",")
            ),
          ].join("\n");
          filename = `sales-report-${selectedTimeframe}-${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
        case "visitors":
          csvContent = [
            ["Date", "Visitors"].join(","),
            ...analyticsData.visitors[selectedTimeframe].map(
              (visitors, index) => [`Day ${index + 1}`, visitors].join(",")
            ),
          ].join("\n");
          filename = `visitors-report-${selectedTimeframe}-${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
        case "products":
          csvContent = [
            ["Product", "Sales", "Revenue"].join(","),
            ...analyticsData.topProducts.map((product) =>
              [`"${product.name}"`, product.sales, product.revenue].join(",")
            ),
          ].join("\n");
          filename = `top-products-${
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
      setActionLoading((prev) => ({ ...prev, [reportType]: null }));
    }
  };

  const currentData = analyticsData || analytics;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Link to="/admin/dashboard" className={styles.backLink}>
                <ArrowLeft className={styles.backIcon} />
              </Link>
              <div>
                <h1 className={styles.headerTitle}>Analytics Dashboard</h1>
                <p className={styles.headerSubtitle}>
                  Comprehensive business insights and performance metrics
                </p>
              </div>
            </div>
            <div className={styles.headerControls}>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className={styles.timeframeSelect}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button onClick={fetchAnalytics} className={styles.refreshButton}>
                <RefreshCw className={styles.refreshIcon} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricContent}>
              <DollarSign
                className={`${styles.metricIcon} ${styles.metricGreenIcon}`}
              />
              <div className={styles.metricText}>
                <p className={styles.metricLabel}>Total Revenue</p>
                <p className={styles.metricValue}>
                  ${currentData.sales[selectedTimeframe]?.slice(-1)[0] || 0}
                </p>
                <p
                  className={`${styles.metricChange} ${styles.metricPositiveChange}`}
                >
                  +{getRevenueGrowth()}% from last period
                </p>
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricContent}>
              <Users
                className={`${styles.metricIcon} ${styles.metricBlueIcon}`}
              />
              <div className={styles.metricText}>
                <p className={styles.metricLabel}>Total Visitors</p>
                <p className={styles.metricValue}>
                  {currentData.visitors[selectedTimeframe]?.slice(-1)[0] || 0}
                </p>
                <p
                  className={`${styles.metricChange} ${styles.metricPositiveChange}`}
                >
                  +{getVisitorGrowth()}% from last period
                </p>
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricContent}>
              <ShoppingBag
                className={`${styles.metricIcon} ${styles.metricPurpleIcon}`}
              />
              <div className={styles.metricText}>
                <p className={styles.metricLabel}>Conversion Rate</p>
                <p className={styles.metricValue}>3.2%</p>
                <p
                  className={`${styles.metricChange} ${styles.metricPositiveChange}`}
                >
                  +0.5% from last period
                </p>
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricContent}>
              <Target
                className={`${styles.metricIcon} ${styles.metricOrangeIcon}`}
              />
              <div className={styles.metricText}>
                <p className={styles.metricLabel}>Avg. Order Value</p>
                <p className={styles.metricValue}>
                  ${currentData.customerMetrics?.averageOrderValue || 185.5}
                </p>
                <p
                  className={`${styles.metricChange} ${styles.metricPositiveChange}`}
                >
                  +12% from last period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.chartsGrid}>
          {/* Sales Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>
                <BarChart3
                  className={`${styles.chartTitleIcon} ${styles.chartBlueIcon}`}
                />
                Sales Analytics
              </h3>
              <button
                onClick={() => handleExportReport("sales")}
                disabled={actionLoading.sales}
                className={styles.exportButton}
              >
                {actionLoading.sales ? (
                  <RefreshCw
                    className={`${styles.exportIcon} ${styles.spinner}`}
                  />
                ) : (
                  <Download className={styles.exportIcon} />
                )}
                Export
              </button>
            </div>
            <div className={`${styles.chartContainer} ${styles.salesChart}`}>
              <div className={styles.chartPlaceholder}>
                <BarChart3
                  className={`${styles.chartPlaceholderIcon} ${styles.salesPlaceholderIcon}`}
                />
                <p className={styles.chartLabel}>Sales Trend</p>
                <p className={styles.chartValue}>
                  Current: $
                  {currentData.sales[selectedTimeframe]?.slice(-1)[0] || 0}
                </p>
                <div className={styles.chartBars}>
                  {currentData.sales[selectedTimeframe]?.map((value, index) => (
                    <div
                      key={index}
                      className={styles.chartBar}
                      style={{
                        height: `${
                          (value /
                            Math.max(...currentData.sales[selectedTimeframe])) *
                          40
                        }px`,
                      }}
                      title={`Day ${index + 1}: $${value}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visitor Analytics */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>
                <Activity
                  className={`${styles.chartTitleIcon} ${styles.chartGreenIcon}`}
                />
                Visitor Analytics
              </h3>
              <button
                onClick={() => handleExportReport("visitors")}
                disabled={actionLoading.visitors}
                className={styles.exportButton}
              >
                {actionLoading.visitors ? (
                  <RefreshCw
                    className={`${styles.exportIcon} ${styles.spinner}`}
                  />
                ) : (
                  <Download className={styles.exportIcon} />
                )}
                Export
              </button>
            </div>
            <div className={`${styles.chartContainer} ${styles.visitorsChart}`}>
              <div className={styles.chartPlaceholder}>
                <Activity
                  className={`${styles.chartPlaceholderIcon} ${styles.visitorsPlaceholderIcon}`}
                />
                <p className={styles.chartLabel}>Visitor Trend</p>
                <p className={styles.chartValue}>
                  Growth: +{getVisitorGrowth()}%
                </p>
                <div className={styles.chartBars}>
                  {currentData.visitors[selectedTimeframe]?.map(
                    (value, index) => (
                      <div
                        key={index}
                        className={styles.chartBar}
                        style={{
                          height: `${
                            (value /
                              Math.max(
                                ...currentData.visitors[selectedTimeframe]
                              )) *
                            40
                          }px`,
                        }}
                        title={`Day ${index + 1}: ${value} visitors`}
                      ></div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products and Categories */}
        <div className={styles.productsCategoriesGrid}>
          {/* Top Products */}
          <div className={styles.productsCard}>
            <div className={styles.productsHeader}>
              <h3 className={styles.chartTitle}>
                <Package
                  className={`${styles.chartTitleIcon} ${styles.chartPurpleIcon}`}
                />
                Top Products
              </h3>
              <button
                onClick={() => handleExportReport("products")}
                disabled={actionLoading.products}
                className={styles.exportButton}
              >
                {actionLoading.products ? (
                  <RefreshCw
                    className={`${styles.exportIcon} ${styles.spinner}`}
                  />
                ) : (
                  <Download className={styles.exportIcon} />
                )}
                Export
              </button>
            </div>
            <div className={styles.productsList}>
              {currentData.topProducts?.map((product, index) => (
                <div key={product.id} className={styles.productItem}>
                  <div className={styles.productInfo}>
                    <div className={styles.productRank}>
                      <span className={styles.productRankText}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className={styles.productDetails}>
                      <h4>{product.name}</h4>
                      <p>{product.sales} sales</p>
                    </div>
                  </div>
                  <div className={styles.productRevenue}>
                    <p className={styles.productRevenueValue}>
                      ${product.revenue}
                    </p>
                    <p className={styles.productRevenueLabel}>Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className={styles.categoriesCard}>
            <div className={styles.categoriesHeader}>
              <h3 className={styles.chartTitle}>
                <PieChart
                  className={`${styles.chartTitleIcon} ${styles.chartOrangeIcon}`}
                />
                Top Categories
              </h3>
            </div>
            <div className={styles.categoriesList}>
              {currentData.topCategories?.map((category, index) => (
                <div key={index} className={styles.categoryItem}>
                  <div className={styles.categoryInfo}>
                    <div
                      className={styles.categoryColor}
                      style={{
                        backgroundColor: [
                          "#3b82f6",
                          "#10b981",
                          "#f59e0b",
                          "#ef4444",
                        ][index % 4],
                      }}
                    ></div>
                    <div className={styles.categoryDetails}>
                      <h4>{category.name}</h4>
                      <p>{category.sales} sales</p>
                    </div>
                  </div>
                  <div className={styles.categoryStats}>
                    <p className={styles.categoryPercentage}>
                      {category.percentage}%
                    </p>
                    <div className={styles.categoryBar}>
                      <div
                        className={styles.categoryBarFill}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className={styles.customerMetricsCard}>
          <h3 className={styles.customerMetricsHeader}>
            <Users className={styles.customerMetricsIcon} />
            Customer Metrics
          </h3>
          <div className={styles.customerMetricsGrid}>
            <div className={styles.customerMetric}>
              <div
                className={`${styles.customerMetricValue} ${styles.customerMetricBlue}`}
              >
                {currentData.customerMetrics?.totalCustomers || 0}
              </div>
              <div className={styles.customerMetricLabel}>Total Customers</div>
            </div>
            <div className={styles.customerMetric}>
              <div
                className={`${styles.customerMetricValue} ${styles.customerMetricGreen}`}
              >
                {currentData.customerMetrics?.newCustomers || 0}
              </div>
              <div className={styles.customerMetricLabel}>New Customers</div>
            </div>
            <div className={styles.customerMetric}>
              <div
                className={`${styles.customerMetricValue} ${styles.customerMetricPurple}`}
              >
                {currentData.customerMetrics?.returningCustomers || 0}
              </div>
              <div className={styles.customerMetricLabel}>
                Returning Customers
              </div>
            </div>
            <div className={styles.customerMetric}>
              <div
                className={`${styles.customerMetricValue} ${styles.customerMetricOrange}`}
              >
                ${currentData.customerMetrics?.averageOrderValue || 0}
              </div>
              <div className={styles.customerMetricLabel}>Avg. Order Value</div>
            </div>
            <div className={styles.customerMetric}>
              <div
                className={`${styles.customerMetricValue} ${styles.customerMetricRed}`}
              >
                ${currentData.customerMetrics?.customerLifetimeValue || 0}
              </div>
              <div className={styles.customerMetricLabel}>Customer LTV</div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className={styles.insightsGrid}>
          {/* Revenue Insights */}
          <div className={styles.insightCard}>
            <h3 className={styles.insightHeader}>
              <TrendingUp
                className={`${styles.insightIcon} ${styles.insightGreenIcon}`}
              />
              Revenue Insights
            </h3>
            <div className={styles.insightList}>
              <div className={styles.insightItem}>
                <span className={styles.insightLabel}>This Month</span>
                <span
                  className={`${styles.insightValue} ${styles.insightPositiveValue}`}
                >
                  ${currentData.sales.monthly?.slice(-1)[0] || 0}
                </span>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightLabel}>Last Month</span>
                <span className={styles.insightValue}>
                  ${currentData.sales.monthly?.slice(-2, -1)[0] || 0}
                </span>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightLabel}>Growth Rate</span>
                <span
                  className={`${styles.insightValue} ${styles.insightPositiveValue}`}
                >
                  +{getRevenueGrowth()}%
                </span>
              </div>
              <div className={styles.insightDivider}>
                <div className={styles.insightSubtitle}>Revenue Trend</div>
                <div className={styles.insightProgress}>
                  <div
                    className={styles.insightProgressFill}
                    style={{
                      width: `${Math.min(
                        parseFloat(getRevenueGrowth()),
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className={styles.insightCard}>
            <h3 className={styles.insightHeader}>
              <Activity
                className={`${styles.insightIcon} ${styles.insightBlueIcon}`}
              />
              Traffic Sources
            </h3>
            <div className={styles.insightList}>
              {[
                {
                  source: "Direct",
                  percentage: 45,
                  color: styles.trafficBlue,
                  barColor: styles.trafficBarBlue,
                },
                {
                  source: "Search Engines",
                  percentage: 30,
                  color: styles.trafficGreen,
                  barColor: styles.trafficBarGreen,
                },
                {
                  source: "Social Media",
                  percentage: 15,
                  color: styles.trafficPurple,
                  barColor: styles.trafficBarPurple,
                },
                {
                  source: "Referrals",
                  percentage: 10,
                  color: styles.trafficOrange,
                  barColor: styles.trafficBarOrange,
                },
              ].map((item, index) => (
                <div key={index} className={styles.trafficItem}>
                  <div className={styles.trafficSource}>
                    <div
                      className={`${styles.trafficColor} ${item.color}`}
                    ></div>
                    <span className={styles.trafficName}>{item.source}</span>
                  </div>
                  <div className={styles.trafficStats}>
                    <span className={styles.trafficPercentage}>
                      {item.percentage}%
                    </span>
                    <div className={styles.trafficBar}>
                      <div
                        className={`${styles.trafficBarFill} ${item.barColor}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.reportsCard}>
            <h3 className={styles.reportsHeader}>Quick Reports</h3>
            <div className={styles.reportsList}>
              <button
                onClick={() => handleExportReport("sales")}
                disabled={actionLoading.sales}
                className={styles.reportButton}
              >
                <div className={styles.reportInfo}>
                  <DollarSign
                    className={`${styles.reportIcon} ${styles.reportGreenIcon}`}
                  />
                  <span>Sales Report</span>
                </div>
                {actionLoading.sales ? (
                  <RefreshCw
                    className={`${styles.exportIcon} ${styles.spinner}`}
                  />
                ) : (
                  <Download className={styles.exportIcon} />
                )}
              </button>

              <button
                onClick={() => handleExportReport("visitors")}
                disabled={actionLoading.visitors}
                className={styles.reportButton}
              >
                <div className={styles.reportInfo}>
                  <Users
                    className={`${styles.reportIcon} ${styles.reportBlueIcon}`}
                  />
                  <span>Visitor Report</span>
                </div>
                {actionLoading.visitors ? (
                  <RefreshCw
                    className={`${styles.exportIcon} ${styles.spinner}`}
                  />
                ) : (
                  <Download className={styles.exportIcon} />
                )}
              </button>

              <button
                onClick={() => handleExportReport("products")}
                disabled={actionLoading.products}
                className={styles.reportButton}
              >
                <div className={styles.reportInfo}>
                  <Package
                    className={`${styles.reportIcon} ${styles.reportPurpleIcon}`}
                  />
                  <span>Product Report</span>
                </div>
                {actionLoading.products ? (
                  <RefreshCw
                    className={`${styles.exportIcon} ${styles.spinner}`}
                  />
                ) : (
                  <Download className={styles.exportIcon} />
                )}
              </button>

              <Link to="/admin/dashboard" className={styles.dashboardLink}>
                <ArrowLeft className={styles.dashboardIcon} />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Table */}
        <div className={styles.analyticsTable}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Detailed Analytics</h3>
          </div>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeaderCell}>Metric</th>
                <th className={styles.tableHeaderCell}>Current Period</th>
                <th className={styles.tableHeaderCell}>Previous Period</th>
                <th className={styles.tableHeaderCell}>Change</th>
                <th className={styles.tableHeaderCell}>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <span className={styles.tableMetric}>Revenue</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.tableValue}>
                    ${currentData.sales[selectedTimeframe]?.slice(-1)[0] || 0}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.tableValue}>
                    $
                    {currentData.sales[selectedTimeframe]?.slice(-2, -1)[0] ||
                      0}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span
                    className={`${styles.tableChange} ${styles.tablePositiveChange}`}
                  >
                    +{getRevenueGrowth()}%
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <TrendingUp
                    className={`${styles.tableTrendIcon} ${styles.tablePositiveTrend}`}
                  />
                </td>
              </tr>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <span className={styles.tableMetric}>Visitors</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.tableValue}>
                    {currentData.visitors[selectedTimeframe]?.slice(-1)[0] || 0}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.tableValue}>
                    {currentData.visitors[selectedTimeframe]?.slice(
                      -2,
                      -1
                    )[0] || 0}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span
                    className={`${styles.tableChange} ${styles.tablePositiveChange}`}
                  >
                    +{getVisitorGrowth()}%
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <TrendingUp
                    className={`${styles.tableTrendIcon} ${styles.tablePositiveTrend}`}
                  />
                </td>
              </tr>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <span className={styles.tableMetric}>Conversion Rate</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.tableValue}>3.2%</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.tableValue}>2.7%</span>
                </td>
                <td className={styles.tableCell}>
                  <span
                    className={`${styles.tableChange} ${styles.tablePositiveChange}`}
                  >
                    +0.5%
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <TrendingUp
                    className={`${styles.tableTrendIcon} ${styles.tablePositiveTrend}`}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
