import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import apiService from "../services/api";

const CategoryContext = createContext(undefined);

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategory must be used within an CategoryProvider");
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getDefaultCategories = useCallback(
    () => [
      {
        _id: "1",
        id: "women",
        name: "Women's Fashion",
        slug: "women",
        description: "Latest trends in women's clothing and accessories",
        image:
          "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600",
        isActive: true,
        productCount: 0,
        sortOrder: 1,
        subcategories: [
          "Dresses",
          "Tops",
          "Bottoms",
          "Outerwear",
          "Activewear",
        ],
      },
      {
        _id: "2",
        id: "men",
        name: "Men's Collection",
        slug: "men",
        description: "Premium men's fashion and accessories",
        image:
          "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600",
        isActive: true,
        productCount: 0,
        sortOrder: 2,
        subcategories: [
          "Shirts",
          "Suits",
          "Casual Wear",
          "Accessories",
          "Shoes",
        ],
      },
      {
        _id: "3",
        id: "accessories",
        name: "Accessories",
        slug: "accessories",
        description: "Complete your look with luxury accessories",
        image:
          "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=600",
        isActive: true,
        productCount: 0,
        sortOrder: 3,
        subcategories: ["Jewelry", "Bags", "Watches", "Sunglasses", "Scarves"],
      },
      {
        _id: "4",
        id: "home",
        name: "Home & Living",
        slug: "home",
        description: "Transform your space with elegant home decor",
        image:
          "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
        isActive: true,
        productCount: 0,
        sortOrder: 4,
        subcategories: [
          "Furniture",
          "Decor",
          "Lighting",
          "Textiles",
          "Kitchen",
        ],
      },
      {
        _id: "5",
        id: "electronics",
        name: "Electronics",
        slug: "electronics",
        description: "Latest technology and gadgets",
        image:
          "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600",
        isActive: true,
        productCount: 0,
        sortOrder: 5,
        subcategories: [
          "Smartphones",
          "Laptops",
          "Audio",
          "Smart Home",
          "Gaming",
        ],
      },
      {
        _id: "6",
        id: "beauty",
        name: "Beauty & Care",
        slug: "beauty",
        description: "Premium beauty products and personal care",
        image:
          "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=600",
        isActive: true,
        productCount: 0,
        sortOrder: 6,
        subcategories: [
          "Skincare",
          "Makeup",
          "Fragrance",
          "Hair Care",
          "Wellness",
        ],
      },
    ],
    []
  );

  const adminGetCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.adminGetCategories();
      if (response.success) {
        const formattedCategories = response.categories.map((category) => ({
          ...category,
          id: category._id,
        }));
        setCategories(formattedCategories);
        return { success: true, categories: formattedCategories };
      } else {
        throw new Error("Failed to fetch categories from API");
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Use default categories as fallback
      const defaultCategories = getDefaultCategories();
      setCategories(defaultCategories);
      return { success: true, categories: defaultCategories };
    } finally {
      setIsLoading(false);
    }
  }, [getDefaultCategories]);

  useEffect(() => {
    adminGetCategories();
  }, []); // Add adminGetCategories to dependency array

  const adminCreateCategory = useCallback(async (category) => {
    try {
      const response = await apiService.adminCreateCategory(category);
      if (!response.success) {
        throw new Error(response.message || "Failed to create category");
      }
      // Format the new category with proper ID
      const newCategory = {
        ...response.data,
        id: response.data._id,
      };

      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }, []);

  const adminUpdateCategory = useCallback(async (categoryId, categoryData) => {
    try {
      const response = await apiService.adminUpdateCategory(
        categoryId,
        categoryData
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to update category");
      }

      console.log(response)

      // Format the updated category with proper ID
      const updatedCategory = {
        ...response.data,
        id: response.data._id,
      };

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId || cat._id === categoryId
            ? updatedCategory
            : cat
        )
      );
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }, []);

  const adminDeleteCategory = useCallback(async (categoryId) => {
    try {
      const response = await apiService.adminDeleteCategory(categoryId);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete category");
      }

      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryId && cat._id !== categoryId)
      );
      return response;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        adminCreateCategory,
        adminUpdateCategory,
        adminDeleteCategory,
        adminGetCategories,
        categories,
        isLoading,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
