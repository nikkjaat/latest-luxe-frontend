import React from "react";
import { Package } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products = [],
  loading = false,
  emptyMessage = "No products found",
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
          >
            <div className="w-full h-64 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Products Found
        </h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const gridClasses = `grid gap-6 ${
    columns.sm ? `grid-cols-${columns.sm}` : "grid-cols-1"
  } ${columns.md ? `md:grid-cols-${columns.md}` : "md:grid-cols-2"} ${
    columns.lg ? `lg:grid-cols-${columns.lg}` : "lg:grid-cols-3"
  } ${columns.xl ? `xl:grid-cols-${columns.xl}` : "xl:grid-cols-4"}`;

  return (
    <div className={gridClasses}>
      {products.map((product) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          showQuickActions={true}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
