

import React, { useState, useCallback, useEffect } from 'react';
import type { Service, UnifiedUser, DateTimeSelection, User, Client } from './types';
import { useAppContext } from './contexts/AppContext';
import { useRouter } from './hooks/useRouter';
import { navigate } from './router';

import HomeScreen from './screens/HomeScreen';
import BookingScreen from './screens/BookingScreen';
import LoginScreen from './screens/LoginScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import DashboardLayout from './screens/DashboardLayout';
import { FloatingWidget, GiftIcon } from './components/marketing/MarketingComponents';
// FIX: Changed to a named import as StaffAccessModal does not have a default export.
import { StaffAccessModal } from './screens/StaffAccessModal';
import { SERVICES_DATA } from './constants';
import BottomNav from './components/shared/BottomNav';
import HistoryScreen from './screens/HistoryScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import StoreScreen from './screens/StoreScreen';
import ProfileScreen from './screens/ProfileScreen';


const App: React.FC = () => {
    const { view } = useRouter();
    const { 
        currentUser, setCurrentUser, 
        featureFlags, campaigns,
        isFloatingWidgetEnabled,
        selectedServices, setSelectedServices,
        selectedProfessional, setSelectedProfessional,
        selectedDateTime, setSelectedDateTime,
        resetBooking,
        clients, setClients,
        reminders, setReminders
    } = useAppContext();
    
    // UI state for global components
    const [isFloatingWidgetVisible, setIsFloatingWidgetVisible] = useState(true);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);

    const floatingCampaign = campaigns.find(c => c.isActive && c.displayLocation === 'floating');
    
    // Effect for checking and firing reminders
    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                const now = Date.now();
                const dueReminders = reminders.filter(r => r.remindAt <= now);
                
                if (dueReminders.length > 0) {
                    dueReminders.forEach(reminder => {
                        new Notification(reminder.title, {
                            body: reminder.body,
                            icon: 'https://i.imgur.com/e9uj5Yx.png' // App logo
                        });
                    });
                    
                    // Remove triggered reminders
                    setReminders(prev => prev.filter(r => r.remindAt > now));
                }
            }
        }, 15000); // Check every 15 seconds

        return () => clearInterval(interval);
    }, [reminders, setReminders]);


    const handleOpenBookingDrawer = useCallback((service?: Service) => {
        resetBooking();
        if (service) {
            let servicesToSelect = [service];
             if (service.includesServiceIds && service.includesServiceIds.length > 0) {
                const includedServices = SERVICES_DATA.filter(s => service.includesServiceIds!.includes(s.id));
                servicesToSelect = servicesToSelect.filter(s => !includedServices.some(inc => inc.id === s.id));
                servicesToSelect.push(...includedServices);
            }
            setSelectedServices(servicesToSelect);
        }
        setIsBookingDrawerOpen(true);
    }, [resetBooking, setSelectedServices]);

    const handleCloseBookingDrawer = useCallback(() => {
        setIsBookingDrawerOpen(false);
    }, []);

    // This effect handles closing the drawer after navigation to prevent screen flicker.
    // It triggers after the view state has updated and the new screen is rendered behind the drawer.
    useEffect(() => {
        const targetViews = ['login', 'confirmation'];
        if (isBookingDrawerOpen && targetViews.includes(view)) {
            handleCloseBookingDrawer();
        }
    }, [view, isBookingDrawerOpen, handleCloseBookingDrawer]);


    const handleLoginOrRegister = ({ email }: { email: string; pass: string }) => {
        const existingClient = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
        
        if (existingClient) {
            setCurrentUser({ name: existingClient.name, role: 'customer', isGuest: false });
        } else {
            const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
            
            const name = email.split('@')[0]
                              .replace(/[._0-9]/g, ' ')
                              .trim()
                              .split(' ')
                              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                              .join(' ') || "Novo Cliente";

            const newClient: Client = {
                id: newId,
                name: name,
                email: email,
                phone: '',
                cpf: '',
                lastVisit: new Date().toISOString().split('T')[0],
            };
            
            setClients(prevClients => [newClient, ...prevClients]);
            const newUser: User = { name: newClient.name, role: 'customer', isGuest: false };
            setCurrentUser(newUser);
        }
        
        navigate('/confirmation');
    };

    const handleBookingComplete = () => {
        if (!currentUser) {
            navigate('/login');
        } else {
            navigate('/confirmation');
        }
    };
    
    if (!featureFlags) {
        return <div className="flex justify-center items-center h-screen">Carregando...</div>;
    }

    const renderView = () => {
        switch (view) {
            case 'login':
                return <LoginScreen onLogin={handleLoginOrRegister} />;
            case 'confirmation':
                return <ConfirmationScreen 
                            selectedServices={selectedServices}
                            selectedProfessional={selectedProfessional} 
                            selectedDateTime={selectedDateTime} 
                        />;
            case 'dashboard':
                if (!featureFlags.dashboard) {
                    navigate('/');
                    return null;
                }
                return <DashboardLayout />;
            case 'history':
                return <HistoryScreen onStaffAccessClick={() => setIsStaffModalOpen(true)} onOpenBookingDrawer={handleOpenBookingDrawer} />;
            case 'subscription':
                return <SubscriptionScreen onStaffAccessClick={() => setIsStaffModalOpen(true)} onOpenBookingDrawer={handleOpenBookingDrawer} />;
            case 'store':
                return <StoreScreen onStaffAccessClick={() => setIsStaffModalOpen(true)} onOpenBookingDrawer={handleOpenBookingDrawer} />;
            case 'profile':
                return <ProfileScreen onStaffAccessClick={() => setIsStaffModalOpen(true)} onOpenBookingDrawer={handleOpenBookingDrawer} />;
            case 'home':
            default:
                return <HomeScreen onOpenBookingDrawer={handleOpenBookingDrawer} onStaffAccessClick={() => setIsStaffModalOpen(true)} />;
        }
    };

    return (
        <div className="font-sans">
            {renderView()}
            
            <BookingScreen
                isOpen={isBookingDrawerOpen}
                onClose={handleCloseBookingDrawer}
                onServicesChange={setSelectedServices}
                onProfessionalSelect={setSelectedProfessional}
                onDateTimeSelect={setSelectedDateTime}
                onBookingComplete={handleBookingComplete}
                selectedServices={selectedServices}
                selectedProfessional={selectedProfessional}
                selectedDateTime={selectedDateTime}
                resetBooking={resetBooking}
            />

            {isFloatingWidgetEnabled && isFloatingWidgetVisible && view === 'home' && (
                <FloatingWidget campaign={floatingCampaign} onClose={() => setIsFloatingWidgetVisible(false)} />
            )}
             {isFloatingWidgetEnabled && !isFloatingWidgetVisible && view === 'home' && floatingCampaign && (
                <button
                    onClick={() => setIsFloatingWidgetVisible(true)}
                    className="fixed bottom-20 right-4 sm:right-6 z-50 w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-accent transition-colors transform hover:scale-110 animate-fade-in-up"
                    aria-label="Ver promoção especial"
                >
                    <GiftIcon />
                </button>
            )}
            <StaffAccessModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} />
            <style>{`.animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default App;