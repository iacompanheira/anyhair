import React from 'react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import BottomNav from '../components/shared/BottomNav';
import { AppointmentsScreen } from './dashboard/AppointmentsScreen';
import type { Service } from '../types';

interface HistoryScreenProps {
    onStaffAccessClick: () => void;
    onOpenBookingDrawer: (service?: Service) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onStaffAccessClick, onOpenBookingDrawer }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header onStaffAccessClick={onStaffAccessClick} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
                 <AppointmentsScreen role="customer" onRebook={onOpenBookingDrawer} />
            </main>
            <Footer />
            <BottomNav onOpenBookingDrawer={onOpenBookingDrawer} />
        </div>
    );
};

export default HistoryScreen;