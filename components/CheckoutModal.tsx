import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabaseClient';

// --- INLINE SVGs ---
const IconX = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconCheckCircle = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

// --- CSS SPINNER ---
const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    t, 
    clearCart,
    language,
    user
  } = useStore();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: ''
  });

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user && isCheckoutOpen) {
        setFormData({
            name: user.full_name || '',
            phone: user.phone || '',
            email: user.email || '',
            address: user.address || '',
            city: user.city || ''
        });
    }
  }, [user, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // --- 1. HANDLE CLIENT DATA (Legacy/Public Table) ---
      const clientData = {
        name: formData.name,
        phone: formData.phone,
        address: `${formData.city}, ${formData.address}`,
      };

      const { error: clientError } = await supabase
          .from('Clients')
          .insert([clientData])
          .select();

      if (clientError) console.warn("Legacy Client insert warning:", clientError.message);

      // --- 2. CREATE ORDER ---
      const orderData = {
        total_amount: Math.round(total), 
        status: 'pending',
        payment_method: 'COD',
        shipping_address: `${formData.city}, ${formData.address}`,
        customer_name: formData.name,
        phone: formData.phone,
        items: cart,
        user_id: user ? user.id : null // LINK THE ORDER TO THE USER ACCOUNT
      };

      const { error: insertError } = await supabase
        .from('Orders')
        .insert([orderData]);

      if (insertError) throw insertError;

      setIsSuccess(true);
      setTimeout(() => {
          clearCart();
      }, 500);
    } catch (err: any) {
      console.error('Order creation failed:', err);
      // SPECIFIC HELP FOR DATABASE ERROR
      if (err.message && err.message.includes('user_id')) {
          alert("SYSTEM ERROR: Database missing 'user_id' column.\n\nPlease go to Admin Panel -> Fix Database to run the update script.");
      }
      setError(err.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setIsSuccess(false);
    setError(null);
    if (!user) {
        setFormData({ name: '', phone: '', email: '', address: '', city: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl font-bold">{t.checkout}</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-12">
              <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.successOrder}</h3>
              <p className="text-gray-500 mb-8">
                 {user ? "You can track this order in your profile." : "Thank you for shopping with Zahrtelkhlig!"}
              </p>
              <button 
                onClick={handleClose}
                className="bg-gray-900 dark:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium w-full md:w-auto"
              >
                {t.close}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-xl text-sm mb-4 bg-red-50 border border-red-200 text-red-700 flex gap-3 items-start">
                  <div className="bg-red-100 p-1 rounded-full"><IconX className="w-3 h-3 text-red-700" /></div>
                  <div>
                    <p className="font-bold">Order Failed</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.name}</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.phone}</label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.city}</label>
                  <input 
                    required
                    type="text" 
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.address}</label>
                  <input 
                    required
                    type="text" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 mt-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t.total}</span>
                  <span className="text-primary-600 flex items-baseline gap-1">
                    {language === 'ar' ? (
                        <>{total} <span className="text-sm">{t.currency}</span></>
                    ) : (
                        <><span className="text-sm">{t.currency}</span> {total}</>
                    )}
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all mt-4 flex justify-center items-center gap-2 active:scale-95 transform"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Processing...
                  </>
                ) : t.placeOrder}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};