import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Lock,
  ShoppingBag,
  MapPin,
  User,
  Mail,
  Phone,
  Plus,
  Edit,
  Wallet,
  QrCode,
  Truck,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import styles from "./CheckoutPage.module.css";

// Mock user addresses - in real app, this would come from user context/API
const mockAddresses = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    isDefault: true,
  },
  {
    id: 2,
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    address: "456 Park Avenue",
    city: "New York",
    state: "NY",
    zipCode: "10022",
    isDefault: false,
  },
];

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState(mockAddresses);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isBuyNow, setIsBuyNow] = useState(false);

  useEffect(() => {
    const buyNowItems = location.state?.buyNowItems;
    if (buyNowItems && buyNowItems.length > 0) {
      setCheckoutItems(buyNowItems);
      setIsBuyNow(true);
    } else {
      setCheckoutItems(items);
      setIsBuyNow(false);
    }

    const defaultAddress = addresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id);
      populateFormWithAddress(defaultAddress);
    }
  }, [location.state, items]);

  const populateFormWithAddress = (address) => {
    setFormData((prev) => ({
      ...prev,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format card number with spaces
    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }

    // Format expiry date
    if (name === "expiryDate") {
      const formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      populateFormWithAddress(address);
    }
    setShowAddressPopup(false);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsEditingAddress(true);
    setShowAddressForm(true);
    setShowAddressPopup(false);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setIsEditingAddress(false);
    setShowAddressForm(true);
    setShowAddressPopup(false);
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setAddresses((prev) => {
        const filtered = prev.filter((addr) => addr.id !== addressId);
        if (selectedAddress === addressId && filtered.length > 0) {
          const newSelected =
            filtered.find((addr) => addr.isDefault) || filtered[0];
          setSelectedAddress(newSelected.id);
          populateFormWithAddress(newSelected);
        } else if (filtered.length === 0) {
          setSelectedAddress(null);
          setFormData((prev) => ({
            ...prev,
            firstName: "",
            lastName: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
          }));
        }
        return filtered;
      });
    }
  };

  const handleSaveAddress = (addressData) => {
    if (isEditingAddress && editingAddress) {
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id ? { ...addr, ...addressData } : addr
        )
      );
      if (selectedAddress === editingAddress.id) {
        populateFormWithAddress({ ...editingAddress, ...addressData });
      }
    } else {
      const newAddress = {
        id: Date.now(),
        ...addressData,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddress(newAddress.id);
      populateFormWithAddress(newAddress);
    }
    setShowAddressForm(false);
    setEditingAddress(null);
    setIsEditingAddress(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    if (
      paymentMethod === "card" &&
      (!formData.cardNumber ||
        !formData.cardName ||
        !formData.expiryDate ||
        !formData.cvv)
    ) {
      alert("Please fill all card details");
      return;
    }

    if (paymentMethod === "upi" && !formData.upiId) {
      alert("Please enter UPI ID");
      return;
    }

    if (
      ["gpay", "phonepe", "paytm"].includes(paymentMethod) &&
      !formData.phone
    ) {
      alert("Please enter phone number for payment");
      return;
    }

    setIsProcessing(true);

    const orderData = {
      orderNumber: `ORD-${Date.now()}`,
      items: checkoutItems,
      total: total + (paymentMethod === "cod" ? 20 : 0),
      address: addresses.find((a) => a.id === selectedAddress),
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
      status: "pending",
      userId: user?.id,
      createdAt: new Date().toISOString(),
    };

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // localStorage.setItem("lastOrder", JSON.stringify(orderData));

    if (!isBuyNow) {
      clearCart();
    }

    setIsProcessing(false);
    navigate("/orders", { state: { newOrder: orderData } });
  };

  const calculateTotal = () => {
    let sum = 0;
    checkoutItems.forEach((item) => {
      const basePrice = parseFloat(item.productId?.price || item.price || 0);
      const colorAdj = parseFloat(item.colorVariant?.priceAdjustment || 0);
      const sizeAdj = parseFloat(item.sizeVariant?.priceAdjustment || 0);
      sum += (basePrice + colorAdj + sizeAdj) * (item.quantity || 1);
    });
    return sum;
  };

  const subtotal = calculateTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + tax + shipping;

  const currentAddress = addresses.find((addr) => addr.id === selectedAddress);

  if (checkoutItems.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <ShoppingBag className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
        <p className={styles.emptyText}>
          Add items to your cart before checking out
        </p>
        <button onClick={() => navigate("/shop")} className={styles.shopButton}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Checkout</h1>

        <div className={styles.layout}>
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit}>
              {/* Selected Address Display */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <MapPin className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Shipping Address</h2>
                </div>

                {currentAddress ? (
                  <div className={styles.selectedAddressContainer}>
                    <div className={styles.selectedAddress}>
                      <div className={styles.addressHeader}>
                        <h4 className={styles.addressName}>
                          {currentAddress.firstName} {currentAddress.lastName}
                          {currentAddress.isDefault && (
                            <span className={styles.defaultBadge}>Default</span>
                          )}
                        </h4>
                      </div>
                      <p className={styles.addressText}>
                        {currentAddress.address}, {currentAddress.city},{" "}
                        {currentAddress.state} {currentAddress.zipCode}
                      </p>
                      <p className={styles.addressPhone}>
                        {currentAddress.phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddressPopup(true)}
                      className={styles.changeAddressButton}
                    >
                      Change Address
                      <ChevronDown size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.noAddress}>
                    <p>No shipping address selected</p>
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className={styles.addAddressButton}
                    >
                      <Plus size={20} />
                      Add Shipping Address
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <CreditCard className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Payment Method</h2>
                </div>

                <div className={styles.paymentMethods}>
                  <div className={styles.paymentOptions}>
                    <label
                      className={`${styles.paymentOption} ${
                        paymentMethod === "card" ? styles.selected : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={styles.paymentRadio}
                      />
                      <CreditCard size={20} />
                      <span>Card</span>
                    </label>

                    <label
                      className={`${styles.paymentOption} ${
                        paymentMethod === "upi" ? styles.selected : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={styles.paymentRadio}
                      />
                      <QrCode size={20} />
                      <span>UPI ID</span>
                    </label>

                    <label
                      className={`${styles.paymentOption} ${
                        paymentMethod === "gpay" ? styles.selected : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="gpay"
                        checked={paymentMethod === "gpay"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={styles.paymentRadio}
                      />
                      <Wallet size={20} />
                      <span>GPay</span>
                    </label>

                    <label
                      className={`${styles.paymentOption} ${
                        paymentMethod === "phonepe" ? styles.selected : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="phonepe"
                        checked={paymentMethod === "phonepe"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={styles.paymentRadio}
                      />
                      <Wallet size={20} />
                      <span>PhonePe</span>
                    </label>

                    <label
                      className={`${styles.paymentOption} ${
                        paymentMethod === "paytm" ? styles.selected : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paytm"
                        checked={paymentMethod === "paytm"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={styles.paymentRadio}
                      />
                      <Wallet size={20} />
                      <span>Paytm</span>
                    </label>

                    <label
                      className={`${styles.paymentOption} ${
                        paymentMethod === "cod" ? styles.selected : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={styles.paymentRadio}
                      />
                      <Truck size={20} />
                      <span>COD</span>
                    </label>
                  </div>

                  {/* Payment forms remain the same */}
                  {paymentMethod === "card" && (
                    <div className={styles.paymentForm}>
                      <div className={styles.securityBadge}>
                        <Lock className={styles.lockIcon} />
                        <span>Secure SSL encrypted payment</span>
                      </div>
                      <div className={styles.formGrid}>
                        <div
                          className={`${styles.formGroup} ${styles.fullWidth}`}
                        >
                          <label className={styles.label}>Card Number</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className={styles.input}
                            maxLength="19"
                            required
                          />
                        </div>
                        <div
                          className={`${styles.formGroup} ${styles.fullWidth}`}
                        >
                          <label className={styles.label}>
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            className={styles.input}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Expiry Date</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className={styles.input}
                            maxLength="5"
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className={styles.input}
                            maxLength="4"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "upi" && (
                    <div className={styles.paymentForm}>
                      <div className={styles.securityBadge}>
                        <Lock className={styles.lockIcon} />
                        <span>Secure UPI Payment</span>
                      </div>
                      <div
                        className={`${styles.formGroup} ${styles.fullWidth}`}
                      >
                        <label className={styles.label}>UPI ID</label>
                        <input
                          type="text"
                          name="upiId"
                          value={formData.upiId}
                          onChange={handleInputChange}
                          placeholder="yourname@upi"
                          className={styles.input}
                          required
                        />
                        <p className={styles.helperText}>
                          Enter your UPI ID (e.g., username@paytm, username@ybl)
                        </p>
                      </div>
                      <div className={styles.upiApps}>
                        <div className={styles.upiApp}>GPay</div>
                        <div className={styles.upiApp}>PhonePe</div>
                        <div className={styles.upiApp}>Paytm</div>
                        <div className={styles.upiApp}>BHIM</div>
                      </div>
                    </div>
                  )}

                  {/* Other payment methods remain the same */}
                  {paymentMethod === "gpay" && (
                    <div className={styles.paymentForm}>
                      <div className={styles.walletNotice}>
                        <div className={styles.walletLogo}>
                          <Wallet size={32} />
                          <h3>Google Pay</h3>
                        </div>
                        <p>
                          You will be redirected to Google Pay to complete the
                          payment
                        </p>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 XXXXX XXXXX"
                            className={styles.input}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "phonepe" && (
                    <div className={styles.paymentForm}>
                      <div className={styles.walletNotice}>
                        <div className={styles.walletLogo}>
                          <Wallet size={32} />
                          <h3>PhonePe</h3>
                        </div>
                        <p>
                          You will be redirected to PhonePe to complete the
                          payment
                        </p>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 XXXXX XXXXX"
                            className={styles.input}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "paytm" && (
                    <div className={styles.paymentForm}>
                      <div className={styles.walletNotice}>
                        <div className={styles.walletLogo}>
                          <Wallet size={32} />
                          <h3>Paytm</h3>
                        </div>
                        <p>
                          You will be redirected to Paytm to complete the
                          payment
                        </p>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 XXXXX XXXXX"
                            className={styles.input}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className={styles.codNotice}>
                      <Truck className={styles.codIcon} />
                      <div>
                        <h4>Cash on Delivery</h4>
                        <p>
                          Pay when your order is delivered. Additional ₹20 COD
                          charge may apply.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className={styles.spinner}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className={styles.buttonIcon} />
                    {paymentMethod === "cod"
                      ? "Place Order (COD)"
                      : `Pay Now - $${total.toFixed(2)}`}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Section */}
          <div className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.itemsList}>
                {checkoutItems.map((item) => {
                  const basePrice = parseFloat(
                    item.productId?.price || item.price || 0
                  );
                  const colorAdjustment = parseFloat(
                    item.colorVariant?.priceAdjustment || 0
                  );
                  const sizeAdjustment = parseFloat(
                    item.sizeVariant?.priceAdjustment || 0
                  );
                  const finalPrice =
                    basePrice + colorAdjustment + sizeAdjustment;

                  const itemImage =
                    item.productId?.colorVariants?.[0]?.images?.[0]?.url ||
                    item.productId?.images?.[0]?.url ||
                    item.image ||
                    "https://via.placeholder.com/100";

                  const itemName =
                    item.productId?.name || item.name || "Product";

                  return (
                    <div key={item._id} className={styles.summaryItem}>
                      <img
                        src={itemImage}
                        alt={itemName}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemDetails}>
                        <p className={styles.itemName}>{itemName}</p>
                        <p className={styles.itemMeta}>
                          {item.color && <span>Color: {item.color}</span>}
                          {item.size && <span> • Size: {item.size}</span>}
                        </p>
                        <p className={styles.itemQuantity}>
                          Qty: {item.quantity || 1}
                        </p>
                      </div>
                      <p className={styles.itemPrice}>
                        ${(finalPrice * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className={styles.summaryBreakdown}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span className={shipping === 0 ? styles.free : ""}>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {paymentMethod === "cod" && (
                  <div className={styles.summaryRow}>
                    <span>COD Charge</span>
                    <span>$20.00</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className={styles.summaryDivider}></div>
                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span>
                    ${(total + (paymentMethod === "cod" ? 20 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {shipping > 0 && (
                <div className={styles.shippingNotice}>
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection Popup */}
      {showAddressPopup && (
        <AddressSelectionPopup
          addresses={addresses}
          selectedAddress={selectedAddress}
          onSelectAddress={handleAddressSelect}
          onEditAddress={handleEditAddress}
          onDeleteAddress={handleDeleteAddress}
          onAddNewAddress={handleAddNewAddress}
          onClose={() => setShowAddressPopup(false)}
        />
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <AddressFormModal
          address={editingAddress}
          onSave={handleSaveAddress}
          onClose={() => setShowAddressForm(false)}
          isEditing={isEditingAddress}
        />
      )}
    </div>
  );
};

// Address Selection Popup Component
const AddressSelectionPopup = ({
  addresses,
  selectedAddress,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
  onAddNewAddress,
  onClose,
}) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Select Delivery Address</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.addressList}>
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`${styles.addressOption} ${
                  selectedAddress === address.id ? styles.selected : ""
                }`}
                onClick={() => onSelectAddress(address.id)}
              >
                <div className={styles.addressContent}>
                  <div className={styles.addressHeader}>
                    <h4 className={styles.addressName}>
                      {address.firstName} {address.lastName}
                      {address.isDefault && (
                        <span className={styles.defaultBadge}>Default</span>
                      )}
                    </h4>
                    <div className={styles.addressActions}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAddress(address);
                        }}
                        className={styles.editButton}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAddress(address.id);
                          }}
                          className={styles.deleteButton}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={styles.addressText}>
                    {address.address}, {address.city}, {address.state}{" "}
                    {address.zipCode}
                  </p>
                  <p className={styles.addressPhone}>{address.phone}</p>
                </div>
                <div className={styles.addressRadio}>
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddress === address.id}
                    onChange={() => onSelectAddress(address.id)}
                    className={styles.radioInput}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAddNewAddress}
            className={styles.addAddressButton}
          >
            <Plus size={20} />
            Add New Address
          </button>
        </div>
      </div>
    </div>
  );
};

// Address Form Modal Component (same as before)
const AddressFormModal = ({ address, onSave, onClose, isEditing }) => {
  const [formData, setFormData] = useState({
    firstName: address?.firstName || "",
    lastName: address?.lastName || "",
    phone: address?.phone || "",
    address: address?.address || "",
    city: address?.city || "",
    state: address?.state || "",
    zipCode: address?.zipCode || "",
    isDefault: address?.isDefault || false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? "Edit Address" : "Add New Address"}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                Set as default address
              </label>
            </div>
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
