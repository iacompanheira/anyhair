import React from 'react';
import ServiceCard from './ServiceCard';
import { useAppContext } from '../../contexts/AppContext';
import type { Service } from '../../types';

interface ServicesListProps {
  onBookNowClick: (service: Service) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ onBookNowClick }) => {
  const { services, branding, favoriteServiceIds, setFavoriteServiceIds } = useAppContext();

  const visibleServices = services.filter(service => service.isEssential);

  const titleStyle: React.CSSProperties = {
    fontSize: `${branding.layout.sectionTitle.fontSize}px`,
    fontWeight: branding.layout.sectionTitle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.layout.sectionTitle.fontStyle,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: `${branding.layout.sectionSubtitle.fontSize}px`,
    fontWeight: branding.layout.sectionSubtitle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.layout.sectionSubtitle.fontStyle,
  };

  const handleToggleFavorite = (serviceId: number) => {
    setFavoriteServiceIds(prevIds =>
      prevIds.includes(serviceId)
        ? prevIds.filter(id => id !== serviceId)
        : [...prevIds, serviceId]
    );
  };

  return (
    <section id="services" className="bg-brand-light py-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-brand-dark" style={titleStyle}>Principais Serviços</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto" style={subtitleStyle}>Conheça nossos serviços mais procurados e agende seu momento de cuidado.</p>
          <div className="mt-4 w-24 h-1 bg-brand-primary mx-auto rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-layout-gap">
          {visibleServices.map(service => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onBookNowClick={onBookNowClick}
              onToggleFavorite={handleToggleFavorite}
              isFavorited={favoriteServiceIds.includes(service.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesList;