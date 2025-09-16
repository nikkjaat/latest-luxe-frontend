import React, { useState } from "react";
import {
  X,
  Save,
  RefreshCw,
  Upload,
  Plus,
  Trash2,
  Eye,
  Edit,
} from "lucide-react";
import apiService from "../../services/api";
import { useProducts } from "../../context/ProductContext";
import { useNavigate } from "react-router-dom";

const EditProductModal = ({
  product,
  onClose,
  onUpdate,
  loading: parentLoading,
}) => {
  const [editFormData, setEditFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    brand: product?.brand || "",
    stock: product?.stock || "",
    images:
      product?.images?.map((img) => ({
        ...img,
        url: img.url || img.secure_url,
        markedForDeletion: false,
      })) || [],
    specifications: {
      weight: product?.specifications?.weight || "",
      dimensions: {
        length: product?.specifications?.dimensions?.length || "",
        width: product?.specifications?.dimensions?.width || "",
        height: product?.specifications?.dimensions?.height || "",
      },
      material: product?.specifications?.material || "",
      color: product?.specifications?.color || [],
      size: product?.specifications?.size || [],
    },
    tags: product?.tags || [],
    badge: product?.badge || "",
    status: product?.status || "active",
  });

  const [tempColor, setTempColor] = useState("");
  const [tempSize, setTempSize] = useState("");
  const [tempTag, setTempTag] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { updateProduct } = useProducts();

  const navigate = useNavigate();

  const categories = [
    "women",
    "men",
    "accessories",
    "home",
    "electronics",
    "beauty",
    "sports",
    "kids",
  ];

  const badges = [
    "Best Seller",
    "New Arrival",
    "Limited Edition",
    "Exclusive",
    "Trending",
    "Premium",
    "Sale",
  ];

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("specifications.")) {
      const fieldPath = name.split(".");
      setEditFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [fieldPath[1]]:
            fieldPath.length > 2
              ? {
                  ...prev.specifications[fieldPath[1]],
                  [fieldPath[2]]: value,
                }
              : value,
        },
      }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      publicId: "",
      alt: `Product image ${editFormData.images.length + 1}`,
    }));

    setEditFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5),
    }));
  };

  const toggleImageDeletion = (index) => {
    setEditFormData((prev) => {
      const newImages = [...prev.images];
      if (newImages[index].publicId) {
        newImages[index] = {
          ...newImages[index],
          markedForDeletion: !newImages[index].markedForDeletion,
        };
      } else {
        newImages.splice(index, 1);
      }
      return { ...prev, images: newImages };
    });
  };

  const addColor = () => {
    if (tempColor && !editFormData.specifications.color.includes(tempColor)) {
      setEditFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          color: [...prev.specifications.color, tempColor],
        },
      }));
      setTempColor("");
    }
  };

  const removeColor = (colorToRemove) => {
    setEditFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        color: prev.specifications.color.filter(
          (color) => color !== colorToRemove
        ),
      },
    }));
  };

  const addSize = () => {
    if (tempSize && !editFormData.specifications.size.includes(tempSize)) {
      setEditFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          size: [...prev.specifications.size, tempSize],
        },
      }));
      setTempSize("");
    }
  };

  const removeSize = (sizeToRemove) => {
    setEditFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        size: prev.specifications.size.filter((size) => size !== sizeToRemove),
      },
    }));
  };

  const addTag = () => {
    if (tempTag && !editFormData.tags.includes(tempTag)) {
      setEditFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tempTag],
      }));
      setTempTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setEditFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editFormData.name.trim()) newErrors.name = "Product name is required";
    if (!editFormData.description.trim())
      newErrors.description = "Description is required";
    if (!editFormData.price || parseFloat(editFormData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!editFormData.category) newErrors.category = "Category is required";
    if (!editFormData.stock || parseInt(editFormData.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (
      editFormData.images.filter((img) => !img.markedForDeletion).length === 0
    )
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      // Append all fields
      formDataToSend.append("name", editFormData.name);
      formDataToSend.append("description", editFormData.description);
      formDataToSend.append("price", Number(editFormData.price));
      formDataToSend.append("category", editFormData.category);
      formDataToSend.append("stock", Number(editFormData.stock));
      formDataToSend.append("subcategory", editFormData.subcategory);
      formDataToSend.append(
        "originalPrice",
        Number(editFormData.originalPrice || 0)
      );
      formDataToSend.append("brand", editFormData.brand || "");
      formDataToSend.append("badge", editFormData.badge || "");
      formDataToSend.append("status", editFormData.status || "active");

      // Handle specifications
      const specsToSend = {
        weight: editFormData.specifications.weight,
        dimensions: {
          length: editFormData.specifications.dimensions.length,
          width: editFormData.specifications.dimensions.width,
          height: editFormData.specifications.dimensions.height,
        },
        material: editFormData.specifications.material,
        color: editFormData.specifications.color,
        size: editFormData.specifications.size,
      };
      formDataToSend.append("specifications", JSON.stringify(specsToSend));

      // Handle tags
      formDataToSend.append("tags", JSON.stringify(editFormData.tags));

      // Handle images
      const keptImages = editFormData.images.filter(
        (img) => img.url && !img.markedForDeletion && img.publicId
      );
      const newImages = editFormData.images.filter(
        (img) => (img.file || img instanceof File) && !img.markedForDeletion
      );
      const deletedImages = editFormData.images.filter(
        (img) => img.markedForDeletion && img.publicId
      );

      if (keptImages.length > 0) {
        formDataToSend.append("keptImages", JSON.stringify(keptImages));
      }

      newImages.forEach((image) => {
        formDataToSend.append("images", image.file || image);
      });

      if (deletedImages.length > 0) {
        formDataToSend.append("deletedImages", JSON.stringify(deletedImages));
      }

      const response = await updateProduct(product._id, formDataToSend);
      if (response && response.success) {
        onUpdate();
        onClose();
      } else {
        throw new Error(response?.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      setErrors({ submit: error.message || "Failed to update product" });
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleUpdateProduct} className="p-6 space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
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
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={editFormData.description}
                  onChange={handleEditChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe your product"
                  maxLength="2000"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="subcategory"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subcategory
                </label>
                <input
                  type="text"
                  id="subcategory"
                  name="subcategory"
                  value={editFormData.subcategory}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subcategory"
                />
              </div>

              <div>
                <label
                  htmlFor="brand"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={editFormData.brand}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  min="0"
                  value={editFormData.stock}
                  onChange={handleEditChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="badge"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Badge
                </label>
                <select
                  id="badge"
                  name="badge"
                  value={editFormData.badge}
                  onChange={handleEditChange}
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
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={editFormData.price}
                    onChange={handleEditChange}
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
                <label
                  htmlFor="originalPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Original Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    min="0"
                    step="0.01"
                    value={editFormData.originalPrice}
                    onChange={handleEditChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  For showing discounts
                </p>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Product Images
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images * (Max 5 images)
                </label>
                <div className="text-sm text-gray-600">
                  <label htmlFor="images" className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600">
                        <span className="text-blue-600 hover:text-blue-700">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {errors.images && (
                  <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                )}
              </div>

              {editFormData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {editFormData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url || image.secure_url}
                        alt={image.alt}
                        className={`w-full h-24 object-cover rounded-lg ${
                          image.markedForDeletion
                            ? "opacity-50 border-2 border-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleImageDeletion(index)}
                        className={`absolute -top-2 -right-2 rounded-full p-1 ${
                          image.markedForDeletion
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white`}
                      >
                        {image.markedForDeletion ? (
                          <RefreshCw className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Specifications Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="specifications.weight"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="specifications.weight"
                  name="specifications.weight"
                  min="0"
                  step="0.01"
                  value={editFormData.specifications.weight}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (cm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      name="specifications.dimensions.length"
                      min="0"
                      step="0.1"
                      value={editFormData.specifications.dimensions.length}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Length"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="specifications.dimensions.width"
                      min="0"
                      step="0.1"
                      value={editFormData.specifications.dimensions.width}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Width"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="specifications.dimensions.height"
                      min="0"
                      step="0.1"
                      value={editFormData.specifications.dimensions.height}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Height"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="specifications.material"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Material
                </label>
                <input
                  type="text"
                  id="specifications.material"
                  name="specifications.material"
                  value={editFormData.specifications.material}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cotton, Wood, Metal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colors
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={tempColor}
                    onChange={(e) => setTempColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add color"
                    onKeyPress={(e) => e.key === "Enter" && addColor()}
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {editFormData.specifications.color.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editFormData.specifications.color.map((color, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sizes
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={tempSize}
                    onChange={(e) => setTempSize(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add size"
                    onKeyPress={(e) => e.key === "Enter" && addSize()}
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {editFormData.specifications.size.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editFormData.specifications.size.map((size, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="ml-1.5 inline-flex text-green-400 hover:text-green-600"
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

          {/* Tags Section */}
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
              {editFormData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {editFormData.tags.map((tag, index) => (
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
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Product Status
            </h2>

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
                    checked={editFormData.status === "active"}
                    onChange={handleEditChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={editFormData.status === "inactive"}
                    onChange={handleEditChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || parentLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
