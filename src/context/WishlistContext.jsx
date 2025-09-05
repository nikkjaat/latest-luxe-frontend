import React, { createContext, useContext, useEffect, useState } from "react";
import apiService from "../services/api";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const WishlistContext = createContext(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const { isAuthenticated, isLoading } = useAuth();

  const getWishlistItems = async () => {
    try {
      const response = await apiService.getWishlistItems();
      setItems(response.wishlistItems.wishlist || []);
    } catch (error) {
      console.error("Failed to load wishlist items", error);
    }
  };
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      getWishlistItems();
    } else if (!isAuthenticated) {
      setItems([]);
    }
  }, [isAuthenticated]);

  const addToWishlist = async (item) => {
    try {
      const response = await apiService.addToWishlist(item);
      if (response.success) {
        getWishlistItems();
      }
    } catch (error) {
      console.log("Failed to add wishlist item", error);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      const response = await apiService.removeFromWishlist(id);
      if (response.success) {
        getWishlistItems();
      }
    } catch (error) {
      console.error("Failed to remove item from wishlist", error);
    }
  };

  const isInWishlist = (id) => {
    return items.some((item) => item.productId._id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
