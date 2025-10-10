import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth, googleProvider } from "../services/firebaseConfig";

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
  const [authLoading, setAuthLoading] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const completeGoogleLogin = async (firebaseUser, role) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      console.log("Firebase ID Token obtained, role:", role);

      const response = await apiService.googleAuth(idToken, role);
      const { token, user: userData } = response;

      apiService.setToken(token);
      localStorage.setItem("token", token);

      setUser(userData);
      setIsAuthenticated(true);

      console.log("Google login successful, user:", userData);
      return userData;
    } catch (error) {
      console.error("Google login completion failed:", error);

      let errorMessage = "Google login failed. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      throw new Error(errorMessage);
    }
  };

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

  const googleLogin = async (role) => {
    try {
      // setAuthLoading(true);
      console.log("Starting Google popup authentication for role:", role);

      const result = await signInWithPopup(auth, googleProvider);
      console.log("Firebase authentication successful:", result.user);

      const userData = await completeGoogleLogin(result.user, role);
      return userData;
    } catch (error) {
      console.error("Google popup authentication failed:", error);

      let errorMessage = "Google authentication failed. Please try again.";

      // Firebase specific errors
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Authentication popup was closed. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage =
          "Popup was blocked by browser. Please allow popups for this site.";
      } else if (error.code === "auth/unauthorized-domain") {
        errorMessage =
          "This domain is not authorized for Firebase authentication.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage =
          "Invalid Firebase configuration. Please contact support.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }

      const enhancedError = new Error(errorMessage);
      enhancedError.code = error.code;
      throw enhancedError;
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // setAuthLoading(true);

      const response = await apiService.login({ email, password });

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
    } finally {
      setAuthLoading(false);
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
      // setAuthLoading(true);
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
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    // Clear local state immediately for instant logout
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    apiService.setToken(null);

    // Sign out from Firebase
    try {
      await signOut(auth);
      console.log("Firebase signout successful");
    } catch (error) {
      console.error("Firebase signout error:", error);
    }

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
    isLoading: isLoading || authLoading,
    isAuthenticated,
    googleLogin,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
