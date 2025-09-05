import React, { createContext, useContext, useEffect, useState } from "react";
import apiService from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const { isAuthenticated, isLoading } = useAuth();

  const getCartItems = async () => {
    try {
      const response = await apiService.getCartItems();
      setItems(response.cartItems.cart || []);
    } catch (error) {
      console.error("Failed to load cart items", error);
    }
  };

  // Load cart items when user is authenticated and auth is done loading
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      getCartItems();
    } else if (!isAuthenticated) {
      setItems([]);
    }
  }, [isAuthenticated]);

  const addToCart = async (item) => {
    console.log(item);
    try {
      const response = await apiService.addToCart(item);
      if (response.success) {
        getCartItems();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeFromCart = async (id) => {
    try {
      const response = await apiService.removeFromCart(id);
      if (response.success) {
        getCartItems();
      }
    } catch (error) {
      console.error("Failed to remove item from cart", error);
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      const response = await apiService.updateQuantity(id, quantity);
      if (!response.success) {
        console.error("Failed to update quantity", response.message);
        return;
      }
      getCartItems();
    } catch (error) {
      console.error("Update quantity error", error);
    }
  };

  const clearCart = () => {
    setItems([]);
  };
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
