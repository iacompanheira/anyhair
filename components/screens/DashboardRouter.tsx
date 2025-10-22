import React from 'react';
import { useRouter } from '../../hooks/useRouter';
import { useAppContext } from '../../contexts/AppContext';

// Import all dashboard screens from their new locations
import { ReportsScreen } from '../../screens/dashboard/ReportsScreen';
import CalendarScreen from '../../screens/dashboard/CalendarScreen';
import { AppointmentsScreen } from '../../screens/dashboard/AppointmentsScreen';
import { ClientsScreen } from '../../screens/dashboard/ClientsScreen';
import SettingsScreen from '../../screens/dashboard/SettingsScreen';
import { FinancialScreen } from '../../screens/dashboard/FinancialScreen';
import MarketingScreen from '../../screens/dashboard/MarketingScreen';
import DashboardHomeScreen from '../../screens/dashboard/DashboardHomeScreen';
import UsersScreen from '../../screens/dashboard/UsersScreen';
import BrandingScreen from '../../screens/dashboard/BrandingScreen';
import SalonHoursScreen from '../../screens/dashboard/SalonHoursScreen';
import { BirthdaysView, RaffleView, CommunicationView } from '../../screens/dashboard/MarketingSubViews';
import ActionHistoryScreen from '../../screens/dashboard/ActionHistoryScreen';
import CommissionsScreen from '../../screens/dashboard/CommissionsScreen';
// FIX: Changed to a named import as SmartAnalyticsScreen does not have a default export.
import { SmartAnalyticsScreen } from '../../screens/dashboard/SmartAnalyticsScreen';
import PendingActionsScreen from '../../screens/dashboard/PendingActionsScreen';
import SubscriptionManagementScreen from '../../screens/dashboard/SubscriptionManagementScreen';
import CostAnalysisScreen from '../../screens/dashboard/CostAnalysisScreen';

export const DashboardRouter: React.FC = () => {
    const { dashboardView } = useRouter();
    const { featureFlags } = useAppContext();

    if (!featureFlags) return null;

    // A check to redirect to main if a disabled feature is accessed via URL
    const isCurrentViewAllowed = (view: string) => {
        switch(view) {
            case 'main': return featureFlags.dashboard;
            case 'appointments': return featureFlags.appointments;
            case 'calendar': return featureFlags.calendar;
            case 'clients': return featureFlags.clients;
            case 'reports': return featureFlags.reports;
            case 'financial': return featureFlags.financial;
            case 'commissions': return featureFlags.commissions;
            case 'costAnalysis': return featureFlags.costAnalysis;
            case 'smartAnalytics': return featureFlags.smartAnalytics;
            case 'pendingActions': return featureFlags.pendingActions;
            case 'marketing': return featureFlags.marketingTools.marketing;
            case 'communication': return featureFlags.marketingTools.communication;
            case 'birthdays': return featureFlags.marketingTools.birthdays;
            case 'raffle': return featureFlags.marketingTools.raffle;
            case 'users': return featureFlags.settings.admins; // Use 'admins' flag for the unified 'users' screen
            case 'branding': return featureFlags.settings.branding;
            case 'salonSettings': return featureFlags.settings.salonHours;
            case 'actionHistory': return featureFlags.settings.actionHistory;
            case 'subscriptionManagement': return featureFlags.settings.subscriptionManagement;
            case 'modules': return true;
            default: return false;
        }
    };
    
    if (!isCurrentViewAllowed(dashboardView)) {
        return <DashboardHomeScreen />;
    }

    switch (dashboardView) {
        case 'appointments': return <AppointmentsScreen role="admin" />;
        case 'calendar': return <CalendarScreen />;
        case 'reports': return <ReportsScreen />;
        case 'financial': return <FinancialScreen />;
        case 'commissions': return <CommissionsScreen />;
        case 'clients': return <ClientsScreen />;
        case 'users': return <UsersScreen />;
        case 'marketing': return <MarketingScreen />;
        case 'birthdays': return <BirthdaysView />;
        case 'communication': return <CommunicationView />;
        case 'raffle': return <RaffleView />;
        case 'branding': return <BrandingScreen />;
        case 'salonSettings': return <SalonHoursScreen />;
        case 'actionHistory': return <ActionHistoryScreen />;
        case 'costAnalysis': return <CostAnalysisScreen />;
        case 'smartAnalytics': return <SmartAnalyticsScreen />;
        case 'pendingActions': return <PendingActionsScreen />;
        case 'subscriptionManagement': return <SubscriptionManagementScreen />;
        case 'modules': return <SettingsScreen />;
        case 'main':
        default:
            return <DashboardHomeScreen />;
    }
};
