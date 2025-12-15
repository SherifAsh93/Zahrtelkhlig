import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { useStore } from "../context/StoreContext";
import { Plus, Eye, Image as ImageIcon } from "lucide-react";

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { t, language, addToCart, setSelectedProduct } = useStore();
  const [imageError, setImageError] = useState(false);

  const name = language === "ar" ? product.nameAr : product.nameEn;

  // Reset error state if the product image url changes (e.g. reused component)
  useEffect(() => {
    setImageError(false);
  }, [product.image]);

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group bg-white dark:bg-gray-800 rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Image - Portrait Aspect Ratio (3:4) for Clothing using Padding Hack for Mobile Support */}
      <div className="relative w-full pt-[133.33%] bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image}
            alt={name}
            onError={() => setImageError(true)}
            className="absolute top-0 left-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600">
            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-xs font-medium opacity-50 uppercase tracking-widest">
              No Image
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
          <div className="bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4" />
            <span>{language === "ar" ? "نظرة سريعة" : "Quick View"}</span>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 bg-white text-gray-900 p-3 rounded-full shadow-lg z-20 hover:bg-primary-600 hover:text-white transition-colors"
          aria-label={t.addToCart}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
          {name}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          {/* Currency Layout Change: Handles Position based on Language */}
          <span className="text-lg font-bold text-gray-900 dark:text-white flex items-baseline gap-1">
            {language === "ar" ? (
              // Arabic: 350 SAR (Price then Currency)
              <>
                {product.price}{" "}
                <span className="text-xs font-normal text-gray-500">
                  {t.currency}
                </span>
              </>
            ) : (
              // English: SAR 350 (Currency then Price)
              <>
                <span className="text-xs font-normal text-gray-500">
                  {t.currency}
                </span>{" "}
                {product.price}
              </>
            )}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors uppercase tracking-wider"
          >
            {language === "ar" ? "إضافة" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};
