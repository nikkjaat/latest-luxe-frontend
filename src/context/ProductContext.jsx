import React, { createContext, useContext, useEffect, useState } from "react";
import apiService from "../services/api";

const ProductContext = createContext(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const getProducts = async (params = {}) => {
    // Don't fetch if already loading or already fetched
    if (isLoading || hasFetched) return products;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getProducts(params);
      if (!response.success) {
        throw new Error("Failed to fetch products");
      }

      const formattedProducts = response.products.map((product) => ({
        ...product,
        id: product._id,
      }));

      setProducts(formattedProducts);
      setHasFetched(true);
      return formattedProducts;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProduct = async (productId) => {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const response = await apiService.getProduct(productId);
    return response;
  };

  const addProduct = async (product) => {
    const response = await apiService.createProduct(product);
    if (!response.success) {
      throw new Error("Failed to create product");
    }
    getProducts();

    setProducts((prev) => [
      ...prev,
      {
        ...response.product,
        id: response.product._id,
      },
    ]);

    return response;
  };

  const updateProduct = async (id, updates) => {
    const response = await apiService.updateProduct(id, updates);
    // After updating, you might want to refresh the products list
    return response;
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const getProductsByVendor = (vendorId) => {
    return products.filter((product) => product.vendor._id === vendorId);
  };

  // Clear the fetched state when component unmounts (optional)
  useEffect(() => {
    return () => {
      setHasFetched(false);
    };
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        hasFetched,
        getProducts,
        getProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductsByVendor,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
