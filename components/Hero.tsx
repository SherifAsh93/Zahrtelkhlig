import React from "react";
import { useStore } from "../context/StoreContext";

export const Hero: React.FC = () => {
  const { t, language } = useStore();

  return (
    <div className="relative h-[85vh] md:h-[80vh] min-h-[500px] bg-gray-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://res.cloudinary.com/dzppk5ylt/image/upload/v1765662876/img_1_sc8jbb.jpg"
          alt="Zahret El Khaleej Collection"
          className="w-full h-full object-cover object-center"
        />

        {/* Gradient Overlays for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent rtl:bg-gradient-to-l"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-start pt-16">
        <div className="max-w-2xl animate-fade-in-up">
          <span className="inline-block px-3 py-1 mb-4 text-[10px] md:text-xs font-bold tracking-widest text-primary-400 uppercase bg-black/40 backdrop-blur-sm rounded-full border border-primary-500/30">
            {language === "ar" ? "تشكيلة جديدة 2025" : "NEW COLLECTION 2025"}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-8 font-light leading-relaxed max-w-md md:max-w-none opacity-90">
            {t.heroSubtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
