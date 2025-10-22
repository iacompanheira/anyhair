import React from 'react';
import type { Product } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { navigate } from '../../router';
import ProductCard from '../store/ProductCard';

interface FeaturedProductsProps {
  products: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  const { branding } = useAppContext();
  
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
    <section className="py-section" style={{ backgroundColor: branding.store.colors.sectionBg }}>
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-brand-dark" style={sectionTitleStyle}>
          {branding.store.titleText}
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto" style={subtitleStyle}>
          {branding.store.subtitleText}
        </p>
        <div className="mt-4 w-24 h-1 bg-brand-primary mx-auto rounded"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-layout-gap mt-12">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-12">
            <button 
                onClick={() => navigate('/store')}
                className="bg-brand-primary text-white font-sans py-3 px-8 rounded-full hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg btn-text-layout"
            >
                Ver todos os produtos
            </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;