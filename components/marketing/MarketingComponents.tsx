import React, { useState, useEffect } from 'react';
import type { Campaign, PromoText } from '../../types';

export const MarketingCard: React.FC<{ campaign: Campaign; isTextOverlayEnabled: boolean; }> = ({ campaign, isTextOverlayEnabled }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <div className="relative w-full h-48">
        <img src={campaign.imageUrl || 'https://picsum.photos/seed/promo/400/300'} alt={campaign.name} className="w-full h-full object-cover" />
        
        {isTextOverlayEnabled && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
            <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{campaign.name}</h3>
            <p className="text-white text-sm drop-shadow-md">{campaign.description}</p>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        {!isTextOverlayEnabled && (
            <>
                <h3 className="text-xl font-bold text-brand-primary mb-2">{campaign.name}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">{campaign.description}</p>
            </>
        )}
      </div>
    </div>
  );
};

export const CampaignsRenderer: React.FC<{ campaigns: Campaign[]; asCarousel: boolean; isTextOverlayEnabled: boolean; }> = ({ campaigns, asCarousel, isTextOverlayEnabled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!asCarousel || campaigns.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % campaigns.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [asCarousel, campaigns.length]);

  const goToPrevious = () => setCurrentIndex(prev => (prev === 0 ? campaigns.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex(prev => (prev + 1) % campaigns.length);

  if (!campaigns.length) return null;

  if (asCarousel) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg">
        <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="w-full flex-shrink-0">
              <MarketingCard campaign={campaign} isTextOverlayEnabled={isTextOverlayEnabled} />
            </div>
          ))}
        </div>
        {campaigns.length > 1 && (
          <>
            <button onClick={goToPrevious} className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-white/50 hover:bg-white text-brand-dark p-2 rounded-full z-10 transition-colors">
              &#10094;
            </button>
            <button onClick={goToNext} className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-white/50 hover:bg-white text-brand-dark p-2 rounded-full z-10 transition-colors">
              &#10095;
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {campaigns.map(campaign => (
        <MarketingCard key={campaign.id} campaign={campaign} isTextOverlayEnabled={isTextOverlayEnabled} />
      ))}
    </div>
  );
};


export const PromoTextBar: React.FC<{ promoTexts: PromoText[]; interval: number }> = ({ promoTexts, interval }) => {
  const activeTexts = promoTexts.filter(pt => pt.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeTexts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeTexts.length);
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [activeTexts.length, interval]);

  if (activeTexts.length === 0) return null;

  return (
    <div className="bg-brand-dark text-brand-secondary text-center py-2 text-sm font-medium relative overflow-hidden h-8">
      {activeTexts.map((promo, index) => (
        <div
          key={promo.id}
          className="absolute w-full transition-transform duration-1000 ease-in-out px-4"
          style={{ transform: `translateY(${(index - currentIndex) * 100}%)` }}
        >
          {promo.text}
        </div>
      ))}
    </div>
  );
};

export const FloatingWidget: React.FC<{ campaign: Campaign | undefined; onClose: () => void }> = ({ campaign, onClose }) => {
  if (!campaign) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
      <div className="relative">
        <button onClick={onClose} className="absolute top-2 right-2 bg-gray-800/50 text-white rounded-full h-7 w-7 flex items-center justify-center hover:bg-gray-900 z-10" aria-label="Fechar widget">&times;</button>
        <img src={campaign.imageUrl} alt={campaign.name} className="w-full h-40 object-cover" />
        <div className="p-5">
          <h3 className="font-bold text-lg text-brand-primary">{campaign.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
        </div>
      </div>
    </div>
  );
};

export const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;