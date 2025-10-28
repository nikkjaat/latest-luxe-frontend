import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import apiService from "../services/api";
import styles from "./OrderDetailPage.module.css";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrderDetails(orderId);
      if (response.success) {
        setOrder(response.order);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    try {
      setCancelling(true);
      const response = await apiService.cancelOrder(orderId, reason);
      if (response.success) {
        alert("Order cancelled successfully");
        fetchOrderDetails();
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: "pending", label: "Order Placed", icon: Clock },
      { key: "confirmed", label: "Confirmed", icon: CheckCircle },
      { key: "processing", label: "Processing", icon: Package },
      { key: "shipped", label: "Shipped", icon: Truck },
      { key: "delivered", label: "Delivered", icon: CheckCircle },
    ];

    if (order?.status === "cancelled") {
      return [
        { key: "pending", label: "Order Placed", icon: Clock },
        { key: "cancelled", label: "Cancelled", icon: AlertCircle },
      ];
    }

    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    return steps.findIndex((step) => step.key === order?.status);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Package className={styles.loadingIcon} />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <h2>Order Not Found</h2>
        <button
          onClick={() => navigate("/orders")}
          className={styles.backButton}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const statusSteps = getStatusSteps();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate("/orders")} className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Orders
        </button>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Order Details</h1>
            <p className={styles.orderNumber}>{order.orderNumber}</p>
          </div>
          {order.status !== "cancelled" &&
            order.status !== "delivered" &&
            order.paymentStatus !== "paid" && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className={styles.cancelButton}
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
        </div>

        <div className={styles.statusTracker}>
          <div className={styles.statusSteps}>
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className={styles.statusStep}>
                  <div
                    className={`${styles.stepIcon} ${
                      isCompleted ? styles.completed : ""
                    } ${isCurrent ? styles.current : ""}`}
                  >
                    <Icon size={24} />
                  </div>
                  <p className={styles.stepLabel}>{step.label}</p>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`${styles.stepLine} ${
                        isCompleted ? styles.completed : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.mainSection}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Order Items</h2>
              <div className={styles.itemsList}>
                {order.items.map((item, index) => {
                  const product = item.product || {};
                  const itemImage =
                    product.colorVariants?.[0]?.images?.[0]?.url ||
                    item.image ||
                    "https://via.placeholder.com/100";
                  const itemName = item.name || product.name || "Product";

                  return (
                    <div key={index} className={styles.orderItem}>
                      <img
                        src={itemImage}
                        alt={itemName}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemName}>{itemName}</h3>
                        <p className={styles.itemMeta}>
                          Quantity: {item.quantity}
                        </p>
                        <p className={styles.itemPrice}>
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className={styles.itemTotal}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Shipping Address</h2>
              <div className={styles.addressCard}>
                <MapPin className={styles.addressIcon} />
                <div>
                  <p className={styles.addressName}>
                    {order.shippingAddress.name}
                  </p>
                  <p className={styles.addressText}>
                    {order.shippingAddress.street}
                  </p>
                  <p className={styles.addressText}>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p className={styles.addressText}>
                    {order.shippingAddress.country}
                  </p>
                  <p className={styles.addressPhone}>
                    <Phone size={14} />
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <span className={styles.discount}>
                    -${order.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Payment Information</h2>
              <div className={styles.infoRow}>
                <CreditCard size={16} />
                <span>
                  {order.paymentMethod === "razorpay"
                    ? "Card/UPI Payment"
                    : "Cash on Delivery"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Status:</span>
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
              {order.paymentDetails?.transactionId && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Transaction ID:</span>
                  <span className={styles.transactionId}>
                    {order.paymentDetails.transactionId}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Order Information</h2>
              <div className={styles.infoRow}>
                <Calendar size={16} />
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {order.tracking?.trackingNumber && (
                <div className={styles.trackingInfo}>
                  <p className={styles.trackingLabel}>Tracking Number:</p>
                  <p className={styles.trackingNumber}>
                    {order.tracking.trackingNumber}
                  </p>
                  {order.tracking.trackingUrl && (
                    <a
                      href={order.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.trackingLink}
                    >
                      Track Package
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
