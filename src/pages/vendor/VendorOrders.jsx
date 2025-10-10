import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  CreditCard as Edit,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  X,
  ArrowLeft,
  Download,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api";

const VendorOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiService.getVendorOrders();
        setOrders(response.orders || []);
      } catch (apiError) {
        console.error("API call failed, using localStorage data:", apiError);
        const storedOrders = JSON.parse(
          localStorage.getItem("userOrders") || "[]"
        );
        const vendorOrders = storedOrders.filter((order) =>
          order.items?.some((item) => item.vendor_id === user?._id)
        );

        if (vendorOrders.length > 0) {
          setOrders(vendorOrders);
        } else {
          const mockOrders = generateMockOrders();
          setOrders(mockOrders);
        }
      }
    } catch (error) {
      console.error("Failed to fetch vendor orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = () => [
    {
      _id: "ORD-V001",
      orderNumber: "ORD-V001",
      customer: {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+1 (555) 123-4567",
      },
      status: "processing",
      total: 299.99,
      vendorTotal: 299.99,
      items: [
        {
          productId: "1",
          name: "Premium Leather Handbag",
          quantity: 1,
          price: 299.99,
          vendorId: user?._id,
        },
      ],
      shippingAddress: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
      createdAt: "2025-01-20T10:30:00Z",
      estimatedDelivery: "2025-01-25",
    },
    {
      _id: "ORD-V002",
      orderNumber: "ORD-V002",
      customer: {
        name: "Michael Chen",
        email: "michael@example.com",
        phone: "+1 (555) 987-6543",
      },
      status: "shipped",
      total: 599.99,
      vendorTotal: 599.99,
      items: [
        {
          productId: "2",
          name: "Designer Watch Collection",
          quantity: 1,
          price: 599.99,
          vendorId: user?._id,
        },
      ],
      shippingAddress: {
        street: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        country: "USA",
      },
      createdAt: "2025-01-19T14:20:00Z",
      trackingNumber: "TRK123456789",
      estimatedDelivery: "2025-01-24",
    },
  ];
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setActionLoading((prev) => ({ ...prev, [orderId]: "updating" }));
      await apiService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  const handleExportOrders = async () => {
    try {
      setActionLoading((prev) => ({ ...prev, export: "exporting" }));

      const csvContent = [
        ["Order ID", "Customer", "Status", "Total", "Items", "Date"].join(","),
        ...filteredOrders.map((order) =>
          [
            order.orderNumber,
            `"${order.customer?.name}"`,
            order.status,
            order.vendorTotal || order.total,
            order.items?.length || 0,
            new Date(order.createdAt).toLocaleDateString(),
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vendor-orders-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export orders:", error);
      alert("Failed to export orders");
    } finally {
      setActionLoading((prev) => ({ ...prev, export: null }));
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        icon: Truck,
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
        icon: XCircle,
        label: "Cancelled",
      },
    };
    return configs[status] || configs.pending;
  };

  // Calculate stats
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.vendorTotal || order.total || 0),
    0
  );
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-2">
                  Manage orders for your products
                </p>
              </div>
            </div>
            <button
              onClick={handleExportOrders}
              disabled={actionLoading.export}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {actionLoading.export ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Orders
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingOrders}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedOrders}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
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
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {paginatedOrders.length} of {filteredOrders.length} orders
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);

                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        {order.trackingNumber && (
                          <div className="text-xs text-gray-500">
                            Tracking: {order.trackingNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          <statusConfig.icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${(order.vendorTotal || order.total || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            disabled={actionLoading[order._id]}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

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

        {filteredOrders.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Orders for your products will appear here."}
            </p>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Details - {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-2 text-gray-400" />
                        <span>{selectedOrder.customer?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        <span>{selectedOrder.customer?.email}</span>
                      </div>
                      {selectedOrder.customer?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2 text-gray-400" />
                          <span>{selectedOrder.customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Order Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            getStatusConfig(selectedOrder.status).bg
                          } ${getStatusConfig(selectedOrder.status).text}`}
                        >
                          {getStatusConfig(selectedOrder.status).label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>
                          {new Date(
                            selectedOrder.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium">
                          $
                          {(
                            selectedOrder.vendorTotal || selectedOrder.total
                          ).toFixed(2)}
                        </span>
                      </div>
                      {selectedOrder.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Est. Delivery:</span>
                          <span>
                            {new Date(
                              selectedOrder.estimatedDelivery
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Shipping Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedOrder.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tracking:</span>
                          <span className="font-mono">
                            {selectedOrder.trackingNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex items-start">
                        <MapPin className="h-3 w-3 mr-2 text-gray-400 mt-1" />
                        <div>
                          <p>{selectedOrder.shippingAddress?.street}</p>
                          <p>
                            {selectedOrder.shippingAddress?.city},{" "}
                            {selectedOrder.shippingAddress?.state}{" "}
                            {selectedOrder.shippingAddress?.zipCode}
                          </p>
                          <p>{selectedOrder.shippingAddress?.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${item.price} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Update Order Status
                  </h3>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        updateOrderStatus(selectedOrder._id, e.target.value);
                        setSelectedOrder((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }));
                      }}
                      disabled={actionLoading[selectedOrder._id]}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {actionLoading[selectedOrder._id] && (
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      Status updates are saved automatically
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
