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
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Link as LinkIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCategory } from "../../../context/CategoryContext";
import { useProducts } from "../../../context/ProductContext";
import styles from "./CategoryManagement.module.css";

const CategoryManagement = () => {
  const {
    adminGetCategories,
    adminCreateCategory,
    adminUpdateCategory,
    adminDeleteCategory,
  } = useCategory();

  const { products, getProducts } = useProducts();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [imageUploadMethod, setImageUploadMethod] = useState("url");
  const [imagePreview, setImagePreview] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    imageFile: null,
    isActive: true,
    sortOrder: 0,
    subcategories: [],
  });

  // State for nested category management
  const [categoryInputs, setCategoryInputs] = useState({
    level1: "",
    level2: {},
    level3: {},
    level4: {},
  });

  // State for editing nested categories
  const [editingNestedCategory, setEditingNestedCategory] = useState(null);

  console.log(editingNestedCategory);

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

  const { categories: contextCategories } = useCategory();

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

  const countProductsInCategory = (category) => {
    if (!products || products.length === 0) return 0;

    const slug = category.slug?.toLowerCase();
    const name = category.name?.toLowerCase();

    return products.filter((product) => {
      const productCategory = product.category?.main;
      if (!productCategory) return false;

      if (typeof productCategory === "string") {
        return (
          productCategory.toLowerCase() === slug ||
          productCategory.toLowerCase() === name
        );
      }

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

  const getProductsByCategory = (category) => {
    if (!products || products.length === 0) return [];

    const slug = category.slug?.toLowerCase();
    const name = category.name?.toLowerCase();

    return products.filter((product) => {
      const productCategory = product.category?.main;
      if (!productCategory) return false;

      if (typeof productCategory === "string") {
        return (
          productCategory.toLowerCase() === slug ||
          productCategory.toLowerCase() === name
        );
      }

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

  // Multi-level category functions
  const addLevel1Category = () => {
    const categoryName = categoryInputs.level1.trim();
    if (!categoryName) return;

    const categorySlug = generateSlug(categoryName);

    // Check for duplicates
    if (formData.subcategories.some((sub) => sub.name === categoryName)) {
      setErrors((prev) => ({
        ...prev,
        subcategories: "Category already exists",
      }));
      return;
    }

    const newCategory = {
      name: categoryName,
      slug: categorySlug,
      productCount: 0,
      isActive: true,
      subcategories: [],
    };

    setFormData((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, newCategory],
    }));

    setCategoryInputs((prev) => ({ ...prev, level1: "" }));
    setErrors((prev) => ({ ...prev, subcategories: "" }));
  };

  const addLevel2Category = (parentCategoryName) => {
    const categoryName = (
      categoryInputs.level2[parentCategoryName] || ""
    ).trim();
    if (!categoryName) return;

    const categorySlug = generateSlug(categoryName);

    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.map((sub) => {
        if (sub.name === parentCategoryName) {
          // Check for duplicates
          if (
            sub.subcategories?.some((subSub) => subSub.name === categoryName)
          ) {
            setErrors((prev) => ({
              ...prev,
              subSubcategories: "Subcategory already exists",
            }));
            return sub;
          }

          const newSubcategory = {
            name: categoryName,
            slug: categorySlug,
            productCount: 0,
            isActive: true,
            subcategories: [],
          };

          return {
            ...sub,
            subcategories: [...(sub.subcategories || []), newSubcategory],
          };
        }
        return sub;
      }),
    }));

    setCategoryInputs((prev) => ({
      ...prev,
      level2: { ...prev.level2, [parentCategoryName]: "" },
    }));
    setErrors((prev) => ({ ...prev, subSubcategories: "" }));
  };

  const addLevel3Category = (grandParentCategoryName, parentCategoryName) => {
    const key = `${grandParentCategoryName}-${parentCategoryName}`;
    const categoryName = (categoryInputs.level3[key] || "").trim();
    if (!categoryName) return;

    const categorySlug = generateSlug(categoryName);

    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.map((grandParent) => {
        if (grandParent.name === grandParentCategoryName) {
          return {
            ...grandParent,
            subcategories: grandParent.subcategories.map((parent) => {
              if (parent.name === parentCategoryName) {
                // Check for duplicates
                if (
                  parent.subcategories?.some((sub) => sub.name === categoryName)
                ) {
                  setErrors((prev) => ({
                    ...prev,
                    subSubcategories: "Sub-subcategory already exists",
                  }));
                  return parent;
                }

                const newSubSubcategory = {
                  name: categoryName,
                  slug: categorySlug,
                  productCount: 0,
                  isActive: true,
                  subcategories: [],
                };

                return {
                  ...parent,
                  subcategories: [
                    ...(parent.subcategories || []),
                    newSubSubcategory,
                  ],
                };
              }
              return parent;
            }),
          };
        }
        return grandParent;
      }),
    }));

    setCategoryInputs((prev) => ({
      ...prev,
      level3: { ...prev.level3, [key]: "" },
    }));
    setErrors((prev) => ({ ...prev, subSubcategories: "" }));
  };

  const addLevel4Category = (
    greatGrandParentCategoryName,
    grandParentCategoryName,
    parentCategoryName
  ) => {
    const key = `${greatGrandParentCategoryName}-${grandParentCategoryName}-${parentCategoryName}`;
    const categoryName = (categoryInputs.level4[key] || "").trim();
    if (!categoryName) return;

    const categorySlug = generateSlug(categoryName);

    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.map((greatGrandParent) => {
        if (greatGrandParent.name === greatGrandParentCategoryName) {
          return {
            ...greatGrandParent,
            subcategories: greatGrandParent.subcategories.map((grandParent) => {
              if (grandParent.name === grandParentCategoryName) {
                return {
                  ...grandParent,
                  subcategories: grandParent.subcategories.map((parent) => {
                    if (parent.name === parentCategoryName) {
                      // Check for duplicates
                      if (
                        parent.subcategories?.some(
                          (sub) => sub.name === categoryName
                        )
                      ) {
                        setErrors((prev) => ({
                          ...prev,
                          subSubcategories:
                            "Sub-sub-subcategory already exists",
                        }));
                        return parent;
                      }

                      const newSubSubSubcategory = {
                        name: categoryName,
                        slug: categorySlug,
                        productCount: 0,
                        isActive: true,
                      };

                      return {
                        ...parent,
                        subcategories: [
                          ...(parent.subcategories || []),
                          newSubSubSubcategory,
                        ],
                      };
                    }
                    return parent;
                  }),
                };
              }
              return grandParent;
            }),
          };
        }
        return greatGrandParent;
      }),
    }));

    setCategoryInputs((prev) => ({
      ...prev,
      level4: { ...prev.level4, [key]: "" },
    }));
    setErrors((prev) => ({ ...prev, subSubcategories: "" }));
  };

  // Remove categories at different levels
  const removeCategory = (
    level,
    categoryToRemove,
    parentCategoryName = null,
    grandParentCategoryName = null,
    greatGrandParentCategoryName = null
  ) => {
    if (level === 1) {
      setFormData((prev) => ({
        ...prev,
        subcategories: prev.subcategories.filter(
          (sub) => sub.name !== categoryToRemove.name
        ),
      }));
    } else if (level === 2 && parentCategoryName) {
      setFormData((prev) => ({
        ...prev,
        subcategories: prev.subcategories.map((sub) => {
          if (sub.name === parentCategoryName) {
            return {
              ...sub,
              subcategories: (sub.subcategories || []).filter(
                (subSub) => subSub.name !== categoryToRemove.name
              ),
            };
          }
          return sub;
        }),
      }));
    } else if (level === 3 && parentCategoryName && grandParentCategoryName) {
      setFormData((prev) => ({
        ...prev,
        subcategories: prev.subcategories.map((grandParent) => {
          if (grandParent.name === grandParentCategoryName) {
            return {
              ...grandParent,
              subcategories: grandParent.subcategories.map((parent) => {
                if (parent.name === parentCategoryName) {
                  return {
                    ...parent,
                    subcategories: (parent.subcategories || []).filter(
                      (subSub) => subSub.name !== categoryToRemove.name
                    ),
                  };
                }
                return parent;
              }),
            };
          }
          return grandParent;
        }),
      }));
    } else if (
      level === 4 &&
      parentCategoryName &&
      grandParentCategoryName &&
      greatGrandParentCategoryName
    ) {
      setFormData((prev) => ({
        ...prev,
        subcategories: prev.subcategories.map((greatGrandParent) => {
          if (greatGrandParent.name === greatGrandParentCategoryName) {
            return {
              ...greatGrandParent,
              subcategories: greatGrandParent.subcategories.map(
                (grandParent) => {
                  if (grandParent.name === grandParentCategoryName) {
                    return {
                      ...grandParent,
                      subcategories: grandParent.subcategories.map((parent) => {
                        if (parent.name === parentCategoryName) {
                          return {
                            ...parent,
                            subcategories: (parent.subcategories || []).filter(
                              (subSub) => subSub.name !== categoryToRemove.name
                            ),
                          };
                        }
                        return parent;
                      }),
                    };
                  }
                  return grandParent;
                }
              ),
            };
          }
          return greatGrandParent;
        }),
      }));
    }
  };

  // Start editing a nested category
  const startEditNestedCategory = (category, level, parentNames = []) => {
    setEditingNestedCategory({
      ...category,
      level,
      parentNames,
      originalName: category.name,
      editingId: `${level}-${parentNames.join("-")}-${category.name}`, // Unique identifier for editing state
    });
  };

  // Save the edited nested category
  const saveEditNestedCategory = () => {
    if (!editingNestedCategory) return;

    const { level, parentNames, originalName, name, editingId } =
      editingNestedCategory;

    if (!name || !name.trim()) {
      setErrors((prev) => ({ ...prev, edit: "Category name is required" }));
      return;
    }

    setFormData((prev) => {
      const updateCategoriesRecursively = (
        categories,
        currentLevel = 1,
        currentParents = []
      ) => {
        return categories.map((category) => {
          // Check if this is the category we want to edit
          const isTargetCategory =
            currentLevel === level &&
            category.name === originalName &&
            JSON.stringify(currentParents) === JSON.stringify(parentNames);

          if (isTargetCategory) {
            return {
              ...category,
              name: name.trim(),
              slug: generateSlug(name.trim()),
            };
          }

          // If this category has subcategories, search recursively
          if (category.subcategories && category.subcategories.length > 0) {
            return {
              ...category,
              subcategories: updateCategoriesRecursively(
                category.subcategories,
                currentLevel + 1,
                [...currentParents, category.name]
              ),
            };
          }

          return category;
        });
      };

      return {
        ...prev,
        subcategories: updateCategoriesRecursively(prev.subcategories),
      };
    });

    setEditingNestedCategory(null);
    setErrors((prev) => ({ ...prev, edit: "" }));
  };

  const isCategoryBeingEdited = (category, level, parentNames = []) => {
    if (!editingNestedCategory) return false;

    const editingId = `${level}-${parentNames.join("-")}-${category.name}`;
    return editingNestedCategory.editingId === editingId;
  };

  const checkForDuplicateName = (level, parentNames, newName) => {
    const findSiblings = (
      categories,
      currentLevel,
      targetLevel,
      currentParents = []
    ) => {
      if (currentLevel === targetLevel) {
        // We're at the target level, check if any sibling has the same name
        return categories.some(
          (cat) =>
            cat.name.toLowerCase() === newName.toLowerCase() &&
            !currentParents.every(
              (parent, index) => parent === parentNames[index]
            )
        );
      }

      // Continue searching in subcategories
      return categories.some((cat) => {
        if (cat.subcategories && cat.subcategories.length > 0) {
          return findSiblings(
            cat.subcategories,
            currentLevel + 1,
            targetLevel,
            [...currentParents, cat.name]
          );
        }
        return false;
      });
    };

    return findSiblings(formData.subcategories, 1, level);
  };

  // Helper function to update category in hierarchy
  const updateCategoryInHierarchy = (
    categories,
    targetLevel,
    parentNames,
    originalName,
    newName
  ) => {
    return categories.map((category) => {
      if (targetLevel === 1) {
        // Level 1 category
        if (category.name === originalName) {
          return {
            ...category,
            name: newName,
            slug: generateSlug(newName),
          };
        }
      } else {
        // Check if this is the parent category we're looking for
        const isParent = parentNames[0] === category.name;

        if (isParent && category.subcategories) {
          if (targetLevel === 2) {
            // Update level 2 category
            return {
              ...category,
              subcategories: category.subcategories.map((subCat) => {
                if (subCat.name === originalName) {
                  return {
                    ...subCat,
                    name: newName,
                    slug: generateSlug(newName),
                  };
                }
                return subCat;
              }),
            };
          } else if (targetLevel >= 3 && category.subcategories) {
            // Recursively update deeper levels
            return {
              ...category,
              subcategories: updateDeeperLevels(
                category.subcategories,
                targetLevel,
                parentNames.slice(1),
                originalName,
                newName
              ),
            };
          }
        }
      }

      // If this category has subcategories, continue searching
      if (category.subcategories && category.subcategories.length > 0) {
        return {
          ...category,
          subcategories: updateCategoryInHierarchy(
            category.subcategories,
            targetLevel,
            parentNames,
            originalName,
            newName
          ),
        };
      }

      return category;
    });
  };

  // Helper function for updating deeper levels (3 and 4)
  const updateDeeperLevels = (
    categories,
    targetLevel,
    parentNames,
    originalName,
    newName
  ) => {
    return categories.map((category) => {
      if (parentNames.length === 1 && category.name === parentNames[0]) {
        // We found the direct parent
        if (targetLevel === 3) {
          return {
            ...category,
            subcategories: category.subcategories.map((subCat) => {
              if (subCat.name === originalName) {
                return {
                  ...subCat,
                  name: newName,
                  slug: generateSlug(newName),
                };
              }
              return subCat;
            }),
          };
        } else if (targetLevel === 4 && category.subcategories) {
          return {
            ...category,
            subcategories: category.subcategories.map((subCat) => {
              if (subCat.subcategories) {
                return {
                  ...subCat,
                  subcategories: subCat.subcategories.map((subSubCat) => {
                    if (subSubCat.name === originalName) {
                      return {
                        ...subSubCat,
                        name: newName,
                        slug: generateSlug(newName),
                      };
                    }
                    return subSubCat;
                  }),
                };
              }
              return subCat;
            }),
          };
        }
      }

      // Continue searching in subcategories
      if (category.subcategories && category.subcategories.length > 0) {
        return {
          ...category,
          subcategories: updateDeeperLevels(
            category.subcategories,
            targetLevel,
            parentNames,
            originalName,
            newName
          ),
        };
      }

      return category;
    });
  };

  // Cancel editing
  const cancelEditNestedCategory = () => {
    setEditingNestedCategory(null);
    setErrors((prev) => ({ ...prev, edit: "" }));
  };

  // Toggle expansion for categories - auto-close others when opening one
  const toggleCategoryExpansion = (categoryPath, level) => {
    setExpandedCategories((prev) => {
      const newState = { ...prev };

      // Only auto-close others when opening a main category (level 1)
      if (!prev[categoryPath] && level === 1) {
        // Close all currently expanded categories
        Object.keys(newState).forEach((key) => {
          newState[key] = false;
        });
      }

      // Toggle the clicked category
      newState[categoryPath] = !prev[categoryPath];
      return newState;
    });
  };

  // Handle input changes for different levels
  const handleCategoryInputChange = (
    level,
    value,
    parentCategoryName = null,
    grandParentCategoryName = null,
    greatGrandParentCategoryName = null
  ) => {
    if (level === 1) {
      setCategoryInputs((prev) => ({ ...prev, level1: value }));
    } else if (level === 2 && parentCategoryName) {
      setCategoryInputs((prev) => ({
        ...prev,
        level2: { ...prev.level2, [parentCategoryName]: value },
      }));
    } else if (level === 3 && parentCategoryName && grandParentCategoryName) {
      const key = `${grandParentCategoryName}-${parentCategoryName}`;
      setCategoryInputs((prev) => ({
        ...prev,
        level3: { ...prev.level3, [key]: value },
      }));
    } else if (
      level === 4 &&
      parentCategoryName &&
      grandParentCategoryName &&
      greatGrandParentCategoryName
    ) {
      const key = `${greatGrandParentCategoryName}-${grandParentCategoryName}-${parentCategoryName}`;
      setCategoryInputs((prev) => ({
        ...prev,
        level4: { ...prev.level4, [key]: value },
      }));
    }
  };

  // Handle key presses for different levels
  const handleCategoryKeyPress = (
    e,
    level,
    parentCategoryName = null,
    grandParentCategoryName = null,
    greatGrandParentCategoryName = null
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (level === 1) {
        addLevel1Category();
      } else if (level === 2 && parentCategoryName) {
        addLevel2Category(parentCategoryName);
      } else if (level === 3 && parentCategoryName && grandParentCategoryName) {
        addLevel3Category(grandParentCategoryName, parentCategoryName);
      } else if (
        level === 4 &&
        parentCategoryName &&
        grandParentCategoryName &&
        greatGrandParentCategoryName
      ) {
        addLevel4Category(
          greatGrandParentCategoryName,
          grandParentCategoryName,
          parentCategoryName
        );
      }
    }
  };

  // Handle nested category edit changes
  const handleNestedCategoryEditChange = (field, value) => {
    if (!editingNestedCategory) return;

    setEditingNestedCategory((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" && { slug: generateSlug(value) }),
    }));
  };

  // Render nested categories in form
  const renderNestedCategories = () => {
    return (
      <div className={styles.nestedCategoriesContainer}>
        {/* Level 1 Input */}
        <div className={styles.categoryInputGroup}>
          <label className={styles.categoryInputLabel}>
            Main Categories (Level 1)
          </label>
          <div className={styles.categoryInputRow}>
            <input
              type="text"
              value={categoryInputs.level1}
              onChange={(e) => handleCategoryInputChange(1, e.target.value)}
              onKeyPress={(e) => handleCategoryKeyPress(e, 1)}
              className={styles.categoryInput}
              placeholder="Enter main category (e.g., Footwear)"
            />
            <button
              type="button"
              onClick={addLevel1Category}
              className={styles.categoryAddButton}
            >
              Add Main Category
            </button>
          </div>
        </div>

        {/* Render Level 1 Categories */}
        {formData.subcategories.map((level1Cat, index1) => {
          const level1Path = level1Cat.name;
          const isLevel1Expanded = expandedCategories[level1Path];

          return (
            <div key={index1} className={styles.categoryLevel}>
              <div className={styles.categoryHeader}>
                <button
                  type="button"
                  onClick={() => toggleCategoryExpansion(level1Path, 1)}
                  className={styles.expandButton}
                >
                  {isLevel1Expanded ? (
                    <FolderOpen size={16} />
                  ) : (
                    <Folder size={16} />
                  )}
                  {isLevel1Expanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {isCategoryBeingEdited(level1Cat, 1, []) ? (
                  <div className={styles.editCategoryForm}>
                    <input
                      type="text"
                      value={editingNestedCategory.name}
                      onChange={(e) =>
                        handleNestedCategoryEditChange("name", e.target.value)
                      }
                      className={styles.categoryEditInput}
                      autoFocus // This helps with input focus
                    />
                    <div className={styles.editActions}>
                      <button
                        type="button"
                        onClick={saveEditNestedCategory}
                        className={styles.saveEditButton}
                      >
                        <Save size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditNestedCategory}
                        className={styles.cancelEditButton}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className={styles.categoryTag}>
                      {level1Cat.name}
                      <span className={styles.categorySlug}>
                        ({level1Cat.slug})
                      </span>
                    </span>
                    <div className={styles.categoryActions}>
                      <button
                        type="button"
                        onClick={() =>
                          startEditNestedCategory(level1Cat, 1, [])
                        }
                        className={styles.categoryEditButton}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCategory(1, level1Cat)}
                        className={styles.categoryRemoveButton}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {isLevel1Expanded && (
                <div className={styles.categoryChildren}>
                  {/* Level 2 Input for this Level 1 Category */}
                  <div className={styles.categoryInputGroup}>
                    <label className={styles.categoryInputLabel}>
                      Subcategories for {level1Cat.name}
                    </label>
                    <div className={styles.categoryInputRow}>
                      <input
                        type="text"
                        value={categoryInputs.level2[level1Cat.name] || ""}
                        onChange={(e) =>
                          handleCategoryInputChange(
                            2,
                            e.target.value,
                            level1Cat.name
                          )
                        }
                        onKeyPress={(e) =>
                          handleCategoryKeyPress(e, 2, level1Cat.name)
                        }
                        className={styles.categoryInput}
                        placeholder={`Enter ${level1Cat.name} subcategory (e.g., Casual Shoes)`}
                      />
                      <button
                        type="button"
                        onClick={() => addLevel2Category(level1Cat.name)}
                        className={styles.categoryAddButton}
                      >
                        Add Subcategory
                      </button>
                    </div>
                  </div>

                  {/* Render Level 2 Categories */}
                  {level1Cat.subcategories?.map((level2Cat, index2) => {
                    const level2Path = `${level1Path}-${level2Cat.name}`;
                    const isLevel2Expanded = expandedCategories[level2Path];

                    return (
                      <div key={index2} className={styles.categoryLevel}>
                        <div className={styles.categoryHeader}>
                          <button
                            type="button"
                            onClick={() =>
                              toggleCategoryExpansion(level2Path, 2)
                            }
                            className={styles.expandButton}
                          >
                            {isLevel2Expanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>

                          {isCategoryBeingEdited(level2Cat, 2, [
                            level1Cat.name,
                          ]) ? (
                            <div className={styles.editCategoryForm}>
                              <input
                                type="text"
                                value={editingNestedCategory.name}
                                onChange={(e) =>
                                  handleNestedCategoryEditChange(
                                    "name",
                                    e.target.value
                                  )
                                }
                                className={styles.categoryEditInput}
                                autoFocus
                              />
                              <div className={styles.editActions}>
                                <button
                                  type="button"
                                  onClick={saveEditNestedCategory}
                                  className={styles.saveEditButton}
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditNestedCategory}
                                  className={styles.cancelEditButton}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className={styles.categoryTag}>
                                {level2Cat.name}
                                <span className={styles.categorySlug}>
                                  ({level2Cat.slug})
                                </span>
                              </span>
                              <div className={styles.categoryActions}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditNestedCategory(level2Cat, 2, [
                                      level1Cat.name,
                                    ])
                                  }
                                  className={styles.categoryEditButton}
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeCategory(2, level2Cat, level1Cat.name)
                                  }
                                  className={styles.categoryRemoveButton}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {isLevel2Expanded && (
                          <div className={styles.categoryChildren}>
                            {/* Level 3 Input for this Level 2 Category */}
                            <div className={styles.categoryInputGroup}>
                              <label className={styles.categoryInputLabel}>
                                Types for {level2Cat.name}
                              </label>
                              <div className={styles.categoryInputRow}>
                                <input
                                  type="text"
                                  value={
                                    categoryInputs.level3[
                                      `${level1Cat.name}-${level2Cat.name}`
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleCategoryInputChange(
                                      3,
                                      e.target.value,
                                      level2Cat.name,
                                      level1Cat.name
                                    )
                                  }
                                  onKeyPress={(e) =>
                                    handleCategoryKeyPress(
                                      e,
                                      3,
                                      level2Cat.name,
                                      level1Cat.name
                                    )
                                  }
                                  className={styles.categoryInput}
                                  placeholder={`Enter ${level2Cat.name} type (e.g., Sneakers)`}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    addLevel3Category(
                                      level1Cat.name,
                                      level2Cat.name
                                    )
                                  }
                                  className={styles.categoryAddButton}
                                >
                                  Add Type
                                </button>
                              </div>
                            </div>

                            {/* Render Level 3 Categories */}
                            {level2Cat.subcategories?.map(
                              (level3Cat, index3) => {
                                const level3Path = `${level2Path}-${level3Cat.name}`;
                                const isLevel3Expanded =
                                  expandedCategories[level3Path];

                                return (
                                  <div
                                    key={index3}
                                    className={styles.categoryLevel}
                                  >
                                    <div className={styles.categoryHeader}>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleCategoryExpansion(level3Path, 3)
                                        }
                                        className={styles.expandButton}
                                      >
                                        {isLevel3Expanded ? (
                                          <ChevronDown size={16} />
                                        ) : (
                                          <ChevronRight size={16} />
                                        )}
                                      </button>

                                      {isCategoryBeingEdited(level3Cat, 3, [
                                        level1Cat.name,
                                        level2Cat.name,
                                      ]) ? (
                                        <div
                                          className={styles.editCategoryForm}
                                        >
                                          <input
                                            type="text"
                                            value={editingNestedCategory.name}
                                            onChange={(e) =>
                                              handleNestedCategoryEditChange(
                                                "name",
                                                e.target.value
                                              )
                                            }
                                            className={styles.categoryEditInput}
                                            autoFocus
                                          />
                                          <div className={styles.editActions}>
                                            <button
                                              type="button"
                                              onClick={saveEditNestedCategory}
                                              className={styles.saveEditButton}
                                            >
                                              <Save size={14} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={cancelEditNestedCategory}
                                              className={
                                                styles.cancelEditButton
                                              }
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <span className={styles.categoryTag}>
                                            {level3Cat.name}
                                            <span
                                              className={styles.categorySlug}
                                            >
                                              ({level3Cat.slug})
                                            </span>
                                          </span>
                                          <div
                                            className={styles.categoryActions}
                                          >
                                            <button
                                              type="button"
                                              onClick={() =>
                                                startEditNestedCategory(
                                                  level3Cat,
                                                  3,
                                                  [
                                                    level1Cat.name,
                                                    level2Cat.name,
                                                  ]
                                                )
                                              }
                                              className={
                                                styles.categoryEditButton
                                              }
                                            >
                                              <Edit size={14} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeCategory(
                                                  3,
                                                  level3Cat,
                                                  level2Cat.name,
                                                  level1Cat.name
                                                )
                                              }
                                              className={
                                                styles.categoryRemoveButton
                                              }
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {isLevel3Expanded && (
                                      <div className={styles.categoryChildren}>
                                        {/* Level 4 Input for this Level 3 Category */}
                                        <div
                                          className={styles.categoryInputGroup}
                                        >
                                          <label
                                            className={
                                              styles.categoryInputLabel
                                            }
                                          >
                                            Variants for {level3Cat.name}
                                          </label>
                                          <div
                                            className={styles.categoryInputRow}
                                          >
                                            <input
                                              type="text"
                                              value={
                                                categoryInputs.level4[
                                                  `${level1Cat.name}-${level2Cat.name}-${level3Cat.name}`
                                                ] || ""
                                              }
                                              onChange={(e) =>
                                                handleCategoryInputChange(
                                                  4,
                                                  e.target.value,
                                                  level3Cat.name,
                                                  level2Cat.name,
                                                  level1Cat.name
                                                )
                                              }
                                              onKeyPress={(e) =>
                                                handleCategoryKeyPress(
                                                  e,
                                                  4,
                                                  level3Cat.name,
                                                  level2Cat.name,
                                                  level1Cat.name
                                                )
                                              }
                                              className={styles.categoryInput}
                                              placeholder={`Enter ${level3Cat.name} variant (e.g., Running)`}
                                            />
                                            <button
                                              type="button"
                                              onClick={() =>
                                                addLevel4Category(
                                                  level1Cat.name,
                                                  level2Cat.name,
                                                  level3Cat.name
                                                )
                                              }
                                              className={
                                                styles.categoryAddButton
                                              }
                                            >
                                              Add Variant
                                            </button>
                                          </div>
                                        </div>

                                        {/* Render Level 4 Categories */}
                                        {level3Cat.subcategories?.map(
                                          (level4Cat, index4) => (
                                            <div
                                              key={index4}
                                              className={styles.categoryLevel}
                                            >
                                              <div
                                                className={
                                                  styles.categoryHeader
                                                }
                                              >
                                                {isCategoryBeingEdited(
                                                  level4Cat,
                                                  4,
                                                  [
                                                    level1Cat.name,
                                                    level2Cat.name,
                                                    level3Cat.name,
                                                  ]
                                                ) ? (
                                                  <div
                                                    className={
                                                      styles.editCategoryForm
                                                    }
                                                  >
                                                    <input
                                                      type="text"
                                                      value={
                                                        editingNestedCategory.name
                                                      }
                                                      onChange={(e) =>
                                                        handleNestedCategoryEditChange(
                                                          "name",
                                                          e.target.value
                                                        )
                                                      }
                                                      className={
                                                        styles.categoryEditInput
                                                      }
                                                      autoFocus
                                                    />
                                                    <div
                                                      className={
                                                        styles.editActions
                                                      }
                                                    >
                                                      <button
                                                        type="button"
                                                        onClick={
                                                          saveEditNestedCategory
                                                        }
                                                        className={
                                                          styles.saveEditButton
                                                        }
                                                      >
                                                        <Save size={14} />
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={
                                                          cancelEditNestedCategory
                                                        }
                                                        className={
                                                          styles.cancelEditButton
                                                        }
                                                      >
                                                        <X size={14} />
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <>
                                                    <span
                                                      className={
                                                        styles.categoryTag
                                                      }
                                                    >
                                                      {level4Cat.name}
                                                      <span
                                                        className={
                                                          styles.categorySlug
                                                        }
                                                      >
                                                        ({level4Cat.slug})
                                                      </span>
                                                    </span>
                                                    <div
                                                      className={
                                                        styles.categoryActions
                                                      }
                                                    >
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          startEditNestedCategory(
                                                            level4Cat,
                                                            4,
                                                            [
                                                              level1Cat.name,
                                                              level2Cat.name,
                                                              level3Cat.name,
                                                            ]
                                                          )
                                                        }
                                                        className={
                                                          styles.categoryEditButton
                                                        }
                                                      >
                                                        <Edit size={14} />
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          removeCategory(
                                                            4,
                                                            level4Cat,
                                                            level3Cat.name,
                                                            level2Cat.name,
                                                            level1Cat.name
                                                          )
                                                        }
                                                        className={
                                                          styles.categoryRemoveButton
                                                        }
                                                      >
                                                        <X size={14} />
                                                      </button>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {errors.edit && (
          <div className={styles.errorMessage}>{errors.edit}</div>
        )}
      </div>
    );
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

    if (imageUploadMethod === "url" && !formData.image.trim()) {
      newErrors.image = "Image URL is required";
    } else if (
      imageUploadMethod === "file" &&
      !formData.imageFile &&
      !editingCategory?.image
    ) {
      newErrors.image = "Please select an image file";
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, form: "saving" }));

      let dataToSend;

      if (imageUploadMethod === "file" && formData.imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("slug", formData.slug);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("isActive", formData.isActive);
        formDataToSend.append("sortOrder", formData.sortOrder);
        formDataToSend.append("imageSource", "file");
        formDataToSend.append("imageFile", formData.imageFile);
        formDataToSend.append(
          "subcategories",
          JSON.stringify(formData.subcategories)
        );
        dataToSend = formDataToSend;
      } else {
        dataToSend = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          image: formData.image,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
          subcategories: formData.subcategories,
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
      subcategories: [],
    });
    setCategoryInputs({
      level1: "",
      level2: {},
      level3: {},
      level4: {},
    });
    setExpandedCategories({});
    setImageUploadMethod("url");
    setImagePreview(null);
    setErrors({});
    setShowForm(false);
    setEditingCategory(null);
    setEditingNestedCategory(null);
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
      subcategories: category.subcategories || [],
    });
    setEditingCategory(category);
    setCategoryInputs({
      level1: "",
      level2: {},
      level3: {},
      level4: {},
    });
    setExpandedCategories({});
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
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image file must be less than 5MB",
        }));
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));

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

    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

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

                {/* Subcategories display */}
                {category.subcategories &&
                  category.subcategories.length > 0 && (
                    <div className={styles.subcategoriesPreview}>
                      <span className={styles.subcategoriesLabel}>
                        Subcategories:
                      </span>
                      <div className={styles.subcategoriesList}>
                        {category.subcategories
                          .slice(0, 3)
                          .map((sub, index) => (
                            <div
                              key={index}
                              className={styles.subcategoryPreview}
                            >
                              <span className={styles.subcategoryPreviewTag}>
                                {sub.name}
                              </span>
                              {sub.subcategories &&
                                sub.subcategories.length > 0 && (
                                  <span className={styles.subSubcategoryCount}>
                                    ({sub.subcategories.length} types)
                                  </span>
                                )}
                            </div>
                          ))}
                        {category.subcategories.length > 3 && (
                          <span className={styles.moreSubcategories}>
                            +{category.subcategories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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

                {/* Nested Categories Section */}
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Category Structure</label>
                  {renderNestedCategories()}
                  <p className={styles.categoryHelperText}>
                    Build your category hierarchy: Main Categories →
                    Subcategories → Types → Variants
                  </p>
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
