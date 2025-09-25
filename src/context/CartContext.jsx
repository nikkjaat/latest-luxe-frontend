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
    try {
      // Handle color variant information
      const cartItem = {
        ...item,
        colorVariant: item.colorVariant || null,
      };

      const response = await apiService.addToCart(cartItem);
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

  // Safe calculation functions to handle null/undefined values
  const totalItems = items.reduce((sum, item) => {
    const quantity = item?.quantity || 0;
    return sum + quantity;
  }, 0);

  const totalPrice = items.reduce((sum, item) => {
    const price = item?.productId?.price || 0;
    const quantity = item?.quantity || 0;
    return sum + price * quantity;
  }, 0);

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
