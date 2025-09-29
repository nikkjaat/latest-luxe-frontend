import React, { useState, useEffect } from "react";
import {
  Grid,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  ArrowLeft,
  Save,
  X,
  Upload,
  RefreshCw,
  Package,
  TrendingUp,
  Link as LinkIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../../services/api";
import { useCategory } from "../../../context/CategoryContext";
import { useProducts } from "../../../context/ProductContext"; // Import ProductContext
import styles from "./CategoryManagement.module.css";

const CategoryManagement = () => {
  const {
    adminGetCategories,
    adminCreateCategory,
    adminUpdateCategory,
    adminDeleteCategory,
  } = useCategory();

  const { products, getProducts } = useProducts(); // Get products context
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [imageUploadMethod, setImageUploadMethod] = useState("url");
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    imageFile: null,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      await adminGetCategories();
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      await getProducts();
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Get categories from context
  const { categories: contextCategories } = useCategory();

  // Count products for each category and update categories state
  useEffect(() => {
    if (contextCategories && contextCategories.length > 0) {
      const categoriesWithProductCounts = contextCategories.map((category) => {
        const productCount = countProductsInCategory(category);
        return {
          ...category,
          productCount,
        };
      });
      setCategories(categoriesWithProductCounts);
    }
  }, [contextCategories, products]);

  // Function to count products in a specific category
  const countProductsInCategory = (category) => {
    if (!products || products.length === 0) return 0;

    const slug = category.slug?.toLowerCase();
    const name = category.name?.toLowerCase();

    return products.filter((product) => {
      const productCategory = product.category?.main;

      if (!productCategory) return false;

      // Handle string category
      if (typeof productCategory === "string") {
        return (
          productCategory.toLowerCase() === slug ||
          productCategory.toLowerCase() === name
        );
      }

      // Handle object category
      if (typeof productCategory === "object") {
        return (
          productCategory.slug?.toLowerCase() === slug ||
          productCategory.name?.toLowerCase() === name ||
          productCategory._id === category._id
        );
      }

      return false;
    }).length;
  };

  // Function to get filtered products for a category (for navigation)
  const getProductsByCategory = (category) => {
    if (!products || products.length === 0) return [];

    const slug = category.slug?.toLowerCase();
    const name = category.name?.toLowerCase();
    const keyword = slug || name;

    return products.filter((product) => {
      const productCategory = product.category?.main;

      if (!productCategory) return false;

      // Handle string category
      if (typeof productCategory === "string") {
        return (
          productCategory.toLowerCase() === slug ||
          productCategory.toLowerCase() === name
        );
      }

      // Handle object category
      if (typeof productCategory === "object") {
        return (
          productCategory.slug?.toLowerCase() === slug ||
          productCategory.name?.toLowerCase() === name ||
          productCategory._id === category._id
        );
      }

      return false;
    });
  };

  // Handle view category click
  const handleViewCategory = (category) => {
    const filterCategory = getProductsByCategory(category);
    const keyword =
      category.slug?.toLowerCase() || category.name?.toLowerCase();

    navigate(`/category/${category.slug}`, {
      state: {
        keyword,
        filterCategory,
        name: category.name,
        itemCount: category.productCount || filterCategory.length,
      },
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "URL slug is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Image validation
    if (imageUploadMethod === "url" && !formData.image.trim()) {
      newErrors.image = "Image URL is required";
    } else if (
      imageUploadMethod === "file" &&
      !formData.imageFile &&
      !editingCategory?.image
    ) {
      newErrors.image = "Please select an image file";
    }

    // Check for duplicate slug
    const existingCategory = categories.find(
      (cat) =>
        cat.slug === formData.slug &&
        (!editingCategory || cat._id !== editingCategory._id)
    );
    if (existingCategory) {
      newErrors.slug = "This URL slug is already in use";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, form: "saving" }));

      let dataToSend;

      if (imageUploadMethod === "file" && formData.imageFile) {
        // Use FormData for file uploads
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("slug", formData.slug);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("isActive", formData.isActive);
        formDataToSend.append("sortOrder", formData.sortOrder);
        formDataToSend.append("imageSource", "file");
        formDataToSend.append("imageFile", formData.imageFile);
        dataToSend = formDataToSend;
      } else {
        // Use JSON for URL-based images
        dataToSend = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          image: formData.image,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
          imageSource: "url",
        };
      }

      if (editingCategory) {
        await adminUpdateCategory(editingCategory._id, dataToSend);
      } else {
        await adminCreateCategory(dataToSend);
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save category:", error);
      setErrors({ submit: error.message || "Failed to save category" });
    } finally {
      setActionLoading((prev) => ({ ...prev, form: null }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      imageFile: null,
      isActive: true,
      sortOrder: 0,
    });
    setImageUploadMethod("url");
    setImagePreview(null);
    setErrors({});
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
      imageFile: null,
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
    });
    setEditingCategory(category);
    setImageUploadMethod("url");
    setImagePreview(null);
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      try {
        setActionLoading((prev) => ({ ...prev, [categoryId]: "deleting" }));
        await adminDeleteCategory(categoryId);
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Failed to delete category");
      } finally {
        setActionLoading((prev) => ({ ...prev, [categoryId]: null }));
      }
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image file must be less than 5MB",
        }));
        return;
      }

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Store the file in formData
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));

      // Clear any previous image errors
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Auto-generate slug when name changes
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    // Clear errors for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));

    // Clear image preview when switching to URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    // Clear errors
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const filteredCategories = categories
    .filter(
      (category) =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Link to="/admin/dashboard" className={styles.backLink}>
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className={styles.title}>Category Management</h1>
                <p className={styles.subtitle}>
                  Organize and manage product categories
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className={styles.addButton}
            >
              <Plus size={20} className={styles.addButtonIcon} />
              Add Category
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <Grid size={32} className={styles.statIconBlue} />
              <div className={styles.statTextContainer}>
                <p className={styles.statLabel}>Total Categories</p>
                <p className={styles.statValue}>{categories.length}</p>
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <TrendingUp size={32} className={styles.statIconGreen} />
              <div className={styles.statTextContainer}>
                <p className={styles.statLabel}>Active Categories</p>
                <p className={styles.statValue}>
                  {categories.filter((cat) => cat.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <Package size={32} className={styles.statIconPurple} />
              <div className={styles.statTextContainer}>
                <p className={styles.statLabel}>Total Products</p>
                <p className={styles.statValue}>
                  {categories.reduce(
                    (sum, cat) => sum + (cat.productCount || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <TrendingUp size={32} className={styles.statIconOrange} />
              <div className={styles.statTextContainer}>
                <p className={styles.statLabel}>Avg. Products</p>
                <p className={styles.statValue}>
                  {categories.length > 0
                    ? Math.round(
                        categories.reduce(
                          (sum, cat) => sum + (cat.productCount || 0),
                          0
                        ) / categories.length
                      )
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className={styles.categoriesGrid}>
          {filteredCategories.map((category) => (
            <div key={category._id} className={styles.categoryCard}>
              <div className={styles.categoryImageContainer}>
                <img
                  src={category.image || "https://via.placeholder.com/400x200"}
                  alt={category.name}
                  className={styles.categoryImage}
                />
                <div
                  className={`${styles.categoryStatus} ${
                    category.isActive
                      ? styles.statusActive
                      : styles.statusInactive
                  }`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div className={styles.categoryContent}>
                <div className={styles.categoryHeader}>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <span className={styles.categoryOrder}>
                    #{category.sortOrder || 0}
                  </span>
                </div>

                <p className={styles.categoryDescription}>
                  {category.description}
                </p>

                <div className={styles.categoryFooter}>
                  <div className={styles.productCount}>
                    <Package size={16} className={styles.productCountIcon} />
                    <span>{category.productCount || 0} products</span>
                  </div>
                  <span className={styles.categorySlug}>/{category.slug}</span>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => handleViewCategory(category)}
                    className={styles.viewButton}
                  >
                    <Eye size={16} className={styles.actionIcon} />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className={styles.editButton}
                  >
                    <Edit size={16} className={styles.actionIcon} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id || category.id)}
                    disabled={actionLoading[category._id || category.id]}
                    className={styles.deleteButton}
                  >
                    {actionLoading[category._id || category.id] ===
                    "deleting" ? (
                      <RefreshCw size={16} className={styles.actionIcon} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className={styles.emptyState}>
            <Grid size={64} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No categories found</h3>
            <p className={styles.emptyText}>
              {searchTerm
                ? "Try adjusting your search terms."
                : "Create your first category to get started."}
            </p>
          </div>
        )}

        {/* Category Form Modal */}
        {showForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h2>
                <button onClick={resetForm} className={styles.modalClose}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalForm}>
                {errors.submit && (
                  <div className={styles.errorMessage}>{errors.submit}</div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Category Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${
                        errors.name ? styles.formInputError : ""
                      }`}
                      required
                    />
                    {errors.name && (
                      <p className={styles.errorText}>{errors.name}</p>
                    )}
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>URL Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleFormChange}
                      className={`${styles.formInput} ${
                        errors.slug ? styles.formInputError : ""
                      }`}
                      required
                    />
                    {errors.slug && (
                      <p className={styles.errorText}>{errors.slug}</p>
                    )}
                    <p className={styles.formHelper}>
                      URL: /category/{formData.slug}
                    </p>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className={`${styles.formTextarea} ${
                      errors.description ? styles.formInputError : ""
                    }`}
                    rows={3}
                    required
                  />
                  {errors.description && (
                    <p className={styles.errorText}>{errors.description}</p>
                  )}
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Category Image</label>

                  {/* Upload method selector */}
                  <div className={styles.uploadMethodSelector}>
                    <button
                      type="button"
                      className={`${styles.uploadMethodButton} ${
                        imageUploadMethod === "url" ? styles.active : ""
                      }`}
                      onClick={() => setImageUploadMethod("url")}
                    >
                      <LinkIcon size={16} />
                      Use URL
                    </button>
                    <button
                      type="button"
                      className={`${styles.uploadMethodButton} ${
                        imageUploadMethod === "file" ? styles.active : ""
                      }`}
                      onClick={() => setImageUploadMethod("file")}
                    >
                      <Upload size={16} />
                      Upload File
                    </button>
                  </div>

                  {/* URL input */}
                  {imageUploadMethod === "url" && (
                    <>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleImageUrlChange}
                        className={`${styles.formInput} ${
                          errors.image ? styles.formInputError : ""
                        }`}
                        placeholder="https://example.com/image.jpg"
                      />
                      {formData.image && (
                        <div className={styles.imagePreviewContainer}>
                          <img
                            src={formData.image}
                            alt="Preview"
                            className={styles.imagePreview}
                            onError={(e) => {
                              setErrors((prev) => ({
                                ...prev,
                                image: "Invalid image URL",
                              }));
                            }}
                            onLoad={() => {
                              setErrors((prev) => ({ ...prev, image: "" }));
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* File upload */}
                  {imageUploadMethod === "file" && (
                    <div className={styles.fileUploadContainer}>
                      <label className={styles.fileUploadLabel}>
                        <Upload size={16} />
                        <span>
                          {imagePreview ? "Change Image" : "Choose Image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className={styles.fileInput}
                        />
                      </label>
                      {imagePreview && (
                        <div className={styles.imagePreviewContainer}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className={styles.imagePreview}
                          />
                        </div>
                      )}
                      {editingCategory?.image && !imagePreview && (
                        <div className={styles.imagePreviewContainer}>
                          <p className={styles.currentImageLabel}>
                            Current image:
                          </p>
                          <img
                            src={editingCategory.image}
                            alt="Current"
                            className={styles.imagePreview}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {errors.image && (
                    <p className={styles.errorText}>{errors.image}</p>
                  )}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleFormChange}
                      className={styles.formInput}
                      min="0"
                    />
                    <p className={styles.formHelper}>
                      Lower numbers appear first
                    </p>
                  </div>

                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className={styles.checkbox}
                    />
                    <label htmlFor="isActive" className={styles.checkboxLabel}>
                      Active Category
                    </label>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading.form}
                    className={styles.submitButton}
                  >
                    {actionLoading.form ? (
                      <RefreshCw size={16} className={styles.submitIcon} />
                    ) : (
                      <Save size={16} className={styles.submitIcon} />
                    )}
                    {editingCategory ? "Update Category" : "Create Category"}
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

export default CategoryManagement;
