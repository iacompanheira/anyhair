import React from 'react';
import { navigate } from '../../router';
import { useRouter } from '../../hooks/useRouter';
import { useAppContext } from '../../contexts/AppContext';
import { HomeIcon, CalendarNavIcon, HistoryIcon, SignatureIcon, ShoppingBagIcon, ProfileIcon, ManageIcon } from '../ui/Icons';
import type { Service } from '../../types';

interface BottomNavProps {
    onOpenBookingDrawer: (service?: Service) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onOpenBookingDrawer }) => {
    const { featureFlags, branding } = useAppContext();
    const { view } = useRouter();

    const handleManageClick = () => {
        if (featureFlags?.dashboard) {
            navigate('/dashboard');
        } else {
            alert('Acesso restrito.');
        }
    };

    const navItems = [
        { id: 'home', icon: <HomeIcon />, text: 'Início', action: () => navigate('/') },
        { id: 'agendar', icon: <CalendarNavIcon />, text: 'Agendar', action: onOpenBookingDrawer },
        { id: 'history', icon: <HistoryIcon />, text: 'Histórico', action: () => navigate('/history') },
        { id: 'subscription', icon: <SignatureIcon />, text: 'Assinatura', action: () => navigate('/subscription') },
        { id: 'store', icon: <ShoppingBagIcon />, text: 'Loja', action: () => navigate('/store') },
        { id: 'profile', icon: <ProfileIcon />, text: 'Perfil', action: () => navigate('/profile') },
    ];
    
    if (featureFlags?.dashboard) {
        navItems.push({ id: 'dashboard', icon: <ManageIcon />, text: 'Gerenciar', action: handleManageClick });
    }

    const navTextStyle: React.CSSProperties = {
        fontSize: `${branding.layout.bottomNavText.fontSize}px`,
        fontWeight: branding.layout.bottomNavText.fontWeight as React.CSSProperties['fontWeight'],
    };

    return (
        <nav className={`sticky bottom-0 z-40 flex items-center justify-around bg-white/80 backdrop-blur-sm border-t border-gray-200 text-gray-600 text-center py-2`}>
            {navItems.map(item => {
                const isActive = view === item.id;
                
                return (
                    <a key={item.id} href="#" onClick={(e) => { e.preventDefault(); item.action(); }} className={`flex flex-col items-center justify-center flex-1 h-full px-1 py-2 rounded-md hover:bg-brand-primary/10 transition-colors ${isActive ? 'text-brand-primary' : ''} ${item.id === 'dashboard' ? 'font-bold' : ''}`}>
                        {React.cloneElement(item.icon, { className: 'h-6 w-6'})}
                        <span className="mt-1" style={navTextStyle}>{item.text}</span>
                    </a>
                )
            })}
        </nav>
    );
};

export default BottomNav;