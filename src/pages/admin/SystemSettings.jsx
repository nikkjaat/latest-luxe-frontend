import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  ArrowLeft,
  Globe,
  Mail,
  Shield,
  CreditCard,
  Truck,
  Bell,
  Palette,
  Database,
  Key,
  Users,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    general: {
      siteName: "LUXE",
      siteDescription: "Premium Shopping Experience",
      contactEmail: "support@luxe.com",
      contactPhone: "+1 (555) 123-4567",
      address: "123 Luxury Avenue, Fashion District, NY 10001",
      timezone: "America/New_York",
      currency: "USD",
      language: "en",
    },
    email: {
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      fromEmail: "noreply@luxe.com",
      fromName: "LUXE Team",
    },
    payment: {
      stripePublishableKey: "",
      stripeSecretKey: "",
      paypalClientId: "",
      paypalClientSecret: "",
      enableStripe: true,
      enablePaypal: false,
      enableCOD: true,
    },
    shipping: {
      freeShippingThreshold: 100,
      standardShippingRate: 9.99,
      expressShippingRate: 19.99,
      internationalShippingRate: 29.99,
      enableFreeShipping: true,
      enableExpressShipping: true,
      enableInternationalShipping: false,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderConfirmation: true,
      shippingUpdates: true,
      promotionalEmails: true,
      lowStockAlerts: true,
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPassword: true,
      enableCaptcha: false,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiService.adminGetSettings();
        if (response.settings) {
          setSettings(response.settings);
        }
      } catch (apiError) {
        console.error("API call failed, using default settings:", apiError);
        // Keep default settings if API fails
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.adminUpdateSettings(settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: "general", name: "General", icon: Globe },
    { id: "email", name: "Email", icon: Mail },
    { id: "payment", name: "Payment", icon: CreditCard },
    { id: "shipping", name: "Shipping", icon: Truck },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

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
                  System Settings
                </h1>
                <p className="text-gray-600 mt-2">
                  Configure your e-commerce platform
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    General Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) =>
                          updateSetting("general", "siteName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "contactEmail",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.general.contactPhone}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "contactPhone",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.general.currency}
                        onChange={(e) =>
                          updateSetting("general", "currency", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) =>
                        updateSetting(
                          "general",
                          "siteDescription",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <textarea
                      value={settings.general.address}
                      onChange={(e) =>
                        updateSetting("general", "address", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === "payment" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Payment Settings
                  </h3>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          Stripe Configuration
                        </h4>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.payment.enableStripe}
                            onChange={(e) =>
                              updateSetting(
                                "payment",
                                "enableStripe",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            Enable Stripe
                          </span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publishable Key
                          </label>
                          <input
                            type="text"
                            value={settings.payment.stripePublishableKey}
                            onChange={(e) =>
                              updateSetting(
                                "payment",
                                "stripePublishableKey",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="pk_test_..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secret Key
                          </label>
                          <input
                            type="password"
                            value={settings.payment.stripeSecretKey}
                            onChange={(e) =>
                              updateSetting(
                                "payment",
                                "stripeSecretKey",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="sk_test_..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          PayPal Configuration
                        </h4>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.payment.enablePaypal}
                            onChange={(e) =>
                              updateSetting(
                                "payment",
                                "enablePaypal",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            Enable PayPal
                          </span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client ID
                          </label>
                          <input
                            type="text"
                            value={settings.payment.paypalClientId}
                            onChange={(e) =>
                              updateSetting(
                                "payment",
                                "paypalClientId",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client Secret
                          </label>
                          <input
                            type="password"
                            value={settings.payment.paypalClientSecret}
                            onChange={(e) =>
                              updateSetting(
                                "payment",
                                "paypalClientSecret",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Other Payment Methods
                      </h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.payment.enableCOD}
                          onChange={(e) =>
                            updateSetting(
                              "payment",
                              "enableCOD",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          Enable Cash on Delivery
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Settings */}
              {activeTab === "shipping" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Shipping Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Free Shipping Threshold ($)
                      </label>
                      <input
                        type="number"
                        value={settings.shipping.freeShippingThreshold}
                        onChange={(e) =>
                          updateSetting(
                            "shipping",
                            "freeShippingThreshold",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Standard Shipping Rate ($)
                      </label>
                      <input
                        type="number"
                        value={settings.shipping.standardShippingRate}
                        onChange={(e) =>
                          updateSetting(
                            "shipping",
                            "standardShippingRate",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Express Shipping Rate ($)
                      </label>
                      <input
                        type="number"
                        value={settings.shipping.expressShippingRate}
                        onChange={(e) =>
                          updateSetting(
                            "shipping",
                            "expressShippingRate",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        International Shipping Rate ($)
                      </label>
                      <input
                        type="number"
                        value={settings.shipping.internationalShippingRate}
                        onChange={(e) =>
                          updateSetting(
                            "shipping",
                            "internationalShippingRate",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Shipping Options
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.shipping.enableFreeShipping}
                          onChange={(e) =>
                            updateSetting(
                              "shipping",
                              "enableFreeShipping",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                        />
                        <span className="text-sm text-gray-700">
                          Enable Free Shipping
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.shipping.enableExpressShipping}
                          onChange={(e) =>
                            updateSetting(
                              "shipping",
                              "enableExpressShipping",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                        />
                        <span className="text-sm text-gray-700">
                          Enable Express Shipping
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            settings.shipping.enableInternationalShipping
                          }
                          onChange={(e) =>
                            updateSetting(
                              "shipping",
                              "enableInternationalShipping",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                        />
                        <span className="text-sm text-gray-700">
                          Enable International Shipping
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === "email" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Email Configuration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpHost}
                        onChange={(e) =>
                          updateSetting("email", "smtpHost", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) =>
                          updateSetting(
                            "email",
                            "smtpPort",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpUser}
                        onChange={(e) =>
                          updateSetting("email", "smtpUser", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) =>
                          updateSetting("email", "smtpPassword", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) =>
                          updateSetting("email", "fromEmail", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) =>
                          updateSetting("email", "fromName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Notification Settings
                  </h3>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Customer Notifications
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Order Confirmation Emails
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderConfirmation}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "orderConfirmation",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Shipping Updates
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.notifications.shippingUpdates}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "shippingUpdates",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Promotional Emails
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.notifications.promotionalEmails}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "promotionalEmails",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Admin Notifications
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Low Stock Alerts
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.notifications.lowStockAlerts}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "lowStockAlerts",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          New Order Notifications
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "emailNotifications",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Security Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "sessionTimeout",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="5"
                        max="1440"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "maxLoginAttempts",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="3"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "passwordMinLength",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="6"
                        max="20"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Security Features
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Enable Two-Factor Authentication
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.security.enableTwoFactor}
                          onChange={(e) =>
                            updateSetting(
                              "security",
                              "enableTwoFactor",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Require Strong Passwords
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.security.requireStrongPassword}
                          onChange={(e) =>
                            updateSetting(
                              "security",
                              "requireStrongPassword",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Enable CAPTCHA
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.security.enableCaptcha}
                          onChange={(e) =>
                            updateSetting(
                              "security",
                              "enableCaptcha",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
