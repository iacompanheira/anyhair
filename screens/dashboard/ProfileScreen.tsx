


import React from 'react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import BottomNav from '../components/shared/BottomNav';
import type { Service } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface ProfileScreenProps {
    onStaffAccessClick: () => void;
    onOpenBookingDrawer: (service?: Service) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onStaffAccessClick, onOpenBookingDrawer }) => {
  const { branding } = useAppContext();
  const pageTitleStyle: React.CSSProperties = {
    fontSize: `${branding.layout.pageTitle.fontSize}px`,
    fontWeight: branding.layout.pageTitle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.layout.pageTitle.fontStyle,
  };
  const user = {
    name: 'Joana Silva',
    email: 'joana.silva@example.com',
    phone: '(11) 98765-4321',
    imageUrl: 'https://picsum.photos/seed/profile_user/200/200'
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header onStaffAccessClick={onStaffAccessClick} />
      <main className="flex-grow container mx-auto px-6 py-12">
        <h2 style={pageTitleStyle} className="text-brand-dark mb-8">Meu Perfil</h2>
        <div className={`bg-white p-8 rounded-layout max-w-lg mx-auto ${branding.layout.cardShadow}`}>
          <div className="flex flex-col items-center">
            <img src={user.imageUrl} alt={user.name} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-brand-secondary" />
            <h3 className="text-2xl font-bold text-brand-dark">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.phone}</p>
            <button className="mt-6 btn-primary">Editar Perfil</button>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav onOpenBookingDrawer={onOpenBookingDrawer} />
    </div>
  );
};

export default ProfileScreen;