import React from 'react';
import type { Product } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { branding } = useAppContext();
  const { store } = branding;

  const titleStyle: React.CSSProperties = {
    fontSize: `${store.cardTitle.fontSize}px`,
    fontWeight: store.cardTitle.fontWeight as React.CSSProperties['fontWeight'],
    color: store.colors.titleColor,
  };
  const bodyStyle: React.CSSProperties = {
    fontSize: `${store.cardDescription.fontSize}px`,
    fontWeight: store.cardDescription.fontWeight as React.CSSProperties['fontWeight'],
  };
  const priceStyle: React.CSSProperties = {
    fontSize: `${store.cardPrice.fontSize}px`,
    fontWeight: store.cardPrice.fontWeight as React.CSSProperties['fontWeight'],
    color: store.colors.priceColor,
  };
  const buttonTextStyle: React.CSSProperties = {
    fontSize: `${store.cardButtonText.fontSize}px`,
    fontWeight: store.cardButtonText.fontWeight as React.CSSProperties['fontWeight'],
  }

  const buttonId = `product-card-button-${product.id}`;

  return (
    <div className={`rounded-layout overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out ${branding.layout.cardShadow}`} style={{ backgroundColor: store.colors.cardBg }}>
      <style>
        {`
            #${buttonId} {
                background-color: ${store.colors.buttonBg};
                color: ${store.colors.buttonTextColor};
                border: 1px solid transparent;
                transition: all 0.2s;
            }
            #${buttonId}:hover {
                background-color: ${store.colors.buttonHoverBg};
                color: ${store.colors.buttonHoverTextColor};
                border-color: ${store.colors.buttonHoverTextColor};
            }
        `}
      </style>
      <div className="relative aspect-square overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="mb-2" style={titleStyle}>
            {product.name}
        </h3>
        <p className="text-gray-600 mb-4 flex-grow" style={bodyStyle}>{product.description}</p>
        <div className="mt-auto" style={priceStyle}>
            {product.promotionalPrice && product.promotionalPrice < product.price ? (
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold" style={{color: store.colors.titleColor}}>{formatCurrency(product.promotionalPrice)}</span>
                    <span className="text-base text-gray-400 line-through">{formatCurrency(product.price)}</span>
                </div>
            ) : (
                <span className="text-xl font-bold">{formatCurrency(product.price)}</span>
            )}
        </div>
      </div>
       <button 
        id={buttonId}
        onClick={() => alert(`Adicionando ${product.name} ao carrinho!`)} 
        style={buttonTextStyle}
        className="w-full font-sans py-3 px-4"
       >
          Adicionar ao Carrinho
        </button>
    </div>
  );
};

export default ProductCard;