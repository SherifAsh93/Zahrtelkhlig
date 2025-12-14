import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, Product, Theme, Language, UserProfile } from "../types";
import { TRANSLATIONS } from "../data";
import { supabase } from "../supabaseClient";
import { Session } from "@supabase/supabase-js";

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;

  // UI State
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (isOpen: boolean) => void;

  // Admin State
  isAdminOpen: boolean;
  setIsAdminOpen: (isOpen: boolean) => void;

  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Theme & Lang
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  t: (typeof TRANSLATIONS)["en"];

  // Data Fetching
  fetchProducts: () => void;
  isLoading: boolean;

  // Auth State
  user: UserProfile | null;
  session: Session | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("zahrtelkhlig_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  // Language State
  const [language, setLanguage] = useState<Language>("en");

  // --- AUTH LOGIC ---
  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setUser(data as UserProfile);
      } else {
        // --- SELF HEALING LOGIC ---
        // If login succeeded but Profile row is missing (e.g. deleted manually),
        // we recreate it using the Auth metadata so the app doesn't break.
        console.warn(
          "Profile missing in DB. Attempting to restore from Auth..."
        );

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const newProfile = {
            id: authUser.id,
            email: authUser.email || "",
            full_name: authUser.user_metadata?.full_name || "Customer",
            phone: "",
            address: "",
            city: "",
          };

          // Insert the restored profile
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([newProfile]);

          if (!insertError) {
            console.log("Profile restored successfully.");
            setUser(newProfile);
          } else {
            console.error(
              "Failed to restore profile in DB:",
              insertError.message
            );
            // FALLBACK CRITICAL: Even if DB insert fails (e.g. RLS issues or table missing),
            // we MUST update the UI 'user' state so the app looks logged in.
            // We use the temporary profile object.
            setUser(newProfile);
          }
        }
      }
    } catch (err) {
      console.error(err);
      // Even on crash, try to set user from session if available
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser && !user) {
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          full_name: authUser.user_metadata?.full_name || "Customer",
          phone: "",
          address: "",
          city: "",
        });
      }
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchUserProfile(session.user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsProfileOpen(false);
  };

  // --- PRODUCT LOGIC ---
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("Products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error.message);
        return;
      }

      if (data) {
        const mappedProducts: Product[] = data.map((item: any) => {
          let gallery: string[] = [];
          if (item.images) {
            gallery = item.images.includes(",")
              ? item.images.split(",").map((url: string) => url.trim())
              : [item.images];
          }

          return {
            id: item.code,
            nameEn: item.name || "Unnamed Product",
            nameAr: item.name || "منتج غير مسمى",
            price: item.price || 0,
            category: "Collection",
            image:
              gallery[0] || "https://via.placeholder.com/400x500?text=No+Image",
            images:
              gallery.length > 0
                ? gallery
                : ["https://via.placeholder.com/400x500?text=No+Image"],
            descriptionEn: `Size: ${item.size || "N/A"}, Color: ${
              item.colour || "N/A"
            }. Quantity: ${item.quantity}`,
            descriptionAr: `المقاس: ${item.size || "غير متوفر"}، اللون: ${
              item.colour || "غير متوفر"
            }. الكمية: ${item.quantity}`,
          };
        });
        setProducts(mappedProducts);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Persist Cart
  useEffect(() => {
    localStorage.setItem("zahrtelkhlig_cart", JSON.stringify(cart));
  }, [cart]);

  // Handle Theme Side Effects
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Handle Language Side Effects
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const toggleLanguage = () =>
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));

  const t = TRANSLATIONS[language];

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileOpen,
        setIsProfileOpen,
        isAdminOpen,
        setIsAdminOpen,
        selectedProduct,
        setSelectedProduct,
        theme,
        toggleTheme,
        language,
        toggleLanguage,
        t,
        fetchProducts,
        isLoading,
        user,
        session,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
