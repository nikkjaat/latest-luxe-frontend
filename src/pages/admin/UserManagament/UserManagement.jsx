import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  Mail,
  Calendar,
  Activity,
  UserX,
  UserCheck,
  Edit,
  Trash2,
  Eye,
  Shield,
  Store,
  X,
  ArrowLeft,
  Download,
  RefreshCw,
  Phone,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import apiService from "../../../services/api";
import styles from "./UserManagement.module.css";
import UserDetails from "../UserDetails";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiService.getAllUsers();
        // Filter out admin users for security
        const filteredUsers = response.users.filter(
          (user) => user.role !== "admin"
        );
        setUsers(filteredUsers);
      } catch (apiError) {
        console.error("API call failed:", apiError);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    // Normalize status from boolean to string for comparison
    const userStatus = user.isActive === true ? "active" : "suspended";
    const matchesStatus = filterStatus === "all" || filterStatus === userStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add this useEffect to update the selectedUser when users data changes
  useEffect(() => {
    if (selectedUser) {
      const updatedUser = users.find((user) => user._id === selectedUser._id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  }, [users, selectedUser]);

  // Also update the handleUserAction function to ensure it refreshes the data
  const handleUserAction = async (userId, action) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: action }));

      if (action === "activate") {
        await apiService.adminActivateUser(userId);
      } else if (action === "suspend") {
        await apiService.adminSuspendUser(userId);
      } else if (action === "delete") {
        if (window.confirm("Are you sure you want to delete this user?")) {
          await apiService.adminDeleteUser(userId);
        } else {
          setActionLoading((prev) => ({ ...prev, [userId]: null }));
          return;
        }
      }

      // Refresh users list
      await fetchUsers();

      // If we're in the user details modal, update the selected user
      if (selectedUser && selectedUser._id === userId) {
        const updatedUser = users.find((user) => user._id === userId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      setActionLoading((prev) => ({ ...prev, bulk: action }));

      if (action === "delete") {
        if (
          !window.confirm(
            `Are you sure you want to delete ${selectedUsers.length} users?`
          )
        ) {
          return;
        }
      }

      await Promise.all(
        selectedUsers.map((userId) => {
          if (action === "activate")
            return apiService.adminActivateUser(userId);
          if (action === "suspend") return apiService.adminSuspendUser(userId);
          if (action === "delete") return apiService.adminDeleteUser(userId);
        })
      );

      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error(`Failed to ${action} users:`, error);
      alert(`Failed to ${action} some users`);
    } finally {
      setActionLoading((prev) => ({ ...prev, bulk: null }));
    }
  };

  const handleExportUsers = async () => {
    try {
      setActionLoading((prev) => ({ ...prev, export: "exporting" }));

      const csvContent = [
        ["Name", "Email", "Role", "Status", "Join Date", "Last Active"].join(
          ","
        ),
        ...filteredUsers.map((user) =>
          [
            `"${user.name}"`,
            user.email,
            user.role,
            user.isActive ? "Active" : "Suspended",
            new Date(user.createdAt || Date.now()).toLocaleDateString(),
            new Date(
              user.lastActive || user.updatedAt || Date.now()
            ).toLocaleDateString(),
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export users:", error);
      alert("Failed to export users");
    } finally {
      setActionLoading((prev) => ({ ...prev, export: null }));
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u._id));
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

  // Calculate stats
  const activeUsers = users.filter((u) => u.isActive === true).length;
  const suspendedUsers = users.filter((u) => u.isActive === false).length;
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const newUsersThisMonth = users.filter((user) => {
    const joinDate = new Date(user.createdAt);
    return joinDate >= startOfMonth;
  }).length;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Link to="/admin/dashboard" className={styles.backLink}>
              <ArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.title}>User Management</h1>
          </div>
          <p className={styles.subtitle}>
            Manage users, vendors, and their activities
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <Users className={`${styles.statIcon} ${styles.statIconBlue}`} />
              <div className={styles.statText}>
                <p className={styles.statLabel}>Total Users</p>
                <p className={styles.statValue}>{users.length}</p>
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <UserCheck
                className={`${styles.statIcon} ${styles.statIconGreen}`}
              />
              <div className={styles.statText}>
                <p className={styles.statLabel}>Active Users</p>
                <p className={styles.statValue}>{activeUsers}</p>
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <UserX className={`${styles.statIcon} ${styles.statIconRed}`} />
              <div className={styles.statText}>
                <p className={styles.statLabel}>Suspended</p>
                <p className={styles.statValue}>{suspendedUsers}</p>
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <Activity
                className={`${styles.statIcon} ${styles.statIconPurple}`}
              />
              <div className={styles.statText}>
                <p className={styles.statLabel}>New This Month</p>
                <p className={styles.statValue}>{newUsersThisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlsContent}>
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="vendor">Vendors</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              <button
                onClick={handleExportUsers}
                disabled={actionLoading.export}
                className={styles.exportButton}
              >
                {actionLoading.export ? (
                  <RefreshCw
                    className={`${styles.exportIcon} ${styles.spinner}`}
                  />
                ) : (
                  <Download className={styles.exportIcon} />
                )}
                Export
              </button>
            </div>

            {selectedUsers.length > 0 && (
              <div className={styles.bulkActions}>
                <span className={styles.bulkText}>
                  {selectedUsers.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction("activate")}
                  disabled={actionLoading.bulk}
                  className={`${styles.bulkButton} ${styles.bulkActivate}`}
                >
                  {actionLoading.bulk === "activate"
                    ? "Activating..."
                    : "Activate"}
                </button>
                <button
                  onClick={() => handleBulkAction("suspend")}
                  disabled={actionLoading.bulk}
                  className={`${styles.bulkButton} ${styles.bulkSuspend}`}
                >
                  {actionLoading.bulk === "suspend"
                    ? "Suspending..."
                    : "Suspend"}
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={actionLoading.bulk}
                  className={`${styles.bulkButton} ${styles.bulkDelete}`}
                >
                  {actionLoading.bulk === "delete" ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === paginatedUsers.length &&
                        paginatedUsers.length > 0
                      }
                      onChange={selectAllUsers}
                      className={styles.checkbox}
                    />
                  </th>
                  <th className={styles.tableHeader}>User</th>
                  <th className={styles.tableHeader}>Role</th>
                  <th className={styles.tableHeader}>Status</th>
                  <th className={styles.tableHeader}>Join Date</th>
                  <th className={styles.tableHeader}>Last Active</th>
                  <th className={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className={styles.checkbox}
                      />
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.userCell}>
                        <img
                          src={
                            user.avatar ||
                            "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
                          }
                          alt={user.name}
                          className={styles.userImage}
                        />
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{user.name}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                          {user.role === "vendor" &&
                            user.vendorInfo?.shopName && (
                              <div className={styles.shopName}>
                                Shop: {user.vendorInfo.shopName}
                              </div>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {getRoleBadge(user.role)}
                    </td>
                    <td className={styles.tableCell}>
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.dateText}>{getJoinDate(user)}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.dateSubtext}>
                        {getLastActive(user)}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionCell}>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className={`${styles.actionButton} ${styles.viewButton}`}
                          title="View Details"
                        >
                          <Eye className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() =>
                            handleUserAction(
                              user._id,
                              user.isActive ? "suspend" : "activate"
                            )
                          }
                          disabled={actionLoading[user._id]}
                          className={`${styles.actionButton} ${
                            user.isActive
                              ? styles.suspendButton
                              : styles.activateButton
                          }`}
                          title={
                            user.isActive ? "Suspend User" : "Activate User"
                          }
                        >
                          {actionLoading[user._id] ? (
                            <RefreshCw
                              className={`${styles.actionIcon} ${styles.spinner}`}
                            />
                          ) : user.isActive ? (
                            <Ban className={styles.actionIcon} />
                          ) : (
                            <CheckCircle className={styles.actionIcon} />
                          )}
                        </button>
                        <button
                          onClick={() => handleUserAction(user._id, "delete")}
                          disabled={actionLoading[user._id]}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Delete User"
                        >
                          {actionLoading[user._id] === "delete" ? (
                            <RefreshCw
                              className={`${styles.actionIcon} ${styles.spinner}`}
                            />
                          ) : (
                            <Trash2 className={styles.actionIcon} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </button>

            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={
                      currentPage === pageNumber
                        ? `${styles.pageButton} ${styles.pageButtonActive}`
                        : `${styles.pageButton} ${styles.pageButtonInactive}`
                    }
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <Users className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No users found</h3>
            <p className={styles.emptyText}>
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <UserDetails
            selectedUser={selectedUser}
            users={users}
            setShowUserDetails={setShowUserDetails}
            fetchUsers={fetchUsers}
            setSelectedUser={setSelectedUser}
            onUserAction={handleUserAction}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
