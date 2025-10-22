

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as api from '../../api';
import type { FullAppointment, UnifiedUser } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

// --- ICONS ---
const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const CloseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
const PrintIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const FilePdfIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const FileCsvIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;


// --- HELPER FUNCTIONS ---
const exportToCsv = (filename: string, rows: (string | number)[][]) => {
    const processRow = (row: (string|number)[]) => row.map(val => {
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

const getStatusLabel = (status: FullAppointment['status']): string => {
    const map: Record<FullAppointment['status'], string> = {
        completed: 'Concluído', scheduled: 'Agendado',
        cancelled: 'Cancelado', 'no-show': 'Não Compareceu',
    };
    return map[status] || status;
};

const getStatusColorClass = (status: FullAppointment['status']): string => {
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800 border-l-4 border-green-500';
        case 'cancelled': return 'bg-red-100 text-red-800 border-l-4 border-red-500';
        case 'no-show': return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
        case 'scheduled':
        default:
            return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
    }
};

const getStatusPillClass = (status: FullAppointment['status'], selected: boolean): string => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all duration-200";
    const colors: Record<FullAppointment['status'], { selected: string, unselected: string }> = {
        scheduled: { selected: 'bg-blue-500 text-white shadow', unselected: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
        completed: { selected: 'bg-green-500 text-white shadow', unselected: 'bg-green-100 text-green-800 hover:bg-green-200' },
        cancelled: { selected: 'bg-red-500 text-white shadow', unselected: 'bg-red-100 text-red-800 hover:bg-red-200' },
        'no-show': { selected: 'bg-yellow-500 text-white shadow', unselected: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    };
    return `${base} ${selected ? colors[status].selected : colors[status].unselected}`;
};


// --- MODAL COMPONENTS ---
const AppointmentDetailsModal: React.FC<{ appointment: FullAppointment | null; onClose: () => void; }> = ({ appointment, onClose }) => {
    if (!appointment) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4 no-print" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl text-brand-dark flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">Detalhes do Agendamento</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <main className="p-6 space-y-4">
                    <div><p className="text-sm text-gray-500">Serviço</p><p className="font-semibold text-lg">{appointment.service.name}</p></div>
                    <div><p className="text-sm text-gray-500">Cliente</p><p className="font-semibold">{appointment.client.name}</p></div>
                    <div><p className="text-sm text-gray-500">Profissional</p><p className="font-semibold">{appointment.professional.name}</p></div>
                    <div><p className="text-sm text-gray-500">Data e Hora</p><p className="font-semibold">{appointment.date.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' })}</p></div>
                    <div><p className="text-sm text-gray-500">Situação</p><p className="font-semibold">{getStatusLabel(appointment.status)}</p></div>
                </main>
            </div>
        </div>
    );
};

const allStatuses: FullAppointment['status'][] = ['scheduled', 'completed', 'cancelled', 'no-show'];

const DayAppointmentsModal: React.FC<{ 
    date: Date | null; 
    appointments: FullAppointment[];
    professionals: UnifiedUser[];
    onClose: () => void;
    onEventClick: (event: FullAppointment) => void;
    initialProId: 'all' | number;
}> = ({ date, appointments, professionals, onClose, onEventClick, initialProId }) => {
    
    const [selectedProId, setSelectedProId] = useState<'all' | number>(initialProId);
    const [selectedStatuses, setSelectedStatuses] = useState<FullAppointment['status'][]>(allStatuses);

    useEffect(() => {
        if (date) { // When modal opens/date changes, reset filters
            setSelectedProId(initialProId);
            setSelectedStatuses(allStatuses);
        }
    }, [date, initialProId]);

    const professionalsOnThisDay = useMemo(() => {
        const proIds = new Set(appointments.map(a => a.professional.id));
        return professionals.filter(p => proIds.has(p.id));
    }, [appointments, professionals]);

    const statusCounts = useMemo(() => {
        const counts: Record<FullAppointment['status'], number> = { scheduled: 0, completed: 0, cancelled: 0, 'no-show': 0 };
        const appointmentsFilteredByPro = selectedProId === 'all'
            ? appointments
            : appointments.filter(a => a.professional.id === selectedProId);

        for (const appt of appointmentsFilteredByPro) {
            counts[appt.status]++;
        }
        return counts;
    }, [appointments, selectedProId]);

    const filteredAppointments = useMemo(() => {
        const sorted = [...appointments].sort((a,b) => a.date.getTime() - b.date.getTime());
        
        const byPro = selectedProId === 'all' 
            ? sorted 
            : sorted.filter(a => a.professional.id === selectedProId);

        return byPro.filter(a => selectedStatuses.includes(a.status));
    }, [appointments, selectedProId, selectedStatuses]);
    
    const handleStatusToggle = (status: FullAppointment['status']) => {
        setSelectedStatuses(prev => 
            prev.includes(status) 
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };
    
    const handleDownloadCsvDay = () => {
        const dateStr = date!.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        const headers = ["Data", "Hora", "Cliente", "Serviço", "Profissional", "Status"];
        const rows = filteredAppointments.map(appt => [
            appt.date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
            appt.client.name,
            appt.service.name,
            appt.professional.name,
            getStatusLabel(appt.status)
        ]);
        exportToCsv(`agendamentos_${date!.toISOString().split('T')[0]}.csv`, [headers, ...rows]);
    };

    if (!date) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 no-print" onClick={onClose}>
            <div id="day-modal-printable-area" className="bg-white w-full max-w-2xl h-[90vh] max-h-[800px] rounded-xl shadow-xl text-brand-dark flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center shrink-0 no-print">
                    <h3 className="font-bold text-lg capitalize">Agendamentos do Dia</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                 <div className="p-4 border-b shrink-0 space-y-4">
                    <p className="font-bold text-lg capitalize text-center">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}</p>
                    <select 
                        id="pro-filter"
                        value={String(selectedProId)}
                        onChange={(e) => setSelectedProId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 no-print"
                    >
                        <option value="all">Todos os Profissionais ({appointments.length})</option>
                        {professionalsOnThisDay.map(pro => {
                             const count = appointments.filter(a => a.professional.id === pro.id).length;
                             return <option key={pro.id} value={pro.id}>{pro.name} ({count})</option>
                        })}
                    </select>
                    <div className="flex flex-wrap items-center justify-center gap-2 no-print">
                        {allStatuses.map(status => {
                            const count = statusCounts[status];
                            if (count === 0) return null;
                            return (
                                <button key={status} onClick={() => handleStatusToggle(status)} className={getStatusPillClass(status, selectedStatuses.includes(status))}>
                                    {getStatusLabel(status)} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
                <main className="p-4 space-y-3 overflow-y-auto">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appt => (
                            <div key={appt.id} onClick={() => onEventClick(appt)} className={`p-3 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors ${getStatusColorClass(appt.status)}`}>
                                <p className="font-bold text-brand-primary">{appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</p>
                                <div>
                                    <p className="font-semibold text-gray-800">{appt.service.name}</p>
                                    <p className="text-sm text-gray-500">{appt.client.name} com {appt.professional.name}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center text-center py-10">
                            <p className="text-gray-500">Nenhum agendamento para os filtros selecionados.</p>
                        </div>
                    )}
                </main>
                 <footer className="p-4 bg-gray-50 flex justify-between items-center shrink-0 rounded-b-xl no-print">
                    <div className="flex gap-2">
                        <button title="Imprimir" onClick={() => window.print()} className="btn-secondary p-2"><PrintIcon /></button>
                        <button title="Salvar PDF" onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm"><FilePdfIcon /> PDF</button>
                        <button title="Exportar CSV" onClick={handleDownloadCsvDay} className="btn-secondary flex items-center gap-2 text-sm"><FileCsvIcon /> CSV</button>
                    </div>
                    <button onClick={onClose} className="btn-secondary">Fechar</button>
                </footer>
            </div>
        </div>
    );
};


// --- VIEW COMPONENTS ---
const MonthView: React.FC<{
    currentDate: Date;
    appointmentsByDate: Record<string, FullAppointment[]>;
    onDayClick: (date: Date) => void;
}> = ({ currentDate, appointmentsByDate, onDayClick }) => {
    const month = currentDate.getUTCMonth();
    const year = currentDate.getUTCFullYear();
    
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    let startDayOfWeek = firstDayOfMonth.getUTCDay(); 
    if (startDayOfWeek === 0) startDayOfWeek = 7; 

    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const blanks = Array.from({ length: startDayOfWeek - 1 });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const today = new Date('2025-10-15T12:00:00Z');
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));


    return (
        <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
                <div key={index} className="text-center font-semibold text-[10px] sm:text-xs py-2 border-r border-b bg-gray-50">{day}</div>
            ))}
            {blanks.map((_, index) => <div key={`blank-${index}`} className="border-r border-b bg-gray-50/50"></div>)}
            {days.map((day) => {
                const dayDate = new Date(Date.UTC(year, month, day));
                const dateKey = dayDate.toISOString().split('T')[0];
                const dayAppointments = appointmentsByDate[dateKey] || [];
                const isToday = dayDate.getTime() === todayUTC.getTime();

                return (
                    <div key={day} onClick={() => onDayClick(dayDate)} className={`min-h-[4.5rem] sm:min-h-[6rem] border-r border-b p-1 flex flex-col cursor-pointer transition-colors bg-white hover:bg-gray-50`}>
                        <span className={`text-xs font-semibold self-center sm:self-start ${isToday ? 'bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-gray-800'}`}>{day}</span>
                        <div className="flex-grow overflow-y-auto no-scrollbar mt-1 space-y-1">
                            {dayAppointments.slice(0, 2).map(appt => (
                                <div key={appt.id} className={`w-full p-1 text-left text-[10px] rounded truncate ${getStatusColorClass(appt.status)}`}>
                                    {appt.client.name.split(' ')[0]}
                                </div>
                            ))}
                            {dayAppointments.length > 2 && <div className="text-[10px] text-center text-gray-500 font-medium">+{dayAppointments.length - 2}</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const PrintableMonthView: React.FC<{ appointments: FullAppointment[], date: Date }> = ({ appointments, date }) => (
    <div id="month-printable-area">
        <h2 className="text-2xl font-bold mb-2">
            Agendamentos para {date.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
        </h2>
        {appointments.length > 0 ? (
            <div className="space-y-4">
                {appointments.map(appt => (
                     <div key={appt.id} className="p-3 border-b">
                        <p><strong>{appt.date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</strong></p>
                        <p>{appt.service.name} com {appt.professional.name}</p>
                        <p>Cliente: {appt.client.name}</p>
                        <p>Status: {getStatusLabel(appt.status)}</p>
                    </div>
                ))}
            </div>
        ) : <p>Nenhum agendamento para este mês.</p>}
    </div>
);


// --- MAIN COMPONENT ---
const CalendarScreen: React.FC = () => {
    const { users } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date('2025-10-15T12:00:00Z'));
    const [appointments, setAppointments] = useState<FullAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<FullAppointment | null>(null);
    const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [selectedProId, setSelectedProId] = useState<'all' | number>('all');
    
    const professionals = useMemo(() => users.filter(u => u.accessLevel === 'professional' && u.id !== 0), [users]);

    const handlePrint = () => {
        setIsPrinting(true);
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const year = currentDate.getUTCFullYear();
                const month = currentDate.getUTCMonth();
                
                const startDate = new Date(Date.UTC(year, month, 1));
                startDate.setUTCHours(0, 0, 0, 0);

                const endDate = new Date(Date.UTC(year, month + 1, 0));
                endDate.setUTCHours(23, 59, 59, 999);
                
                const data = await api.getAppointments({ startDate, endDate });
                setAppointments(data);
            } catch (err) {
                console.error("Failed to load appointments:", err);
                setError("Não foi possível carregar os agendamentos do calendário.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, [currentDate]);
    
    useEffect(() => {
        if (isPrinting) {
            setTimeout(() => {
                window.print();
                setIsPrinting(false);
            }, 100);
        }
    }, [isPrinting]);

    const appointmentsByDate = useMemo(() => {
        const filteredAppointments = selectedProId === 'all'
            ? appointments
            : appointments.filter(appt => appt.professional.id === selectedProId);
        
        return filteredAppointments.reduce((acc, appt) => {
            const dateKey = appt.date.toISOString().split('T')[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(appt);
            return acc;
        }, {} as Record<string, FullAppointment[]>);
    }, [appointments, selectedProId]);

    const appointmentsForDayModal = useMemo(() => {
        if (!selectedDayForModal) return [];
        const dateKey = selectedDayForModal.toISOString().split('T')[0];
        return appointments.filter(a => a.date.toISOString().split('T')[0] === dateKey);
    }, [selectedDayForModal, appointments]);

    const appointmentsForCurrentMonth = useMemo(() => {
        // The `appointments` state now only contains data for the current month.
        // The filter is no longer necessary, but sorting is still good.
        return [...appointments].sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [appointments]);

    const handleNavigate = useCallback((action: 'TODAY') => {
        if (action === 'TODAY') {
            const today = new Date('2025-10-15T12:00:00Z');
            const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            setCurrentDate(todayUTC);
            setSelectedDayForModal(todayUTC);
        }
    }, []);
    
    const handleDateChange = (year: number, month: number) => {
        const newDate = new Date(Date.UTC(year, month, 15));
        setCurrentDate(newDate);
    };
    
    const handleDayClickInMonth = (date: Date) => {
        setSelectedDayForModal(date);
    };

    const handleEventClickInDayModal = (event: FullAppointment) => {
        setSelectedAppointment(event);
    };
    
    const closeDetailsAndKeepDayOpen = () => {
        setSelectedAppointment(null);
    };
    
    const handleDownloadCsvMonth = () => {
        const monthStr = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        const headers = ["Data", "Hora", "Cliente", "Serviço", "Profissional", "Status"];
        const rows = appointmentsForCurrentMonth.map(appt => [
            appt.date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
            appt.client.name,
            appt.service.name,
            appt.professional.name,
            getStatusLabel(appt.status)
        ]);
        exportToCsv(`agendamentos_${monthStr.split(' de ').join('_')}.csv`, [headers, ...rows]);
    };

    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    const years = Array.from({ length: 11 }, (_, i) => year - 5 + i);
    const months = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(2000, i, 1)).toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' }));


    if (error) {
        return (
             <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start" role="alert">
                <ErrorIcon />
                <div><p className="font-bold">Ocorreu um Erro</p><p className="text-sm">{error}</p></div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6" id="printable-area">
            <style>{`
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .print-only { display: none; }
                @media print {
                    body > *:not(#printable-content) { display: none; }
                    #printable-content, #printable-content * { visibility: visible; }
                    #printable-content { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    @page { size: auto; margin: 0.5in; }
                    #day-modal-printable-area {
                        box-shadow: none !important;
                        border: none !important;
                        height: auto;
                        max-height: none;
                    }
                }
            `}</style>
             <div id="printable-content">
                {isPrinting && <PrintableMonthView appointments={appointmentsForCurrentMonth} date={currentDate} />}
            </div>
            
             <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 no-print">
                    <h3 className="text-xl font-bold text-gray-900">Calendário de Agendamentos</h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                        <select value={String(selectedProId)} onChange={(e) => setSelectedProId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="select-dark w-full sm:w-60">
                            <option value="all">Todos os Profissionais</option>
                            {professionals.map(pro => (
                                <option key={pro.id} value={pro.id}>{pro.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 p-4 rounded-lg bg-brand-dark no-print">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <button onClick={() => handleNavigate('TODAY')} className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-700 text-white hover:bg-gray-600 border border-gray-500">Hoje</button>
                        <div className="flex items-center">
                            <button onClick={() => handleDateChange(year, month - 1)} className="p-2 w-9 h-9 flex items-center justify-center rounded-full bg-brand-primary text-white hover:bg-brand-accent transition-colors" aria-label="Mês anterior"><ChevronLeftIcon /></button>
                            <button onClick={() => handleDateChange(year, month + 1)} className="p-2 w-9 h-9 flex items-center justify-center rounded-full bg-brand-primary text-white hover:bg-brand-accent transition-colors" aria-label="Próximo mês"><ChevronRightIcon /></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <select value={month} onChange={(e) => handleDateChange(year, parseInt(e.target.value))} className="select-dark capitalize">
                                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select value={year} onChange={(e) => handleDateChange(parseInt(e.target.value), month)} className="select-dark">
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                        <button title="Imprimir Mês" onClick={handlePrint} className="p-2 rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 border border-gray-500"><PrintIcon /></button>
                        <button title="Salvar Mês em PDF" onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 border border-gray-500"><FilePdfIcon /> PDF</button>
                        <button title="Exportar Mês para CSV" onClick={handleDownloadCsvMonth} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 border border-gray-500"><FileCsvIcon /> CSV</button>
                    </div>
                </div>

                <div className="flex-grow min-w-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><p>Carregando calendário...</p></div>
                    ) : (
                        <MonthView currentDate={currentDate} appointmentsByDate={appointmentsByDate} onDayClick={handleDayClickInMonth} />
                    )}
                </div>
            </div>

            <DayAppointmentsModal 
                date={selectedDayForModal}
                appointments={appointmentsForDayModal}
                professionals={professionals}
                onClose={() => setSelectedDayForModal(null)}
                onEventClick={handleEventClickInDayModal}
                initialProId={selectedProId}
            />
            <AppointmentDetailsModal appointment={selectedAppointment} onClose={closeDetailsAndKeepDayOpen} />
        </div>
    );
};

export default CalendarScreen;
