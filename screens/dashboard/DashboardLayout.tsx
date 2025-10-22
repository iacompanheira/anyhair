import React, { useState, useMemo } from 'react';
import { navigate } from '../router';
import { useRouter } from '../hooks/useRouter';
import { useAppContext } from '../contexts/AppContext';
import { DashboardRouter } from './dashboard/DashboardRouter';
import type { DashboardView } from '../types';

// --- ICONS ---
const ScaleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.243c-2.132 0-4.14-.354-6.042-.983m12.162-9.614c-1.472 0-2.882.265-4.185.75M12 10.5h.008v.008H12V10.5z" /></svg>;
const RocketLaunchIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a12.022 12.022 0 01-5.84 7.38v-4.82m5.84-2.56a12.022 12.022 0 00-5.84-7.38v4.82m5.84 2.56a6 6 0 01-5.84-7.38v4.82m0 0a6 6 0 01-10.12-3.13 6 6 0 01-3.13-10.12A6.01 6.01 0 018.84 2.25a6 6 0 0110.12 3.13 6 6 0 013.13 10.12 6.01 6.01 0 01-4.75 4.75m0 0a6 6 0 01-5.84 7.38" /></svg>;
const CommunicationIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const CakeIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.24a2.95 2.95 0 01-2.06 2.06c-1.8.6-4.24.9-6.94.9s-5.14-.3-6.94-.9a2.95 2.95 0 01-2.06-2.06c-.6-1.8-.9-4.24-.9-6.94s.3-5.14.9-6.94A2.95 2.95 0 014.06 2.3c1.8-.6 4.24-.9 6.94-.9s5.14.3 6.94.9a2.95 2.95 0 012.06 2.06c.6 1.8.9 4.24.9 6.94s-.3 5.14-.9 6.94z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2m-3-3l-1 1m6-1l1 1m-4-6v-1a1 1 0 011-1h2a1 1 0 011 1v1" /></svg>;
const RaffleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
const ChartBarIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const ClipboardListIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const ClipboardCheckIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const CalendarDateIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ClientsIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ReportsIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const WalletIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m15 0a2.25 2.25 0 012.25 2.25v3.75a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V15a2.25 2.25 0 012.25-2.25h12.5" /></svg>;
const PercentIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17l-10-10m0 10l10-10M17 7a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM7 17a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
const TagIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>;
const UsersIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ColorSwatchIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
const SalonHoursIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TemplateIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>;
const DocumentTextIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const MenuIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const BrainIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 01-3.09 3.09L15 18.75l-.813-2.846a4.5 4.5 0 013.09-3.09L18.25 12z" /></svg>;
const AlertIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const SignatureIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const ShoppingBagIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;


const DashboardLayout: React.FC = () => {
    const { dashboardView } = useRouter();
    const { featureFlags, branding } = useAppContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const navGroups = useMemo(() => {
      if (!featureFlags) return [];
      
      const allGroups = [
        {
          title: 'Funcionalidades Principais',
          items: [
            { view: 'main', label: 'Painel Geral', icon: <ChartBarIcon className="w-5 h-5" />, flag: featureFlags.dashboard },
            { view: 'appointments', label: 'Agendamentos', icon: <ClipboardCheckIcon className="w-5 h-5" />, flag: featureFlags.appointments },
            { view: 'pendingActions', label: 'Ações Pendentes', icon: <AlertIcon className="w-5 h-5" />, flag: featureFlags.pendingActions },
            { view: 'calendar', label: 'Calendário', icon: <CalendarDateIcon className="w-5 h-5" />, flag: featureFlags.calendar },
            { view: 'clients', label: 'Clientes', icon: <ClientsIcon className="w-5 h-5" />, flag: featureFlags.clients },
            { view: 'smartAnalytics', label: 'Gestão Inteligente', icon: <BrainIcon className="w-5 h-5" />, flag: featureFlags.smartAnalytics },
          ]
        },
        {
          title: 'Base de finanças',
          items: [
            { view: 'reports', label: 'Relatórios', icon: <ReportsIcon className="w-5 h-5" />, flag: featureFlags.reports },
            { view: 'financial', label: 'Financeiro', icon: <WalletIcon className="w-5 h-5" />, flag: featureFlags.financial },
            { view: 'commissions', label: 'Comissões', icon: <PercentIcon className="w-5 h-5" />, flag: featureFlags.commissions },
            { view: 'costAnalysis', label: 'Análise de Custos', icon: <ScaleIcon className="w-5 h-5" />, flag: featureFlags.costAnalysis },
            { view: 'subscriptionManagement', label: 'Planos de Assinatura', icon: <SignatureIcon className="w-5 h-5" />, flag: featureFlags.settings.subscriptionManagement },
          ]
        },
        {
          title: 'Marketing',
          items: [
            { view: 'marketing', label: 'Campanhas', icon: <RocketLaunchIcon className="w-5 h-5" />, flag: featureFlags.marketingTools.marketing },
            { view: 'communication', label: 'Comunicação', icon: <CommunicationIcon className="h-5 w-5" />, flag: featureFlags.marketingTools.communication },
            { view: 'birthdays', label: 'Aniversários', icon: <CakeIcon className="w-5 h-5" />, flag: featureFlags.marketingTools.birthdays },
            { view: 'raffle', label: 'Sorteio', icon: <RaffleIcon className="h-5 w-5" />, flag: featureFlags.marketingTools.raffle },
          ]
        },
        {
          title: 'Gestão',
          items: [
            { view: 'users', label: 'Usuários', icon: <UsersIcon className="w-5 h-5" />, flag: featureFlags.settings.admins },
            { view: 'branding', label: 'Identidade e Catálogo', icon: <ColorSwatchIcon className="w-5 h-5" />, flag: featureFlags.settings.branding },
            { view: 'salonSettings', label: 'Horários', icon: <SalonHoursIcon className="h-5 w-5" />, flag: featureFlags.settings.salonHours },
            { view: 'storeSettings', label: 'Controle da Loja', icon: <ShoppingBagIcon className="w-5 h-5" />, flag: featureFlags.settings.storeSettings },
            { view: 'actionHistory', label: 'Histórico de Ações', icon: <DocumentTextIcon className="w-5 h-5" />, flag: featureFlags.settings.actionHistory },
            { view: 'modules', label: 'Módulos e Telas', icon: <TemplateIcon className="w-5 h-5" />, flag: true },
          ]
        }
      ];
      
      return allGroups
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.flag)
        }))
        .filter(group => group.items.length > 0);
    }, [featureFlags]);
    
    const viewTitles: { [key in DashboardView]?: string } = {
        main: 'Painel Geral', appointments: 'Agendamentos', calendar: 'Calendário Completo',
        reports: 'Relatórios de Desempenho', financial: 'Painel Financeiro', commissions: 'Relatório de Comissões', clients: 'Clientes', services: 'Serviços',
        users: 'Gerenciamento de Usuários', marketing: 'Ferramentas de Marketing', birthdays: 'Aniversariantes', communication: 'Comunicação em Massa',
        raffle: 'Realizar Sorteio', branding: 'Identidade Visual e Catálogo de Serviços', salonSettings: 'Horário do Salão', 
        modules: 'Módulos e Telas',
        actionHistory: 'Histórico de Ações',
        smartAnalytics: 'Gestão Inteligente com IA',
        pendingActions: 'Ações Pendentes',
        costAnalysis: 'Análise de Custos e Precificação',
        subscriptionManagement: 'Gerenciamento de Planos',
        storeSettings: 'Controle da Loja',
    };

    const handleNavClick = (targetView: DashboardView) => {
        navigate(`/dashboard/${targetView}`);
        setIsSidebarOpen(false);
    };
    
    if (!featureFlags) {
        return <div className="flex justify-center items-center h-screen w-screen">Carregando permissões...</div>;
    }

    const currentViewTitle = viewTitles[dashboardView] || 'Painel';
    
    const pageTitleStyle: React.CSSProperties = {
        fontSize: `${branding.layout.pageTitle.fontSize}px`,
        fontWeight: branding.layout.pageTitle.fontWeight as React.CSSProperties['fontWeight'],
        fontStyle: branding.layout.pageTitle.fontStyle,
    };

    return (
        <div className="relative flex h-screen overflow-hidden bg-brand-light font-sans">
            <style>{`@keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } .confetti-container{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:100}.confetti-particle{position:absolute;width:10px;height:20px;border-radius:50%;opacity:0;animation:fall 3s ease-in forwards}@keyframes fall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
            
            {isSidebarOpen && ( <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" /> )}
            
            <aside className={`fixed inset-y-0 left-0 bg-brand-dark text-white w-64 flex-col z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-full flex-col">
                    <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/10">
                        <h2 className="text-2xl font-bold">Any <span className="text-brand-primary">Hair</span></h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-300 hover:text-white" aria-label="Fechar menu"><CloseIcon/></button>
                    </div>
                    <nav className="flex-1 overflow-y-auto no-scrollbar p-4">
                        <ul className="space-y-1">
                            {navGroups.map((group, groupIndex) => (
                                <li key={group.title}>
                                    {groupIndex > 0 && <hr className="my-3 border-white/10" />}
                                    <h3 className="px-3 text-xs font-semibold uppercase text-gray-400 mb-2">{group.title}</h3>
                                    <ul className="space-y-1">
                                    {group.items.map(item => (
                                        <li key={item.view}>
                                            <button onClick={() => handleNavClick(item.view as DashboardView)} className={`w-full flex items-center gap-x-3 rounded-md p-3 text-sm font-semibold text-left transition-colors ${dashboardView === item.view ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                                                {React.cloneElement(item.icon, { className: 'h-5 w-5' })}
                                                <span>{item.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="mt-auto p-4 border-t border-white/10">
                        <button onClick={() => navigate('/')} className="w-full flex items-center gap-x-3 rounded-md p-3 text-sm font-semibold text-left text-gray-300 hover:bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Voltar para o Site
                        </button>
                    </div>
                </div>
            </aside>
            
            <div className="flex-1 flex flex-col w-full overflow-y-auto">
                <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 px-4 shadow-sm sm:px-6">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-brand-dark md:hidden -ml-2.5 p-2.5" aria-label="Abrir menu"><MenuIcon /></button>
                    <h2 className="text-brand-dark truncate" style={pageTitleStyle}>{currentViewTitle}</h2>
                </header>
                
                <main className="flex-grow p-4 sm:p-6 md:p-8 lg:p-10">
                    <DashboardRouter />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;