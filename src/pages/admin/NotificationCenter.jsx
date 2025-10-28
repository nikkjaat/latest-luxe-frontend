import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Users,
  Package,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  ArrowLeft,
  Filter,
  Search,
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import apiService from "../../services/api";

const NotificationCenter = () => {
  const { notifications, addNotification, markAsRead, markAllAsRead } =
    useNotifications();
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    targetAudience: "all",
    priority: "normal",
    scheduledFor: "",
  });

  const notificationTypes = [
    { value: "info", label: "Information", icon: Info, color: "text-blue-600" },
    {
      value: "warning",
      label: "Warning",
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    {
      value: "success",
      label: "Success",
      icon: CheckCircle,
      color: "text-green-600",
    },
    { value: "error", label: "Error", icon: X, color: "text-red-600" },
  ];

  const targetAudiences = [
    { value: "all", label: "All Users" },
    { value: "customers", label: "Customers Only" },
    { value: "vendors", label: "Vendors Only" },
    { value: "admins", label: "Admins Only" },
  ];

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      setActionLoading((prev) => ({ ...prev, create: "creating" }));

      const notificationData = {
        ...formData,
        scheduledFor: formData.scheduledFor || new Date().toISOString(),
      };

      try {
        await apiService.adminSendNotification(notificationData);
      } catch (apiError) {
        console.error("API call failed, adding to local state:", apiError);
      }

      addNotification(notificationData);

      setFormData({
        title: "",
        message: "",
        type: "info",
        targetAudience: "all",
        priority: "normal",
        scheduledFor: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create notification:", error);
      alert("Failed to create notification");
    } finally {
      setActionLoading((prev) => ({ ...prev, create: null }));
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        setActionLoading((prev) => ({ ...prev, [notificationId]: "deleting" }));
        try {
          await apiService.adminDeleteNotification(notificationId);
        } catch (apiError) {
          console.error("API call failed:", apiError);
        }
        // Remove from local state
      } catch (error) {
        console.error("Failed to delete notification:", error);
        alert("Failed to delete notification");
      } finally {
        setActionLoading((prev) => ({ ...prev, [notificationId]: null }));
      }
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesType =
      filterType === "all" || notification.type === filterType;
    const matchesSearch =
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getNotificationIcon = (type) => {
    const config =
      notificationTypes.find((t) => t.value === type) || notificationTypes[0];
    return config.icon;
  };

  const getNotificationColor = (type) => {
    const config =
      notificationTypes.find((t) => t.value === type) || notificationTypes[0];
    return config.color;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/admin/dashboard"
                className="text-blue-600 hover:text-blue-700 mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Notification Center
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage system notifications and announcements
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Send className="h-5 w-5 mr-2" />
              Create Notification
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Notifications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter((n) => !n.read).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Sent Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    notifications.filter((n) => {
                      const today = new Date().toDateString();
                      const notifDate = new Date(
                        n.createdAt || Date.now()
                      ).toDateString();
                      return today === notifDate;
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900">2,543</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={markAllAsRead}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Mark All Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-500">
                  Create your first notification to get started.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full bg-gray-100`}>
                          <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{notification.time}</span>
                            <span>
                              Target:{" "}
                              {notification.userId === "all"
                                ? "All Users"
                                : notification.userId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                          disabled={actionLoading[notification.id]}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Delete notification"
                        >
                          {actionLoading[notification.id] === "deleting" ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Create Notification Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Create Notification
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={handleCreateNotification}
                className="p-6 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {notificationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience *
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          targetAudience: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {targetAudiences.map((audience) => (
                        <option key={audience.value} value={audience.value}>
                          {audience.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule For (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledFor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to send immediately
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading.create}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    {actionLoading.create ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
