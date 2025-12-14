import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';

// Separate component to consume Context
const AppContent: React.FC = () => {
  const { language } = useStore();

  return (
    <div className={`font-${language === 'ar' ? 'cairo' : 'sans'}`}>
      {/* Main Page Layout (Header, Hero, Products, Footer) */}
      <Layout>
        <Hero />
        <main className="container mx-auto px-4 py-8">
          <ProductGrid />
        </main>
      </Layout>

      {/* Modals & Drawers - Rendered OUTSIDE Layout to prevent clipping on mobile */}
      <CartDrawer />
      <CheckoutModal />
      <ProductDetailsModal />
      <AdminPanel />
      <AuthModal />
      <UserProfile />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;