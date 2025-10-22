import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { AuditLogEntry, UnifiedUser } from '../../types';
import * as api from '../../api';
import { useAppContext } from '../../contexts/AppContext';
import { ReportToolbar } from '../../components/dashboard/ReportToolbar';
import { getQuickPeriodDates } from '../../components/dashboard/PeriodSelector';
import type { PeriodSelection } from '../../components/dashboard/PeriodSelector';

// --- ICONS ---
const ServicesIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 5.857L18.142 18m-12.284 0L18 5.857M6.43 14.57a3.429 3.429 0 110-4.858 3.429 3.429 0 010 4.858zm11.14 0a3.429 3.429 0 110-4.858 3.429 3.429 0 010 4.858z" /></svg>;
const UsersIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const PhotoIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const SecurityIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;
const ClientsIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CalendarIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

const entityIcons: Record<AuditLogEntry['entityType'], React.ReactNode> = {
    user: <UsersIcon />,
    client: <ClientsIcon />,
    appointment: <CalendarIcon />,
    service: <ServicesIcon />,
    branding: <PhotoIcon />,
    settings: <PhotoIcon />,
    campaign: <PhotoIcon />,
    security: <SecurityIcon />,
};

const exportToCsv = (filename: string, rows: (string | number)[][]) => {
    const processRow = (row: (string|number)[]) => row.map(val => {
        const str = String(val == null ? '' : val).replace(/<[^>]+>/g, ''); // Strip HTML
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


const ActionHistoryScreen = () => {
    const { users } = useAppContext();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [totalLogs, setTotalLogs] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        userId: 'all',
        searchTerm: '',
    });
     const [periodSelection, setPeriodSelection] = useState<PeriodSelection>(() => {
        const { start, end } = getQuickPeriodDates('last7');
        return { type: 'quick', key: 'last7', label: 'Últimos 7 dias', start, end };
    });

    const ITEMS_PER_PAGE = 15;

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        const { logs: fetchedLogs, total } = await api.getAuditLog({ 
            ...filters, 
            start: periodSelection.start, 
            end: periodSelection.end, 
            page: currentPage, 
            limit: ITEMS_PER_PAGE 
        });
        setLogs(fetchedLogs);
        setTotalLogs(total);
        setIsLoading(false);
    }, [filters, currentPage, periodSelection]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, periodSelection]);
    
    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const totalPages = Math.ceil(totalLogs / ITEMS_PER_PAGE);

    const handleExportCsv = async () => {
        const { logs: allFilteredLogs } = await api.getAuditLog({ 
            ...filters, 
            start: periodSelection.start, 
            end: periodSelection.end,
            page: 1, 
            limit: totalLogs 
        });
        const headers = ["Data", "Usuário", "Descrição"];
        const rows = allFilteredLogs.map(log => [
            log.timestamp.toLocaleString('pt-BR'),
            log.userName,
            log.description
        ]);
        exportToCsv(`historico_de_acoes.csv`, [headers, ...rows]);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div id="printable-area">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                    @page { size: auto; margin: 0.5in; }
                }
            `}</style>
            <div className="space-y-6">
                <ReportToolbar
                    periodSelection={periodSelection}
                    onPeriodSelect={setPeriodSelection}
                    onPrint={handlePrint}
                    onExportCsv={handleExportCsv}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <select value={filters.userId} onChange={e => handleFilterChange('userId', e.target.value)} className="select-dark">
                            <option value="all">Todos os Usuários</option>
                            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </select>
                        <input type="text" placeholder="Buscar na descrição..." value={filters.searchTerm} onChange={e => handleFilterChange('searchTerm', e.target.value)} className="input-dark" />
                    </div>
                </ReportToolbar>
                
                <div className="bg-white p-6 rounded-xl shadow-md border">
                    <h2 className="text-xl font-bold font-serif mb-4 print:block hidden">Histórico de Ações</h2>
                    {isLoading ? (
                        <div className="text-center p-8">Carregando histórico...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center p-8">Nenhuma ação encontrada para os filtros selecionados.</div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map(log => (
                                <div key={log.id} className="flex items-start gap-4 p-3 border-b last:border-b-0">
                                    <div className="p-2 bg-gray-100 rounded-full text-brand-primary no-print">{entityIcons[log.entityType]}</div>
                                    <div className="flex-grow">
                                        <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: log.description }} />
                                        <div className="text-xs text-gray-500 mt-1">
                                            <span>por <strong>{log.userName}</strong></span>
                                            <span className="mx-1">•</span>
                                            <span>{log.timestamp.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 no-print">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="btn-secondary">Anterior</button>
                        <span className="text-sm font-medium">Página {currentPage} de {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="btn-secondary">Próximo</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionHistoryScreen;
