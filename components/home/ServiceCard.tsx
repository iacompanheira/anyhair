import React from 'react';
import type { Service } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/formatters';

interface ServiceCardProps {
  service: Service;
  onBookNowClick: (service: Service) => void;
  onToggleFavorite: (serviceId: number) => void;
  isFavorited: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBookNowClick, onToggleFavorite, isFavorited }) => {
  const { branding } = useAppContext();

  const titleStyle: React.CSSProperties = {
    fontSize: `${branding.layout.cardTitle.fontSize}px`,
    fontWeight: branding.layout.cardTitle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.layout.cardTitle.fontStyle,
  };
  const bodyStyle: React.CSSProperties = {
    fontSize: `${branding.layout.cardBody.fontSize}px`,
    fontWeight: branding.layout.cardBody.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.layout.cardBody.fontStyle,
  };
  const priceStyle: React.CSSProperties = {
    fontSize: `${branding.layout.cardPrice.fontSize}px`,
    fontWeight: branding.layout.cardPrice.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.layout.cardPrice.fontStyle,
  };

  const priceAsNumber = parseFloat(service.price.replace('R$', '').replace(',', '.'));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(service.id);
  };

  return (
    <div className={`bg-white rounded-layout overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out ${branding.layout.cardShadow}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:opacity-100 opacity-70 transition-all z-10 transform hover:scale-110"
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorited}
        >
          <i className={`${isFavorited ? 'fas fa-heart text-brand-primary' : 'far fa-heart text-white'}`}></i>
        </button>

        {service.icon && (
          <div className="absolute top-4 right-4 w-12 h-12 bg-brand-primary/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <i className={`${service.icon} text-white text-2xl`}></i>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-brand-primary mb-2" style={titleStyle}>
            {service.name}
        </h3>
        <p className="text-gray-600 mb-4 flex-grow" style={bodyStyle}>{service.description}</p>
        <div className="flex justify-between items-center text-brand-dark mt-auto" style={priceStyle}>
          {service.isPriceHidden ? (
            <span className="text-brand-accent font-semibold">Consulte</span>
          ) : (
            <span>{formatCurrency(priceAsNumber)}</span>
          )}
          <span className="text-gray-500">{service.duration}</span>
        </div>
      </div>
       <button onClick={() => onBookNowClick(service)} className="w-full bg-brand-primary text-white font-sans py-3 px-4 border-2 border-transparent hover:bg-white hover:text-brand-primary hover:border-brand-primary transition-all duration-300 ease-in-out btn-text-layout">
          Agendar
        </button>
    </div>
  );
};

export default ServiceCard;