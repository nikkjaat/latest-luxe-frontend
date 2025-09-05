import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  Upload,
  X,
  Plus,
  Minus,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Info,
  Tag,
  DollarSign,
  Hash,
  Palette,
  Ruler,
  Weight,
  Shield,
  Clock,
  Zap,
  Heart,
  Baby,
  Home,
  Smartphone,
  Shirt,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductContext";
import apiService from "../../services/api";

const AddProduct = () => {
  const { user } = useAuth();
  const { addProduct, updateProduct, getProduct } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const tagInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [productId, setProductId] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    subcategory: "",
    brand: "",
    stock: "",
    status: "active",
    badge: "",
    images: [],
    specifications: {},
    tags: [],
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  // Category-specific specifications
  const categorySpecs = {
    women: {
      name: "Women's Fashion",
      icon: Shirt,
      color: "text-pink-600",
      guidelines:
        "Focus on style, fit, and comfort. Include detailed size charts and care instructions.",
      specifications: [
        {
          key: "size",
          label: "Available Sizes",
          type: "multiselect",
          options: ["XS", "S", "M", "L", "XL", "XXL"],
          required: true,
        },
        {
          key: "color",
          label: "Available Colors",
          type: "multiselect",
          options: [
            "Black",
            "White",
            "Red",
            "Blue",
            "Green",
            "Pink",
            "Purple",
            "Yellow",
            "Orange",
            "Gray",
            "Brown",
          ],
          required: true,
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: [
            "Cotton",
            "Polyester",
            "Silk",
            "Wool",
            "Linen",
            "Denim",
            "Leather",
            "Synthetic",
          ],
          required: true,
        },
        {
          key: "careInstructions",
          label: "Care Instructions",
          type: "textarea",
          placeholder: "e.g., Machine wash cold, tumble dry low",
        },
        {
          key: "fitType",
          label: "Fit Type",
          type: "select",
          options: ["Regular", "Slim", "Loose", "Oversized", "Tight"],
        },
        {
          key: "occasion",
          label: "Occasion",
          type: "multiselect",
          options: ["Casual", "Formal", "Party", "Work", "Sports", "Beach"],
        },
        {
          key: "season",
          label: "Season",
          type: "multiselect",
          options: ["Spring", "Summer", "Fall", "Winter", "All Season"],
        },
      ],
    },
    men: {
      name: "Men's Collection",
      icon: Shirt,
      color: "text-blue-600",
      guidelines:
        "Emphasize quality, durability, and classic style. Include sizing and material details.",
      specifications: [
        {
          key: "size",
          label: "Available Sizes",
          type: "multiselect",
          options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
          required: true,
        },
        {
          key: "color",
          label: "Available Colors",
          type: "multiselect",
          options: [
            "Black",
            "White",
            "Navy",
            "Gray",
            "Brown",
            "Khaki",
            "Blue",
            "Green",
          ],
          required: true,
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: [
            "Cotton",
            "Polyester",
            "Wool",
            "Linen",
            "Denim",
            "Leather",
            "Synthetic",
          ],
          required: true,
        },
        {
          key: "careInstructions",
          label: "Care Instructions",
          type: "textarea",
          placeholder: "e.g., Dry clean only, iron on low heat",
        },
        {
          key: "fitType",
          label: "Fit Type",
          type: "select",
          options: ["Regular", "Slim", "Classic", "Relaxed", "Athletic"],
        },
        {
          key: "occasion",
          label: "Occasion",
          type: "multiselect",
          options: ["Business", "Casual", "Formal", "Sports", "Weekend"],
        },
        {
          key: "collarType",
          label: "Collar Type",
          type: "select",
          options: ["Regular", "Button-down", "Spread", "Cutaway", "Band"],
        },
      ],
    },
    electronics: {
      name: "Electronics",
      icon: Smartphone,
      color: "text-purple-600",
      guidelines:
        "Include technical specifications, warranty information, and compatibility details.",
      specifications: [
        {
          key: "color",
          label: "Available Colors",
          type: "multiselect",
          options: ["Black", "White", "Silver", "Gold", "Blue", "Red", "Green"],
          required: true,
        },
        {
          key: "dimensions",
          label: "Dimensions (L×W×H cm)",
          type: "dimensions",
          required: true,
        },
        {
          key: "weight",
          label: "Weight (kg)",
          type: "number",
          step: "0.01",
          required: true,
        },
        {
          key: "warranty",
          label: "Warranty Period",
          type: "select",
          options: ["6 months", "1 year", "2 years", "3 years", "5 years"],
          required: true,
        },
        {
          key: "connectivity",
          label: "Connectivity",
          type: "multiselect",
          options: [
            "WiFi",
            "Bluetooth",
            "USB-C",
            "Lightning",
            "3.5mm Jack",
            "NFC",
            "5G",
            "4G",
          ],
        },
        {
          key: "powerSource",
          label: "Power Source",
          type: "select",
          options: ["Battery", "AC Adapter", "USB", "Solar", "Rechargeable"],
        },
        {
          key: "compatibility",
          label: "Compatibility",
          type: "textarea",
          placeholder: "Compatible devices and systems",
        },
        {
          key: "batteryLife",
          label: "Battery Life",
          type: "text",
          placeholder: "e.g., Up to 24 hours",
        },
      ],
    },
    beauty: {
      name: "Beauty & Care",
      icon: Heart,
      color: "text-pink-600",
      guidelines:
        "Include ingredient information, skin type compatibility, and usage instructions.",
      specifications: [
        {
          key: "color",
          label: "Color/Shades",
          type: "multiselect",
          options: [
            "Fair",
            "Light",
            "Medium",
            "Tan",
            "Deep",
            "Universal",
            "Clear",
          ],
          required: true,
        },
        {
          key: "skinType",
          label: "Skin Type",
          type: "multiselect",
          options: [
            "All Skin Types",
            "Dry",
            "Oily",
            "Combination",
            "Sensitive",
            "Mature",
          ],
          required: true,
        },
        {
          key: "ingredients",
          label: "Key Ingredients",
          type: "textarea",
          placeholder: "List main ingredients and benefits",
          required: true,
        },
        {
          key: "volume",
          label: "Volume/Size",
          type: "text",
          placeholder: "e.g., 50ml, 100g",
          required: true,
        },
        {
          key: "shelfLife",
          label: "Shelf Life",
          type: "select",
          options: [
            "6 months",
            "12 months",
            "18 months",
            "24 months",
            "36 months",
          ],
        },
        {
          key: "application",
          label: "Application Method",
          type: "textarea",
          placeholder: "How to use this product",
        },
        {
          key: "benefits",
          label: "Key Benefits",
          type: "multiselect",
          options: [
            "Anti-aging",
            "Moisturizing",
            "Brightening",
            "Acne Control",
            "Sun Protection",
            "Hydrating",
          ],
        },
        { key: "crueltyFree", label: "Cruelty Free", type: "checkbox" },
        { key: "vegan", label: "Vegan", type: "checkbox" },
      ],
    },
    home: {
      name: "Home & Living",
      icon: Home,
      color: "text-green-600",
      guidelines:
        "Include material details, care instructions, and room compatibility information.",
      specifications: [
        {
          key: "color",
          label: "Available Colors",
          type: "multiselect",
          options: [
            "White",
            "Black",
            "Gray",
            "Brown",
            "Beige",
            "Blue",
            "Green",
            "Red",
            "Multi-color",
          ],
          required: true,
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: [
            "Wood",
            "Metal",
            "Plastic",
            "Glass",
            "Fabric",
            "Ceramic",
            "Stone",
            "Composite",
          ],
          required: true,
        },
        {
          key: "dimensions",
          label: "Dimensions (L×W×H cm)",
          type: "dimensions",
          required: true,
        },
        {
          key: "weight",
          label: "Weight (kg)",
          type: "number",
          step: "0.1",
          required: true,
        },
        {
          key: "roomType",
          label: "Suitable for Room",
          type: "multiselect",
          options: [
            "Living Room",
            "Bedroom",
            "Kitchen",
            "Bathroom",
            "Dining Room",
            "Office",
            "Outdoor",
          ],
        },
        {
          key: "style",
          label: "Style",
          type: "select",
          options: [
            "Modern",
            "Traditional",
            "Contemporary",
            "Rustic",
            "Industrial",
            "Scandinavian",
            "Bohemian",
          ],
        },
        {
          key: "careInstructions",
          label: "Care Instructions",
          type: "textarea",
          placeholder: "Cleaning and maintenance instructions",
        },
        { key: "assembly", label: "Assembly Required", type: "checkbox" },
      ],
    },
    accessories: {
      name: "Accessories",
      icon: Tag,
      color: "text-purple-600",
      guidelines:
        "Focus on style, material quality, and compatibility with different outfits.",
      specifications: [
        {
          key: "color",
          label: "Available Colors",
          type: "multiselect",
          options: [
            "Black",
            "Brown",
            "Tan",
            "White",
            "Red",
            "Blue",
            "Gold",
            "Silver",
            "Rose Gold",
          ],
          required: true,
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: [
            "Leather",
            "Metal",
            "Fabric",
            "Plastic",
            "Wood",
            "Glass",
            "Ceramic",
            "Synthetic",
          ],
          required: true,
        },
        {
          key: "dimensions",
          label: "Dimensions (L×W×H cm)",
          type: "dimensions",
        },
        { key: "weight", label: "Weight (g)", type: "number", step: "1" },
        {
          key: "compatibility",
          label: "Compatible With",
          type: "multiselect",
          options: [
            "Casual Wear",
            "Formal Wear",
            "Party Wear",
            "Sports Wear",
            "Business Attire",
          ],
        },
        {
          key: "closure",
          label: "Closure Type",
          type: "select",
          options: [
            "Zipper",
            "Magnetic",
            "Buckle",
            "Snap",
            "Drawstring",
            "None",
          ],
        },
        { key: "waterResistant", label: "Water Resistant", type: "checkbox" },
        {
          key: "giftWrapping",
          label: "Gift Wrapping Available",
          type: "checkbox",
        },
      ],
    },
    sports: {
      name: "Sports & Fitness",
      icon: Zap,
      color: "text-orange-600",
      guidelines:
        "Emphasize performance features, durability, and sport-specific benefits.",
      specifications: [
        {
          key: "size",
          label: "Available Sizes",
          type: "multiselect",
          options: ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
          required: true,
        },
        {
          key: "color",
          label: "Available Colors",
          type: "multiselect",
          options: [
            "Black",
            "White",
            "Red",
            "Blue",
            "Green",
            "Yellow",
            "Orange",
            "Pink",
            "Gray",
          ],
          required: true,
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: [
            "Polyester",
            "Nylon",
            "Spandex",
            "Cotton",
            "Mesh",
            "Synthetic",
            "Rubber",
          ],
          required: true,
        },
        { key: "weight", label: "Weight (kg)", type: "number", step: "0.01" },
        {
          key: "sportCategory",
          label: "Sport Category",
          type: "multiselect",
          options: [
            "Running",
            "Gym",
            "Yoga",
            "Swimming",
            "Cycling",
            "Basketball",
            "Football",
            "Tennis",
          ],
        },
        {
          key: "features",
          label: "Features",
          type: "multiselect",
          options: [
            "Moisture Wicking",
            "Breathable",
            "Quick Dry",
            "UV Protection",
            "Anti-Odor",
            "Compression",
          ],
        },
        {
          key: "skillLevel",
          label: "Skill Level",
          type: "select",
          options: [
            "Beginner",
            "Intermediate",
            "Advanced",
            "Professional",
            "All Levels",
          ],
        },
        { key: "indoor", label: "Indoor Use", type: "checkbox" },
        { key: "outdoor", label: "Outdoor Use", type: "checkbox" },
      ],
    },
    kids: {
      name: "Kids & Baby",
      icon: Baby,
      color: "text-cyan-600",
      guidelines:
        "Safety is paramount. Include age recommendations and safety certifications.",
      specifications: [
        {
          key: "size",
          label: "Available Sizes",
          type: "multiselect",
          options: [
            "Newborn",
            "0-3M",
            "3-6M",
            "6-12M",
            "12-18M",
            "18-24M",
            "2T",
            "3T",
            "4T",
            "5T",
          ],
          required: true,
        },
        {
          key: "color",
          label: "Available Colors",
          type: "multiselect",
          options: [
            "Pink",
            "Blue",
            "Yellow",
            "Green",
            "White",
            "Red",
            "Purple",
            "Orange",
            "Multi-color",
          ],
          required: true,
        },
        {
          key: "material",
          label: "Material",
          type: "select",
          options: [
            "Organic Cotton",
            "Cotton",
            "Bamboo",
            "Polyester",
            "Wool",
            "Synthetic",
            "Plastic",
            "Wood",
          ],
          required: true,
        },
        {
          key: "ageGroup",
          label: "Age Group",
          type: "select",
          options: [
            "0-6 months",
            "6-12 months",
            "1-2 years",
            "2-4 years",
            "4-6 years",
            "6-8 years",
            "8+ years",
          ],
          required: true,
        },
        {
          key: "safetyStandards",
          label: "Safety Certifications",
          type: "multiselect",
          options: [
            "CE Certified",
            "CPSIA Compliant",
            "Non-toxic",
            "BPA Free",
            "Phthalate Free",
          ],
        },
        { key: "washable", label: "Machine Washable", type: "checkbox" },
        { key: "chokeHazard", label: "Small Parts Warning", type: "checkbox" },
        {
          key: "educational",
          label: "Educational Value",
          type: "textarea",
          placeholder: "Learning benefits and skills developed",
        },
      ],
    },
  };

  const badges = [
    "Best Seller",
    "New Arrival",
    "Limited Edition",
    "Exclusive",
    "Trending",
    "Premium",
    "Sale",
    "Featured",
    "Eco-Friendly",
    "Handmade",
  ];

  // Check if editing mode
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editMode = searchParams.get("edit") === "true";
    const productIdFromState = location.state?.productId;

    if (editMode && productIdFromState) {
      setIsEditing(true);
      setProductId(productIdFromState);
      loadProductForEdit(productIdFromState);
    }
  }, [location]);

  const loadProductForEdit = async (id) => {
    try {
      setLoading(true);
      const response = await getProduct(id);
      const product = response.product;

      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        brand: product.brand || "",
        stock: product.stock?.toString() || "",
        status: product.status || "active",
        badge: product.badge || "",
        // Ensure images have publicId for existing images
        images:
          product.images?.map((img) => ({
            ...img,
            publicId: img.publicId || img._id || "", // Use appropriate ID field
            markedForDeletion: false,
          })) || [],
        specifications: product.specifications || {},
        tags: product.tags || [],
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        seoKeywords: product.seoKeywords || "",
      });
    } catch (error) {
      console.error("Failed to load product for editing:", error);
      setErrors({ general: "Failed to load product data" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Reset specifications when category changes
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        specifications: {},
        subcategory: "",
      }));
    }
  };

  const handleSpecificationChange = (key, value, type) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: type === "multiselect" ? value : value,
      },
    }));
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // const handleImageUpload = async (e) => {
  //   const files = Array.from(e.target.files);
  //   if (files.length === 0) return;

  //   setImageUploading(true);
  //   try {
  //     // In a real app, you would upload to a cloud service
  //     // For now, we'll create data URLs
  //     const imagePromises = files.map((file) => {
  //       return new Promise((resolve) => {
  //         const reader = new FileReader();
  //         reader.onload = (e) => {
  //           resolve({
  //             url: e.target.result,
  //             name: file.name,
  //             size: file.size,
  //           });
  //         };
  //         reader.readAsDataURL(file);
  //       });
  //     });

  //     const newImages = await Promise.all(imagePromises);
  //     setFormData((prev) => ({
  //       ...prev,
  //       images: [...prev.images, ...newImages].slice(0, 5), // Max 5 images
  //     }));
  //   } catch (error) {
  //     console.error("Failed to upload images:", error);
  //     setErrors({ images: "Failed to upload images" });
  //   } finally {
  //     setImageUploading(false);
  //   }
  // };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    try {
      // Store the actual File objects, not data URLs
      const newImages = files.map((file) => ({
        file, // Store the actual File object
        url: URL.createObjectURL(file), // Create URL for preview
        name: file.name,
        size: file.size,
      }));

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5), // Max 5 images
      }));
    } catch (error) {
      console.error("Failed to upload images:", error);
      setErrors({ images: "Failed to upload images" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageRemove = (index) => {
    const imageToRemove = formData.images[index];

    // If it's an existing image (has publicId), mark it for deletion
    if (imageToRemove.publicId) {
      setFormData((prev) => {
        const newImages = [...prev.images];
        newImages[index] = {
          ...newImages[index],
          markedForDeletion: true,
        };
        return { ...prev, images: newImages };
      });
    } else {
      // For new images not yet uploaded, just remove them
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  // Add function to restore deleted images
  const restoreImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages[index] = {
        ...newImages[index],
        markedForDeletion: false,
      };
      return { ...prev, images: newImages };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (formData.images.length === 0)
      newErrors.images = "At least one image is required";

    // Validate category-specific required specifications
    const categorySpec = categorySpecs[formData.category];
    if (categorySpec) {
      categorySpec.specifications.forEach((spec) => {
        if (spec.required && !formData.specifications[spec.key]) {
          newErrors[`spec_${spec.key}`] = `${spec.label} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) {
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const formDataToSend = new FormData();

  //     // Add basic product data
  //     formDataToSend.append("name", formData.name);
  //     formDataToSend.append("description", formData.description);
  //     formDataToSend.append("price", formData.price);
  //     formDataToSend.append("originalPrice", formData.originalPrice || "");
  //     formDataToSend.append("category", formData.category);
  //     formDataToSend.append("subcategory", formData.subcategory || "");
  //     formDataToSend.append("brand", formData.brand || "");
  //     formDataToSend.append("stock", formData.stock);
  //     formDataToSend.append("status", formData.status);
  //     formDataToSend.append("badge", formData.badge || "");
  //     formDataToSend.append("seoTitle", formData.seoTitle || "");
  //     formDataToSend.append("seoDescription", formData.seoDescription || "");
  //     formDataToSend.append("seoKeywords", formData.seoKeywords || "");

  //     // Add specifications as JSON
  //     formDataToSend.append(
  //       "specifications",
  //       JSON.stringify(formData.specifications)
  //     );

  //     // Add tags as JSON
  //     formDataToSend.append("tags", JSON.stringify(formData.tags));

  //     // Add images (in real app, these would be actual files)
  //     formDataToSend.append("images", JSON.stringify(formData.images));

  //     let response;
  //     if (isEditing) {
  //       response = await apiService.updateProduct(productId, formDataToSend);
  //     } else {
  //       response = await apiService.createProduct(formDataToSend);
  //     }

  //     if (response.success) {
  //       navigate("/vendor/dashboard", {
  //         state: {
  //           message: isEditing
  //             ? "Product updated successfully!"
  //             : "Product created successfully!",
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Failed to save product:", error);
  //     setErrors({ general: error.message || "Failed to save product" });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Add basic product data
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("originalPrice", formData.originalPrice || "");
      formDataToSend.append("category", formData.category);
      formDataToSend.append("subcategory", formData.subcategory || "");
      formDataToSend.append("brand", formData.brand || "");
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("badge", formData.badge || "");
      formDataToSend.append("seoTitle", formData.seoTitle || "");
      formDataToSend.append("seoDescription", formData.seoDescription || "");
      formDataToSend.append("seoKeywords", formData.seoKeywords || "");

      // Add specifications as JSON
      formDataToSend.append(
        "specifications",
        JSON.stringify(formData.specifications)
      );

      // Add tags as JSON
      formDataToSend.append("tags", JSON.stringify(formData.tags));

      if (isEditing) {
        // For editing mode, handle images properly
        const keptImages = formData.images.filter(
          (img) => !img.markedForDeletion && img.publicId
        );
        const newImages = formData.images.filter(
          (img) => img.file && !img.markedForDeletion
        );
        const deletedImages = formData.images.filter(
          (img) => img.markedForDeletion && img.publicId
        );

        // Append kept images
        if (keptImages.length > 0) {
          formDataToSend.append("keptImages", JSON.stringify(keptImages));
        }

        // Append new images
        newImages.forEach((image) => {
          formDataToSend.append("images", image.file);
        });

        // Append deleted images
        if (deletedImages.length > 0) {
          formDataToSend.append(
            "imagesToDelete",
            JSON.stringify(deletedImages)
          );
        }
      } else {
        // For new product creation, add all images
        formData.images.forEach((image) => {
          if (image.file) {
            formDataToSend.append("images", image.file);
          }
        });
      }

      let response;
      if (isEditing) {
        response = await apiService.updateProduct(productId, formDataToSend);
      } else {
        response = await apiService.createProduct(formDataToSend);
      }

      if (response.success) {
        navigate("/vendor/dashboard", {
          state: {
            message: isEditing
              ? "Product updated successfully!"
              : "Product created successfully!",
          },
        });
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      setErrors({ general: error.message || "Failed to save product" });
    } finally {
      setLoading(false);
    }
  };

  const renderSpecificationField = (spec) => {
    const value = formData.specifications[spec.key] || "";
    const error = errors[`spec_${spec.key}`];

    switch (spec.type) {
      case "text":
      case "number":
        return (
          <div key={spec.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {spec.label}{" "}
              {spec.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={spec.type}
              value={value}
              onChange={(e) =>
                handleSpecificationChange(spec.key, e.target.value, spec.type)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-300" : "border-gray-300"
              }`}
              placeholder={spec.placeholder}
              step={spec.step}
              min={spec.min}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={spec.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {spec.label}{" "}
              {spec.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) =>
                handleSpecificationChange(spec.key, e.target.value, spec.type)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-300" : "border-gray-300"
              }`}
              placeholder={spec.placeholder}
              rows={3}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={spec.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {spec.label}{" "}
              {spec.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) =>
                handleSpecificationChange(spec.key, e.target.value, spec.type)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select {spec.label}</option>
              {spec.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "multiselect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={spec.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {spec.label}{" "}
              {spec.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {spec.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, option]
                          : selectedValues.filter((v) => v !== option);
                        handleSpecificationChange(
                          spec.key,
                          newValues,
                          spec.type
                        );
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedValues.map((val) => (
                  <span
                    key={val}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {val}
                  </span>
                ))}
              </div>
            )}
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "dimensions":
        const dimensions = value || { length: "", width: "", height: "" };
        return (
          <div key={spec.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {spec.label}{" "}
              {spec.required && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Length"
                value={dimensions.length}
                onChange={(e) =>
                  handleSpecificationChange(
                    spec.key,
                    {
                      ...dimensions,
                      length: e.target.value,
                    },
                    spec.type
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
              <input
                type="number"
                placeholder="Width"
                value={dimensions.width}
                onChange={(e) =>
                  handleSpecificationChange(
                    spec.key,
                    {
                      ...dimensions,
                      width: e.target.value,
                    },
                    spec.type
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
              <input
                type="number"
                placeholder="Height"
                value={dimensions.height}
                onChange={(e) =>
                  handleSpecificationChange(
                    spec.key,
                    {
                      ...dimensions,
                      height: e.target.value,
                    },
                    spec.type
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={spec.key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) =>
                handleSpecificationChange(spec.key, e.target.checked, spec.type)
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">{spec.label}</label>
          </div>
        );

      default:
        return null;
    }
  };

  const currentCategorySpec = categorySpecs[formData.category];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/vendor/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isEditing
                  ? "Update your product information"
                  : "Create a new product listing for your store"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-700">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Category</option>
                  {Object.entries(categorySpecs).map(([key, spec]) => (
                    <option key={key} value={key}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if no discount
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.stock ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0"
                    min="0"
                  />
                </div>
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge
                </label>
                <select
                  name="badge"
                  value={formData.badge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Badge</option>
                  {badges.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Describe your product in detail..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Category-Specific Specifications */}
          {currentCategorySpec && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <currentCategorySpec.icon
                  className={`h-6 w-6 ${currentCategorySpec.color} mr-3`}
                />
                <h2 className="text-xl font-bold text-gray-900">
                  {currentCategorySpec.name} Specifications
                </h2>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <p className="text-blue-800 text-sm">
                    {currentCategorySpec.guidelines}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentCategorySpec.specifications.map(
                  renderSpecificationField
                )}
              </div>
            </div>
          )}

          {/* Product Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Product Images
            </h2>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={imageUploading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {imageUploading ? "Uploading..." : "Click to upload images"}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG up to 10MB (Max 5 images)
                  </p>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.images.map((image, index) => {
                    const isMarkedForDeletion = image.markedForDeletion;

                    return (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-lg ${
                            isMarkedForDeletion ? "opacity-50" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            isMarkedForDeletion
                              ? restoreImage(index)
                              : handleImageRemove(index)
                          }
                          className={`absolute top-1 right-1 rounded-full p-1 ${
                            isMarkedForDeletion ? "bg-green-500" : "bg-red-500"
                          } text-white opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
                          {isMarkedForDeletion ? (
                            <RefreshCw className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>

                        {index === 0 && !isMarkedForDeletion && (
                          <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {errors.images && (
                <p className="text-red-500 text-xs">{errors.images}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tags & SEO</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    ref={tagInputRef}
                    type="text"
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleTagAdd(e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleTagAdd(tagInputRef.current.value.trim());
                      tagInputRef.current.value = "";
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SEO meta description"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Product Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subcategory"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/vendor/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {isEditing ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
