import React, { useState, useEffect } from "react";
import {
  User,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Building,
  Globe,
  Clock,
  Package,
  Star,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductContext";
import apiService from "../../services/api";

const VendorProfile = () => {
  const { user, updateProfile } = useAuth();
  const { products, getProductsByVendor } = useProducts();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    vendorInfo: {
      shopName: "",
      businessType: "",
      description: "",
      address: "",
      website: "",
      businessHours: "",
      taxId: "",
      bankDetails: {
        accountNumber: "",
        routingNumber: "",
        bankName: "",
      },
    },
  });

  const vendorProducts = getProductsByVendor(user?._id);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
        vendorInfo: {
          shopName: user.vendorInfo?.shopName || "",
          businessType: user.vendorInfo?.businessType || "",
          description: user.vendorInfo?.description || "",
          address: user.vendorInfo?.address || "",
          website: user.vendorInfo?.website || "",
          businessHours: user.vendorInfo?.businessHours || "",
          taxId: user.vendorInfo?.taxId || "",
          bankDetails: {
            accountNumber: user.vendorInfo?.bankDetails?.accountNumber || "",
            routingNumber: user.vendorInfo?.bankDetails?.routingNumber || "",
            bankName: user.vendorInfo?.bankDetails?.bankName || "",
          },
        },
      });
    }
  }, [user]);

  const businessTypes = [
    "Fashion & Accessories",
    "Electronics & Gadgets",
    "Home & Living",
    "Beauty & Cosmetics",
    "Sports & Fitness",
    "Books & Media",
    "Toys & Games",
    "Food & Beverages",
    "Health & Wellness",
    "Art & Crafts",
  ];

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("vendorInfo.")) {
      const field = name.replace("vendorInfo.", "");
      if (field.startsWith("bankDetails.")) {
        const bankField = field.replace("bankDetails.", "");
        setFormData((prev) => ({
          ...prev,
          vendorInfo: {
            ...prev.vendorInfo,
            bankDetails: {
              ...prev.vendorInfo.bankDetails,
              [bankField]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          vendorInfo: {
            ...prev.vendorInfo,
            [field]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Calculate vendor stats
  const totalProducts = vendorProducts.length;
  const activeProducts = vendorProducts.filter(
    (p) => p.status === "active"
  ).length;
  const averageRating =
    vendorProducts.length > 0
      ? vendorProducts.reduce((sum, p) => {
          const rating =
            typeof p.rating === "object" ? p.rating.average : p.rating;
          return sum + (rating || 0);
        }, 0) / vendorProducts.length
      : 0;
  const totalReviews = vendorProducts.reduce((sum, p) => {
    const reviews = typeof p.rating === "object" ? p.rating.count : p.reviews;
    return sum + (reviews || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/vendor/dashboard"
                className="text-blue-600 hover:text-blue-700 mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Vendor Profile
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your store information and settings
                </p>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={formData.avatar || user?.avatar}
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto"
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {formData.name}
                </h2>
                <p className="text-gray-600">{formData.vendorInfo.shopName}</p>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      user?.vendorInfo?.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user?.vendorInfo?.status === "approved"
                      ? "Verified Vendor"
                      : "Pending Approval"}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-gray-600">Products</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {totalProducts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="text-gray-600">Rating</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-600">Reviews</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {totalReviews}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-600">Member Since</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {new Date(user?.createdAt || Date.now()).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Store Information
              </h3>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Owner Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Store className="h-4 w-4 inline mr-2" />
                      Shop Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="vendorInfo.shopName"
                        value={formData.vendorInfo.shopName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.vendorInfo.shopName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="h-4 w-4 inline mr-2" />
                      Business Type
                    </label>
                    {isEditing ? (
                      <select
                        name="vendorInfo.businessType"
                        value={formData.vendorInfo.businessType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.vendorInfo.businessType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.phone || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="vendorInfo.website"
                        value={formData.vendorInfo.website}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://yourstore.com"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.vendorInfo.website ? (
                          <a
                            href={formData.vendorInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {formData.vendorInfo.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Description
                  </label>
                  {isEditing ? (
                    <textarea
                      name="vendorInfo.description"
                      value={formData.vendorInfo.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell customers about your store..."
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg">
                      {formData.vendorInfo.description ||
                        "No description provided"}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Business Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="vendorInfo.address"
                      value={formData.vendorInfo.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your business address..."
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg">
                      {formData.vendorInfo.address || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Business Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Business Hours
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="vendorInfo.businessHours"
                      value={formData.vendorInfo.businessHours}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mon-Fri 9AM-6PM"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg">
                      {formData.vendorInfo.businessHours || "Not specified"}
                    </p>
                  )}
                </div>

                {/* Bank Details (Only in edit mode for security) */}
                {isEditing && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Payment Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          name="vendorInfo.bankDetails.bankName"
                          value={formData.vendorInfo.bankDetails.bankName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number
                        </label>
                        <input
                          type="text"
                          name="vendorInfo.bankDetails.accountNumber"
                          value={formData.vendorInfo.bankDetails.accountNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Routing Number
                        </label>
                        <input
                          type="text"
                          name="vendorInfo.bankDetails.routingNumber"
                          value={formData.vendorInfo.bankDetails.routingNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax ID
                        </label>
                        <input
                          type="text"
                          name="vendorInfo.taxId"
                          value={formData.vendorInfo.taxId}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Store Performance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Store Performance
              </h3>

              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {totalProducts}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {activeProducts}
                  </div>
                  <div className="text-sm text-gray-600">Active Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {totalReviews}
                  </div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
              </div>

              {/* Recent Products */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Recent Products
                </h4>
                <div className="space-y-3">
                  {vendorProducts.slice(0, 3).map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            product.images?.[0]?.url ||
                            "https://via.placeholder.com/48"
                          }
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {product.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            ${product.price}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm">
                            {typeof product.rating === "object"
                              ? product.rating.average?.toFixed(1)
                              : product.rating?.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {vendorProducts.length > 3 && (
                  <Link
                    to="/vendor/dashboard"
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all products →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
