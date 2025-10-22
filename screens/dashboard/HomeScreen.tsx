import React from 'react';
import Header from '../components/shared/Header';
import Hero from '../components/home/Hero';
import ServicesList from '../components/home/ServicesList';
import Footer from '../components/shared/Footer';
import { PromoTextBar, CampaignsRenderer } from '../components/marketing/MarketingComponents';
import { useAppContext } from '../contexts/AppContext';
import BottomNav from '../components/shared/BottomNav';
import type { Service } from '../types';
import FeaturedProducts from '../components/home/FeaturedProducts';

interface HomeScreenProps {
    onOpenBookingDrawer: (service?: Service) => void;
    onStaffAccessClick: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenBookingDrawer, onStaffAccessClick }) => {
    const { 
        campaigns, promoTexts, 
        promoTextInterval, isTextOverlayEnabled,
        branding,
        products,
    } = useAppContext();

    const mainCampaigns = campaigns.filter(c => c.isActive && c.displayLocation === 'main');
    const carouselCampaigns = campaigns.filter(c => c.isActive && c.displayLocation === 'carousel');
    const featuredProducts = products.filter(p => p.isFeatured);
    
    const sectionTitleStyle: React.CSSProperties = {
        fontSize: `${branding.layout.sectionTitle.fontSize}px`,
        fontWeight: branding.layout.sectionTitle.fontWeight as React.CSSProperties['fontWeight'],
    };

    return (
        <div className="flex flex-col min-h-screen">
            <PromoTextBar promoTexts={promoTexts} interval={promoTextInterval} />
            <Header onStaffAccessClick={onStaffAccessClick} />
            <main className="flex-grow">
                <Hero onBookNowClick={() => onOpenBookingDrawer()} />
                <ServicesList onBookNowClick={onOpenBookingDrawer} />

                {featuredProducts.length > 0 && (
                    <FeaturedProducts products={featuredProducts} />
                )}

                {(mainCampaigns.length > 0 || carouselCampaigns.length > 0) && (
                    <section className="bg-brand-secondary py-section">
                        <div className="container mx-auto px-6">
                            <div className="text-center mb-12">
                                <h2 className="text-brand-dark" style={sectionTitleStyle}>Promoções Especiais</h2>
                                <div className="mt-4 w-24 h-1 bg-brand-primary mx-auto rounded"></div>
                            </div>
                            {mainCampaigns.length > 0 && <CampaignsRenderer campaigns={mainCampaigns} asCarousel={false} isTextOverlayEnabled={isTextOverlayEnabled} />}
                            {carouselCampaigns.length > 0 && <div className="mt-12"><CampaignsRenderer campaigns={carouselCampaigns} asCarousel={true} isTextOverlayEnabled={isTextOverlayEnabled} /></div>}
                        </div>
                    </section>
                )}
            </main>
            <Footer />
            <BottomNav onOpenBookingDrawer={onOpenBookingDrawer} />
        </div>
    );
};

export default HomeScreen;