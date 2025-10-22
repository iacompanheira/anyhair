

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, LabelList, ComposedChart } from 'recharts';
import * as api from '../../api';
import { FullAppointment, Client } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAppContext } from '../../contexts/AppContext';
import { ReportToolbar } from '../../components/dashboard/ReportToolbar';
import type { PeriodSelection } from '../../components/dashboard/PeriodSelector';
import { getQuickPeriodDates } from '../../components/dashboard/PeriodSelector';

// --- ICONS ---
const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const KpiDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0H8v-1h4v1zm-4 8v1h12v-1h-4v-1h-4v1H8z" /></svg>;
const KpiCalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm4-6l2 2 4-4" /></svg>;
const KpiTicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const KpiChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const KpiUserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18 11v6m3-3h-6" /></svg>;
const KpiUsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UpArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
const DownArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;

// --- CSV HELPER ---
const exportToCsv = (filename: string, rows: (string | number)[][]) => {
    const processRow = (row: (string | number)[]) => row.map(val => {
        const str = String(val == null ? '' : val);
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }).join(',');

    const csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => processRow(e)).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


// --- MOCK DATA & CONSTANTS ---
const PIE_CHART_COLORS = ['#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6'];

// --- TYPES & HELPER FUNCTIONS ---
type Metrics = {
    totalRevenue: number;
    totalAppointments: number;
    avgTicket: number;
    newClients: number;
    returningClients: number;
    attendanceRate: number;
};

const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    return ((current - previous) / previous) * 100;
};

const CardSkeleton: React.FC = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
);

interface StatCardProps { title: string; value: string; icon: React.ReactNode; trend: number; comparisonLabel: string; }
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, comparisonLabel }) => {
    const isPositive = trend >= 0;
    const trendText = !isFinite(trend)
        ? (trend > 0 ? '∞' : 'N/A')
        : `${isPositive ? '+' : ''}${trend.toFixed(1)}%`;
    const trendColor = isPositive ? 'bg-green-600' : 'bg-red-600';

    return (
        <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-200/80 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-gray-600">{title}</p>
                    <div className="p-2 rounded-full bg-brand-secondary text-brand-primary">{icon}</div>
                </div>
                <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
            </div>
            
            <div className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 text-white self-start ${trendColor}`}>
                {isPositive ? <UpArrowIcon/> : <DownArrowIcon/>}
                <span>{trendText} {comparisonLabel}</span>
            </div>
        </div>
    );
};

// --- CUSTOM CHART COMPONENTS ---
const CustomFinancialProfessionalTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-brand-dark text-lg mb-2">{data.name}</p>
          <p className="text-sm text-[#3b82f6] font-semibold">{`Faturamento: ${formatCurrency(data.faturamento)}`}</p>
          <p className="text-sm text-[#8b5cf6] font-semibold">{`Atendimentos: ${data.atendimentos}`}</p>
          <p className="text-sm text-gray-800 font-bold mt-2">{`Ticket Médio: ${formatCurrency(data.ticketMedio)}`}</p>
        </div>
      );
    }
  
    return null;
};

// --- CLIENT ANALYSIS COMPONENTS ---
const ClientDetailModal: React.FC<{ client: Client | null; onClose: () => void }> = ({ client, onClose }) => {
    if (!client) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">{client.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-2xl leading-none">&times;</button>
                </header>
                <main className="p-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                    <span className="font-semibold text-gray-500">E-mail:</span><span className="text-gray-800 break-all">{client.email}</span>
                    <span className="font-semibold text-gray-500">Telefone:</span><span className="text-gray-800">{client.phone}</span>
                    <span className="font-semibold text-gray-500">CPF:</span><span className="text-gray-800">{client.cpf}</span>
                    <span className="font-semibold text-gray-500">Aniversário:</span><span className="text-gray-800">{client.birthdate ? new Date(client.birthdate + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}</span>
                    <span className="font-semibold text-gray-500">Última Visita:</span><span className="text-gray-800">{new Date(client.lastVisit + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                </main>
            </div>
        </div>
    );
};

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-2 mt-4">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"> Anterior </button>
            <span className="text-sm text-gray-600"> Página {currentPage} de {totalPages} </span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"> Próximo </button>
        </div>
    );
};

interface ReportBlockProps { data: { id: number | string; name: string; value: number }[]; valueFormatter: (value: number) => string; itemsPerPage?: number; onBarClick: (clientId: number | string) => void; }
const ReportBlock: React.FC<ReportBlockProps> = ({ data, valueFormatter, itemsPerPage = 5, onBarClick }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = useMemo(() => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [data, currentPage, itemsPerPage]);
    const maxValue = useMemo(() => paginatedData.length === 0 ? 1 : Math.max(...paginatedData.map(item => item.value)), [paginatedData]);
    
    useEffect(() => { setCurrentPage(1); }, [data]);
    
    return (
        <div>
            <div className="space-y-4">
                {paginatedData.map((item) => {
                    const barWidthPercentage = maxValue > 0 ? (item.value / maxValue) * 60 + 5 : 5; // Min width 5%
                    return (
                        <div key={item.id} className="flex items-center group cursor-pointer gap-3" onClick={() => onBarClick(item.id)} role="button" tabIndex={0} aria-label={`${item.name}: ${valueFormatter(item.value)}. Clique para ver detalhes.`} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onBarClick(item.id)}>
                            <div className="bg-brand-primary rounded h-8 flex items-center group-hover:bg-pink-700 transition-colors" style={{ width: `${barWidthPercentage}%` }}>
                                <span className="pl-2 text-white font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                    {item.name}
                                </span>
                            </div>
                            <div className="text-right font-bold text-sm text-gray-700 flex-shrink-0">
                                {valueFormatter(item.value)}
                            </div>
                        </div>
                    );
                })}
                 {paginatedData.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum dado encontrado para este filtro.</p>}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};

const ClientAnalysis: React.FC<{ allAppointments: FullAppointment[], allClients: Client[] }> = ({ allAppointments, allClients }) => {
    const [analysisType, setAnalysisType] = useState('topSpenders');
    const [selectedClientForModal, setSelectedClientForModal] = useState<Client | null>(null);
    const [period, setPeriod] = useState('360'); // Default to 360 days
    const [customDays, setCustomDays] = useState(45);

    const NOW = new Date('2025-10-15T23:59:59Z');
    const isRiskOrLostAnalysis = analysisType === 'atRiskClients' || analysisType === 'lostClients';

    const appointmentsForPeriod = useMemo(() => {
        if (isRiskOrLostAnalysis || period === 'all') {
            return allAppointments;
        }

        const endDate = NOW;
        const startDate = new Date(NOW);
        let daysToSubtract;

        if (period === 'custom') {
            daysToSubtract = customDays > 0 ? customDays : 30; // Fallback
        } else {
            daysToSubtract = parseInt(period, 10);
        }
        
        startDate.setUTCDate(startDate.getUTCDate() - daysToSubtract);
        
        return allAppointments.filter(a => {
            const apptDate = a.date;
            // FIX: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
            // FIX: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
            return Number(apptDate.getTime()) >= Number(startDate.getTime()) && Number(apptDate.getTime()) <= Number(endDate.getTime());
        });
    }, [allAppointments, period, customDays, isRiskOrLostAnalysis]);

    const analysisData = useMemo(() => {
        const completedAppointmentsInPeriod = appointmentsForPeriod.filter(a => a.status === 'completed');
        
        const clientMetrics: Record<number, { spend: number, visits: number, lastVisit: number }> = {};
        allClients.forEach(c => {
            clientMetrics[c.id] = { spend: 0, visits: 0, lastVisit: new Date(c.lastVisit + 'T00:00:00Z').getTime() };
        });

        completedAppointmentsInPeriod.forEach(a => {
            if (!clientMetrics[a.client.id]) return;
            const price = parseFloat(a.service.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
            clientMetrics[a.client.id].spend += price;
            clientMetrics[a.client.id].visits += 1;
        });
        
        const clientArray = Object.entries(clientMetrics).map(([id, data]) => {
            const metrics = data as { spend: number; visits: number; lastVisit: number; };
            return { id: Number(id), name: allClients.find(c => c.id === Number(id))?.name || 'N/A', spend: metrics.spend, visits: metrics.visits, lastVisit: metrics.lastVisit, avgTicket: metrics.visits > 0 ? metrics.spend / metrics.visits : 0 };
        });

        const topSpenders = [...clientArray].filter(c => c.spend > 0).sort((a,b) => b.spend - a.spend).map(c => ({ id: c.id, name: c.name, value: c.spend }));
        const mostFrequent = [...clientArray].filter(c => c.visits > 0).sort((a,b) => b.visits - a.visits).map(c => ({ id: c.id, name: c.name, value: c.visits }));
        const highestTicket = [...clientArray].filter(c => c.avgTicket > 0).sort((a,b) => b.avgTicket - a.avgTicket).map(c => ({ id: c.id, name: c.name, value: c.avgTicket }));
        
        const atRiskCutoffStart = new Date(NOW); atRiskCutoffStart.setMonth(atRiskCutoffStart.getMonth() - 6);
        const atRiskCutoffEnd = new Date(NOW); atRiskCutoffEnd.setMonth(atRiskCutoffEnd.getMonth() - 3);
        const atRiskClients = allClients
            .filter(c => { const lastVisitTime = new Date(c.lastVisit + 'T00:00:00Z').getTime(); return Number(lastVisitTime) >= Number(atRiskCutoffStart.getTime()) && Number(lastVisitTime) < Number(atRiskCutoffEnd.getTime()); })
            .sort((a: Client, b: Client) => Number(new Date(a.lastVisit + 'T00:00:00Z').getTime()) - Number(new Date(b.lastVisit + 'T00:00:00Z').getTime()))
            .map(c => ({ id: c.id, name: c.name, value: Math.floor((Number(NOW.getTime()) - Number(new Date(c.lastVisit + 'T00:00:00Z').getTime())) / (1000 * 3600 * 24)) }));

        const lostCutoff = new Date(NOW); lostCutoff.setFullYear(lostCutoff.getFullYear() - 1);
        const lostClients = allClients
            .filter(c => Number(new Date(c.lastVisit + 'T00:00:00Z').getTime()) < Number(lostCutoff.getTime()))
            .sort((a: Client, b: Client) => Number(new Date(a.lastVisit + 'T00:00:00Z').getTime()) - Number(new Date(b.lastVisit + 'T00:00:00Z').getTime()))
            .map(c => ({ id: c.id, name: c.name, value: Math.floor((Number(NOW.getTime()) - Number(new Date(c.lastVisit + 'T00:00:00Z').getTime())) / (1000 * 3600 * 24)) }));

        const servicesByRevenue = completedAppointmentsInPeriod.reduce<Record<number, number>>((acc, a) => {
            const price = parseFloat(a.service.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
            acc[a.service.id] = (acc[a.service.id] || 0) + price;
            return acc;
        }, {});
        const servicesByRevenueData = Object.entries(servicesByRevenue).map(([id, value]) => ({ id: Number(id), name: allAppointments.find(a => a.service.id === Number(id))?.service.name || 'N/A', value })).sort((a, b) => b.value - a.value);

        const servicesByPopularity = completedAppointmentsInPeriod.reduce<Record<number, number>>((acc, a) => { acc[a.service.id] = (acc[a.service.id] || 0) + 1; return acc; }, {});
        const servicesByPopularityData = Object.entries(servicesByPopularity).map(([id, value]) => ({ id: Number(id), name: allAppointments.find(a => a.service.id === Number(id))?.service.name || 'N/A', value })).sort((a, b) => b.value - a.value);

        const serviceNoShowRates: Record<string, { total: number, noShows: number }> = {};
        appointmentsForPeriod.forEach(a => { if (!serviceNoShowRates[a.service.name]) serviceNoShowRates[a.service.name] = { total: 0, noShows: 0 }; serviceNoShowRates[a.service.name].total++; if (a.status === 'no-show') serviceNoShowRates[a.service.name].noShows++; });
        const servicesByNoShowData = Object.entries(serviceNoShowRates).map(([name, data], index) => ({ id: index, name, value: data.total > 0 ? (data.noShows / data.total) * 100 : 0 })).sort((a, b) => b.value - a.value);

        const combinations: Record<string, number> = {};
        const apptsByClientDay = appointmentsForPeriod.reduce<Record<string, Set<string>>>((acc, a) => { const key = `${a.client.id}|${a.date.toISOString().split('T')[0]}`; if (!acc[key]) acc[key] = new Set(); acc[key].add(a.service.name); return acc; }, {});
        Object.values(apptsByClientDay).forEach((serviceSet: any) => { if (serviceSet.size > 1) { const services = Array.from(serviceSet as Set<string>).sort(); for (let i = 0; i < services.length; i++) { for (let j = i + 1; j < services.length; j++) { const key = `${services[i]} + ${services[j]}`; combinations[key] = (combinations[key] || 0) + 1; } } } });
        const popularCombinationsData = Object.entries(combinations).map(([name, value], id) => ({ id, name, value })).sort((a, b) => b.value - a.value);

        return {
            topSpenders: { title: 'Top Clientes por Gasto Total', data: topSpenders, formatter: formatCurrency, isClient: true },
            loyalClients: { title: 'Clientes Fiéis (por Frequência de Visitas)', data: mostFrequent, formatter: (val: number) => `${val} visita(s)`, isClient: true },
            highestTicket: { title: 'Clientes com Maior Ticket Médio por Visita', data: highestTicket, formatter: formatCurrency, isClient: true },
            atRiskClients: { title: 'Clientes em Risco (sem visita 3-6 meses)', data: atRiskClients, formatter: (val: number) => `há ${val} dias`, isClient: true },
            lostClients: { title: 'Clientes Perdidos (>1 ano)', data: lostClients, formatter: (val: number) => `há ${val} dias`, isClient: true },
            servicesByRevenue: { title: 'Serviços que Mais Geram Receita', data: servicesByRevenueData, formatter: formatCurrency, isClient: false },
            servicesByPopularity: { title: 'Serviços Mais Populares (em quantidade)', data: servicesByPopularityData, formatter: (val: number) => `${val} atend.`, isClient: false },
            servicesByNoShow: { title: 'Serviços com Maior Taxa de "Não Comparecimento"', data: servicesByNoShowData, formatter: (val: number) => `${val.toFixed(1)}%`, isClient: false },
            popularCombinations: { title: 'Combinações Populares', data: popularCombinationsData, formatter: (val: number) => `${val}x`, isClient: false },
        };
    }, [appointmentsForPeriod, allClients, allAppointments, NOW]);

    const handleBarClick = (itemId: number | string) => {
        const currentAnalysis = analysisData[analysisType as keyof typeof analysisData];
        if (currentAnalysis?.isClient) {
            const client = allClients.find(c => c.id === itemId);
            if (client) setSelectedClientForModal(client);
        }
    };
    
    const activeAnalysis = analysisData[analysisType as keyof typeof analysisData];
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
            <ClientDetailModal client={selectedClientForModal} onClose={() => setSelectedClientForModal(null)} />
            <h3 className="text-xl font-bold text-brand-dark mb-4">Análise de Clientes & Serviços</h3>
            
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`transition-opacity ${isRiskOrLostAnalysis ? 'opacity-50' : ''}`}>
                    <label htmlFor="analysis-period" className="block text-sm font-medium text-gray-700 mb-1">Período da Análise</label>
                    <div className="flex gap-2">
                         <select 
                            id="analysis-period"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full select-dark"
                            disabled={isRiskOrLostAnalysis}
                        >
                            <option value="30">Últimos 30 dias</option>
                            <option value="60">Últimos 60 dias</option>
                            <option value="90">Últimos 90 dias</option>
                            <option value="120">Últimos 120 dias</option>
                            <option value="180">Últimos 180 dias</option>
                            <option value="360">Últimos 360 dias</option>
                            <option value="730">Últimos 2 anos</option>
                            <option value="all">Todo o Período</option>
                            <option value="custom">Personalizado</option>
                        </select>
                        {period === 'custom' && (
                             <input 
                                type="number" 
                                value={customDays} 
                                onChange={e => setCustomDays(Number(e.target.value))} 
                                className="input-dark w-28 text-center" 
                                placeholder="dias"
                                disabled={isRiskOrLostAnalysis}
                                min="1"
                            />
                        )}
                    </div>
                </div>
                <div>
                     <label htmlFor="analysis-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Análise</label>
                     <select 
                        id="analysis-type"
                        value={analysisType}
                        onChange={(e) => setAnalysisType(e.target.value)}
                        className="w-full select-dark"
                    >
                        <optgroup label="Top Clientes">
                            <option value="topSpenders">Mais Gastam</option>
                            <option value="loyalClients">Clientes Fiéis (pela frequência)</option>
                            <option value="highestTicket">Maior Ticket Médio</option>
                        </optgroup>
                        <optgroup label="Análise de Atividade e Retenção">
                            <option value="atRiskClients">Clientes em Risco (3-6 meses)</option>
                            <option value="lostClients">Clientes Perdidos (&gt;1 ano)</option>
                        </optgroup>
                        <optgroup label="Análise de Serviços">
                            <option value="servicesByRevenue">Serviços (por Receita)</option>
                            <option value="servicesByPopularity">Serviços (por Popularidade)</option>
                            <option value="servicesByNoShow">Serviços (por Não Comparecimento)</option>
                            <option value="popularCombinations">Combinações Populares</option>
                        </optgroup>
                    </select>
                </div>
            </div>
             {isRiskOrLostAnalysis && (
                <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-md -mt-2 mb-6 animate-fade-in-down">
                    <strong>Nota:</strong> Esta análise usa um período pré-definido e ignora o filtro de período selecionado.
                </div>
            )}
            
            {activeAnalysis && (
                <div className="border border-gray-200 rounded-lg p-4 mt-2 animate-fade-in-down">
                    <h4 className="font-bold text-brand-dark mb-4">{activeAnalysis.title}</h4>
                    <ReportBlock 
                        data={activeAnalysis.data} 
                        valueFormatter={activeAnalysis.formatter} 
                        onBarClick={handleBarClick}
                        itemsPerPage={5}
                    />
                </div>
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
export const ReportsScreen: React.FC = () => {
    const { users } = useAppContext();
    const [allAppointments, setAllAppointments] = useState<FullAppointment[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [periodSelection, setPeriodSelection] = useState<PeriodSelection>(() => {
        const { start, end } = getQuickPeriodDates('last30');
        const duration = Number(end.getTime()) - Number(start.getTime());
        const compEnd = new Date(Number(start.getTime()) - (24 * 60 * 60 * 1000));
        const compStart = new Date(Number(compEnd.getTime()) - duration);
        return { 
            type: 'quick', 
            key: 'last30', 
            label: 'Últimos 30 dias', 
            start, 
            end, 
            comparison: {
                label: 'vs. período anterior',
                start: compStart,
                end: compEnd
            }
        };
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [appts, clientsData] = await Promise.all([api.getAppointments(), api.getClients(1, 10000)]);
            setAllAppointments(appts);
            setAllClients(clientsData.clients);
        } catch (err) {
            console.error("Failed to load report data:", err);
            setError("Não foi possível carregar os dados para os relatórios.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handlePeriodSelection = (selection: PeriodSelection) => {
        const newSelection = { ...selection };
        if (!newSelection.comparison && newSelection.type !== 'best' && newSelection.key !== 'allTime') {
            const startDate = newSelection.start;
            const endDate = newSelection.end;
            const duration = Number(endDate.getTime()) - Number(startDate.getTime());
            const compEnd = new Date(Number(startDate.getTime()) - (24 * 60 * 60 * 1000));
            const compStart = new Date(Number(compEnd.getTime()) - duration);
            newSelection.comparison = { label: 'vs. período anterior', start: compStart, end: compStart };
        }
        setPeriodSelection(newSelection);
    };

     const { 
        kpiData, 
        servicePopularityData,
        serviceDistributionData,
        peakHoursData,
        busiestDaysData,
        professionalPerformanceData,
        mostSoughtProfessionalsData,
        appointmentsByMonthData,
    } = useMemo(() => {
        const { start, end, comparison } = periodSelection;
        const startDate = start;
        const endDate = end;
        
        const appointmentsInPeriod = allAppointments.filter(a => Number(a.date.getTime()) >= Number(startDate.getTime()) && Number(a.date.getTime()) <= Number(endDate.getTime()));
        const completedInPeriod = appointmentsInPeriod.filter(a => a.status === 'completed');
        const appointmentsInComp = comparison ? allAppointments.filter(a => {
            const compStart = comparison.start;
            const compEnd = comparison.end;
            // FIX: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
            // FIX: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
            return Number(a.date.getTime()) >= Number(compStart.getTime()) && Number(a.date.getTime()) <= Number(compEnd.getTime());
        }) : [];
        const completedInComp = appointmentsInComp.filter(a => a.status === 'completed');
        
        const firstAppointmentsByClient = new Map<number, number>();
        allAppointments
            .slice()
            // FIX: Operator '+' cannot be applied to types 'number' and 'unknown'.
            .sort((a, b) => Number(a.date.getTime()) - Number(b.date.getTime()))
            .forEach(appt => {
                if (!firstAppointmentsByClient.has(appt.client.id)) {
                    // FIX: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
                    firstAppointmentsByClient.set(appt.client.id, Number(appt.date.getTime()));
                }
            });

        const calculateMetrics = (appts: FullAppointment[], periodStart: Date, periodEnd: Date): Metrics => {
            const revenue = appts.reduce<number>((sum: number, a) => sum + (parseFloat(a.service.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0), 0);
            const total = appts.length;
            const avgTicket = total > 0 ? revenue / total : 0;
            
            const clientsInPeriod = new Set(appts.map(a => a.client.id));
            let newClients = 0;
            let returningClients = 0;
            
            clientsInPeriod.forEach(clientId => {
                const firstApptTime = firstAppointmentsByClient.get(clientId);
                if (firstApptTime && typeof firstApptTime === 'number' && Number(firstApptTime) >= Number(periodStart.getTime()) && Number(firstApptTime) <= Number(periodEnd.getTime())) {
                    newClients++;
                } else {
                    returningClients++;
                }
            });
            
            const completed = appts.filter(a => a.status === 'completed').length;
            const noShows = appts.filter(a => a.status === 'no-show').length;
            const attendanceRate = (completed + noShows) > 0 ? (completed / (completed + noShows)) * 100 : 100;

            return { totalRevenue: revenue, totalAppointments: total, avgTicket, newClients, returningClients, attendanceRate };
        };
        
        const currentMetrics = calculateMetrics(completedInPeriod, startDate, endDate);
        const previousMetrics = comparison ? calculateMetrics(completedInComp, comparison.start, comparison.end) : { totalRevenue: 0, totalAppointments: 0, avgTicket: 0, newClients: 0, returningClients: 0, attendanceRate: 0 };
        
        const kpiData = [
            { title: "Faturamento Total", value: formatCurrency(currentMetrics.totalRevenue), icon: <KpiDollarIcon />, trend: calculateTrend(currentMetrics.totalRevenue, previousMetrics.totalRevenue), comparisonLabel: comparison?.label || '' },
            { title: "Agend. Concluídos", value: String(currentMetrics.totalAppointments), icon: <KpiCalendarIcon />, trend: calculateTrend(currentMetrics.totalAppointments, previousMetrics.totalAppointments), comparisonLabel: comparison?.label || '' },
            { title: "Ticket Médio", value: formatCurrency(currentMetrics.avgTicket), icon: <KpiTicketIcon />, trend: calculateTrend(currentMetrics.avgTicket, previousMetrics.avgTicket), comparisonLabel: comparison?.label || '' },
            { title: "Taxa de Comparecimento", value: `${currentMetrics.attendanceRate.toFixed(1)}%`, icon: <KpiChartPieIcon />, trend: calculateTrend(currentMetrics.attendanceRate, previousMetrics.attendanceRate), comparisonLabel: comparison?.label || '' },
            { title: "Novos Clientes", value: String(currentMetrics.newClients), icon: <KpiUserPlusIcon />, trend: calculateTrend(currentMetrics.newClients, previousMetrics.newClients), comparisonLabel: comparison?.label || '' },
            { title: "Clientes Recorrentes", value: String(currentMetrics.returningClients), icon: <KpiUsersIcon />, trend: calculateTrend(currentMetrics.returningClients, previousMetrics.returningClients), comparisonLabel: comparison?.label || '' },
        ];

        const serviceMap = completedInPeriod.reduce<Record<string, number>>((acc, a) => { acc[a.service.name] = (acc[a.service.name] || 0) + 1; return acc; }, {});
        const servicePopularityData = Object.entries(serviceMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
        
        const totalServiceCount = servicePopularityData.reduce((sum: number, item) => sum + item.value, 0);
        const serviceDistributionData = servicePopularityData.slice(0, 12).map(service => ({
            ...service,
            percent: totalServiceCount > 0 ? (service.value / totalServiceCount) * 100 : 0,
        }));

        const peakHoursMap: Record<string, number> = {'08-10': 0, '10-12': 0, '12-14': 0, '14-16': 0, '16-18': 0, '18-20': 0};
        completedInPeriod.forEach(a => { const hour = a.date.getUTCHours(); if(hour >= 8 && hour < 10) peakHoursMap['08-10']++; else if (hour >= 10 && hour < 12) peakHoursMap['10-12']++; else if (hour >= 12 && hour < 14) peakHoursMap['12-14']++; else if (hour >= 14 && hour < 16) peakHoursMap['14-16']++; else if (hour >= 16 && hour < 18) peakHoursMap['16-18']++; else if (hour >= 18 && hour < 20) peakHoursMap['18-20']++; });
        const peakHoursData = Object.entries(peakHoursMap).map(([hour, atendimentos]) => ({ hour, atendimentos }));
        
        const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const busiestDaysMap = completedInPeriod.reduce<Record<string, number>>((acc, a) => { const day = dayLabels[a.date.getUTCDay()]; acc[day] = (acc[day] ?? 0) + 1; return acc; }, {});
        const busiestDaysData = dayLabels.map((day) => ({ day, atendimentos: busiestDaysMap[day] || 0 }));

        const proMap = completedInPeriod.reduce((acc, a) => {
            const proId = a.professional.id;
            if (!acc[proId]) {
                acc[proId] = { id: proId, name: a.professional.name, faturamento: 0, atendimentos: 0 };
            }
            acc[proId].faturamento += (parseFloat(a.service.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0);
            acc[proId].atendimentos += 1;
            return acc;
        }, {} as Record<number, {id: number, name: string, faturamento: number, atendimentos: number}>);
        
        const professionalPerformanceData = Object.values(proMap)
            .map(p => ({
                ...p,
                ticketMedio: p.atendimentos > 0 ? p.faturamento / p.atendimentos : 0,
            }))
            .sort((a, b) => b.faturamento - a.faturamento)
            .map((p, index: number) => ({ ...p, index: index + 1 }));
        
        const mostSoughtMap = completedInPeriod.reduce((acc, a) => { acc[a.professional.name] = (acc[a.professional.name] || 0) + 1; return acc; }, {} as Record<string, number>);
        const mostSoughtProfessionalsData = Object.entries(mostSoughtMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, atendimentos]) => ({name, atendimentos}));
        
        const monthCounts: number[] = Array(12).fill(0);
        allAppointments.filter(a => a.date.getUTCFullYear() === 2025).forEach(a => { 
            const monthIndex = a.date.getUTCMonth();
            monthCounts[monthIndex] = (monthCounts[monthIndex] || 0) + 1;
         });
        const appointmentsByMonthData = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'].map((name, index) => ({ name, agendamentos: monthCounts[index] || 0 }));

        return { kpiData, servicePopularityData, serviceDistributionData, peakHoursData, busiestDaysData, professionalPerformanceData, mostSoughtProfessionalsData, appointmentsByMonthData };
    }, [periodSelection, allAppointments, allClients.length]);

        const handleExportCsv = () => {
            const headers = ["Rank", "Profissional", "Faturamento (R$)", "Nº Atendimentos", "Ticket Médio (R$)"];
            
            const rows = professionalPerformanceData.map(p => [
                p.index,
                p.name,
                p.faturamento.toFixed(2).replace('.',','),
                p.atendimentos,
                p.ticketMedio.toFixed(2).replace('.',','),
            ]);
            
            exportToCsv(`desempenho_profissionais_${periodSelection.label.replace(/\s/g, '_')}.csv`, [headers, ...rows]);
        };

        if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
        if (error) return <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start" role="alert"><ErrorIcon /><div><p className="font-bold">Ocorreu um Erro</p><p className="text-sm">{error}</p></div></div>;
        
        return (
            <div id="printable-area">
                <style>{`.no-print { display: block; } @media print { body * { visibility: hidden; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; } .no-print { display: none !important; } @page { size: auto; margin: 0.5in; } }`}</style>
                <div className="space-y-6">
                     <ReportToolbar
                        periodSelection={periodSelection}
                        onPeriodSelect={handlePeriodSelection}
                        allAppointments={allAppointments}
                        onPrint={() => window.print()}
                        onExportCsv={handleExportCsv}
                     />

                        <div className="hidden print:block mb-4">
                        <h2 className="text-2xl font-bold">Relatório de Desempenho</h2>
                        <p className="text-lg text-gray-600">{periodSelection.label}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kpiData.map(kpi => <StatCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} trend={kpi.trend} comparisonLabel={kpi.comparisonLabel} />)}
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
                        <h3 className="text-xl font-bold text-brand-dark mb-4">Agendamentos (Mês a Mês)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={appointmentsByMonthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => [value, "Agendamentos"]} />
                                <Bar dataKey="agendamentos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
                            <h3 className="text-xl font-bold text-brand-dark mb-4">Serviços Mais Populares</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={servicePopularityData.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={10} tick={false} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(value: number) => [`${value} atend.`, 'Atendimentos']}/>
                                    <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]}>
                                        <LabelList dataKey="name" position="insideLeft" fill="white" dx={5} style={{ fontWeight: 'bold' }} />
                                        <LabelList dataKey="value" position="right" formatter={(value: number) => `${value} atend.`} fontSize={12} fill="#333" fontWeight="bold"/>
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
                            <h3 className="text-xl font-bold text-brand-dark mb-4">Distribuição de Serviços</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={serviceDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                                        {serviceDistributionData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} /> ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props) => [`${(props.payload.percent).toFixed(1)}%`, name]}/>
                                    <Legend iconSize={10} wrapperStyle={{fontSize: "12px", bottom: -10}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
                            <h3 className="text-xl font-bold text-brand-dark mb-4">Horários de Pico</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={peakHoursData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value: number) => [value, "Atendimentos"]} />
                                    <Bar dataKey="atendimentos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
                            <h3 className="text-xl font-bold text-brand-dark mb-4">Dias Mais Movimentados</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={busiestDaysData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value: number) => [value, "Atendimentos"]} />
                                    <Bar dataKey="atendimentos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
                        <h3 className="text-xl font-bold text-brand-dark">Desempenho dos Profissionais</h3>
                        <div className="mt-6">
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={professionalPerformanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="index" tickFormatter={(tick) => `${tick}.`} tick={{ fontSize: 12 }} />
                                    <YAxis yAxisId="left" stroke="#3b82f6" tickFormatter={(value) => `R$ ${value >= 1000 ? `${value / 1000}k` : value}`} tick={{ fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomFinancialProfessionalTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.08)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                    <Bar yAxisId="left" dataKey="faturamento" name="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar yAxisId="right" dataKey="atendimentos" name="Atendimentos" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                                </ComposedChart>
                            </ResponsiveContainer>
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-2">
                                {professionalPerformanceData.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 text-sm">
                                        <span className="font-bold text-gray-800">{p.index}.</span>
                                        <span className="w-3 h-3 rounded-sm bg-[#3b82f6]"></span>
                                        <span className="w-3 h-3 rounded-sm bg-[#8b5cf6]"></span>
                                        <span className="text-gray-700">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <ClientAnalysis allAppointments={allAppointments} allClients={allClients} />
                </div>
            </div>
        );
};
