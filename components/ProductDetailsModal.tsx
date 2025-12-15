import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import {
  X,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

export const ProductDetailsModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, t, language } =
    useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Reset state when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setFailedImages(new Set());
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const images =
    selectedProduct.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : [selectedProduct.image];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageError = (index: number) => {
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setSelectedProduct(null)}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl bg-white dark:bg-gray-900 md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-scale-in">
        {/* Close Button (Mobile) - Absolute on top of image */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 text-white rounded-full md:hidden backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Section */}
        <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-800 relative flex flex-col h-[40vh] md:h-auto shrink-0">
          {/* Main Image */}
          <div className="flex-grow relative overflow-hidden flex items-center justify-center">
            {!failedImages.has(activeImageIndex) ? (
              <img
                src={images[activeImageIndex]}
                alt="Product View"
                onError={() => handleImageError(activeImageIndex)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                <span className="text-sm">Image Unavailable</span>
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-gray-900 dark:text-white rounded-full shadow transition-all"
                >
                  <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-gray-900 dark:text-white rounded-full shadow transition-all"
                >
                  <ChevronRight className="w-6 h-6 rtl:rotate-180" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails (Desktop Only) */}
          {images.length > 1 && (
            <div className="hidden md:flex p-4 gap-4 justify-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 xl:w-20 xl:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all relative ${
                    activeImageIndex === idx
                      ? "border-primary-600 ring-2 ring-primary-600/20"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {!failedImages.has(idx) ? (
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      onError={() => handleImageError(idx)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Dots (Mobile Only) */}
          {images.length > 1 && (
            <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full shadow-sm ${
                    activeImageIndex === idx ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-5 md:p-10 flex flex-col h-full overflow-hidden">
          <div className="flex-grow overflow-y-auto pr-1">
            {/* Close Button (Desktop) */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="hidden md:block absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 leading-tight mt-2">
              {language === "ar"
                ? selectedProduct.nameAr
                : selectedProduct.nameEn}
            </h2>

            <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-baseline gap-2">
              {language === "ar" ? (
                <>
                  {selectedProduct.price}{" "}
                  <span className="text-sm md:text-base font-medium text-gray-500">
                    {t.currency}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm md:text-base font-medium text-gray-500">
                    {t.currency}
                  </span>{" "}
                  {selectedProduct.price}
                </>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8 text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white">
                {t.description}
              </h3>
              <p>
                {language === "ar"
                  ? selectedProduct.descriptionAr
                  : selectedProduct.descriptionEn}
              </p>
            </div>
          </div>

          <div className="pt-4 md:pt-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 md:py-4 px-8 rounded-xl font-bold text-base md:text-lg shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all flex items-center justify-center gap-3 transform active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              {t.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
