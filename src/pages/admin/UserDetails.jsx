import React, { useState } from "react";
import styles from "./UserManagament/UserManagement.module.css";
import {
  Ban,
  CheckCircle,
  RefreshCw,
  Store,
  Trash2,
  Users,
  X,
} from "lucide-react";
import apiService from "../../services/api";

export default function UserDetails({
  selectedUser,
  setShowUserDetails,
  onUserAction,
}) {
  const [actionLoading, setActionLoading] = useState({});

  // Also update the handleUserAction function to ensure it refreshes the data
  const handleAction = async (userId, action) => {
    setActionLoading((prev) => ({ ...prev, [userId]: action }));
    try {
      await onUserAction(userId, action);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span
        className={
          isActive
            ? `${styles.badge} ${styles.activeBadge}`
            : `${styles.badge} ${styles.suspendedBadge}`
        }
      >
        {isActive ? "Active" : "Suspended"}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    if (role === "vendor") {
      return (
        <span className={`${styles.roleBadge} ${styles.vendorBadge}`}>
          <Store className={styles.roleIcon} />
          Vendor
        </span>
      );
    }

    return (
      <span className={`${styles.roleBadge} ${styles.customerBadge}`}>
        <Users className={styles.roleIcon} />
        Customer
      </span>
    );
  };

  const getJoinDate = (user) => {
    return new Date(user.createdAt || Date.now()).toLocaleDateString();
  };

  const getLastActive = (user) => {
    return new Date(
      user.lastActive || user.updatedAt || Date.now()
    ).toLocaleDateString();
  };

  return (
    <>
      {" "}
      {selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>User Details</h2>
              <button
                onClick={() => setShowUserDetails(false)}
                className={styles.modalClose}
              >
                <X className={styles.modalCloseIcon} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.userProfile}>
                <img
                  src={
                    selectedUser.avatar ||
                    "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
                  }
                  alt={selectedUser.name}
                  className={styles.userProfileImage}
                />
                <div className={styles.userProfileInfo}>
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                  <div className={styles.userBadges}>
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.isActive)}
                  </div>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div>
                  <h4 className={styles.infoSectionTitle}>
                    Account Information
                  </h4>
                  <div className={styles.infoItems}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>User ID:</span>
                      <span className={styles.infoValue}>
                        {selectedUser._id}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Join Date:</span>
                      <span className={styles.infoValue}>
                        {getJoinDate(selectedUser)}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Last Active:</span>
                      <span className={styles.infoValue}>
                        {getLastActive(selectedUser)}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Email Verified:</span>
                      <span className={styles.infoValue}>
                        {selectedUser.emailVerified ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedUser.role === "vendor" && selectedUser.vendorInfo && (
                  <div>
                    <h4 className={styles.infoSectionTitle}>
                      Vendor Information
                    </h4>
                    <div className={styles.infoItems}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Shop Name:</span>
                        <span className={styles.infoValue}>
                          {selectedUser.vendorInfo.shopName}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Business Type:</span>
                        <span className={styles.infoValue}>
                          {selectedUser.vendorInfo.businessType}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Vendor Status:</span>
                        <span
                          className={`${styles.statusBadge} ${
                            selectedUser.vendorInfo.status === "approved"
                              ? styles.statusApproved
                              : styles.statusPending
                          }`}
                        >
                          {selectedUser.vendorInfo.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() =>
                    handleAction(
                      selectedUser._id,
                      selectedUser.isActive ? "suspend" : "activate"
                    )
                  }
                  disabled={actionLoading[selectedUser._id]}
                  className={`${styles.modalButton} ${
                    selectedUser.isActive
                      ? styles.suspendModalButton
                      : styles.activateModalButton
                  }`}
                >
                  {actionLoading[selectedUser._id] ? (
                    <RefreshCw
                      className={`${styles.modalButtonIcon} ${styles.spinner}`}
                    />
                  ) : selectedUser.isActive ? (
                    <Ban className={styles.modalButtonIcon} />
                  ) : (
                    <CheckCircle className={styles.modalButtonIcon} />
                  )}
                  {selectedUser.isActive ? "Suspend User" : "Activate User"}
                </button>
                <button
                  onClick={() => handleAction(selectedUser._id, "delete")}
                  disabled={actionLoading[selectedUser._id]}
                  className={`${styles.modalButton} ${styles.deleteModalButton}`}
                >
                  {actionLoading[selectedUser._id] === "delete" ? (
                    <RefreshCw
                      className={`${styles.modalButtonIcon} ${styles.spinner}`}
                    />
                  ) : (
                    <Trash2 className={styles.modalButtonIcon} />
                  )}
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
