import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import apiService from "../../services/api";
import styles from "./OrdersPage.module.css";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyOrders();
      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (selectedFilter !== "all") {
      filtered = filtered.filter((order) => order.status === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, selectedFilter, searchQuery]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className={styles.statusIcon} />;
      case "confirmed":
        return <CheckCircle className={styles.statusIcon} />;
      case "processing":
        return <Package className={styles.statusIcon} />;
      case "shipped":
        return <Truck className={styles.statusIcon} />;
      case "delivered":
        return <CheckCircle className={styles.statusIcon} />;
      case "cancelled":
        return <XCircle className={styles.statusIcon} />;
      default:
        return <Clock className={styles.statusIcon} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "confirmed":
        return styles.statusConfirmed;
      case "processing":
        return styles.statusProcessing;
      case "shipped":
        return styles.statusShipped;
      case "delivered":
        return styles.statusDelivered;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw className={styles.loadingIcon} />
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Package className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>No Orders Yet</h2>
        <p className={styles.emptyText}>
          Start shopping and your orders will appear here
        </p>
        <button onClick={() => navigate("/shop")} className={styles.shopButton}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Orders</h1>
          <p className={styles.subtitle}>Track and manage your orders</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button onClick={fetchOrders} className={styles.refreshButton}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <div className={styles.filterButtons}>
            <button
              onClick={() => setSelectedFilter("all")}
              className={`${styles.filterButton} ${
                selectedFilter === "all" ? styles.active : ""
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter("pending")}
              className={`${styles.filterButton} ${
                selectedFilter === "pending" ? styles.active : ""
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedFilter("confirmed")}
              className={`${styles.filterButton} ${
                selectedFilter === "confirmed" ? styles.active : ""
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setSelectedFilter("processing")}
              className={`${styles.filterButton} ${
                selectedFilter === "processing" ? styles.active : ""
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setSelectedFilter("shipped")}
              className={`${styles.filterButton} ${
                selectedFilter === "shipped" ? styles.active : ""
              }`}
            >
              Shipped
            </button>
            <button
              onClick={() => setSelectedFilter("delivered")}
              className={`${styles.filterButton} ${
                selectedFilter === "delivered" ? styles.active : ""
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        <div className={styles.ordersList}>
          {filteredOrders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3 className={styles.orderNumber}>
                    {order.orderNumber || `Order ${order._id.slice(-8)}`}
                  </h3>
                  <div className={styles.orderMeta}>
                    <Calendar size={16} />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div
                  className={`${styles.statusBadge} ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  <span className={styles.statusText}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items.slice(0, 3).map((item, index) => {
                  const product = item.product || {};
                  const itemImage =
                    product.colorVariants?.[0]?.images?.[0]?.url ||
                    item.image ||
                    "https://via.placeholder.com/80";

                  const itemName = item.name || product.name || "Product";

                  return (
                    <div key={index} className={styles.orderItem}>
                      <img
                        src={itemImage}
                        alt={itemName}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemDetails}>
                        <p className={styles.itemName}>{itemName}</p>
                        <p className={styles.itemMeta}>
                          <span>Qty: {item.quantity || 1}</span>
                          <span> • ${item.price.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
                {order.items.length > 3 && (
                  <p className={styles.moreItems}>
                    +{order.items.length - 3} more item(s)
                  </p>
                )}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.orderAddress}>
                  <MapPin size={16} />
                  <span>
                    {order.shippingAddress?.street},{" "}
                    {order.shippingAddress?.city}
                  </span>
                </div>
                <div className={styles.orderTotal}>
                  <span className={styles.totalLabel}>Total:</span>
                  <span className={styles.totalAmount}>
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className={styles.orderActions}>
                <div className={styles.paymentInfo}>
                  <span className={styles.paymentLabel}>Payment:</span>
                  <span className={styles.paymentMethod}>
                    {order.paymentMethod === "razorpay" ? "Card/UPI" : "COD"}
                  </span>
                  <span
                    className={`${styles.paymentStatus} ${
                      order.paymentStatus === "paid"
                        ? styles.paid
                        : styles.pending
                    }`}
                  >
                    {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/order/${order._id}`)}
                  className={styles.detailsButton}
                >
                  View Details
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && orders.length > 0 && (
          <div className={styles.noResults}>
            <Filter size={48} />
            <p>No orders found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
