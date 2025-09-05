import React, { createContext, useContext, useState } from "react";
import apiService from "../services/api";
const VendorContext = createContext(undefined);

export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error("useVendors must be used within a VendorProvider");
  }
  return context;
};

export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);

  const [vendorApplications, setVendorApplications] = useState([]);

  // Vendor management functions

  //get all vendors
  const getVendors = async () => {
    try {
      const response = await apiService.getVendors();
      setVendors(response.data); // assuming backend returns array
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  // get vendors applications
  const getVendorApplications = async () => {
    try {
      const response = await apiService.getVendorApplications();
      setVendorApplications(response.data); // assuming backend returns array
    } catch (error) {
      console.error("Error fetching vendor applications:", error);
    }
  };

  const approveVendor = (vendorId) => {
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === vendorId ? { ...vendor, status: "approved" } : vendor
      )
    );
  };

  const rejectVendor = (vendorId) => {
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === vendorId ? { ...vendor, status: "rejected" } : vendor
      )
    );
  };

  const addVendorApplication = async (application) => {
    const newApplication = {
      ...application,
      id: `app_${Date.now()}`,
      status: "pending",
      appliedDate: new Date().toISOString().split("T")[0],
    };
    setVendorApplications((prev) => [...prev, newApplication]);
  };

  const approveApplication = async (applicationId) => {
    const response = await apiService.approveApplication(applicationId);
    if (response.success) {
      getVendorApplications();
    }
  };

  const rejectApplication = (applicationId) => {
    setVendorApplications((prev) =>
      prev.filter((app) => app.id !== applicationId)
    );
  };

  return (
    <VendorContext.Provider
      value={{
        vendors,
        vendorApplications,
        getVendors,
        getVendorApplications,
        approveVendor,
        rejectVendor,
        addVendorApplication,
        approveApplication,
        rejectApplication,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};
