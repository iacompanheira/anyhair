


import React from 'react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import BottomNav from '../components/shared/BottomNav';
import type { Service } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface FeedScreenProps {
    onStaffAccessClick: () => void;
    onOpenBookingDrawer: (service?: Service) => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ onStaffAccessClick, onOpenBookingDrawer }) => {
  const { branding } = useAppContext();
  const pageTitleStyle: React.CSSProperties = {
    fontSize: `${branding.layout.pageTitle.fontSize}px`,
    fontWeight: branding.layout.pageTitle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.layout.pageTitle.fontStyle,
  };
  const feedItems = [
    { id: 1, type: 'Dica', title: '5 Dicas para Cabelos Cacheados no Verão', imageUrl: 'https://picsum.photos/seed/feed1/400/250' },
    { id: 2, type: 'Novidade', title: 'Nova Linha de Tratamento Antiqueda Chegou!', imageUrl: 'https://picsum.photos/seed/feed2/400/250' },
    { id: 3, type: 'Promoção', title: 'Combo Hidratação + Escova com 20% OFF', imageUrl: 'https://picsum.photos/seed/feed3/400/250' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header onStaffAccessClick={onStaffAccessClick} />
      <main className="flex-grow container mx-auto px-6 py-12">
        <h2 style={pageTitleStyle} className="text-brand-dark mb-8">Feed de Novidades</h2>
        <div className="space-y-8 max-w-2xl mx-auto">
          {feedItems.map(item => (
            <div key={item.id} className={`bg-white rounded-layout overflow-hidden ${branding.layout.cardShadow}`}>
              <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <span className="text-xs font-bold uppercase text-brand-primary">{item.type}</span>
                <h3 className="text-xl font-bold text-brand-dark mt-1">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
      <BottomNav onOpenBookingDrawer={onOpenBookingDrawer} />
    </div>
  );
};

export default FeedScreen;