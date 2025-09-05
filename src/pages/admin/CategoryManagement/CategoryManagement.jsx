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
} from "lucide-react";
import { Link } from "react-router-dom";
import apiService from "../../../services/api";
import styles from "./CategoryManagement.module.css";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.adminGetCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Use default categories as fallback
      const defaultCategories = [
        {
          _id: "1",
          name: "Women's Fashion",
          slug: "women",
          description: "Latest trends in women's clothing and accessories",
          image:
            "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600",
          isActive: true,
          productCount: 45,
          sortOrder: 1,
        },
        {
          _id: "2",
          name: "Men's Collection",
          slug: "men",
          description: "Premium men's fashion and accessories",
          image:
            "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600",
          isActive: true,
          productCount: 32,
          sortOrder: 2,
        },
        {
          _id: "3",
          name: "Accessories",
          slug: "accessories",
          description: "Complete your look with luxury accessories",
          image:
            "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=600",
          isActive: true,
          productCount: 28,
          sortOrder: 3,
        },
        {
          _id: "4",
          name: "Home & Living",
          slug: "home",
          description: "Transform your space with elegant home decor",
          image:
            "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
          isActive: true,
          productCount: 19,
          sortOrder: 4,
        },
        {
          _id: "5",
          name: "Electronics",
          slug: "electronics",
          description: "Latest technology and gadgets",
          image:
            "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600",
          isActive: true,
          productCount: 15,
          sortOrder: 5,
        },
        {
          _id: "6",
          name: "Beauty & Care",
          slug: "beauty",
          description: "Premium beauty products and personal care",
          image:
            "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=600",
          isActive: true,
          productCount: 22,
          sortOrder: 6,
        },
      ];
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setActionLoading((prev) => ({ ...prev, form: "saving" }));

      if (editingCategory) {
        await apiService.adminUpdateCategory(editingCategory._id, formData);
      } else {
        await apiService.adminCreateCategory(formData);
      }

      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category");
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
      isActive: true,
      sortOrder: 0,
    });
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
    });
    setEditingCategory(category);
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
        await apiService.adminDeleteCategory(categoryId);
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Failed to delete category");
      } finally {
        setActionLoading((prev) => ({ ...prev, [categoryId]: null }));
      }
    }
  };

  const toggleCategoryStatus = async (category) => {
    try {
      setActionLoading((prev) => ({ ...prev, [category._id]: "updating" }));
      const updatedCategory = { ...category, isActive: !category.isActive };
      await apiService.adminUpdateCategory(category._id, updatedCategory);
      setCategories((prev) =>
        prev.map((cat) => (cat._id === category._id ? updatedCategory : cat))
      );
    } catch (error) {
      console.error("Failed to update category status:", error);
      alert("Failed to update category status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [category._id]: null }));
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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
                  <Link
                    to={`/category/${category.slug}`}
                    className={styles.viewButton}
                  >
                    <Eye size={16} className={styles.actionIcon} />
                    View
                  </Link>
                  <button
                    onClick={() => handleEdit(category)}
                    className={styles.editButton}
                  >
                    <Edit size={16} className={styles.actionIcon} />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleCategoryStatus(category)}
                    disabled={actionLoading[category._id]}
                    className={`${styles.toggleButton} ${
                      category.isActive
                        ? styles.toggleButtonActive
                        : styles.toggleButtonInactive
                    }`}
                  >
                    {actionLoading[category._id] ? (
                      <RefreshCw size={16} className={styles.actionIcon} />
                    ) : category.isActive ? (
                      "Hide"
                    ) : (
                      "Show"
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    disabled={actionLoading[category._id]}
                    className={styles.deleteButton}
                  >
                    {actionLoading[category._id] === "deleting" ? (
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
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Category Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name,
                          slug: generateSlug(name),
                        }));
                      }}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>URL Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      className={styles.formInput}
                      required
                    />
                    <p className={styles.formHelper}>
                      URL: /category/{formData.slug}
                    </p>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className={styles.formTextarea}
                    rows={3}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Category Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    className={styles.formInput}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div>
                      <img
                        src={formData.image}
                        alt="Preview"
                        className={styles.imagePreview}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sortOrder: parseInt(e.target.value) || 0,
                        }))
                      }
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
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
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
