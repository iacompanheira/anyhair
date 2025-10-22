
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import * as api from '../../api';
import type { FullAppointment, Client, UnifiedUser } from '../../types';
import { navigate } from '../../router';

// --- ICONS ---
const DollarSignIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0H8v-1h4v1zm-4 8v1h12v-1h-4v-1h-4v1H8z" /></svg>;
const NewUsersIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const CalendarCheckIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm4-6l2 2 4-4" /></svg>;
const ActivityIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CakeIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.24a2.95 2.95 0 01-2.06 2.06c-1.8.6-4.24.9-6.94.9s-5.14-.3-6.94-.9a2.95 2.95 0 01-2.06-2.06c-.6-1.8-.9-4.24-.9-6.94s.3-5.14.9-6.94A2.95 2.95 0 014.06 2.3c1.8-.6 4.24-.9 6.94-.9s5.14.3 6.94.9a2.95 2.95 0 012.06 2.06c.6 1.8.9 4.24.9 6.94s-.3 5.14-.9 6.94z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2m-3-3l-1 1m6-1l1 1m-4-6v-1a1 1 0 011-1h2a1 1 0 011 1v1" /></svg>;
const UpArrowIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
const DownArrowIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;
const BrainIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 01-3.09 3.09L15 18.75l-.813-2.846a4.5 4.5 0 013.09-3.09L18.25 12z" /></svg>;


const PaginationButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" {...props}>
        {children}
    </button>
);


const DashboardHomeScreen: React.FC = () => {
    const { users, featureFlags } = useAppContext();
    const [allAppointments, setAllAppointments] = useState<FullAppointment[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // New state for live updates
    const [mockNow, setMockNow] = useState(new Date('2025-10-15T08:00:00Z'));
    const [justUpdated, setJustUpdated] = useState(false);


    // State for Appointments Block
    const [selectedDayForAppointments, setSelectedDayForAppointments] = useState(mockNow);
    const [appointmentsPage, setAppointmentsPage] = useState(1);
    const APPOINTMENTS_PER_PAGE = 4;

    // State for Birthdays Block
    const [birthdaysPage, setBirthdaysPage] = useState(1);
    const BIRTHDAYS_PER_PAGE = 5;
    
    // Automatic refresh effect
    useEffect(() => {
        const intervalId = setInterval(() => {
            setMockNow(prevDate => {
                // Simulate 5 minutes passing every 5 seconds
                return new Date(prevDate.getTime() + 5 * 60 * 1000);
            });
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 1000); // Flash for 1 second
        }, 5000); // Update every 5 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [appts, clientsData] = await Promise.all([
                    api.getAppointments(),
                    api.getClients(1, 10000)
                ]);
                setAllAppointments(appts);
                setAllClients(clientsData.clients);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // --- LOGIC FOR APPOINTMENTS BLOCK ---
    const weekDaysForFilter = useMemo(() => {
        const startOfWeek = new Date(mockNow);
        startOfWeek.setUTCDate(mockNow.getUTCDate() - mockNow.getUTCDay()); // Sunday is 0
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setUTCDate(startOfWeek.getUTCDate() + i);
            return day;
        });
    }, [mockNow]);

    const appointmentsForSelectedDay = useMemo(() => {
        const dayStart = new Date(selectedDayForAppointments);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDayForAppointments);
        dayEnd.setHours(23, 59, 59, 999);
        
        return allAppointments
            .filter(a => Number(a.date.getTime()) >= Number(dayStart.getTime()) && Number(a.date.getTime()) <= Number(dayEnd.getTime()) && a.status === 'scheduled')
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [allAppointments, selectedDayForAppointments]);

    const paginatedAppointments = useMemo(() => {
        const startIndex = (appointmentsPage - 1) * APPOINTMENTS_PER_PAGE;
        return appointmentsForSelectedDay.slice(startIndex, startIndex + APPOINTMENTS_PER_PAGE);
    }, [appointmentsForSelectedDay, appointmentsPage]);

    const totalAppointmentsPages = Math.ceil(appointmentsForSelectedDay.length / APPOINTMENTS_PER_PAGE);

    // --- LOGIC FOR BIRTHDAYS BLOCK ---
    const nextTwoWeeksBirthdays = useMemo(() => {
        const fourteenDaysFromNow = new Date(mockNow);
        fourteenDaysFromNow.setUTCDate(mockNow.getUTCDate() + 14);

        const mockTodayStartOfDay = new Date(mockNow);
        mockTodayStartOfDay.setUTCHours(0,0,0,0);

        return allClients
            .filter(c => {
                if (!c.birthdate) return false;
                const birthDate = new Date(c.birthdate + 'T00:00:00Z'); 
                
                const birthdayThisYear = new Date(Date.UTC(mockNow.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate()));
                const birthdayNextYear = new Date(Date.UTC(mockNow.getUTCFullYear() + 1, birthDate.getUTCMonth(), birthDate.getUTCDate()));

                return (Number(birthdayThisYear.getTime()) >= Number(mockTodayStartOfDay.getTime()) && Number(birthdayThisYear.getTime()) <= Number(fourteenDaysFromNow.getTime())) || (Number(birthdayNextYear.getTime()) >= Number(mockTodayStartOfDay.getTime()) && Number(birthdayNextYear.getTime()) <= Number(fourteenDaysFromNow.getTime()));
            })
            .sort((a, b) => {
                const dateA = new Date(a.birthdate + 'T00:00:00Z');
                const dateB = new Date(b.birthdate + 'T00:00:00Z');
                return (dateA.getUTCMonth() * 100 + dateA.getUTCDate()) - (dateB.getUTCMonth() * 100 + dateB.getUTCDate());
            });
    }, [allClients, mockNow]);

    const paginatedBirthdays = useMemo(() => {
        const startIndex = (birthdaysPage - 1) * BIRTHDAYS_PER_PAGE;
        return nextTwoWeeksBirthdays.slice(startIndex, startIndex + BIRTHDAYS_PER_PAGE);
    }, [nextTwoWeeksBirthdays, birthdaysPage]);
    
    const totalBirthdaysPages = Math.ceil(nextTwoWeeksBirthdays.length / BIRTHDAYS_PER_PAGE);

    // --- LOGIC FOR PROFESSIONAL PERFORMANCE ---
    const { professionalPerformance, maxRevenue } = useMemo(() => {
        const professionals = users.filter(u => u.accessLevel === 'professional' && u.id !== 0 && u.isEnabled);

        const endCurrentPeriod = new Date(mockNow);
        const startCurrentPeriod = new Date(mockNow);
        startCurrentPeriod.setDate(startCurrentPeriod.getDate() - 30);

        const endPreviousPeriod = new Date(startCurrentPeriod);
        endPreviousPeriod.setDate(endPreviousPeriod.getDate() - 1);
        const startPreviousPeriod = new Date(endPreviousPeriod);
        startPreviousPeriod.setDate(startPreviousPeriod.getDate() - 30);
        
        const completedAppointments = allAppointments.filter(a => a.status === 'completed');

        const appointmentsInCurrentPeriod = completedAppointments.filter(a => Number(a.date.getTime()) >= Number(startCurrentPeriod.getTime()) && Number(a.date.getTime()) <= Number(endCurrentPeriod.getTime()));
        const appointmentsInPreviousPeriod = completedAppointments.filter(a => Number(a.date.getTime()) >= Number(startPreviousPeriod.getTime()) && Number(a.date.getTime()) <= Number(endPreviousPeriod.getTime()));

        const calculateRevenue = (appts: FullAppointment[]) => {
            return appts.reduce((total, appt) => {
                const price = parseFloat(appt.service.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                return total + price;
            }, 0);
        };

        const performanceData = professionals.map(pro => {
            const currentRevenue = calculateRevenue(appointmentsInCurrentPeriod.filter(appt => appt.professional.id === pro.id));
            const previousRevenue = calculateRevenue(appointmentsInPreviousPeriod.filter(appt => appt.professional.id === pro.id));
            
            let trend = 0;
            if (previousRevenue > 0) {
                trend = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
            } else if (currentRevenue > 0) {
                trend = Infinity;
            }

            return { ...pro, revenue: currentRevenue, trend };
        });

        performanceData.sort((a, b) => b.revenue - a.revenue);
        const max = performanceData.length > 0 ? performanceData[0].revenue : 1;
        return { professionalPerformance: performanceData, maxRevenue: max > 0 ? max : 1 };
    }, [users, allAppointments, mockNow]);
    
    const appointmentsTodayCount = useMemo(() => {
         return allAppointments.filter(a => {
            const apptDate = a.date.toISOString().split('T')[0];
            const todayDate = mockNow.toISOString().split('T')[0];
            return apptDate === todayDate;
        }).length;
    }, [allAppointments, mockNow]);

    const monthlyRevenue = useMemo(() => {
        const startOfMonth = new Date(mockNow);
        startOfMonth.setUTCDate(1);
        startOfMonth.setUTCHours(0, 0, 0, 0);

        const revenue = allAppointments
            .filter(a => a.status === 'completed' && Number(a.date.getTime()) >= Number(startOfMonth.getTime()) && Number(a.date.getTime()) <= Number(mockNow.getTime()))
            .reduce((sum, a) => {
                const priceString = String(a.service.price || '0');
                const numberString = priceString.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                return sum + (parseFloat(numberString) || 0);
            }, 0);
        
        return revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }, [allAppointments, mockNow]);

    const kpiData = [
        { title: 'Faturamento do Mês', value: isLoading ? '...' : monthlyRevenue, icon: <DollarSignIcon className="w-8 h-8"/>, color: 'text-green-500' },
        { title: 'Novos Clientes', value: '23', icon: <NewUsersIcon className="w-8 h-8"/>, color: 'text-blue-500' },
        { title: 'Agendamentos Hoje', value: isLoading ? '...' : appointmentsTodayCount.toString(), icon: <CalendarCheckIcon className="w-8 h-8"/>, color: 'text-brand-primary' },
        { title: 'Taxa de Ocupação', value: '82%', icon: <ActivityIcon className="w-8 h-8"/>, color: 'text-orange-500' },
    ];

    if (isLoading) {
        return <div className="text-center p-10">Carregando dados do painel...</div>;
    }

    return (
        <div className={`space-y-8 animate-fade-in-down transition-colors duration-1000 ${justUpdated ? 'bg-green-50' : ''}`}>
            <div className="flex justify-end text-xs font-semibold text-green-700 items-center">
                <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Atualizado em: {mockNow.toLocaleTimeString('pt-BR')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map(item => (
                    <div key={item.title} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 flex items-center space-x-4 transition-transform transform hover:-translate-y-1">
                        <div className={`p-3 bg-gray-100 rounded-full ${item.color}`}>{item.icon}</div>
                        <div><p className="text-gray-500 text-sm font-medium">{item.title}</p><p className="text-2xl font-bold text-brand-dark">{item.value}</p></div>
                    </div>
                ))}
            </div>

            {featureFlags?.smartAnalytics && (
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 p-6 rounded-2xl shadow-lg border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6 transition-transform transform hover:-translate-y-1 text-white">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-full">
                            <BrainIcon className="w-8 h-8"/>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Gestão Inteligente com IA</h3>
                            <p className="text-sm opacity-90 max-w-lg">Faça perguntas sobre seus dados e receba insights e estratégias para otimizar seu salão.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/smartAnalytics')}
                        className="bg-white text-brand-primary font-bold py-2 px-6 rounded-full text-base hover:bg-pink-100 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md shrink-0"
                    >
                        Analisar Agora
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bloco 1: Próximos Agendamentos */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 flex flex-col">
                    <h3 className="text-xl font-bold text-brand-dark mb-4">Próximos Agendamentos da Semana</h3>
                    <div className="flex flex-wrap gap-1 border-b pb-3 mb-3">
                        {weekDaysForFilter.map(day => {
                            const isSelected = day.toDateString() === selectedDayForAppointments.toDateString();
                            const isMockCurrentDay = day.getUTCDate() === mockNow.getUTCDate() && day.getUTCMonth() === mockNow.getUTCMonth();
                            return (
                                <button key={day.toISOString()} onClick={() => {setSelectedDayForAppointments(day); setAppointmentsPage(1);}} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${isSelected ? 'bg-brand-primary text-white shadow' : isMockCurrentDay ? 'bg-pink-100 text-brand-primary ring-1 ring-pink-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <span className="uppercase">{day.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' })}</span>
                                    <span className="ml-1.5">{day.getUTCDate()}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="space-y-3 flex-grow">
                        {paginatedAppointments.length > 0 ? paginatedAppointments.map(appt => (
                            <div key={appt.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center text-brand-primary font-bold"><ClockIcon className="w-5 h-5 mr-2"/><span className="text-base">{appt.date.toLocaleTimeString('pt-BR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}</span></div>
                                <div className="flex-grow"><p className="font-semibold text-gray-900">{appt.client.name}</p><p className="text-sm text-gray-500">{appt.service.name}</p></div>
                                <div className="text-right"><p className="font-medium text-sm text-gray-600">{appt.professional.name}</p></div>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-8">Nenhum agendamento para este dia.</p>}
                    </div>
                     {totalAppointmentsPages > 1 && (
                        <div className="flex justify-between items-center mt-4 pt-3 border-t">
                            <span className="text-sm text-gray-600">Página {appointmentsPage} de {totalAppointmentsPages}</span>
                            <PaginationButton onClick={() => setAppointmentsPage(p => p < totalAppointmentsPages ? p + 1 : 1)}>Próximo</PaginationButton>
                        </div>
                    )}
                </div>

                {/* Bloco 2: Aniversariantes */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 flex flex-col">
                    <h3 className="text-xl font-bold text-brand-dark mb-4">Aniversariantes (Próximas 2 Semanas)</h3>
                    <div className="space-y-3 flex-grow">
                        {paginatedBirthdays.length > 0 ? paginatedBirthdays.map(client => {
                            // This logic correctly calculates the upcoming birthday date for the mock year
                            const birthDate = new Date(client.birthdate + 'T00:00:00Z');
                            let upcomingBirthday = new Date(Date.UTC(mockNow.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate()));
                            
                            // Create a version of mockNow at the start of its day for accurate comparison
                            const mockTodayStartOfDay = new Date(mockNow);
                            mockTodayStartOfDay.setUTCHours(0,0,0,0);
                            
                            if (upcomingBirthday.getTime() < mockTodayStartOfDay.getTime()) {
                                 upcomingBirthday.setUTCFullYear(mockNow.getUTCFullYear() + 1);
                            }

                            return (
                                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3"><CakeIcon className="w-6 h-6 text-brand-accent"/><p className="font-semibold text-sm text-gray-900">{client.name}</p></div>
                                    <p className="text-sm font-medium text-gray-600">{upcomingBirthday.toLocaleDateString('pt-BR', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                                </div>
                            );
                        }) : <p className="text-sm text-gray-500 text-center py-8">Nenhum aniversariante nas próximas duas semanas.</p>}
                    </div>
                     {totalBirthdaysPages > 1 && (
                        <div className="flex justify-between items-center mt-4 pt-3 border-t">
                            <span className="text-sm text-gray-600">Página {birthdaysPage} de {totalBirthdaysPages}</span>
                            <PaginationButton onClick={() => setBirthdaysPage(p => p < totalBirthdaysPages ? p + 1 : 1)}>Próximo</PaginationButton>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
                <h3 className="text-xl font-bold text-brand-dark mb-4">Desempenho dos Profissionais</h3>
                <p className="text-sm text-gray-500 -mt-3 mb-4">Comparativo de faturamento dos últimos 30 dias com os 30 dias anteriores.</p>
                <div className="space-y-4">
                    {professionalPerformance.map(pro => (
                        <div key={pro.id}>
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-semibold text-gray-900">{pro.name}</span>
                                <div className="flex items-center gap-2">
                                    {isFinite(pro.trend) && pro.trend !== 0 && (
                                        <span className={`flex items-center text-xs font-bold ${pro.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {pro.trend > 0 ? <UpArrowIcon className="w-3 h-3"/> : <DownArrowIcon className="w-3 h-3"/>}
                                            {Math.abs(pro.trend).toFixed(1)}%
                                        </span>
                                    )}
                                    <span className="text-gray-800 font-bold">{pro.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${(pro.revenue / maxRevenue) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardHomeScreen;
