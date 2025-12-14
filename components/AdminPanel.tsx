import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useStore } from "../context/StoreContext";
import { Order, Client } from "../types";

// --- INLINE SVGs (Zero Dependency) ---
const IconShield = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const IconMenu = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);
const IconCart = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);
const IconUsers = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconPlus = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
const IconLogOut = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
const IconSave = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const IconCheck = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconX = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const IconArrowLeft = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);
const IconPhone = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconMapPin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconTrash = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
const IconImage = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);
const IconEdit = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
const IconBox = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// --- CSS SPINNER ---
const Spinner = () => (
  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
);

export const AdminPanel: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    fetchProducts: refreshStoreProducts,
  } = useStore();

  // -- Authentication State --
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  // -- Dashboard State --
  const [currentView, setCurrentView] = useState<
    "add_product" | "view_orders" | "view_clients" | "view_products"
  >("view_orders");

  // -- Data State --
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // -- Details & Editing State --
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeClient, setActiveClient] = useState<{
    client: Client | any;
    history: Order[];
  } | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // -- Client Editing State --
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [isSavingClient, setIsSavingClient] = useState(false);

  // -- Product Form State --
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editTargetCode, setEditTargetCode] = useState<number | null>(null);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [productForm, setProductForm] = useState({
    code: "",
    name: "",
    price: "",
    quantity: "",
    size: "",
    colour: "",
    images: "",
  });

  // --- FETCH DATA ---
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("Orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from("Clients")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Supabase Clients Error:", error);
      } else {
        setClients(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchAdminProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("Products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdminProducts(data || []);
    } catch (err) {
      console.error(err);
      // Fallback to prevent blank screen if fetch fails drastically
      setAdminProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // --- ACTIONS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "114891") {
      setIsAuthenticated(true);
      setAuthError(false);
      fetchOrders();
      fetchClients();
      fetchAdminProducts();
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    setIsAdminOpen(false);
    setSelectedOrder(null);
    setActiveClient(null);
  };

  // --- ORDER MANAGEMENT ---
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSavingOrder(true);

    try {
      const { error } = await supabase
        .from("Orders")
        .update({
          status: selectedOrder.status,
          customer_name: selectedOrder.customer_name,
          phone: selectedOrder.phone,
          shipping_address: selectedOrder.shipping_address,
          total_amount: selectedOrder.total_amount,
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      // Update local state list
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? selectedOrder : o))
      );
      alert("Order updated successfully!");
    } catch (err: any) {
      alert("Failed to update order: " + err.message);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This cannot be undone."
      )
    )
      return;

    try {
      const { error } = await supabase.from("Orders").delete().eq("id", id);
      if (error) throw error;

      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelectedOrder(null);
    } catch (err: any) {
      alert("Failed to delete order: " + err.message);
    }
  };

  // --- CLIENT PROFILE ---
  const openClientProfile = (
    phone: string | undefined,
    nameFallback: string
  ) => {
    if (!phone) return;

    const existingClient = clients.find((c) => c.phone === phone);
    const history = orders.filter((o) => o.phone === phone);

    const clientData = existingClient || {
      id: 0,
      name: nameFallback,
      phone: phone,
      address: "Unknown",
    };

    setActiveClient({
      client: clientData,
      history: history,
    });
    // Initialize form
    setClientForm({
      name: clientData.name,
      phone: clientData.phone,
      address: clientData.address,
    });
    setIsEditingClient(false);
  };

  const handleUpdateClient = async () => {
    if (!activeClient || !activeClient.client.id) return;
    setIsSavingClient(true);

    try {
      const { error } = await supabase
        .from("Clients")
        .update({
          name: clientForm.name,
          phone: clientForm.phone,
          address: clientForm.address,
        })
        .eq("id", activeClient.client.id);

      if (error) throw error;

      // Update local state
      const updatedClient = { ...activeClient.client, ...clientForm };
      setActiveClient({ ...activeClient, client: updatedClient });
      setClients((prev) =>
        prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
      );

      setIsEditingClient(false);
      alert("Client info updated!");
    } catch (err: any) {
      alert("Failed to update client: " + err.message);
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!activeClient || !activeClient.client.id) return;
    if (
      !window.confirm(
        `Are you sure you want to delete client "${activeClient.client.name}"? This will NOT delete their past orders, but will remove them from the registry.`
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("Clients")
        .delete()
        .eq("id", activeClient.client.id);
      if (error) throw error;

      // Remove from local list
      setClients((prev) => prev.filter((c) => c.id !== activeClient.client.id));
      setActiveClient(null);
    } catch (err: any) {
      alert("Failed to delete client: " + err.message);
    }
  };

  // --- PRODUCT MANAGEMENT ---
  const handleEditProductClick = (product: any) => {
    setProductForm({
      code: product.code,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      size: product.size,
      colour: product.colour,
      images: product.images,
    });
    setEditTargetCode(product.code);
    setIsEditingProduct(true);
    setCurrentView("add_product"); // Reuse the form view
  };

  const handleDeleteProduct = async (code: number) => {
    if (
      !window.confirm(
        "Are you sure? This will remove the product from the store permanently."
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("Products")
        .delete()
        .eq("code", code);
      if (error) throw error;
      setAdminProducts((prev) => prev.filter((p) => p.code !== code));
      refreshStoreProducts();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    // Convert newlines to commas for multiple images
    const processedImages = productForm.images.replace(/\n/g, ",");

    try {
      if (isEditingProduct && editTargetCode) {
        // UPDATE
        const { error } = await supabase
          .from("Products")
          .update({
            name: productForm.name,
            price: parseFloat(productForm.price),
            quantity: parseInt(productForm.quantity) || 0,
            size: productForm.size,
            colour: productForm.colour,
            images: processedImages,
          })
          .eq("code", editTargetCode);

        if (error) throw error;
        setFormMessage({
          type: "success",
          text: "Product updated successfully!",
        });
      } else {
        // INSERT
        const { error } = await supabase.from("Products").insert([
          {
            code: parseInt(productForm.code) || Date.now(),
            name: productForm.name,
            price: parseFloat(productForm.price),
            quantity: parseInt(productForm.quantity) || 0,
            size: productForm.size,
            colour: productForm.colour,
            images: processedImages,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
        setFormMessage({
          type: "success",
          text: "Product added successfully!",
        });
      }

      // Refresh Data
      refreshStoreProducts();
      fetchAdminProducts();

      // Reset form if editing, after a short delay
      if (isEditingProduct) {
        setTimeout(() => {
          setCurrentView("view_products");
          setProductForm({
            code: "",
            name: "",
            price: "",
            quantity: "",
            size: "",
            colour: "",
            images: "",
          });
          setIsEditingProduct(false);
          setEditTargetCode(null);
        }, 1500);
      } else {
        // If adding, just clear form
        setProductForm({
          code: "",
          name: "",
          price: "",
          quantity: "",
          size: "",
          colour: "",
          images: "",
        });
      }
    } catch (error: any) {
      setFormMessage({
        type: "error",
        text: error.message || "Failed to save product",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      code: "",
      name: "",
      price: "",
      quantity: "",
      size: "",
      colour: "",
      images: "",
    });
    setIsEditingProduct(false);
    setEditTargetCode(null);
    setFormMessage(null);
  };

  const copyFixScript = () => {
    const sql = `
-- 1. Create Profiles Table (Linked to Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null,
  email text,
  full_name text,
  phone text,
  address text,
  city text,
  primary key (id)
);
alter table profiles enable row level security;
drop policy if exists "Public profiles" on profiles;
create policy "Public profiles" on profiles for all using (true) with check (true);

-- 2. Update Orders Table (ADD user_id if missing)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='Orders' and column_name='user_id') then
    alter table "Orders" add column user_id uuid references auth.users(id);
  end if;
end $$;

-- 3. PERMISSIONS (CRITICAL: Allows Updates/Deletes)
-- Orders
alter table "Orders" enable row level security;
drop policy if exists "Enable access for all" on "Orders";
create policy "Enable access for all" on "Orders" for all using (true) with check (true);

-- Clients
alter table "Clients" enable row level security;
drop policy if exists "Enable access for all" on "Clients";
create policy "Enable access for all" on "Clients" for all using (true) with check (true);

-- Products
alter table "Products" enable row level security;
drop policy if exists "Enable access for all" on "Products";
create policy "Enable access for all" on "Products" for all using (true) with check (true);
    `;
    navigator.clipboard.writeText(sql);
    alert(
      "UPDATED SQL copied to clipboard!\n\n1. Go to Supabase -> SQL Editor\n2. Paste this script\n3. Click RUN to fix Permissions for Products & Orders."
    );
  };

  // --- EFFECT HOOKS ---
  useEffect(() => {
    if (isAuthenticated) {
      if (currentView === "view_orders") fetchOrders();
      if (currentView === "view_clients") {
        fetchClients();
        fetchOrders();
      }
      if (currentView === "view_products") fetchAdminProducts();
    }
  }, [currentView, isAuthenticated]);

  if (!isAdminOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-2xl animate-scale-in">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-100 p-4 rounded-full">
              <IconShield className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Admin Access
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Enter security key to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Security Key"
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center text-lg tracking-widest focus:ring-2 focus:ring-primary-500 outline-none"
                autoFocus
              />
              {authError && (
                <p className="text-red-500 text-sm text-center mt-2 font-bold">
                  Incorrect Security Key
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-600/20"
            >
              Unlock Dashboard
            </button>
          </form>

          <button
            onClick={() => setIsAdminOpen(false)}
            className="w-full mt-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
          >
            Cancel & Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <IconMenu className="w-6 h-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h1>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => {
              setCurrentView("view_orders");
              setSelectedOrder(null);
              setActiveClient(null);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${
              currentView === "view_orders" && !selectedOrder && !activeClient
                ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <IconCart className="w-5 h-5" />
            <span>Orders</span>
          </button>

          <button
            onClick={() => {
              setCurrentView("view_clients");
              setSelectedOrder(null);
              setActiveClient(null);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${
              currentView === "view_clients" && !activeClient
                ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <IconUsers className="w-5 h-5" />
            <span>Clients</span>
          </button>

          <button
            onClick={() => {
              setCurrentView("view_products");
              setSelectedOrder(null);
              setActiveClient(null);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${
              currentView === "view_products"
                ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <IconBox className="w-5 h-5" />
            <span>All Products</span>
          </button>

          <hr className="my-4 border-gray-100 dark:border-gray-700" />

          <button
            onClick={copyFixScript}
            className="w-full flex items-center gap-3 p-3 rounded-xl font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 transition-colors text-sm"
          >
            <IconShield className="w-4 h-4" />
            Fix Database
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
          >
            <IconLogOut className="w-5 h-5" />
            <span>Logout & Close</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* --- VIEW: ORDERS LIST --- */}
          {currentView === "view_orders" && !selectedOrder && !activeClient && (
            <div className="space-y-6 animate-fade-in-up">
              <header className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Customer Orders
                  </h2>
                  <p className="text-gray-500">
                    Click on any order to view details and edit.
                  </p>
                </div>
                <button
                  onClick={fetchOrders}
                  className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Refresh
                </button>
              </header>

              {loadingOrders ? (
                <div className="text-center py-12">
                  <Spinner />
                  <p className="text-gray-500 mt-2">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                  <IconCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    No Orders Yet
                  </h3>
                  <p className="text-gray-500">
                    Orders placed by customers will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            ID
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Customer
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Total
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {orders.map((order) => (
                          <tr
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group"
                          >
                            <td className="p-4 font-mono text-sm text-gray-500">
                              #{order.id}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openClientProfile(
                                    order.phone,
                                    order.customer_name || "N/A"
                                  );
                                }}
                                className="font-bold text-gray-900 dark:text-white hover:text-primary-600 hover:underline text-left"
                              >
                                {order.customer_name || "N/A"}
                              </button>
                              <p className="text-xs text-gray-500">
                                {order.phone}
                              </p>
                            </td>
                            <td className="p-4 font-bold text-primary-600">
                              {order.total_amount} EGP
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-bold rounded-full capitalize
                                ${
                                  order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                View Details &rarr;
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- VIEW: CLIENTS LIST --- */}
          {currentView === "view_clients" && !activeClient && (
            <div className="space-y-6 animate-fade-in-up">
              <header className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Registered Clients
                  </h2>
                  <p className="text-gray-500">
                    List of all customers who have placed orders.
                  </p>
                </div>
                <button
                  onClick={() => {
                    fetchClients();
                    fetchOrders();
                  }}
                  className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Refresh
                </button>
              </header>

              {loadingClients ? (
                <div className="text-center py-12">
                  <Spinner />
                  <p className="text-gray-500 mt-2">Loading clients...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                  <IconUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    No Clients Yet
                  </h3>
                  <p className="text-gray-500">
                    Customers will appear here after checkout.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            ID
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Phone
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Address
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            History
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {clients.map((client) => {
                          const orderCount = orders.filter(
                            (o) => o.phone === client.phone
                          ).length;
                          return (
                            <tr
                              key={client.id}
                              onClick={() =>
                                openClientProfile(client.phone, client.name)
                              }
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group"
                            >
                              <td className="p-4 font-mono text-sm text-gray-500">
                                #{client.id}
                              </td>
                              <td className="p-4 font-bold text-gray-900 dark:text-white">
                                {client.name}
                              </td>
                              <td className="p-4 text-gray-500">
                                {client.phone}
                              </td>
                              <td className="p-4 text-gray-500 truncate max-w-xs">
                                {client.address}
                              </td>
                              <td className="p-4">
                                <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-md text-xs font-bold">
                                  {orderCount} Orders
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- VIEW: PRODUCTS LIST --- */}
          {currentView === "view_products" && (
            <div className="space-y-6 animate-fade-in-up">
              <header className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Store Inventory
                  </h2>
                  <p className="text-gray-500">
                    Manage all products available in your store.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchAdminProducts}
                    className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      resetProductForm();
                      setCurrentView("add_product");
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <IconPlus className="w-4 h-4" /> Add New
                  </button>
                </div>
              </header>

              {loadingProducts ? (
                <div className="text-center py-12">
                  <Spinner />
                </div>
              ) : adminProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No products found. Add one to get started.
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Image
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Code
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Stock
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {adminProducts.map((product, index) => {
                          // Robust Image Handling
                          let imgUrl = "";
                          try {
                            if (typeof product.images === "string") {
                              imgUrl = product.images.split(",")[0].trim();
                            } else if (Array.isArray(product.images)) {
                              imgUrl = product.images[0];
                            }
                          } catch (e) {
                            console.warn("Image rendering error", e);
                          }

                          return (
                            <tr
                              key={product.code || index}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                            >
                              <td className="p-4">
                                <img
                                  src={
                                    imgUrl || "https://via.placeholder.com/50"
                                  }
                                  alt="thumb"
                                  className="w-12 h-12 rounded object-cover bg-gray-100"
                                  onError={(e) =>
                                    (e.currentTarget.src =
                                      "https://via.placeholder.com/50")
                                  }
                                />
                              </td>
                              <td className="p-4 text-sm font-mono text-gray-500">
                                {product.code}
                              </td>
                              <td className="p-4 font-bold text-gray-900 dark:text-white">
                                {product.name}
                              </td>
                              <td className="p-4 font-bold text-primary-600">
                                {product.price}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                                    Number(product.quantity) > 5
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {product.quantity} units
                                </span>
                              </td>
                              <td className="p-4 flex gap-2">
                                <button
                                  onClick={() =>
                                    handleEditProductClick(product)
                                  }
                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <IconEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product.code)
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Delete Product"
                                >
                                  <IconTrash className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- VIEW: CLIENT DETAILS OVERLAY --- */}
          {activeClient && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setActiveClient(null)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <IconArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeClient.client.id
                      ? activeClient.client.name
                      : "Unregistered Client"}
                  </h2>
                  <p className="text-gray-500">{activeClient.client.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Card - EDITABLE */}
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase">
                      Contact Info
                    </h3>
                    {activeClient.client.id && (
                      <button
                        onClick={() => setIsEditingClient(!isEditingClient)}
                        className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-2 rounded-lg transition-colors"
                      >
                        {isEditingClient ? (
                          "Cancel"
                        ) : (
                          <IconEdit className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {isEditingClient ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">
                          Name
                        </label>
                        <input
                          type="text"
                          value={clientForm.name}
                          onChange={(e) =>
                            setClientForm({
                              ...clientForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={clientForm.phone}
                          onChange={(e) =>
                            setClientForm({
                              ...clientForm,
                              phone: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">
                          Address
                        </label>
                        <textarea
                          rows={3}
                          value={clientForm.address}
                          onChange={(e) =>
                            setClientForm({
                              ...clientForm,
                              address: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                      <button
                        onClick={handleUpdateClient}
                        disabled={isSavingClient}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-lg text-sm flex justify-center gap-2"
                      >
                        {isSavingClient ? (
                          "Saving..."
                        ) : (
                          <>
                            <IconSave className="w-4 h-4" /> Save Details
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <IconUsers className="w-5 h-5 text-gray-400" />
                        <div className="overflow-hidden">
                          <p className="text-xs text-gray-500 uppercase font-bold">
                            Name
                          </p>
                          <p className="text-gray-900 dark:text-white truncate">
                            {activeClient.client.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <IconPhone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">
                            Phone
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {activeClient.client.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <IconMapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">
                            Address
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {activeClient.client.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <IconCart className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">
                            Total Orders
                          </p>
                          <p className="text-gray-900 dark:text-white text-xl font-bold">
                            {activeClient.history.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DELETE BUTTON */}
                  {activeClient.client.id && !isEditingClient && (
                    <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={handleDeleteClient}
                        className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100"
                      >
                        <IconTrash className="w-4 h-4" />
                        Delete Client
                      </button>
                    </div>
                  )}
                </div>

                {/* History List */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Order History
                    </h3>
                  </div>
                  {activeClient.history.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No order history found.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {activeClient.history.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 flex justify-between items-center cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-bold text-primary-600">
                                #{order.id}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full capitalize
                                                    ${
                                                      order.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : order.status ===
                                                          "delivered"
                                                        ? "bg-green-100 text-green-800"
                                                        : order.status ===
                                                          "cancelled"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {order.total_amount} EGP
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- VIEW: ADD/EDIT PRODUCT FORM --- */}
          {currentView === "add_product" && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <header className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditingProduct
                      ? `Edit Product #${editTargetCode}`
                      : "Add New Product"}
                  </h2>
                  <p className="text-gray-500">
                    {isEditingProduct
                      ? "Update product details below."
                      : "Create a new product listing in the store."}
                  </p>
                </div>
                {isEditingProduct && (
                  <button
                    onClick={() => {
                      setCurrentView("view_products");
                      resetProductForm();
                    }}
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </header>

              <form
                onSubmit={handleProductSubmit}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5"
              >
                {formMessage && (
                  <div
                    className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                      formMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {formMessage.type === "success" ? (
                      <IconCheck className="w-5 h-5" />
                    ) : (
                      <IconX className="w-5 h-5" />
                    )}
                    {formMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Product Code
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.code}
                      onChange={(e) =>
                        setProductForm({ ...productForm, code: e.target.value })
                      }
                      disabled={isEditingProduct} // PK cannot be edited
                      className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none ${
                        isEditingProduct ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="e.g. 1001"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Price (EGP)
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Product Name (English/Arabic)
                  </label>
                  <input
                    required
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Premium Abaya Black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={productForm.quantity}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          quantity: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Size
                    </label>
                    <input
                      type="text"
                      value={productForm.size}
                      onChange={(e) =>
                        setProductForm({ ...productForm, size: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="M, L, XL"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Color
                    </label>
                    <input
                      type="text"
                      value={productForm.colour}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          colour: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Black"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Image URLs (Gallery)
                  </label>
                  <div className="relative">
                    <IconImage className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      required
                      rows={4}
                      value={productForm.images}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          images: e.target.value,
                        })
                      }
                      className="w-full pl-10 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Paste multiple URLs. Press Enter or use commas to separate
                    images.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-600/20 transition-all flex justify-center items-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : isEditingProduct ? (
                    <>
                      <IconSave className="w-5 h-5" /> Save Changes
                    </>
                  ) : (
                    <>
                      <IconPlus className="w-5 h-5" /> Add Product to Store
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* --- VIEW: ORDER DETAILS (EDIT MODE) --- */}
          {selectedOrder && (
            <div className="space-y-6 animate-fade-in-up pb-10">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <IconArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order #{selectedOrder.id}
                </h2>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full capitalize
                    ${
                      selectedOrder.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedOrder.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : selectedOrder.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Items List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items &&
                      Array.isArray(selectedOrder.items) ? (
                        selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <img
                              src={item.image}
                              alt={item.nameEn}
                              className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "https://via.placeholder.com/150")
                              }
                            />
                            <div className="flex-grow">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {item.nameEn}
                              </p>
                              <p className="text-sm text-gray-500">
                                Size:{" "}
                                {item.descriptionEn?.split(",")[0] || "N/A"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {item.quantity} x {item.price}
                              </p>
                              <p className="font-bold text-primary-600">
                                {item.quantity * item.price} EGP
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">
                          No items data available.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                    <div className="text-red-800 dark:text-red-200 text-sm">
                      <span className="font-bold">Danger Zone:</span> This
                      action cannot be undone.
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(selectedOrder.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm bg-white dark:bg-red-900/40 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50"
                    >
                      <IconTrash className="w-4 h-4" /> Delete Order
                    </button>
                  </div>
                </div>

                {/* RIGHT: Edit Form */}
                <div className="lg:col-span-1 space-y-6">
                  <form
                    onSubmit={handleUpdateOrder}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4"
                  >
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <IconMenu className="w-5 h-5 text-primary-600" />
                      Order Details
                    </h3>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Status
                      </label>
                      <select
                        value={selectedOrder.status || "pending"}
                        onChange={(e) =>
                          setSelectedOrder({
                            ...selectedOrder,
                            status: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Total Amount (EGP)
                      </label>
                      <input
                        type="number"
                        value={selectedOrder.total_amount}
                        onChange={(e) =>
                          setSelectedOrder({
                            ...selectedOrder,
                            total_amount: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <hr className="border-gray-100 dark:border-gray-700 my-2" />

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                        Customer Name
                        <button
                          type="button"
                          onClick={() =>
                            openClientProfile(
                              selectedOrder.phone,
                              selectedOrder.customer_name || ""
                            )
                          }
                          className="text-primary-600 hover:underline text-[10px] normal-case"
                        >
                          View Profile
                        </button>
                      </label>
                      <div className="relative">
                        <IconUsers className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={selectedOrder.customer_name || ""}
                          onChange={(e) =>
                            setSelectedOrder({
                              ...selectedOrder,
                              customer_name: e.target.value,
                            })
                          }
                          className="w-full pl-9 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Phone Number
                      </label>
                      <div className="relative">
                        <IconPhone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={selectedOrder.phone || ""}
                          onChange={(e) =>
                            setSelectedOrder({
                              ...selectedOrder,
                              phone: e.target.value,
                            })
                          }
                          className="w-full pl-9 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Shipping Address
                      </label>
                      <div className="relative">
                        <IconMapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <textarea
                          value={selectedOrder.shipping_address || ""}
                          onChange={(e) =>
                            setSelectedOrder({
                              ...selectedOrder,
                              shipping_address: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full pl-9 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingOrder}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingOrder ? (
                        "Saving..."
                      ) : (
                        <>
                          <IconSave className="w-4 h-4" /> Save Changes
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
