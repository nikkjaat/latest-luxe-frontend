import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./SignupPage.module.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength < 3) {
      setError("Password is too weak");
      return;
    }

    try {
      await signup(formData.name, formData.email, formData.password);
      setIsLoading(false);
      navigate("/");
    } catch (err) {
      setIsLoading(false);
      setError("Failed to create account");
    }
  };

  const getPasswordStrengthClass = () => {
    if (passwordStrength <= 2) return styles.weak;
    if (passwordStrength <= 3) return styles.medium;
    return styles.strong;
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

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
              <div className={styles.decorIcon}>
                <Check className={styles.checkIcon} />
              </div>
            </div>
          </div>
          <h2 className={styles.title}>Create Account</h2>
          <p className={styles.subtitle}>
            Join LUXE and discover premium shopping
          </p>
        </div>

        {/* Signup Form */}
        <div className={styles.formCard}>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formFields}>
              <div className={styles.fieldGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name
                </label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.password}
                    onChange={handleChange}
                    className={`${styles.input} ${styles.passwordInput}`}
                    placeholder="Create a password"
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
                {formData.password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthHeader}>
                      <span className={styles.strengthLabel}>
                        Password strength:
                      </span>
                      <span
                        className={`${
                          styles.strengthText
                        } ${getPasswordStrengthClass()}`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className={styles.strengthBar}>
                      <div
                        className={`${
                          styles.strengthProgress
                        } ${getPasswordStrengthClass()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${styles.input} ${styles.passwordInput}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.toggleButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className={styles.toggleIcon} />
                    ) : (
                      <Eye className={styles.toggleIcon} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.termsGroup}>
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className={styles.checkbox}
              />
              <label htmlFor="terms" className={styles.checkboxLabel}>
                I agree to the{" "}
                <a href="#" className={styles.termsLink}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className={styles.termsLink}>
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                <div className={styles.buttonText}>
                  Create Account
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
                <span className={styles.dividerTextSpan}>Or sign up with</span>
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

          <p className={styles.loginPrompt}>
            Already have an account?{" "}
            <Link to="/login" className={styles.loginLink}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
