import React from "react";
import { useStore } from "../context/StoreContext";
import { ProductCard } from "./ProductCard";
import { Loader, ShoppingBag } from "lucide-react";

export const ProductGrid: React.FC = () => {
  const { products, isLoading, language } = useStore();

  return (
    <div className="space-y-6 md:space-y-8 min-h-[50vh]">
      {/* Title Section (Replaces Filter Bar) */}
      <div className="pt-4 md:pt-8 pb-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white px-2">
          {language === "ar" ? "أحدث المنتجات" : "Latest Products"}
        </h2>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader className="w-10 h-10 animate-spin mb-4 text-primary-600" />
          <p>Loading latest products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">No products found.</p>
          <p className="text-sm">
            Use the Admin Panel to add your first product.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
