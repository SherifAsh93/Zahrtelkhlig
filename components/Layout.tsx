import React from "react";
import { useStore } from "../context/StoreContext";
import {
  ShoppingCart,
  Moon,
  Sun,
  Languages,
  Facebook,
  Menu,
  X,
  ShieldCheck,
  User,
} from "lucide-react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    cart,
    setIsCartOpen,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    setIsAdminOpen,
    setIsAuthModalOpen,
    setIsProfileOpen,
    user,
    t,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleUserClick = () => {
    if (user) {
      setIsProfileOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-${
        language === "ar" ? "cairo" : "sans"
      }`}
    >
      {/* Header - Fixed with Backdrop Blur */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200/50 dark:border-gray-800/50 h-16 md:h-20 transition-all duration-300">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center h-full py-2">
            <img
              src="https://res.cloudinary.com/dzppk5ylt/image/upload/v1765546921/main_logo_q5crrg.jpg"
              alt="Zahrtelkhlig Logo"
              className="h-full w-auto object-contain mix-blend-multiply dark:mix-blend-normal rounded-lg"
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Languages className="w-5 h-5" />
              <span>{t.language}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-yellow-500 dark:text-blue-400"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Account Button */}
            <button
              onClick={handleUserClick}
              className={`p-2 rounded-full transition-colors flex items-center gap-2 ${
                user
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <User className="w-6 h-6" />
              {user && (
                <span className="text-sm font-bold max-w-[80px] truncate">
                  {user.full_name.split(" ")[0]}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-primary-600 dark:text-primary-400"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-primary-600 dark:text-primary-400"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Absolute Position */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl animate-fade-in-up md:hidden">
            <div className="flex flex-col p-4 space-y-3">
              {/* User Mobile Button */}
              <button
                onClick={() => {
                  handleUserClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium text-left"
              >
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <span>
                  {user ? `Profile: ${user.full_name}` : "Login / Register"}
                </span>
              </button>

              <button
                onClick={() => {
                  toggleLanguage();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg text-primary-600">
                  <Languages className="w-5 h-5" />
                </div>
                {t.language}
              </button>
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg text-yellow-500 dark:text-blue-400">
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </div>
                {theme === "dark" ? t.themeLight : t.themeDark}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content - No top padding so Hero can bleed behind header, but ensure elements are layered correctly */}
      <div className="flex-grow w-full overflow-x-hidden">{children}</div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              Zahrtelkhlig
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 All Rights Reserved
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <a
              href="https://www.facebook.com/zahrtelkhlig"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full"
            >
              <Facebook className="w-5 h-5" />
              <span className="font-medium">Facebook</span>
            </a>

            {/* Admin Link */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-sm font-medium border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full hover:border-primary-600"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
