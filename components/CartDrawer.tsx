import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    t, 
    language,
    setIsCheckoutOpen,
    user,
    setIsAuthModalOpen
  } = useStore();

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
      if (!user) {
          setIsCartOpen(false);
          setIsAuthModalOpen(true);
          // Optional: You could show a small toast here if you had a toast system
          alert("Please login or create an account to complete your purchase."); 
          return;
      }
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 ${language === 'ar' ? 'left-0' : 'right-0'} h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold">{t.cart} <span className="text-sm font-normal text-gray-500">({cart.length})</span></h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>{t.emptyCart}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <img src={item.image} alt={item.nameEn} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {language === 'ar' ? item.nameAr : item.nameEn}
                  </h3>
                  <p className="text-primary-600 font-bold mt-1 flex items-baseline gap-1">
                     {language === 'ar' ? (
                       <>{item.price * item.quantity} <span className="text-xs">{t.currency}</span></>
                     ) : (
                       <><span className="text-xs">{t.currency}</span> {item.price * item.quantity}</>
                     )}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:text-red-500 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:text-green-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span>{t.total}</span>
              <span className="flex items-baseline gap-1">
                 {language === 'ar' ? (
                    <>{total} <span className="text-sm">{t.currency}</span></>
                 ) : (
                    <><span className="text-sm">{t.currency}</span> {total}</>
                 )}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all"
            >
              {t.checkout}
            </button>
          </div>
        )}
      </div>
    </>
  );
};