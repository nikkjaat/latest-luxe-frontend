import React, { createContext, useContext, useEffect, useState } from "react";

const ARContext = createContext(undefined);

export const useAR = () => {
  const context = useContext(ARContext);
  if (context === undefined) {
    throw new Error("useAR must be used within an ARProvider");
  }
  return context;
};

export const ARProvider = ({ children }) => {
  const [arSupported, setArSupported] = useState(false);
  const [arSession, setArSession] = useState(null);
  const [virtualTryOns, setVirtualTryOns] = useState([]);

  // Check AR support on mount
  useEffect(() => {
    const checkARSupport = () => {
      const hasCamera = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );
      const hasWebGL = !!window.WebGLRenderingContext;
      const isSecureContext =
        window.isSecureContext || location.protocol === "https:";

      setArSupported(hasCamera && hasWebGL && isSecureContext);
    };

    checkARSupport();
  }, []);

  const startARSession = async (productId, type = "try-on") => {
    try {
      const session = {
        id: Date.now().toString(),
        productId,
        type,
        startTime: new Date(),
        active: true,
      };

      setArSession(session);
      return session;
    } catch (error) {
      console.error("Failed to start AR session:", error);
      throw error;
    }
  };

  const endARSession = () => {
    setArSession(null);
  };

  const captureARPhoto = (productId) => {
    const photo = {
      id: Date.now().toString(),
      productId,
      image:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
      timestamp: new Date().toISOString(),
      filters: ["original", "vintage", "modern"],
    };

    setVirtualTryOns((prev) => [...prev, photo]);
    return photo;
  };

  const getARCompatibleProducts = () => {
    // Return products that support AR try-on
    return [
      { id: "1", type: "accessory", arType: "overlay" },
      { id: "2", type: "watch", arType: "wrist-tracking" },
      { id: "3", type: "jewelry", arType: "face-tracking" },
    ];
  };

  const measureWithAR = (productId) => {
    // Simulate AR measurement
    return {
      dimensions: { width: 25, height: 15, depth: 8 },
      unit: "cm",
      accuracy: 0.95,
      confidence: "high",
    };
  };

  return (
    <ARContext.Provider
      value={{
        arSupported,
        arSession,
        virtualTryOns,
        startARSession,
        endARSession,
        captureARPhoto,
        getARCompatibleProducts,
        measureWithAR,
      }}
    >
      {children}
    </ARContext.Provider>
  );
};
