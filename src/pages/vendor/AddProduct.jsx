import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  Plus,
  Save,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Eye,
  Palette,
  Image as ImageIcon,
  Move,
  AlertCircle,
  Check,
  Ruler,
  Search,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import { useCategory } from "../../context/CategoryContext";

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProduct, updateProduct, getProduct } = useProducts();
  const { categories, adminGetCategories } = useCategory();

  const isEditing = location.search.includes("edit=true");
  const editProductId = location.state?.productId;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [draggedColorIndex, setDraggedColorIndex] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState({});

  // New state for image upload method
  const [imageUploadMethod, setImageUploadMethod] = useState("upload"); // "upload" or "link"
  const [imageLink, setImageLink] = useState("");

  // Category selection state
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");

  // Dropdown visibility state
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showVariantDropdown, setShowVariantDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  // Category-specific fields definitions
  const categoryFields = {
    electronics: [
      { name: "brand", label: "Brand", type: "text" },
      { name: "model", label: "Model", type: "text" },
      { name: "screenSize", label: "Screen Size", type: "text" },
      { name: "resolution", label: "Resolution", type: "text" },
      { name: "ram", label: "RAM", type: "text" },
      { name: "storage", label: "Storage", type: "text" },
      { name: "processor", label: "Processor", type: "text" },
      { name: "battery", label: "Battery", type: "text" },
    ],
    men: [
      { name: "fabric", label: "Fabric", type: "text" },
      { name: "fit", label: "Fit Type", type: "text" },
      { name: "sleeveType", label: "Sleeve Type", type: "text" },
      { name: "neckType", label: "Neck Type", type: "text" },
      { name: "occasion", label: "Occasion", type: "text" },
      { name: "pattern", label: "Pattern", type: "text" },
    ],
    women: [
      { name: "fabric", label: "Fabric", type: "text" },
      { name: "fit", label: "Fit Type", type: "text" },
      { name: "occasion", label: "Occasion", type: "text" },
      { name: "pattern", label: "Pattern", type: "text" },
      { name: "neckType", label: "Neck Type", type: "text" },
      { name: "sleeveType", label: "Sleeve Type", type: "text" },
    ],
    books: [
      { name: "author", label: "Author", type: "text" },
      { name: "publisher", label: "Publisher", type: "text" },
      { name: "isbn", label: "ISBN", type: "text" },
      { name: "language", label: "Language", type: "text" },
      { name: "pages", label: "Total Pages", type: "number" },
      { name: "genre", label: "Genre", type: "text" },
    ],
    furniture: [
      { name: "material", label: "Material", type: "text" },
      { name: "dimensions", label: "Dimensions (LxWxH)", type: "text" },
      { name: "roomType", label: "Room Type", type: "text" },
      { name: "assembly", label: "Assembly Required", type: "text" },
      { name: "weightCapacity", label: "Weight Capacity", type: "text" },
    ],
    grocery: [
      { name: "expiryDate", label: "Expiry Date", type: "date" },
      { name: "weight", label: "Weight", type: "text" },
      { name: "ingredients", label: "Ingredients", type: "text" },
      { name: "nutritionFacts", label: "Nutrition Facts", type: "textarea" },
    ],
    toys: [
      { name: "ageRange", label: "Age Range", type: "text" },
      { name: "material", label: "Material", type: "text" },
      { name: "batteryRequired", label: "Battery Required", type: "checkbox" },
      { name: "safetyInfo", label: "Safety Information", type: "textarea" },
    ],
    sports: [
      { name: "sportType", label: "Sport Type", type: "text" },
      { name: "material", label: "Material", type: "text" },
      { name: "size", label: "Size", type: "text" },
      { name: "weight", label: "Weight", type: "text" },
    ],
    beauty: [
      { name: "skinType", label: "Skin Type", type: "text" },
      { name: "ingredients", label: "Ingredients", type: "text" },
      { name: "volume", label: "Volume/Weight", type: "text" },
      { name: "benefits", label: "Benefits", type: "textarea" },
    ],
    other: [],
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: {
      main: "",
      sub: "",
      type: "",
      variant: "",
      style: "",
      fullPath: "",
    },
    brand: "",
    badge: "",
    status: "active",
    specifications: {},
    commonSpecs: {
      weight: {
        value: "",
        unit: "kg",
      },
      material: "",
      warranty: "",
      features: [],
    },
    tags: [],
    colorVariants: [
      {
        colorName: "Default",
        colorCode: "#000000",
        images: [],
        sizeVariants: [
          {
            size: "",
            customSize: "",
            stock: "",
            priceAdjustment: 0,
          },
        ],
      },
    ],
    categoryFields: {},
  });

  const [tempTag, setTempTag] = useState("");
  const [tempFeature, setTempFeature] = useState("");

  const badges = [
    "Best Seller",
    "New Arrival",
    "Limited Edition",
    "Exclusive",
    "Trending",
    "Premium",
    "Sale",
    "Hot Deal",
    "Staff Pick",
  ];

  const commonSizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
    "28",
    "30",
    "32",
    "34",
    "36",
    "38",
    "40",
    "42",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
  ];

  const weightUnits = ["kg", "g", "lb", "oz"];
  const dimensionUnits = ["cm", "m", "in", "ft"];

  useEffect(() => {
    adminGetCategories();
  }, [adminGetCategories]);

  useEffect(() => {
    if (isEditing && editProductId) {
      loadProductForEdit();
    }
  }, [isEditing, editProductId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".category-dropdown")) {
        setShowMainDropdown(false);
        setShowSubcategoryDropdown(false);
        setShowTypeDropdown(false);
        setShowVariantDropdown(false);
        setShowStyleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper functions to get categories at each level
  const getMainCategories = () => {
    return categories.filter((cat) => cat.level === 1 && cat.isActive);
  };

  const getSubcategories = (mainCategoryId) => {
    if (!mainCategoryId) return [];
    const mainCategory = categories.find((cat) => cat._id === mainCategoryId);
    return mainCategory?.subcategories || [];
  };

  const getTypes = (mainCategoryId, subcategoryId) => {
    if (!mainCategoryId || !subcategoryId) return [];
    const subcategories = getSubcategories(mainCategoryId);
    const subcategory = subcategories.find((cat) => cat._id === subcategoryId);
    return subcategory?.subcategories || [];
  };

  const getVariants = (mainCategoryId, subcategoryId, typeId) => {
    if (!mainCategoryId || !subcategoryId || !typeId) return [];
    const types = getTypes(mainCategoryId, subcategoryId);
    const type = types.find((cat) => cat._id === typeId);
    return type?.subcategories || [];
  };

  const getStyles = (mainCategoryId, subcategoryId, typeId, variantId) => {
    if (!mainCategoryId || !subcategoryId || !typeId || !variantId) return [];
    const variants = getVariants(mainCategoryId, subcategoryId, typeId);
    const variant = variants.find((cat) => cat._id === variantId);
    return variant?.subcategories || [];
  };

  // Get category name by ID
  const getCategoryNameById = (categoryId, level = 1) => {
    if (!categoryId) return "";

    const findCategory = (cats, targetId) => {
      for (const cat of cats) {
        if (cat._id === targetId) return cat;
        if (cat.subcategories) {
          const found = findCategory(cat.subcategories, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategory(categories, categoryId);
    return category?.name || "";
  };

  // Category selection handlers
  // Category selection handlers - UPDATED to store only strings
  const handleMainCategorySelect = (categoryId) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubcategory("");
    setSelectedType("");
    setSelectedVariant("");
    setSelectedStyle("");
    setShowMainDropdown(false);

    const mainCategory = categories.find((cat) => cat._id === categoryId);
    const mainCategoryName = mainCategory?.name || "";

    setFormData((prev) => ({
      ...prev,
      category: {
        main: mainCategoryName, // Store only the name as string
        sub: "",
        type: "",
        variant: "",
        style: "",
        fullPath: mainCategory?.slug || "",
      },
    }));
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    setSelectedType("");
    setSelectedVariant("");
    setSelectedStyle("");
    setShowSubcategoryDropdown(false);

    const subcategory = getSubcategories(selectedMainCategory).find(
      (cat) => cat._id === subcategoryId
    );
    const subcategoryName = subcategory?.name || "";

    setFormData((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        sub: subcategoryName, // Store only the name as string
        type: "",
        variant: "",
        style: "",
        fullPath: `${prev.category.fullPath}/${subcategory?.slug || ""}`,
      },
    }));
  };

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setSelectedVariant("");
    setSelectedStyle("");
    setShowTypeDropdown(false);

    const type = getTypes(selectedMainCategory, selectedSubcategory).find(
      (cat) => cat._id === typeId
    );
    const typeName = type?.name || "";

    setFormData((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        type: typeName, // Store only the name as string
        variant: "",
        style: "",
        fullPath: `${prev.category.fullPath}/${type?.slug || ""}`,
      },
    }));
  };

  const handleVariantSelect = (variantId) => {
    setSelectedVariant(variantId);
    setSelectedStyle("");
    setShowVariantDropdown(false);

    const variant = getVariants(
      selectedMainCategory,
      selectedSubcategory,
      selectedType
    ).find((cat) => cat._id === variantId);
    const variantName = variant?.name || "";

    setFormData((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        variant: variantName, // Store only the name as string
        style: "",
        fullPath: `${prev.category.fullPath}/${variant?.slug || ""}`,
      },
    }));
  };

  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId);
    setShowStyleDropdown(false);

    const style = getStyles(
      selectedMainCategory,
      selectedSubcategory,
      selectedType,
      selectedVariant
    ).find((cat) => cat._id === styleId);
    const styleName = style?.name || "";

    setFormData((prev) => ({
      ...prev,
      category: {
        ...prev.category,
        style: styleName, // Store only the name as string
        fullPath: `${prev.category.fullPath}/${style?.slug || ""}`,
      },
    }));
  };

  // Clear category selections
  const clearCategorySelection = (level) => {
    switch (level) {
      case "main":
        setSelectedMainCategory("");
        setSelectedSubcategory("");
        setSelectedType("");
        setSelectedVariant("");
        setSelectedStyle("");
        setFormData((prev) => ({
          ...prev,
          category: {
            main: "",
            sub: "",
            type: "",
            variant: "",
            style: "",
            fullPath: "",
          },
        }));
        break;
      case "sub":
        setSelectedSubcategory("");
        setSelectedType("");
        setSelectedVariant("");
        setSelectedStyle("");
        setFormData((prev) => ({
          ...prev,
          category: {
            ...prev.category,
            sub: "",
            type: "",
            variant: "",
            style: "",
            fullPath: prev.category.fullPath.split("/")[0] || "",
          },
        }));
        break;
      case "type":
        setSelectedType("");
        setSelectedVariant("");
        setSelectedStyle("");
        setFormData((prev) => ({
          ...prev,
          category: {
            ...prev.category,
            type: "",
            variant: "",
            style: "",
            fullPath:
              prev.category.fullPath.split("/").slice(0, 2).join("/") || "",
          },
        }));
        break;
      case "variant":
        setSelectedVariant("");
        setSelectedStyle("");
        setFormData((prev) => ({
          ...prev,
          category: {
            ...prev.category,
            variant: "",
            style: "",
            fullPath:
              prev.category.fullPath.split("/").slice(0, 3).join("/") || "",
          },
        }));
        break;
      case "style":
        setSelectedStyle("");
        setFormData((prev) => ({
          ...prev,
          category: {
            ...prev.category,
            style: "",
            fullPath:
              prev.category.fullPath.split("/").slice(0, 4).join("/") || "",
          },
        }));
        break;
    }
  };

  // Get selected category path for display
  const getSelectedCategoryPath = () => {
    const path = [];
    if (formData.category.main) path.push(formData.category.main);
    if (formData.category.sub) path.push(formData.category.sub);
    if (formData.category.type) path.push(formData.category.type);
    if (formData.category.variant) path.push(formData.category.variant);
    if (formData.category.style) path.push(formData.category.style);

    return path.join(" > ");
  };

  const loadProductForEdit = async () => {
    try {
      setLoading(true);
      const response = await getProduct(editProductId);
      const product = response.product || response;

      // Convert existing product data to new color variant format
      const colorVariants =
        product.colorVariants && product.colorVariants.length > 0
          ? product.colorVariants.map((variant) => ({
              ...variant,
              images: variant.images.map((img) => ({
                ...img,
                source: img.source || (img.publicId ? "upload" : "link"), // Add source for existing images
                markedForDeletion: false,
              })),
            }))
          : [
              {
                colorName: "Default",
                colorCode: "#000000",
                images: (product.images || []).map((img) => ({
                  ...img,
                  source: img.source || (img.publicId ? "upload" : "link"),
                  markedForDeletion: false,
                })),
                sizeVariants:
                  product.sizeVariants && product.sizeVariants.length > 0
                    ? product.sizeVariants
                    : [
                        {
                          size: "",
                          customSize: "",
                          stock: product.stock || "",
                          priceAdjustment: 0,
                        },
                      ],
              },
            ];

      // Parse category data and set selections - FIXED to ensure only strings
      const categoryData = product.category || {
        main: "",
        sub: "",
        type: "",
        variant: "",
        style: "",
        fullPath: "",
      };

      // Extract category names as strings (not objects)
      const mainCategoryName =
        typeof categoryData.main === "object"
          ? categoryData.main.name
          : categoryData.main;
      const subCategoryName =
        typeof categoryData.sub === "object"
          ? categoryData.sub.name
          : categoryData.sub;
      const typeName =
        typeof categoryData.type === "object"
          ? categoryData.type.name
          : categoryData.type;
      const variantName =
        typeof categoryData.variant === "object"
          ? categoryData.variant.name
          : categoryData.variant;
      const styleName =
        typeof categoryData.style === "object"
          ? categoryData.style.name
          : categoryData.style;

      // Set category selections - properly handle all 5 levels
      if (mainCategoryName) {
        const mainCategory = categories.find(
          (cat) => cat.name === mainCategoryName
        );
        if (mainCategory) {
          setSelectedMainCategory(mainCategory._id);

          // Set subcategory if exists (Level 2)
          if (subCategoryName) {
            const subcategories = getSubcategories(mainCategory._id);
            const subcategory = subcategories.find(
              (sub) => sub.name === subCategoryName
            );
            if (subcategory) {
              setSelectedSubcategory(subcategory._id);

              // Set type if exists (Level 3)
              if (typeName) {
                const types = getTypes(mainCategory._id, subcategory._id);
                const type = types.find((t) => t.name === typeName);
                if (type) {
                  setSelectedType(type._id);

                  // Set variant if exists (Level 4)
                  if (variantName) {
                    const variants = getVariants(
                      mainCategory._id,
                      subcategory._id,
                      type._id
                    );
                    const variant = variants.find(
                      (v) => v.name === variantName
                    );
                    if (variant) {
                      setSelectedVariant(variant._id);

                      // Set style if exists (Level 5)
                      if (styleName) {
                        const styles = getStyles(
                          mainCategory._id,
                          subcategory._id,
                          type._id,
                          variant._id
                        );
                        const style = styles.find((s) => s.name === styleName);
                        if (style) {
                          setSelectedStyle(style._id);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        originalPrice: product.originalPrice || "",
        category: {
          main: mainCategoryName,
          sub: subCategoryName,
          type: typeName,
          variant: variantName,
          style: styleName,
          fullPath: categoryData.fullPath || "",
        },
        brand: product.brand || "",
        badge: product.badge || "",
        status: product.status || "active",
        specifications: product.specifications || {},
        commonSpecs: {
          weight: product.commonSpecs?.weight || { value: "", unit: "kg" },
          material: product.commonSpecs?.material || "",
          warranty: product.commonSpecs?.warranty || "",
          features: product.commonSpecs?.features || [],
        },
        tags: product.tags || [],
        colorVariants,
        categoryFields: product.categoryFields || {},
      });
    } catch (error) {
      console.error("Failed to load product:", error);
      setErrors({ submit: "Failed to load product data" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("commonSpecs.")) {
      const fieldPath = name.split(".");
      setFormData((prev) => ({
        ...prev,
        commonSpecs: {
          ...prev.commonSpecs,
          [fieldPath[1]]:
            fieldPath.length > 2
              ? {
                  ...prev.commonSpecs[fieldPath[1]],
                  [fieldPath[2]]: value,
                }
              : value,
        },
      }));
    } else if (name.startsWith("categoryFields.")) {
      const fieldName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        categoryFields: {
          ...prev.categoryFields,
          [fieldName]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Get the current category-specific fields based on selected category
  const getCurrentCategoryFields = () => {
    const mainCategory = formData.category.main.toLowerCase();
    return mainCategory && categoryFields[mainCategory]
      ? categoryFields[mainCategory]
      : [];
  };

  // Color variant management
  const addColorVariant = () => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: [
        ...prev.colorVariants,
        {
          colorName: "",
          colorCode: "#000000",
          images: [],
          sizeVariants: [
            {
              size: "",
              customSize: "",
              stock: "",
              priceAdjustment: 0,
            },
          ],
        },
      ],
    }));
  };

  const removeColorVariant = (index) => {
    if (formData.colorVariants.length === 1) {
      alert("At least one color variant is required");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index),
    }));
  };

  const updateColorVariant = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  // Size variant management
  const addSizeVariant = (colorIndex) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === colorIndex
          ? {
              ...variant,
              sizeVariants: [
                ...variant.sizeVariants,
                {
                  size: "",
                  customSize: "",
                  stock: "",
                  priceAdjustment: 0,
                },
              ],
            }
          : variant
      ),
    }));
  };

  const removeSizeVariant = (colorIndex, sizeIndex) => {
    if (formData.colorVariants[colorIndex].sizeVariants.length === 1) {
      alert("At least one size variant is required per color");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === colorIndex
          ? {
              ...variant,
              sizeVariants: variant.sizeVariants.filter(
                (_, j) => j !== sizeIndex
              ),
            }
          : variant
      ),
    }));
  };

  const updateSizeVariant = (colorIndex, sizeIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === colorIndex
          ? {
              ...variant,
              sizeVariants: variant.sizeVariants.map((sizeVariant, j) =>
                j === sizeIndex
                  ? { ...sizeVariant, [field]: value }
                  : sizeVariant
              ),
            }
          : variant
      ),
    }));
  };

  // Image handling for color variants
  const handleImageUpload = (colorIndex, files) => {
    const fileArray = Array.from(files);
    const maxImages = 10;

    // Filter out images marked for deletion to get active count
    const activeImages = formData.colorVariants[colorIndex].images.filter(
      (img) => !img.markedForDeletion
    );

    if (activeImages.length + fileArray.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed per color`);
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    const hasExistingPrimary = activeImages.some((img) => img.isPrimary);

    const newImages = validFiles.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      alt: `${formData.name} - ${
        formData.colorVariants[colorIndex].colorName
      } - Image ${activeImages.length + index + 1}`,
      isPrimary: !hasExistingPrimary && index === 0, // Set as primary only if no existing primary
      markedForDeletion: false,
      source: "upload", // Track the source of the image
    }));

    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === colorIndex
          ? {
              ...variant,
              images: [
                ...variant.images.filter((img) => !img.markedForDeletion),
                ...newImages,
              ],
            }
          : variant
      ),
    }));
  };

  const handleAddImageLink = (colorIndex) => {
    if (!imageLink.trim()) {
      alert("Please enter a valid image URL");
      return;
    }

    // Validate URL format
    try {
      new URL(imageLink);
    } catch (error) {
      alert("Please enter a valid image URL");
      return;
    }

    // Check if URL points to an image (basic check)
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const isImageUrl = imageExtensions.some((ext) =>
      imageLink.toLowerCase().includes(ext)
    );

    if (!isImageUrl) {
      if (!confirm("This doesn't look like an image URL. Continue anyway?")) {
        return;
      }
    }

    const maxImages = 10;
    const activeImages = formData.colorVariants[colorIndex].images.filter(
      (img) => !img.markedForDeletion
    );

    if (activeImages.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed per color`);
      return;
    }

    const hasExistingPrimary = activeImages.some((img) => img.isPrimary);

    const newImage = {
      url: imageLink,
      alt: `${formData.name} - ${
        formData.colorVariants[colorIndex].colorName
      } - Image ${activeImages.length + 1}`,
      isPrimary: !hasExistingPrimary,
      markedForDeletion: false,
      source: "link", // Track the source of the image
    };

    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === colorIndex
          ? {
              ...variant,
              images: [
                ...variant.images.filter((img) => !img.markedForDeletion),
                newImage,
              ],
            }
          : variant
      ),
    }));

    // Clear the link input
    setImageLink("");
  };

  const toggleImageDeletion = (colorIndex, imageIndex) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === colorIndex
          ? {
              ...variant,
              images: variant.images.map((img, imgI) =>
                imgI === imageIndex
                  ? {
                      ...img,
                      markedForDeletion: !img.markedForDeletion,
                    }
                  : img
              ),
            }
          : variant
      ),
    }));
  };

  const removeImage = (colorIndex, imageIndex) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === colorIndex
          ? {
              ...variant,
              images: variant.images.filter((_, imgI) => imgI !== imageIndex),
            }
          : variant
      ),
    }));
  };

  const setPrimaryImage = (colorIndex, imageIndex) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === colorIndex
          ? {
              ...variant,
              images: variant.images.map((img, imgI) => ({
                ...img,
                isPrimary: imgI === imageIndex, // Set only the clicked image as primary
              })),
            }
          : variant
      ),
    }));
  };

  // Image drag and drop handlers
  const handleImageDragStart = (e, colorIndex, imageIndex) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        colorIndex,
        imageIndex,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleImageDrop = (e, targetColorIndex, targetImageIndex) => {
    e.preventDefault();

    try {
      const draggedData = JSON.parse(
        e.dataTransfer.getData("application/json")
      );
      const { colorIndex: sourceColorIndex, imageIndex: sourceImageIndex } =
        draggedData;

      if (
        sourceColorIndex === targetColorIndex &&
        sourceImageIndex === targetImageIndex
      ) {
        return;
      }

      setFormData((prev) => {
        const newColorVariants = [...prev.colorVariants];
        const sourceVariant = newColorVariants[sourceColorIndex];
        const targetVariant = newColorVariants[targetColorIndex];

        // If dragging within the same color variant
        if (sourceColorIndex === targetColorIndex) {
          const newImages = [...sourceVariant.images];
          const [draggedImage] = newImages.splice(sourceImageIndex, 1);
          newImages.splice(targetImageIndex, 0, draggedImage);

          return {
            ...prev,
            colorVariants: newColorVariants.map((variant, index) =>
              index === sourceColorIndex
                ? { ...variant, images: newImages }
                : variant
            ),
          };
        }
        // If dragging between different color variants
        else {
          const sourceImages = [...sourceVariant.images];
          const targetImages = [...targetVariant.images];
          const [draggedImage] = sourceImages.splice(sourceImageIndex, 1);
          targetImages.splice(targetImageIndex, 0, draggedImage);

          return {
            ...prev,
            colorVariants: newColorVariants.map((variant, index) => {
              if (index === sourceColorIndex) {
                return { ...variant, images: sourceImages };
              }
              if (index === targetColorIndex) {
                return { ...variant, images: targetImages };
              }
              return variant;
            }),
          };
        }
      });
    } catch (error) {
      console.error("Error handling image drop:", error);
    }
  };

  // Specification management
  const addSpecificationItem = (type, value) => {
    if (!value.trim()) return;

    setFormData((prev) => ({
      ...prev,
      commonSpecs: {
        ...prev.commonSpecs,
        [type]: [...prev.commonSpecs[type], value.trim()],
      },
    }));

    // Clear the temp value
    if (type === "features") setTempFeature("");
  };

  const removeSpecificationItem = (type, itemToRemove) => {
    setFormData((prev) => ({
      ...prev,
      commonSpecs: {
        ...prev.commonSpecs,
        [type]: prev.commonSpecs[type].filter((item) => item !== itemToRemove),
      },
    }));
  };

  // Tag management
  const addTag = () => {
    if (tempTag && !formData.tags.includes(tempTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tempTag],
      }));
      setTempTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.category.main)
      newErrors.category_main = "Category is required";

    // Validate color variants
    formData.colorVariants.forEach((variant, colorIndex) => {
      if (!variant.colorName.trim()) {
        newErrors[`colorName_${colorIndex}`] = "Color name is required";
      }

      const activeImages = variant.images.filter(
        (img) => !img.markedForDeletion
      );
      if (activeImages.length === 0) {
        newErrors[`images_${colorIndex}`] =
          "At least one image is required per color";
      }
      if (variant.images.length === 0) {
        newErrors[`images_${colorIndex}`] =
          "At least one image is required per color";
      }

      // Validate size variants for each color
      variant.sizeVariants.forEach((sizeVariant, sizeIndex) => {
        if (!sizeVariant.size && !sizeVariant.customSize) {
          newErrors[`size_${colorIndex}_${sizeIndex}`] =
            "Size or custom size is required";
        }
        if (!sizeVariant.stock || parseInt(sizeVariant.stock) < 0) {
          newErrors[`stock_${colorIndex}_${sizeIndex}`] =
            "Valid stock quantity is required";
        }

        // Validate price adjustment
        if (
          sizeVariant.priceAdjustment &&
          isNaN(parseFloat(sizeVariant.priceAdjustment))
        ) {
          newErrors[`priceAdjustment_${colorIndex}_${sizeIndex}`] =
            "Price adjustment must be a valid number";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      // Basic product information
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", Number(formData.price));

      // FIX: Ensure category data is sent as strings, not objects
      const categoryToSend = {
        main: formData.category.main,
        sub: formData.category.sub,
        type: formData.category.type || "",
        variant: formData.category.variant || "",
        style: formData.category.style || "",
        fullPath: formData.category.fullPath || "",
      };

      console.log("Category being sent:", categoryToSend); // Debug log

      formDataToSend.append("category", JSON.stringify(categoryToSend));

      formDataToSend.append("brand", formData.brand || "");
      formDataToSend.append("badge", formData.badge || "");
      formDataToSend.append("status", formData.status);
      formDataToSend.append(
        "originalPrice",
        Number(formData.originalPrice || 0)
      );

      // Calculate total stock
      const totalStock = formData.colorVariants.reduce(
        (sum, variant) =>
          sum +
          variant.sizeVariants.reduce(
            (sizeSum, sizeVariant) =>
              sizeSum + parseInt(sizeVariant.stock || 0),
            0
          ),
        0
      );
      formDataToSend.append("stock", totalStock);

      // Append other data
      formDataToSend.append(
        "specifications",
        JSON.stringify(formData.specifications)
      );
      formDataToSend.append(
        "commonSpecs",
        JSON.stringify(formData.commonSpecs)
      );
      formDataToSend.append("tags", JSON.stringify(formData.tags));
      formDataToSend.append(
        "categoryFields",
        JSON.stringify(formData.categoryFields)
      );

      // Color variants data - FIXED: Include linked images properly
      const colorVariantsData = formData.colorVariants.map((variant) => ({
        colorName: variant.colorName,
        colorCode: variant.colorCode,
        images: variant.images
          .filter((img) => !img.markedForDeletion)
          .map((img) => ({
            // For linked images, include the URL and source
            url: img.source === "link" ? img.url : undefined,
            secure_url: img.secure_url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            source: img.source,
            // Only include file reference for uploaded images
            file: img.source === "upload" ? img.file : undefined,
          })),
        sizeVariants: variant.sizeVariants.map((sizeVariant) => ({
          size: sizeVariant.size,
          customSize: sizeVariant.customSize,
          stock: parseInt(sizeVariant.stock || 0),
          priceAdjustment: parseFloat(sizeVariant.priceAdjustment || 0),
        })),
      }));
      formDataToSend.append("colorVariants", JSON.stringify(colorVariantsData));

      // Handle images - collect all kept and deleted images
      const keptImages = [];
      const deletedImages = [];

      formData.colorVariants.forEach((variant, colorIndex) => {
        variant.images.forEach((image, imageIndex) => {
          if (image.publicId && !image.markedForDeletion) {
            // Kept existing image (from previous upload)
            keptImages.push({
              ...image,
              colorIndex,
              order: imageIndex,
            });
          } else if (image.publicId && image.markedForDeletion) {
            // Deleted existing image
            deletedImages.push(image);
          } else if (
            image.file &&
            !image.markedForDeletion &&
            image.source === "upload"
          ) {
            // New uploaded image - add to FormData
            formDataToSend.append(`colorImages_${colorIndex}`, image.file);
            formDataToSend.append(
              `imageMetadata_${colorIndex}_${imageIndex}`,
              JSON.stringify({
                alt: image.alt,
                isPrimary: image.isPrimary,
                order: imageIndex,
                source: image.source,
              })
            );
          } else if (image.source === "link" && !image.markedForDeletion) {
            // Linked image - add to keptImages so backend knows about it
            keptImages.push({
              ...image,
              colorIndex,
              order: imageIndex,
              source: "link",
            });
          }
        });
      });

      // Append kept and deleted images arrays
      if (keptImages.length > 0) {
        formDataToSend.append("keptImages", JSON.stringify(keptImages));
      }

      if (deletedImages.length > 0) {
        formDataToSend.append("deletedImages", JSON.stringify(deletedImages));
      }

      console.log("Kept Images:", keptImages);
      console.log("Deleted Images:", deletedImages);

      let response;
      if (isEditing) {
        response = await updateProduct(editProductId, formDataToSend);
      } else {
        response = await addProduct(formDataToSend);
      }

      if (response.success) {
        navigate("/vendor/dashboard");
      } else {
        throw new Error(response.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      setErrors({ submit: error.message || "Failed to save product" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
    }));
  };

  // Custom Dropdown Component
  const CategoryDropdown = ({
    level,
    selectedId,
    onSelect,
    options,
    isOpen,
    onToggle,
    placeholder,
    disabled,
  }) => {
    return (
      <div className="category-dropdown relative">
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between ${
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white border-gray-300 hover:border-gray-400"
          } ${isOpen ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
        >
          <span className={selectedId ? "text-gray-900" : "text-gray-500"}>
            {selectedId
              ? options.find((opt) => opt._id === selectedId)?.name
              : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option._id}
                  onClick={() => onSelect(option._id)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedId === option._id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.name}</span>
                    {option.productCount > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {option.productCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/vendor/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing
              ? "Update your product information"
              : "Create a new product listing with multiple color and size variants"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {errors.submit}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter product name"
                  maxLength="100"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe your product in detail"
                  maxLength="2000"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/2000 characters
                </p>
              </div>

              {/* Category Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Selection *
                </label>

                {/* Selected Category Path */}
                {getSelectedCategoryPath() && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-blue-800">
                          Selected Category:
                        </span>
                        <span className="ml-2 text-blue-900">
                          {getSelectedCategoryPath()}
                        </span>
                      </div>
                      <div className="text-sm text-blue-600">
                        Full Path: {formData.category.fullPath}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Main Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Category *
                    </label>
                    <CategoryDropdown
                      level={1}
                      selectedId={selectedMainCategory}
                      onSelect={handleMainCategorySelect}
                      options={getMainCategories()}
                      isOpen={showMainDropdown}
                      onToggle={() => setShowMainDropdown(!showMainDropdown)}
                      placeholder="Select main category"
                      disabled={false}
                    />
                    {selectedMainCategory && (
                      <button
                        type="button"
                        onClick={() => clearCategorySelection("main")}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory
                    </label>
                    <CategoryDropdown
                      level={2}
                      selectedId={selectedSubcategory}
                      onSelect={handleSubcategorySelect}
                      options={getSubcategories(selectedMainCategory)}
                      isOpen={showSubcategoryDropdown}
                      onToggle={() =>
                        setShowSubcategoryDropdown(!showSubcategoryDropdown)
                      }
                      placeholder="Select subcategory"
                      disabled={!selectedMainCategory}
                    />
                    {selectedSubcategory && (
                      <button
                        type="button"
                        onClick={() => clearCategorySelection("sub")}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <CategoryDropdown
                      level={3}
                      selectedId={selectedType}
                      onSelect={handleTypeSelect}
                      options={getTypes(
                        selectedMainCategory,
                        selectedSubcategory
                      )}
                      isOpen={showTypeDropdown}
                      onToggle={() => setShowTypeDropdown(!showTypeDropdown)}
                      placeholder="Select type"
                      disabled={!selectedSubcategory}
                    />
                    {selectedType && (
                      <button
                        type="button"
                        onClick={() => clearCategorySelection("type")}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>

                  {/* Variant */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variant
                    </label>
                    <CategoryDropdown
                      level={4}
                      selectedId={selectedVariant}
                      onSelect={handleVariantSelect}
                      options={getVariants(
                        selectedMainCategory,
                        selectedSubcategory,
                        selectedType
                      )}
                      isOpen={showVariantDropdown}
                      onToggle={() =>
                        setShowVariantDropdown(!showVariantDropdown)
                      }
                      placeholder="Select variant"
                      disabled={!selectedType}
                    />
                    {selectedVariant && (
                      <button
                        type="button"
                        onClick={() => clearCategorySelection("variant")}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style
                    </label>
                    <CategoryDropdown
                      level={5}
                      selectedId={selectedStyle}
                      onSelect={handleStyleSelect}
                      options={getStyles(
                        selectedMainCategory,
                        selectedSubcategory,
                        selectedType,
                        selectedVariant
                      )}
                      isOpen={showStyleDropdown}
                      onToggle={() => setShowStyleDropdown(!showStyleDropdown)}
                      placeholder="Select style"
                      disabled={!selectedVariant}
                    />
                    {selectedStyle && (
                      <button
                        type="button"
                        onClick={() => clearCategorySelection("style")}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>

                {errors.category_main && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category_main}
                  </p>
                )}
              </div>

              {/* Brand field - shown for all categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="originalPrice"
                    min="0"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  For showing discounts
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge
                </label>
                <select
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a badge (optional)</option>
                  {badges.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of the component remains the same */}
          {/* Category-specific Fields, Color Variants, Common Specifications, Tags, etc. */}
          {/* ... (The rest of the component code remains unchanged) ... */}

          {/* Category-specific Fields */}
          {formData.category.main &&
            categoryFields[formData.category.main.toLowerCase()] && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  {formData.category.main.charAt(0).toUpperCase() +
                    formData.category.main.slice(1)}{" "}
                  Specifications
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getCurrentCategoryFields().map((field) => (
                    <div
                      key={field.name}
                      className={
                        field.type === "textarea" ? "md:col-span-2" : ""
                      }
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          name={`categoryFields.${field.name}`}
                          value={formData.categoryFields[field.name] || ""}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      ) : field.type === "checkbox" ? (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name={`categoryFields.${field.name}`}
                            checked={
                              formData.categoryFields[field.name] || false
                            }
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {field.label}
                          </span>
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          name={`categoryFields.${field.name}`}
                          value={formData.categoryFields[field.name] || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Color Variants Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Palette className="h-5 w-5 mr-2 text-purple-600" />
                Color & Size Variants
              </h2>
              <button
                type="button"
                onClick={addColorVariant}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Color
              </button>
            </div>

            <div className="space-y-8">
              {formData.colorVariants.map((variant, colorIndex) => (
                <div
                  key={colorIndex}
                  className="border border-gray-200 rounded-lg p-6 relative"
                >
                  {/* Color Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-900 flex items-center">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3"
                        style={{ backgroundColor: variant.colorCode }}
                      ></div>
                      Color Variant {colorIndex + 1}
                    </h3>
                    {formData.colorVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColorVariant(colorIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Color Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Name *
                      </label>
                      <input
                        type="text"
                        value={variant.colorName}
                        onChange={(e) =>
                          updateColorVariant(
                            colorIndex,
                            "colorName",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`colorName_${colorIndex}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g., Midnight Blue"
                      />
                      {errors[`colorName_${colorIndex}`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`colorName_${colorIndex}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Code
                      </label>
                      <input
                        type="color"
                        value={variant.colorCode}
                        onChange={(e) =>
                          updateColorVariant(
                            colorIndex,
                            "colorCode",
                            e.target.value
                          )
                        }
                        className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Size Variants for this Color */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 flex items-center">
                        <Ruler className="h-5 w-5 mr-2 text-blue-600" />
                        Size Variants for{" "}
                        {variant.colorName || `Color ${colorIndex + 1}`}
                        <span className="ml-2 text-sm text-gray-500">
                          ({variant.sizeVariants.length} size
                          {variant.sizeVariants.length !== 1 ? "s" : ""})
                        </span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => addSizeVariant(colorIndex)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Size
                      </button>
                    </div>

                    <div className="space-y-4">
                      {variant.sizeVariants.map((sizeVariant, sizeIndex) => (
                        <div
                          key={sizeIndex}
                          className="relative p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          {/* Header with size number and remove button */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              Size Option {sizeIndex + 1}
                            </span>
                            {variant.sizeVariants.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeSizeVariant(colorIndex, sizeIndex)
                                }
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Remove this size option"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Size
                              </label>
                              <select
                                value={sizeVariant.size}
                                onChange={(e) =>
                                  updateSizeVariant(
                                    colorIndex,
                                    sizeIndex,
                                    "size",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select a size</option>
                                {commonSizes.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Size
                              </label>
                              <input
                                type="text"
                                value={sizeVariant.customSize}
                                onChange={(e) =>
                                  updateSizeVariant(
                                    colorIndex,
                                    sizeIndex,
                                    "customSize",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 10x20 cm"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Use if size not in dropdown
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Quantity *
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={sizeVariant.stock}
                                onChange={(e) =>
                                  updateSizeVariant(
                                    colorIndex,
                                    sizeIndex,
                                    "stock",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors[`stock_${colorIndex}_${sizeIndex}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="0"
                              />
                              {errors[`stock_${colorIndex}_${sizeIndex}`] && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors[`stock_${colorIndex}_${sizeIndex}`]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price Adjustment
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">
                                  $
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={sizeVariant.priceAdjustment}
                                  onChange={(e) =>
                                    updateSizeVariant(
                                      colorIndex,
                                      sizeIndex,
                                      "priceAdjustment",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors[
                                      `priceAdjustment_${colorIndex}_${sizeIndex}`
                                    ]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="0.00"
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Extra cost for this size
                              </p>
                              {errors[
                                `priceAdjustment_${colorIndex}_${sizeIndex}`
                              ] && (
                                <p className="mt-1 text-sm text-red-600">
                                  {
                                    errors[
                                      `priceAdjustment_${colorIndex}_${sizeIndex}`
                                    ]
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Validation error for size requirement */}
                          {errors[`size_${colorIndex}_${sizeIndex}`] && (
                            <p className="mt-2 text-sm text-red-600">
                              {errors[`size_${colorIndex}_${sizeIndex}`]}
                            </p>
                          )}

                          {/* Final price preview for this size */}
                          {sizeVariant.stock && formData.price && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  Final price for{" "}
                                  {sizeVariant.size ||
                                    sizeVariant.customSize ||
                                    "this size"}
                                  :
                                </span>
                                <span className="font-semibold text-green-600">
                                  $
                                  {(
                                    parseFloat(formData.price) +
                                    parseFloat(sizeVariant.priceAdjustment || 0)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Helpful instructions */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-900 text-sm mb-1">
                        Size Variant Tips:
                      </h5>
                      <ul className="text-blue-800 text-xs space-y-1">
                        <li>
                          • Each color can have multiple sizes (S, M, L, etc.)
                        </li>
                        <li>• Set individual stock quantities for each size</li>
                        <li>
                          • Add price adjustments for premium sizes (like XXL)
                        </li>
                        <li>• Use custom size for unique dimensions</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Images for{" "}
                        {variant.colorName || `Color ${colorIndex + 1}`} *
                      </label>
                      <span className="text-xs text-gray-500">
                        {
                          variant.images.filter((img) => !img.markedForDeletion)
                            .length
                        }
                        /10 images
                        {variant.images.filter((img) => img.markedForDeletion)
                          .length > 0 && (
                          <span className="text-red-500 ml-2">
                            (
                            {
                              variant.images.filter(
                                (img) => img.markedForDeletion
                              ).length
                            }{" "}
                            marked for deletion)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Image Upload Method Selection */}
                    <div className="mb-4">
                      <div className="flex border border-gray-300 rounded-lg overflow-hidden w-fit">
                        <button
                          type="button"
                          onClick={() => setImageUploadMethod("upload")}
                          className={`px-4 py-2 text-sm font-medium flex items-center ${
                            imageUploadMethod === "upload"
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUploadMethod("link")}
                          className={`px-4 py-2 text-sm font-medium flex items-center ${
                            imageUploadMethod === "link"
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Add Link
                        </button>
                      </div>
                    </div>

                    {/* File Upload Section */}
                    {imageUploadMethod === "upload" && (
                      <div className="mb-4">
                        <label className="block cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <div className="text-sm text-gray-600">
                              <span className="text-blue-600 hover:text-blue-700">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              PNG, JPG, GIF up to 5MB (Max 10 images per color)
                            </p>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(colorIndex, e.target.files)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* Image Link Section */}
                    {imageUploadMethod === "link" && (
                      <div className="mb-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                          <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="text-sm text-gray-600 mb-4 text-center">
                            Add image from URL
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={imageLink}
                              onChange={(e) => setImageLink(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                handleAddImageLink(colorIndex)
                              }
                            />
                            <button
                              type="button"
                              onClick={() => handleAddImageLink(colorIndex)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Supported formats: JPG, PNG, GIF, WebP
                          </p>
                        </div>
                      </div>
                    )}

                    {errors[`images_${colorIndex}`] && (
                      <p className="mb-4 text-sm text-red-600">
                        {errors[`images_${colorIndex}`]}
                      </p>
                    )}

                    {/* Image Grid - UPDATED to show source badges */}
                    {variant.images.filter((img) => !img.markedForDeletion)
                      .length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {variant.images.map(
                          (image, imageIndex) =>
                            !image.markedForDeletion && (
                              <div
                                key={imageIndex}
                                className="relative group"
                                draggable
                                onDragStart={(e) =>
                                  handleImageDragStart(
                                    e,
                                    colorIndex,
                                    imageIndex
                                  )
                                }
                                onDragOver={handleImageDragOver}
                                onDrop={(e) =>
                                  handleImageDrop(e, colorIndex, imageIndex)
                                }
                              >
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-move">
                                  <img
                                    src={image.url || image.secure_url}
                                    alt={image.alt}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Handle broken images, especially for links
                                      e.target.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10' fill='%239ca3af'%3EImage Error%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                </div>

                                {/* Image Controls */}
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPrimaryImage(colorIndex, imageIndex)
                                      }
                                      className={`p-2 rounded-full ${
                                        image.isPrimary
                                          ? "bg-green-500 text-white"
                                          : "bg-white text-gray-700 hover:bg-gray-100"
                                      }`}
                                      title="Set as primary image"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleImageDeletion(
                                          colorIndex,
                                          imageIndex
                                        )
                                      }
                                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                      title="Remove image"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Primary Badge */}
                                {image.isPrimary && (
                                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                    Primary
                                  </div>
                                )}

                                {/* Source Badge */}
                                <div
                                  className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                                    image.source === "link"
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-500 text-white"
                                  }`}
                                >
                                  {image.source === "link" ? "Link" : "Upload"}
                                </div>

                                {/* Image Order Number */}
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                  {imageIndex + 1}
                                </div>

                                {/* Drag Handle */}
                                <div className="absolute top-2 right-2 bg-white bg-opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Move className="h-3 w-3 text-gray-600" />
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {/* Images marked for deletion with restore option */}
                    {variant.images.filter((img) => img.markedForDeletion)
                      .length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Images Marked for Deletion
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {variant.images.map(
                            (image, imageIndex) =>
                              image.markedForDeletion && (
                                <div
                                  key={imageIndex}
                                  className="relative group opacity-60"
                                >
                                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-red-300">
                                    <img
                                      src={image.url || image.secure_url}
                                      alt={image.alt}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src =
                                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10' fill='%239ca3af'%3EImage Error%3C/text%3E%3C/svg%3E";
                                      }}
                                    />
                                  </div>

                                  {/* Restore Button */}
                                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleImageDeletion(
                                          colorIndex,
                                          imageIndex
                                        )
                                      }
                                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                                      title="Restore image"
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                    Will Delete
                                  </div>

                                  {/* Source Badge for deleted images */}
                                  <div
                                    className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                                      image.source === "link"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-500 text-white"
                                    }`}
                                  >
                                    {image.source === "link"
                                      ? "Link"
                                      : "Upload"}
                                  </div>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Image Instructions - UPDATED */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-900 text-sm mb-1">
                        Image Tips:
                      </h5>
                      <ul className="text-blue-800 text-xs space-y-1">
                        <li>
                          • First image will be set as primary automatically
                        </li>
                        <li>
                          • Click the eye icon to set a different primary image
                        </li>
                        <li>• Drag images to reorder them</li>
                        <li>
                          • Use high-quality images (1200x1200px recommended)
                        </li>
                        <li>
                          • Images should clearly show the product in this color
                        </li>
                        <li>
                          • For linked images, ensure URLs are permanent and
                          accessible
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Specifications */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Common Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight
                </label>
                <div className="flex">
                  <input
                    type="number"
                    name="commonSpecs.weight.value"
                    min="0"
                    step="0.01"
                    value={formData.commonSpecs.weight.value}
                    onChange={handleChange}
                    className="w-3/4 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  <select
                    name="commonSpecs.weight.unit"
                    value={formData.commonSpecs.weight.unit}
                    onChange={handleChange}
                    className="w-1/4 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {weightUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <input
                  type="text"
                  name="commonSpecs.material"
                  value={formData.commonSpecs.material}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cotton, Wood, Metal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty
                </label>
                <input
                  type="text"
                  name="commonSpecs.warranty"
                  value={formData.commonSpecs.warranty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1 Year, 6 Months"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={tempFeature}
                    onChange={(e) => setTempFeature(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a key feature"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      addSpecificationItem("features", tempFeature)
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      addSpecificationItem("features", tempFeature)
                    }
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {formData.commonSpecs.features.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.commonSpecs.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() =>
                            removeSpecificationItem("features", feature)
                          }
                          className="ml-1.5 inline-flex text-purple-400 hover:text-purple-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Product Tags
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Tags
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 inline-flex text-purple-400 hover:text-purple-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Tags help customers find your product. Use relevant keywords.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/vendor/dashboard"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Update Product" : "Create Product"}
            </button>
          </div>

          {/* Preview Section */}
          {formData.name && formData.price && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Product Preview
              </h2>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-4">
                  {formData.colorVariants[0]?.images[0] && (
                    <img
                      src={formData.colorVariants[0].images[0].url}
                      alt={formData.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {formData.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {formData.description.slice(0, 100)}...
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-lg font-bold text-blue-600">
                        ${formData.price}
                      </span>
                      {formData.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${formData.originalPrice}
                        </span>
                      )}
                      {formData.badge && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {formData.badge}
                        </span>
                      )}
                    </div>
                    {formData.category.main && (
                      <div className="mt-2 text-xs text-gray-500">
                        Category: {getSelectedCategoryPath()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
