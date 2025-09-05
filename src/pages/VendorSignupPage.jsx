import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  Building,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useVendors } from "../context/VendorContext";

const VendorSignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    businessType: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useCurrentEmail, setUseCurrentEmail] = useState(false);
  const [error, setError] = useState("");
  const { signup, isLoading, isAuthenticated, user } = useAuth();
  const { addVendorApplication } = useVendors();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  // React.useEffect(() => {
  //   if (isAuthenticated) {
  //     const from = location.state?.from?.pathname || "/vendor/dashboard";
  //     navigate(from, { replace: true });
  //   }
  // }, [isAuthenticated, navigate, location]);

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

  // auto-fill email if user is logged in

  React.useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: useCurrentEmail ? user.email : "",
      }));
    }
  }, [useCurrentEmail, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Add vendor application
      addVendorApplication({
        name: formData.name,
        email: formData.email,
        shopName: formData.shopName,
        businessType: formData.businessType,
      });

      // Create vendor account with pending status
      await signup(formData.name, formData.email, formData.password, "vendor", {
        shopName: formData.shopName,
        businessType: formData.businessType,
      });

      navigate("/");
    } catch (err) {
      setError("Failed to create vendor account");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {user.vendorInfo.status === "pending"
              ? "Your application is under review."
              : "Become a Vendor"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {user.vendorInfo.status === "pending"
              ? "Thank you for your interest! Our team will review your application and get back to you soon."
              : "Join our marketplace and start selling your products"}
          </p>
        </div>

        {/* Form */}
        {!user.vendorInfo.status && (
          <>
            <form
              className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Personal Information */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name as per PAN
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      disabled={useCurrentEmail}
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        useCurrentEmail ? "bg-gray-100" : ""
                      }`}
                      placeholder="Enter your email"
                    />
                    {user && (
                      <div className="flex items-center mt-1">
                        <input
                          id="useCurrentEmail"
                          type="checkbox"
                          checked={useCurrentEmail}
                          onChange={(e) => setUseCurrentEmail(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="useCurrentEmail"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Use my current account email ({user.email})
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <label
                    htmlFor="shopName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Shop Name
                  </label>
                  <div className="mt-1 relative">
                    <Store className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="shopName"
                      name="shopName"
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your shop name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="businessType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Business Type
                  </label>
                  <div className="mt-1 relative">
                    <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      id="businessType"
                      name="businessType"
                      required
                      value={formData.businessType}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Application Process
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your application will be reviewed by our admin team</li>
                  <li>• You'll receive an email notification once approved</li>
                  <li>• After approval, you can start adding products</li>
                </ul>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorSignupPage;
