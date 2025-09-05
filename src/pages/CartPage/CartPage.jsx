import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Shield,
  Truck,
  Loader,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } =
    useCart();
  const [loadingItems, setLoadingItems] = useState({});
  const [deletingItems, setDeletingItems] = useState({});

  // Reset loading state when items change (after successful update)
  useEffect(() => {
    setLoadingItems({});
  }, [items]);

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    setLoadingItems((prev) => ({ ...prev, [id]: true }));
    await updateQuantity(id, newQuantity);
    // Loading state will be reset automatically by the useEffect above
    // when the items array updates
  };

  const handleRemoveItem = async (id) => {
    setDeletingItems((prev) => ({ ...prev, [id]: true }));
    await removeFromCart(id);
    setDeletingItems((prev) => ({ ...prev, [id]: false }));
  };

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ShoppingBag className={styles.emptyIconSvg} />
            </div>
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <p className={styles.emptyDescription}>
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/shop" className={styles.shopButton}>
              <ArrowLeft className={styles.shopIcon} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/shop" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            Continue Shopping
          </Link>
          <h1 className={styles.title}>Shopping Cart</h1>
          <p className={styles.subtitle}>{totalItems} items in your cart</p>
        </div>

        <div className={styles.layout}>
          {/* Cart Items */}
          <div className={styles.cartItems}>
            <div className={styles.itemsCard}>
              <div className={styles.itemsContent}>
                <div className={styles.itemsList}>
                  {items.map((item) => (
                    <div key={item._id} className={styles.cartItem}>
                      <Link
                        to={`/product/${item.productId._id}`}
                        className={styles.itemLink}
                      >
                        <div className={styles.itemImage}>
                          <img
                            src={item.productId?.images?.[0]?.url}
                            alt={item.productId.name}
                            className={styles.productImage}
                          />
                        </div>
                      </Link>

                      <div className={styles.itemInfo}>
                        <Link to={`/product/${item.productId._id}`}>
                          <h3 className={styles.productName}>
                            {item.productId.name}
                          </h3>
                          <div className={styles.productOptions}>
                            {item.size && (
                              <span className={styles.optionText}>
                                Size: Medium
                              </span>
                            )}
                            {item.color && (
                              <span className={styles.optionText}>
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                          <p className={styles.productPrice}>
                            ${item.productId.price}
                          </p>
                        </Link>
                      </div>

                      <div className={styles.quantityControls}>
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity - 1)
                          }
                          className={styles.quantityButton}
                          disabled={
                            loadingItems[item._id] || item.quantity <= 1
                          }
                        >
                          <Minus className={styles.quantityIcon} />
                        </button>
                        <span className={styles.quantityDisplay}>
                          {loadingItems[item._id] ? (
                            <Loader
                              className={`${styles.quantityLoader} ${styles.spinning}`}
                            />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity + 1)
                          }
                          className={styles.quantityButton}
                          disabled={loadingItems[item._id]}
                        >
                          <Plus className={styles.quantityIcon} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className={styles.removeButton}
                        disabled={deletingItems[item._id]}
                      >
                        {deletingItems[item._id] ? (
                          <Loader
                            className={`${styles.removeIcon} ${styles.spinning}`}
                          />
                        ) : (
                          <Trash2 className={styles.removeIcon} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.summaryItems}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    Subtotal ({totalItems} items)
                  </span>
                  <span className={styles.summaryValue}>
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Shipping</span>
                  <span className={`${styles.summaryValue} ${styles.free}`}>
                    Free
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Tax</span>
                  <span className={styles.summaryValue}>
                    ${(totalPrice * 0.08).toFixed(2)}
                  </span>
                </div>
                <div
                  className={`${styles.summaryRow} ${styles.summaryDivider}`}
                >
                  <div className={styles.summaryTotal}>
                    <span className={styles.totalLabel}>Total</span>
                    <span className={styles.totalValue}>
                      ${(totalPrice * 1.08).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button className={styles.checkoutButton}>
                <CreditCard className={styles.checkoutIcon} />
                Proceed to Checkout
              </button>

              <div className={styles.features}>
                <div className={styles.feature}>
                  <Shield
                    className={`${styles.featureIcon} ${styles.shield}`}
                  />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className={styles.feature}>
                  <Truck className={`${styles.featureIcon} ${styles.truck}`} />
                  <span>Free shipping on orders over $100</span>
                </div>
              </div>

              <div className={styles.offerCard}>
                <h3 className={styles.offerTitle}>Special Offer!</h3>
                <p className={styles.offerText}>
                  Add $50 more to get free express shipping and a complimentary
                  gift wrap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
