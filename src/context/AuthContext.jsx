import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (token) {
        apiService.setToken(token);
        const response = await apiService.getMe();
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      apiService.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, role = "customer") => {
    try {
      const response = await apiService.login({ email, password, role });

      const { token, user: userData } = response;

      // Set token in API service and localStorage
      apiService.setToken(token);
      localStorage.setItem("token", token);

      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (
    name,
    email,
    password,
    role = "customer",
    additionalData = {}
  ) => {
    try {
      const userData = {
        name,
        email,
        password,
        role,
      };

      // Add vendor-specific data if role is vendor
      if (role === "vendor") {
        userData.vendorInfo = {
          shopName: additionalData.shopName,
          businessType: additionalData.businessType,
        };
      }

      const response = await apiService.register(userData);

      const { token, user: newUser } = response;

      // Set token in API service and localStorage
      apiService.setToken(token);
      localStorage.setItem("token", token);

      setUser(newUser);
      setIsAuthenticated(true);

      return newUser;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear local state immediately for instant logout
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    apiService.setToken(null);

    // Then make API call in background (don't wait for it)
    try {
      apiService.logout(); // Don't await this
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await apiService.changePassword(passwordData);
      return response;
    } catch (error) {
      console.error("Password change failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
