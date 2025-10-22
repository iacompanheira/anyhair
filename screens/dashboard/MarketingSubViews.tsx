

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as api from '../../api';
import type { Client, UnifiedUser } from '../../types';
import { MOCK_USERS } from '../../constants';

// --- ICONS ---
const BellIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459L.057 24zM7.327 21.187l.431.26s2.387 1.428 5.105 1.428c5.42 0 9.781-4.36 9.781-9.781s-4.36-9.781-9.781-9.781-9.781 4.36-9.781 9.781c0 2.06.6 4.041 1.734 5.735l.24.433-1.07 3.861 3.946-1.04z"/></svg>;
const EmailIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const Spinner: React.FC = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative group flex items-center">
        {children}
        <div className="absolute bottom-full mb-2 w-max max-w-xs bg-brand-dark text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            {text}
        </div>
    </div>
);


// --- SKELETON LOADER ---
const BirthdaysSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-40 bg-gray-200 rounded-lg mb-8"></div>
        <div className="h-12 bg-gray-200 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
    </div>
);

// --- TOAST NOTIFICATION ---
const Toast: React.FC<{ message: string; show: boolean; onClose: () => void }> = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="bg-green-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6" />
                <span>{message}</span>
            </div>
        </div>
    );
};


export const BirthdaysView: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
    const [toastInfo, setToastInfo] = useState({ show: false, message: '' });

    const monthNames = useMemo(() => ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], []);

    useEffect(() => {
        const fetchAllClients = async () => {
            setIsLoading(true);
            try {
                // Fetch a large number to simulate getting all clients, as the API is paginated
                const { clients: allClients } = await api.getClients(1, 10000);
                setClients(allClients.filter(c => c.birthdate));
            } catch (error) {
                console.error("Failed to fetch clients for birthday view:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllClients();
    }, []);

    const { nextWeekBirthdays, clientsByMonth } = useMemo(() => {
        const today = new Date('2025-10-15T12:00:00Z'); // Fixed date for consistent mock data
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const upcoming: Client[] = [];
        const byMonth: Record<number, Client[]> = {};

        for (const client of clients) {
            if (!client.birthdate) continue;
            const [year, month, day] = client.birthdate.split('-').map(Number);
            
            // Group by birth month
            const monthIndex = month - 1;
            if (!byMonth[monthIndex]) byMonth[monthIndex] = [];
            byMonth[monthIndex].push(client);

            // Check for upcoming birthday this year
            const birthdayThisYear = new Date(Date.UTC(today.getUTCFullYear(), monthIndex, day));
            if (Number(birthdayThisYear.getTime()) >= Number(today.getTime()) && Number(birthdayThisYear.getTime()) <= Number(nextWeek.getTime())) {
                upcoming.push(client);
                continue;
            }

            // Check for upcoming birthday next year (if today is close to year end)
            if(today.getUTCMonth() === 11) {
                 const birthdayNextYear = new Date(Date.UTC(today.getUTCFullYear() + 1, monthIndex, day));
                 if (Number(birthdayNextYear.getTime()) >= Number(today.getTime()) && Number(birthdayNextYear.getTime()) <= Number(nextWeek.getTime())) {
                    upcoming.push(client);
                 }
            }
        }
        
        // Sort clients within each month by day
        for (const month in byMonth) {
            byMonth[month].sort((a, b) => {
                const dayA = parseInt(a.birthdate!.split('-')[2], 10);
                const dayB = parseInt(b.birthdate!.split('-')[2], 10);
                return dayA - dayB;
            });
        }
        
        upcoming.sort((a, b) => {
            const dateA = new Date(a.birthdate!);
            const dateB = new Date(b.birthdate!);
            return (dateA.getUTCMonth() * 100 + dateA.getUTCDate()) - (dateB.getUTCMonth() * 100 + dateB.getUTCDate());
        });

        return { nextWeekBirthdays: upcoming, clientsByMonth: byMonth };
    }, [clients]);

    useEffect(() => {
        // Pre-select current month on load
        if(!isLoading) {
            const currentMonthIndex = new Date('2025-10-15').getMonth();
            setSelectedMonths([currentMonthIndex]);
        }
    }, [isLoading]);

    const handleMonthToggle = (monthIndex: number) => {
        setSelectedMonths(prev => 
            prev.includes(monthIndex) ? prev.filter(m => m !== monthIndex) : [...prev, monthIndex]
        );
    };

    const handleSelectAll = () => setSelectedMonths(Array.from({ length: 12 }, (_, i) => i));
    const handleClearAll = () => setSelectedMonths([]);

    const showToast = (message: string) => {
        setToastInfo({ show: true, message });
    };

    if (isLoading) return <BirthdaysSkeleton />;

    return (
        <div className="space-y-8">
            <Toast message={toastInfo.message} show={toastInfo.show} onClose={() => setToastInfo({ ...toastInfo, show: false })} />

            {/* Next Week Birthdays */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-yellow-400">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative text-yellow-500"><BellIcon className="w-8 h-8" /><div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div></div>
                    <h3 className="text-xl font-bold text-brand-dark">Aniversariantes da Próxima Semana</h3>
                </div>
                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 mb-4">
                    {nextWeekBirthdays.length > 0 ? (
                        nextWeekBirthdays.map(client => (
                            <div key={client.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded-md">
                                <p className="font-semibold text-gray-800">{client.name}</p>
                                <p className="text-sm font-medium text-yellow-700">{new Date(client.birthdate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Nenhum aniversariante na próxima semana.</p>
                    )}
                </div>
                <button className="btn-primary w-full" onClick={() => alert('Navegando para a tela de comunicação...')}>Enviar Mensagem em Massa</button>
            </div>

            {/* Month Filter */}
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Filtrar por Mês</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {monthNames.map((month, index) => (
                        <label key={month} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <input type="checkbox" checked={selectedMonths.includes(index)} onChange={() => handleMonthToggle(index)} className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary" />
                            <span className="text-gray-800">{month}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-start gap-4 mt-4 pt-4 border-t">
                    <button onClick={handleSelectAll} className="btn-secondary">Selecionar Todos</button>
                    <button onClick={handleClearAll} className="btn-secondary">Limpar Seleção</button>
                </div>
            </div>

            {/* Birthdays List by Month */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedMonths.sort((a,b) => a - b).map(monthIndex => (
                    (clientsByMonth[monthIndex] && clientsByMonth[monthIndex].length > 0) ? (
                        <div key={monthIndex} className="bg-white p-5 rounded-xl shadow-md border flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-brand-dark">{monthNames[monthIndex]}</h3>
                                <button onClick={() => showToast(`Vouchers para ${monthNames[monthIndex]} enviados!`)} className="btn-primary text-sm">Enviar Voucher</button>
                            </div>
                            <ul className="space-y-2 flex-grow overflow-y-auto max-h-60 pr-2">
                                {clientsByMonth[monthIndex].map(client => (
                                    <li key={client.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="font-medium text-sm text-gray-800">{client.name}</span>
                                        <span className="text-xs text-gray-500 font-semibold">{client.birthdate?.split('-')[2]}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null
                ))}
            </div>
             {selectedMonths.length > 0 && selectedMonths.every(m => !clientsByMonth[m] || clientsByMonth[m].length === 0) && (
                <div className="text-center p-8 border-2 border-dashed rounded-lg col-span-full">
                    <p className="text-lg text-gray-500">Nenhum aniversariante encontrado para os meses selecionados.</p>
                </div>
             )}
        </div>
    );
};

const Confetti: React.FC = () => {
    const particles = useMemo(() => Array.from({ length: 150 }).map((_, i) => {
        const colors = ['#DB2777', '#F472B6', '#FCE7F3', '#4ade80', '#facc15'];
        const style: React.CSSProperties = {
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            transform: `rotate(${Math.random() * 360}deg)`
        };
        return <div key={i} className="confetti-particle" style={style}></div>;
    }), []);
    return <div className="confetti-container">{particles}</div>;
};

export const RaffleView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'clients' | 'employees'>('clients');
    const [clientFilter, setClientFilter] = useState('all');
    
    const [isLoading, setIsLoading] = useState(true);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const allProfessionals = useMemo(() => MOCK_USERS.filter(u => u.accessLevel === 'professional' && u.id !== 0), []);
    
    const [raffleHistory, setRaffleHistory] = useState([
        { name: 'Miguel Silva', type: 'Cliente', date: '2025-09-15', prize: 'Kit Hidratação' },
        { name: 'João Calmon', type: 'Funcionário', date: '2025-07-20', prize: 'Folga Extra' },
        { name: 'Helena Santos', type: 'Cliente', date: '2024-05-01', prize: 'Escova Grátis' },
    ]);

    const [prize, setPrize] = useState('');
    const [isRaffling, setIsRaffling] = useState(false);
    const [shuffledName, setShuffledName] = useState('');
    const [winner, setWinner] = useState<{ name: string; imageUrl?: string; type: string; } | null>(null);
    const [historySearch, setHistorySearch] = useState('');
    
    const raffleIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        api.getClients(1, 10000).then(({ clients }) => {
            setAllClients(clients);
            setIsLoading(false);
        });
    }, []);

    const eligibleParticipants = useMemo(() => {
        const now = new Date('2025-10-15T12:00:00Z');
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        const recentWinners = new Set(
            raffleHistory.filter(entry => new Date(entry.date).getTime() > oneYearAgo.getTime()).map(entry => entry.name)
        );

        let participants: (Client | UnifiedUser)[] = [];

        if (activeTab === 'clients') {
            if (clientFilter === 'all') {
                participants = allClients;
            } else {
                const months = { '3_months': 3, '6_months': 6, '12_months': 12 }[clientFilter as '3_months' | '6_months' | '12_months'] || 0;
                const filterDate = new Date(now);
                filterDate.setMonth(now.getMonth() - months);
                participants = allClients.filter(c => new Date(c.lastVisit).getTime() >= filterDate.getTime());
            }
        } else {
            participants = allProfessionals;
        }

        return participants.filter(p => !recentWinners.has(p.name));
    }, [activeTab, clientFilter, allClients, allProfessionals, raffleHistory]);

    const handleRaffle = useCallback(() => {
        if (eligibleParticipants.length < 2) {
            alert("É necessário ter pelo menos 2 participantes elegíveis para realizar o sorteio.");
            return;
        }
        
        setIsRaffling(true);
        setWinner(null);

        raffleIntervalRef.current = window.setInterval(() => {
            const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
            setShuffledName(eligibleParticipants[randomIndex].name);
        }, 80);

        setTimeout(() => {
            if (raffleIntervalRef.current) clearInterval(raffleIntervalRef.current);
            
            const winnerIndex = Math.floor(Math.random() * eligibleParticipants.length);
            const newWinnerData = eligibleParticipants[winnerIndex];
            const winnerType = activeTab === 'clients' ? 'Cliente' : 'Funcionário';
            
            setWinner({ 
                name: newWinnerData.name, 
                imageUrl: (newWinnerData as UnifiedUser).imageUrl,
                type: winnerType
            });
            setIsRaffling(false);
            setShuffledName('');
            
            setRaffleHistory(prev => [{
                name: newWinnerData.name,
                type: winnerType,
                date: new Date('2025-10-15T12:00:00Z').toISOString().split('T')[0],
                prize: prize || 'Não especificado'
            }, ...prev]);
            setPrize('');
        }, 3000);
    }, [eligibleParticipants, activeTab, prize]);
    
    useEffect(() => {
        return () => { if (raffleIntervalRef.current) clearInterval(raffleIntervalRef.current); };
    }, []);

    const filteredHistory = useMemo(() => {
        return raffleHistory.filter(item => 
            item.name.toLowerCase().includes(historySearch.toLowerCase())
        );
    }, [raffleHistory, historySearch]);

    const clientFilters = [
        { id: 'all', label: 'Todos os Clientes', desc: 'Inclui todos os clientes cadastrados.' },
        { id: '3_months', label: 'Clientes (Últimos 3 meses)', desc: 'Clientes que visitaram nos últimos 90 dias.' },
        { id: '6_months', label: 'Clientes (Últimos 6 meses)', desc: 'Clientes que visitaram nos últimos 180 dias.' },
        { id: '12_months', label: 'Clientes (Últimos 12 meses)', desc: 'Clientes que visitaram no último ano.' },
    ];

    const employeeFilters = [
        { id: 'all', label: 'Todos os Funcionários', desc: 'Inclui toda a equipe ativa.' },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="flex border-b mb-4">
                    <button onClick={() => {setActiveTab('clients'); setWinner(null);}} className={`px-4 py-2 font-semibold ${activeTab === 'clients' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500'}`}>Clientes</button>
                    <button onClick={() => {setActiveTab('employees'); setWinner(null);}} className={`px-4 py-2 font-semibold ${activeTab === 'employees' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500'}`}>Funcionários</button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Passo 1: Configuração */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-brand-dark">1. Selecione os Participantes</h3>
                        <div className="space-y-3">
                            {(activeTab === 'clients' ? clientFilters : employeeFilters).map(filter => (
                                <div key={filter.id} onClick={() => setClientFilter(filter.id)} className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all ${clientFilter === filter.id ? 'bg-pink-50 border-brand-primary ring-2 ring-brand-primary' : 'hover:bg-gray-50'}`}>
                                    <input type="radio" name="clientFilter" value={filter.id} checked={clientFilter === filter.id} readOnly className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/>
                                    <div>
                                        <p className="font-semibold text-gray-700">{filter.label}</p>
                                        <p className="text-xs text-gray-500">{filter.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prêmio (Opcional)</label>
                            <input type="text" value={prize} onChange={e => setPrize(e.target.value)} placeholder="Ex: Kit de Hidratação" className="input-dark" />
                        </div>
                    </div>

                    {/* Passo 2: Sorteio */}
                    <div className="flex flex-col">
                         <h3 className="font-bold text-lg text-brand-dark">2. Realize o Sorteio</h3>
                         <div className="flex-grow bg-gray-50 border-2 border-dashed rounded-xl mt-4 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                             <div className="flex items-center gap-2 mb-4">
                                <span className="font-bold text-3xl text-brand-primary">{eligibleParticipants.length}</span>
                                <span className="text-gray-600">participantes elegíveis</span>
                                <Tooltip text="Nota: Participantes que ganharam no último ano não são elegíveis para novos sorteios."><InfoIcon className="text-gray-400 cursor-help" /></Tooltip>
                             </div>
                            
                            {winner && <Confetti />}

                             <div className="h-32 flex flex-col items-center justify-center">
                                {isRaffling ? (
                                    <p className="text-3xl font-bold text-gray-800 animate-pulse">{shuffledName}</p>
                                ) : winner ? (
                                    <div className="animate-fade-in-up">
                                        <img src={winner.imageUrl || `https://ui-avatars.com/api/?name=${winner.name}&background=DB2777&color=fff`} alt={winner.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-4 border-white shadow-lg" />
                                        <p className="text-2xl font-bold text-gray-900">{winner.name}</p>
                                        <p className="font-semibold text-green-600">foi a pessoa sorteada!</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Pronto para descobrir quem será a pessoa de sorte?</p>
                                )}
                            </div>

                             <button onClick={handleRaffle} disabled={isRaffling || eligibleParticipants.length < 2} className="btn-primary mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                 {isRaffling ? 'Sorteando...' : winner ? 'Sortear Novamente' : 'Sortear'}
                             </button>
                             {winner && (
                                 <div className="mt-4 flex gap-2">
                                     <button className="btn-secondary text-sm">Enviar Voucher</button>
                                     <button className="btn-secondary text-sm">Ver Perfil</button>
                                 </div>
                             )}
                         </div>
                    </div>
                </div>
            </div>

            {/* Histórico */}
            <div className="bg-white p-6 rounded-xl shadow-md border">
                 <h3 className="font-bold text-lg text-brand-dark mb-4">Histórico de Vencedores</h3>
                 <input type="text" placeholder="Buscar no histórico..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} className="input-dark w-full md:w-1/2 mb-4" />
                 
                 {/* Desktop Table */}
                 <div className="overflow-x-auto hidden md:block">
                     <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50"><tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prêmio</th>
                         </tr></thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {filteredHistory.map((item, index) => (<tr key={index}>
                                 <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{item.name}</td>
                                 <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.type === 'Cliente' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{item.type}</span></td>
                                 <td className="px-6 py-4">{new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                 <td className="px-6 py-4 text-gray-600">{item.prize}</td>
                             </tr>))}
                         </tbody>
                     </table>
                 </div>
                 {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                    {filteredHistory.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-800">{item.name}</p>
                                    <p className="text-sm text-gray-500">{new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.type === 'Cliente' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{item.type}</span>
                             </div>
                             <p className="text-sm mt-2 pt-2 border-t text-gray-800"><strong>Prêmio:</strong> {item.prize}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ImageUploader: React.FC<{
    imageUrl: string;
    onImageUrlChange: (url: string) => void;
    onImageFileChange: (file: File | null) => void;
}> = ({ imageUrl, onImageUrlChange, onImageFileChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            onImageFileChange(file);
        }
    };

    const handleRemoveImage = () => {
        onImageFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
            {imageUrl && (
                <div className="relative group">
                    <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                    <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                </div>
            )}
            <div className="flex gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary flex-1 text-center justify-center">Carregar Arquivo</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
            <input type="text" value={imageUrl.startsWith('blob:') ? '' : imageUrl} onChange={e => onImageUrlChange(e.target.value)} placeholder="Ou cole a URL da imagem" className="input-dark" />
        </div>
    );
};


export const CommunicationView: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const [message, setMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    
    // State for message templates
    const [templates, setTemplates] = useState<{ id: number; text: string }[]>([]);
    const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
    const templateDropdownRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        api.getClients(1, 10000).then(({ clients }) => {
            setClients(clients);
            setIsLoadingClients(false);
        });
        
        // Load templates from localStorage on mount
        try {
            const savedTemplates = localStorage.getItem('messageTemplates');
            if (savedTemplates) {
                setTemplates(JSON.parse(savedTemplates));
            }
        } catch (e) {
            console.error("Failed to load templates from localStorage", e);
            localStorage.removeItem('messageTemplates');
        }
    }, []);

    // Save templates to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('messageTemplates', JSON.stringify(templates));
        } catch (e) {
            console.error("Failed to save templates to localStorage", e);
        }
    }, [templates]);

    // Click outside handler for template dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
                setIsTemplateDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const recipients = useMemo(() => {
        const today = new Date('2025-10-15T12:00:00Z');
        if (filter === 'all') return clients;
        if (filter === 'no_visit_3_months') {
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            return clients.filter(c => new Date(c.lastVisit).getTime() < threeMonthsAgo.getTime());
        }
        if (filter === 'birthdays_month') {
            const currentMonth = today.getUTCMonth();
            return clients.filter(c => c.birthdate && new Date(c.birthdate + 'T00:00:00').getUTCMonth() === currentMonth);
        }
        return [];
    }, [clients, filter]);

    const handleImageFileChange = (file: File | null) => {
        if (imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageFile(file);
        if (file) {
            setImageUrl(URL.createObjectURL(file));
        } else {
            setImageUrl('');
        }
    };

    const handleImageUrlChange = (url: string) => {
        if (imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageFile(null);
        setImageUrl(url);
    }
    
    useEffect(() => {
        return () => {
            if (imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        }
    }, [imageUrl]);

    const handleSend = (channel: 'WhatsApp' | 'E-mail') => {
        if (recipients.length === 0 || !message.trim()) {
            alert('Por favor, selecione destinatários e escreva uma mensagem.');
            return;
        }
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setToast({ show: true, message: `Mensagens enviadas para ${recipients.length} clientes via ${channel}!` });
            setMessage('');
            setImageUrl('');
            setImageFile(null);
        }, 2000);
    };

    // --- TEMPLATE HANDLERS ---
    const handleSaveTemplate = () => {
        if (!message.trim()) {
            setToast({ show: true, message: "A mensagem não pode estar vazia." });
            return;
        }
        if (templates.some(t => t.text === message)) {
            setToast({ show: true, message: "Este template já existe!" });
            return;
        }
        const newTemplate = { id: Date.now(), text: message };
        setTemplates(prev => [...prev, newTemplate]);
        setToast({ show: true, message: "Template salvo com sucesso!" });
    };

    const handleLoadTemplate = (text: string) => {
        setMessage(text);
        setIsTemplateDropdownOpen(false);
    };

    const handleDeleteTemplate = (id: number) => {
        if (window.confirm("Tem certeza que deseja excluir este template?")) {
            setTemplates(prev => prev.filter(t => t.id !== id));
            setToast({ show: true, message: "Template excluído." });
        }
    };

    const clientFilters = [
        { id: 'all', label: 'Todos os Clientes', desc: 'Enviar para toda a sua base de clientes.' },
        { id: 'no_visit_3_months', label: 'Clientes Inativos', desc: 'Clientes que não visitam há mais de 3 meses.' },
        { id: 'birthdays_month', label: 'Aniversariantes do Mês', desc: 'Clientes que fazem aniversário no mês atual.' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />
            {/* Coluna de Configuração */}
            <div className="bg-white p-6 rounded-xl shadow-md border space-y-6">
                <div>
                    <h3 className="font-bold text-lg text-brand-dark mb-2">1. Escolha o Público</h3>
                    <div className="space-y-3">
                        {clientFilters.map(f => (
                            <div key={f.id} onClick={() => setFilter(f.id)} className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all ${filter === f.id ? 'bg-pink-50 border-brand-primary ring-2 ring-brand-primary' : 'hover:bg-gray-50'}`}>
                                <input type="radio" name="clientFilter" value={f.id} checked={filter === f.id} readOnly className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/>
                                <div>
                                    <p className="font-semibold text-gray-700">{f.label}</p>
                                    <p className="text-xs text-gray-500">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-brand-dark mb-2">2. Crie sua Mensagem</h3>
                     <div className="mb-2 relative" ref={templateDropdownRef}>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsTemplateDropdownOpen(p => !p)} className="btn-secondary flex-1">
                                Usar Template
                            </button>
                            <button type="button" onClick={handleSaveTemplate} disabled={!message.trim()} className="btn-secondary flex-1 disabled:opacity-50">
                                Salvar Template Atual
                            </button>
                        </div>

                        {isTemplateDropdownOpen && (
                            <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                                {templates.length > 0 ? (
                                    templates.map(template => (
                                        <div key={template.id} className="group flex items-center justify-between p-3 hover:bg-gray-100 text-sm border-b last:border-b-0">
                                            <span className="truncate cursor-pointer flex-grow mr-2" onClick={() => handleLoadTemplate(template.text)}>
                                                {template.text}
                                            </span>
                                            <button onClick={() => handleDeleteTemplate(template.id)} className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-lg leading-none rounded-full hover:bg-red-100 font-bold flex-shrink-0">
                                                &times;
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-sm text-gray-500 text-center">Nenhum template salvo.</div>
                                )}
                            </div>
                        )}
                    </div>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Olá, {{nome_cliente}}! Temos uma oferta especial para você..." className="textarea-dark w-full" />
                </div>
                 <div>
                    <h3 className="font-bold text-lg text-brand-dark mb-2">3. Adicione uma Imagem (Opcional)</h3>
                    <ImageUploader imageUrl={imageUrl} onImageUrlChange={handleImageUrlChange} onImageFileChange={handleImageFileChange} />
                </div>
            </div>

            {/* Coluna de Preview e Envio */}
            <div className="bg-white p-6 rounded-xl shadow-md border space-y-6">
                <h3 className="font-bold text-lg text-brand-dark">4. Pré-visualização e Envio</h3>
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner min-h-[200px]">
                    {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-md mb-3" />}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{message || <span className="text-gray-400">Sua mensagem aparecerá aqui...</span>}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex justify-between items-center">
                    <p className="font-semibold text-blue-800">Destinatários: <span className="text-2xl">{isLoadingClients ? '...' : recipients.length}</span></p>
                    <button className="text-sm font-semibold text-blue-700 hover:underline">Ver Lista</button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => handleSend('WhatsApp')} disabled={isSending} className="btn-primary flex-1 !bg-green-600 hover:!bg-green-700 flex items-center justify-center gap-2 disabled:bg-gray-400">
                        {isSending ? <Spinner /> : <WhatsAppIcon />}
                        Enviar via WhatsApp
                    </button>
                    <button onClick={() => handleSend('E-mail')} disabled={isSending} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:bg-gray-400">
                        {isSending ? <Spinner /> : <EmailIcon />}
                        Enviar via E-mail
                    </button>
                </div>
            </div>
        </div>
    );
};
