import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  User,
  Shield,
  Store,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, role);

      // Redirect based on role
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "vendor") {
        navigate("/vendor/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "customer", label: "Customer", icon: User, color: "bg-blue-500" },
    { value: "vendor", label: "Vendor", icon: Store, color: "bg-green-500" },
    { value: "admin", label: "Admin", icon: Shield, color: "bg-purple-500" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Animated Header */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <div className={styles.iconWrapper}>
              <div className={styles.mainIcon}>
                <Sparkles className={styles.sparklesIcon} />
              </div>
              <div className={styles.decorIcon}></div>
            </div>
          </div>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to your LUXE account</p>
        </div>

        {/* Login Form */}
        <div className={styles.formCard}>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Login as
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      role === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`${option.color} w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2`}
                    >
                      <option.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formFields}>
              <div className={styles.fieldGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${styles.input} ${styles.passwordInput}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.toggleButton}
                  >
                    {showPassword ? (
                      <EyeOff className={styles.toggleIcon} />
                    ) : (
                      <Eye className={styles.toggleIcon} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Demo Credentials
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>Admin:</strong> admin@luxe.com / admin123
                </p>
                <p>
                  <strong>Vendor:</strong> vendor@luxe.com / vendor123
                </p>
                <p>
                  <strong>User:</strong> user@luxe.com / user123
                </p>
              </div>
            </div>

            <div className={styles.formOptions}>
              <div className={styles.checkboxGroup}>
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className={styles.checkbox}
                />
                <label htmlFor="remember-me" className={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              <a href="#" className={styles.forgotLink}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : (
                <div className={styles.buttonText}>
                  Sign In
                  <ArrowRight className={styles.buttonIcon} />
                </div>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}>
              <div className={styles.dividerBorder}>
                <div className={styles.dividerBorderLine}></div>
              </div>
              <div className={styles.dividerText}>
                <span className={styles.dividerTextSpan}>Or continue with</span>
              </div>
            </div>

            <div className={styles.socialButtons}>
              <button className={styles.socialButton}>
                <svg className={styles.socialIcon} viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
              <button className={styles.socialButton}>
                <svg
                  className={styles.socialIcon}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className={styles.signupPrompt}>
              Don't have an account?{" "}
              <Link to="/signup" className={styles.signupLink}>
                Sign up as customer
              </Link>
            </p>
            <p className={styles.signupPrompt}>
              Want to sell products?{" "}
              <Link to="/vendor/signup" className={styles.signupLink}>
                Become a vendor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
