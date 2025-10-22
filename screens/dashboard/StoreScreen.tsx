import React from 'react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import BottomNav from '../components/shared/BottomNav';
import type { Service } from '../types';
import { useAppContext } from '../contexts/AppContext';
import ProductCard from '../components/store/ProductCard';

interface StoreScreenProps {
    onStaffAccessClick: () => void;
    onOpenBookingDrawer: (service?: Service) => void;
}

const StoreScreen: React.FC<StoreScreenProps> = ({ onStaffAccessClick, onOpenBookingDrawer }) => {
  const { branding, products } = useAppContext();
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${branding.store.sectionTitle.fontSize}px`,
    fontWeight: branding.store.sectionTitle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.store.sectionTitle.fontStyle,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: `${branding.store.sectionSubtitle.fontSize}px`,
    fontWeight: branding.store.sectionSubtitle.fontWeight as React.CSSProperties['fontWeight'],
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header onStaffAccessClick={onStaffAccessClick} />
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="text-center mb-12">
            <h2 className="text-brand-dark" style={sectionTitleStyle}>{branding.store.titleText}</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto" style={subtitleStyle}>
              {branding.store.subtitleText}
            </p>
            <div className="mt-4 w-24 h-1 bg-brand-primary mx-auto rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-layout-gap">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <Footer />
      <BottomNav onOpenBookingDrawer={onOpenBookingDrawer} />
    </div>
  );
};

export default StoreScreen;