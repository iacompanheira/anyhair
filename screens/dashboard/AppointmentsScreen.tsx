
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, Service, FullAppointment } from '../../types';
import * as api from '../../api';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/formatters';

// --- ICONS ---
const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const Spinner: React.FC = () => (<svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const CalendarIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ChevronDownIcon: React.FC<{ open: boolean }> = ({ open }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 text-gray-500 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
const PrintIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const FilePdfIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const FileCsvIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

// Modal-specific Icons
const ModalCloseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ModalUserCircleIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ModalScissorsIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 5.857L18.142 18m-12.284 0L18 5.857M6.43 14.57a3.429 3.429 0 110-4.858 3.429 3.429 0 010 4.858zm11.14 0a3.429 3.429 0 110-4.858 3.429 3.429 0 010 4.858z" /></svg>;
const ModalCalendarIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;


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

const CardSkeleton: React.FC<{ count: number }> = ({ count }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="bg-white shadow-sm rounded-lg flex items-center p-4 gap-4 animate-pulse">
                <div className="w-24 h-16 bg-gray-200 rounded-md"></div>
                <div className="flex-grow space-y-3">
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
            </div>
        ))}
    </div>
);

const DatePickerCalendar: React.FC<{
    currentMonth: Date;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    onMonthChange: (offset: number) => void;
}> = ({ currentMonth, selectedDate, onDateSelect, onMonthChange }) => {
    const year = currentMonth.getUTCFullYear();
    const month = currentMonth.getUTCMonth();
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const blanks = Array.from({ length: (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1) });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="bg-brand-input-bg text-white p-3 rounded-xl shadow-xl border border-gray-700 absolute top-full mt-2 z-10 w-72">
            <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={() => onMonthChange(-1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors w-8 h-8 flex items-center justify-center">&lt;</button>
                <span className="font-semibold text-sm capitalize">{currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>
                <button type="button" onClick={() => onMonthChange(1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors w-8 h-8 flex items-center justify-center">&gt;</button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-medium">
                {weekDays.map(day => <div key={day} className="h-8 flex items-center justify-center">{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
                {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                {days.map(day => {
                    const date = new Date(Date.UTC(year, month, day));
                    const isSelected = selectedDate.getTime() === date.getTime();
                    
                    let dayButtonClasses = 'w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-150';

                    if (isSelected) {
                        dayButtonClasses += ' bg-brand-primary text-white ring-2 ring-offset-2 ring-brand-primary ring-offset-brand-input-bg';
                    } else {
                        dayButtonClasses += ' text-gray-200 hover:bg-gray-700';
                    }

                    return (
                        <div key={day} className="flex items-center justify-center p-0.5">
                             <button onClick={() => onDateSelect(date)} className={dayButtonClasses}>
                                {day}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const StatusBadge: React.FC<{ status: FullAppointment['status'] }> = ({ status }) => {
    const statusMap = {
        completed: { text: 'Concluído', color: 'bg-green-100 text-green-800' },
        cancelled: { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
        'no-show': { text: 'Não Compareceu', color: 'bg-yellow-100 text-yellow-800' },
        scheduled: { text: 'Agendado', color: 'bg-blue-100 text-blue-800' },
    };
    const { text, color } = statusMap[status] || statusMap.scheduled;

    return <span className={`px-2.5 py-1 text-sm font-semibold rounded-full ${color}`}>{text}</span>;
};

const PaymentStatusBadge: React.FC<{ paymentStatus?: 'paid' | 'pending'; paymentMethod?: string; }> = ({ paymentStatus, paymentMethod }) => {
    if (paymentStatus === 'paid') {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Pago ({paymentMethod})</span>;
    }
    if (paymentStatus === 'pending') {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Pendente de Pagamento</span>;
    }
    return null;
}

const PaymentModal: React.FC<{
    appointment: FullAppointment;
    onClose: () => void;
    onConfirm: (paymentMethod: string) => void;
    onSkip: () => void;
    isPaymentMandatory: boolean;
}> = ({ appointment, onClose, onConfirm, onSkip, isPaymentMandatory }) => {
    const [otherMethod, setOtherMethod] = useState('');

    const handleConfirm = (method: string) => {
        if (method === 'Outro' && !otherMethod.trim()) return;
        onConfirm(method === 'Outro' ? otherMethod.trim() : method);
    };
    
    const paymentMethods = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Registrar Pagamento</h3>
                    <p className="text-sm text-gray-600">{appointment.service.name} - {appointment.service.price}</p>
                    {isPaymentMandatory && <p className="text-xs text-red-600 font-semibold mt-1">O registro do pagamento é obrigatório.</p>}
                </div>
                <div className="p-5 grid grid-cols-2 gap-3">
                    {paymentMethods.map(method => (
                        <button key={method} onClick={() => handleConfirm(method)} className="p-4 text-center font-semibold border rounded-lg hover:bg-brand-secondary hover:border-brand-primary transition-colors text-gray-800">
                            {method}
                        </button>
                    ))}
                    <div className="col-span-2 flex gap-2">
                        <input
                            type="text"
                            placeholder="Outro método"
                            value={otherMethod}
                            onChange={(e) => setOtherMethod(e.target.value)}
                            className="input-dark flex-grow"
                        />
                         <button onClick={() => handleConfirm('Outro')} disabled={!otherMethod.trim()} className="btn-secondary whitespace-nowrap disabled:opacity-50">Confirmar</button>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    {!isPaymentMandatory && (
                        <button onClick={onSkip} className="btn-secondary">Registrar Depois</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const AppointmentDetailsModal: React.FC<{
  appointment: FullAppointment | null;
  onClose: () => void;
}> = ({ appointment, onClose }) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4 no-print" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="appointment-details-title">
      <style>{`.animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl text-brand-dark flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b flex justify-between items-center">
          <h3 id="appointment-details-title" className="font-bold text-lg">Detalhes do Agendamento</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Fechar modal"><ModalCloseIcon /></button>
        </header>
        <main className="p-6 space-y-6">
          {/* Service & Professional */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-pink-100 rounded-full text-brand-primary"><ModalScissorsIcon /></div>
              <div>
                  <p className="font-bold text-lg text-brand-dark">{appointment.service.name}</p>
                  <p className="text-sm text-gray-600">com <span className="font-semibold">{appointment.professional.name}</span></p>
                  <p className="text-sm text-gray-500">{formatCurrency(parseFloat(appointment.service.price.replace('R$', '').replace(',', '.')))} • {appointment.service.duration}</p>
              </div>
          </div>

          {/* Date & Time */}
           <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600"><ModalCalendarIcon /></div>
              <div>
                  <p className="font-bold text-lg text-brand-dark">{appointment.date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                  <p className="text-sm text-gray-600">às <span className="font-semibold">{appointment.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</span></p>
              </div>
          </div>
          
          {/* Client Info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-gray-200 rounded-full text-gray-600"><ModalUserCircleIcon /></div>
              <div>
                  <p className="font-bold text-lg text-brand-dark">{appointment.client.name}</p>
                  <p className="text-sm text-gray-600">{appointment.client.phone}</p>
                  <p className="text-sm text-gray-500">{appointment.client.email}</p>
              </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">Status do Agendamento:</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={appointment.status} />
                {appointment.status === 'completed' && <PaymentStatusBadge paymentStatus={appointment.paymentStatus} paymentMethod={appointment.paymentMethod} />}
              </div>
          </div>
        </main>
        <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="btn-secondary">Fechar</button>
        </footer>
      </div>
    </div>
  );
};


export const AppointmentsScreen: React.FC<{ role: UserRole; onRebook?: (service: Service) => void; }> = ({ role, onRebook }) => {
    const { loggedInStaff, isPaymentMandatory } = useAppContext();
    const [allAppointments, setAllAppointments] = useState<FullAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingAppointments, setUpdatingAppointments] = useState<string[]>([]);
    const [paymentAppointment, setPaymentAppointment] = useState<FullAppointment | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<FullAppointment | null>(null);


    // Admin state
    const [selectedDate, setSelectedDate] = useState(() => { const d = new Date('2025-10-15T12:00:00Z'); d.setUTCHours(0,0,0,0); return d; });
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date('2025-10-15T12:00:00Z'));
    const [clientSearch, setClientSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [isSummaryVisible, setIsSummaryVisible] = useState(false);
    
    // Customer state
    const [pastAppointmentsPage, setPastAppointmentsPage] = useState(1);
    const PAST_APPOINTMENTS_PER_PAGE = 8;


    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apptsData = await api.getAppointments();
                if (role === 'customer') {
                    const loggedInClientId = sessionStorage.getItem('logged_in_client_id');
                    const customerAppointments = apptsData.filter(a => String(a.client.id) === loggedInClientId);
                    setAllAppointments(customerAppointments);
                } else {
                    setAllAppointments(apptsData);
                }
            } catch (error) {
                console.error('Falha ao carregar agendamentos:', error);
                setError('Ocorreu um erro ao carregar os agendamentos. Por favor, tente novamente mais tarde.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, [role]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleUpdateStatus = async (id: string, status: FullAppointment['status'], paymentMethod?: string) => {
        setUpdatingAppointments(prev => [...prev, id]);
        const originalAppointments = [...allAppointments];
        const updatedAll = allAppointments.map(a => {
            if (a.id === id) {
                const updatedAppt: FullAppointment = { ...a, status };
                if (status === 'completed') {
                    if (paymentMethod) {
                        updatedAppt.paymentStatus = 'paid';
                        updatedAppt.paymentMethod = paymentMethod;
                    } else if (a.paymentStatus !== 'paid') {
                        updatedAppt.paymentStatus = 'pending';
                    }
                } else if (status === 'scheduled') {
                    updatedAppt.paymentStatus = 'pending';
                    updatedAppt.paymentMethod = undefined;
                }
                return updatedAppt;
            }
            return a;
        });
        setAllAppointments(updatedAll);
        
        try {
            await api.updateAppointmentStatus(id, status, paymentMethod);
        } catch (error) {
            console.error('Falha ao atualizar status:', error);
            setAllAppointments(originalAppointments); 
        } finally {
            setUpdatingAppointments(prev => prev.filter(appId => appId !== id));
        }
    };
    
    const handleRevertStatus = (appointment: FullAppointment) => {
        if (appointment.status === 'completed' && !['admin', 'super_admin'].includes(loggedInStaff?.accessLevel || '')) {
            alert('Apenas administradores podem reverter um agendamento concluído.');
            return;
        }
        handleUpdateStatus(appointment.id, 'scheduled');
    };

    // --- ADMIN LOGIC ---
    const filteredAdminAppointments = useMemo(() => {
        if (role !== 'admin') return [];
        
        const start = new Date(selectedDate);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setUTCHours(23, 59, 59, 999);
        
        return allAppointments.filter(a => {
            const isCorrectDate = Number(a.date.getTime()) >= Number(start.getTime()) && Number(a.date.getTime()) <= Number(end.getTime());
            if (!isCorrectDate) return false;

            if (statusFilter !== 'all' && a.status !== statusFilter) return false;

            if (clientSearch && !a.client.name.toLowerCase().includes(clientSearch.toLowerCase())) return false;
            
            return true;
        }).sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [allAppointments, selectedDate, statusFilter, clientSearch, role]);

    const kpiData = useMemo(() => {
        const appointments = filteredAdminAppointments;
        const revenue = appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + (parseFloat(a.service.price.replace('R$', '').replace(',', '.')) || 0), 0);
        const scheduled = appointments.filter(a => a.status === 'scheduled').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        const noShows = appointments.filter(a => a.status === 'no-show').length;
        return { revenue, scheduled, cancelled, noShows };
    }, [filteredAdminAppointments]);

     const handleAdminExport = () => {
        const headers = ["Data", "Hora", "Cliente", "Telefone", "Serviço", "Profissional", "Preço", "Status", "Status Pag."];
        const rows = filteredAdminAppointments.map(a => [
            a.date.toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
            a.date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', timeZone: 'UTC'}),
            a.client.name,
            a.client.phone,
            a.service.name,
            a.professional.name,
            a.service.price,
            a.status,
            a.paymentStatus || ''
        ]);
        exportToCsv(`agendamentos_${selectedDate.toISOString().split('T')[0]}.csv`, [headers, ...rows]);
    };
    
    // --- CUSTOMER LOGIC ---
    const { upcomingAppointments, pastAppointments, paginatedPastAppointments, totalPages } = useMemo(() => {
        if (role !== 'customer') {
            return { upcomingAppointments: [], pastAppointments: [], paginatedPastAppointments: [], totalPages: 0 };
        }
        const now = new Date('2025-10-15T12:00:00Z');
        const upcoming = allAppointments
            .filter(a => Number(a.date.getTime()) >= Number(now.getTime()) && a.status === 'scheduled')
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        const past = allAppointments
            .filter(a => Number(a.date.getTime()) < Number(now.getTime()) || a.status !== 'scheduled')
            .sort((a, b) => b.date.getTime() - a.date.getTime());
            
        const totalPgs = Math.ceil(past.length / PAST_APPOINTMENTS_PER_PAGE);
        const paginated = past.slice((pastAppointmentsPage - 1) * PAST_APPOINTMENTS_PER_PAGE, pastAppointmentsPage * PAST_APPOINTMENTS_PER_PAGE);
            
        return { upcomingAppointments: upcoming, pastAppointments: past, paginatedPastAppointments: paginated, totalPages: totalPgs };
    }, [allAppointments, role, pastAppointmentsPage]);

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start" role="alert">
                <ErrorIcon />
                <div>
                    <p className="font-bold">Ocorreu um Erro</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }
    
    if (role === 'admin') {
        return (
            <div className="space-y-0.5" id="printable-area">
                 <style>{`.no-print { display: block; } @media print { body * { visibility: hidden; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; } .no-print { display: none !important; } @page { size: auto; margin: 0.5in; } }`}</style>
                {/* Filtros e Ações */}
                <div className="bg-white rounded-xl shadow-md border no-print">
                    <button
                        onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                        className="w-full p-4 flex justify-between items-center text-left"
                        aria-expanded={isFiltersVisible}
                        aria-controls="filters-panel"
                    >
                        <h3 className="font-bold text-lg text-brand-dark">Filtros e Ações de Exportação</h3>
                        <ChevronDownIcon open={isFiltersVisible} />
                    </button>
                    {isFiltersVisible && (
                        <div id="filters-panel" className="p-4 border-t space-y-4 animate-fade-in-down">
                            <div className="flex flex-wrap items-center gap-4">
                                <div ref={datePickerRef} className="relative">
                                    <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="input-dark !flex items-center justify-between w-72">
                                        <span className="flex items-center gap-2"><CalendarIcon />{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>
                                        <ChevronDownIcon open={isCalendarOpen} />
                                    </button>
                                    {isCalendarOpen && <DatePickerCalendar currentMonth={calendarMonth} selectedDate={selectedDate} onDateSelect={(date) => {setSelectedDate(date); setIsCalendarOpen(false);}} onMonthChange={(offset) => setCalendarMonth(prev => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + offset, 15)))} />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setSelectedDate(prev => { const d = new Date(prev); d.setUTCDate(d.getUTCDate() - 1); return d; })} className="btn-secondary text-sm !px-3"> &lt; </button>
                                    <button onClick={() => setSelectedDate(() => { const d = new Date('2025-10-15T12:00:00Z'); d.setUTCHours(0,0,0,0); return d; })} className="btn-secondary text-sm">Hoje</button>
                                    <button onClick={() => setSelectedDate(prev => { const d = new Date(prev); d.setUTCDate(d.getUTCDate() + 1); return d; })} className="btn-secondary text-sm !px-3"> &gt; </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Nome do cliente..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="input-dark" />
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-dark">
                                    <option value="all">Todos os Status</option><option value="scheduled">Agendado</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option><option value="no-show">Não Compareceu</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm"><PrintIcon /> Imprimir</button>
                                <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm"><FilePdfIcon /> PDF</button>
                                <button onClick={handleAdminExport} className="btn-secondary flex items-center gap-2 text-sm"><FileCsvIcon /> CSV</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resumo do Dia */}
                <div className="bg-white rounded-xl shadow-md border no-print">
                    <button
                        onClick={() => setIsSummaryVisible(!isSummaryVisible)}
                        className="w-full p-4 flex justify-between items-center text-left"
                        aria-expanded={isSummaryVisible}
                        aria-controls="summary-panel"
                    >
                        <h3 className="font-bold text-lg text-brand-dark">Resumo do Dia</h3>
                        <ChevronDownIcon open={isSummaryVisible} />
                    </button>
                    {isSummaryVisible && (
                         <div id="summary-panel" className="p-4 border-t animate-fade-in-down">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-5 rounded-xl shadow-md border"><p className="text-sm font-semibold text-gray-500">Faturamento Realizado</p><p className="text-2xl font-bold text-green-500">{formatCurrency(kpiData.revenue)}</p></div>
                                <div className="bg-white p-5 rounded-xl shadow-md border"><p className="text-sm font-semibold text-gray-500">Agendados</p><p className="text-2xl font-bold text-blue-500">{kpiData.scheduled}</p></div>
                                <div className="bg-white p-5 rounded-xl shadow-md border"><p className="text-sm font-semibold text-gray-500">Cancelados</p><p className="text-2xl font-bold text-red-500">{kpiData.cancelled}</p></div>
                                <div className="bg-white p-5 rounded-xl shadow-md border"><p className="text-sm font-semibold text-gray-500">Faltas</p><p className="text-2xl font-bold text-yellow-500">{kpiData.noShows}</p></div>
                            </div>
                        </div>
                    )}
                </div>
                {/* List */}
                <div className="bg-white rounded-xl shadow-md border divide-y divide-gray-100">
                    {isLoading ? <div className="p-8 text-center">Carregando...</div> : filteredAdminAppointments.length === 0 ? <div className="p-8 text-center text-gray-500">Nenhum agendamento encontrado para este dia.</div> : (
                        filteredAdminAppointments.map(appt => {
                            const isUpdating = updatingAppointments.includes(appt.id);
                            return (
                                <div key={appt.id} onClick={() => setSelectedAppointment(appt)} className="p-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    {/* Time Column (spans all content rows) */}
                                    <p className="row-span-2 font-bold text-xl text-brand-dark self-start">
                                        {appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                                    </p>
                                    
                                    {/* Client & Service Info (Row 1, Col 2) */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-x-4 gap-y-1">
                                        <div>
                                            <p className="font-semibold text-brand-dark">{appt.client.name}</p>
                                            <p className="text-sm text-gray-500">{appt.client.phone}</p>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="font-semibold text-brand-dark">{appt.service.name}</p>
                                            <p className="text-sm text-gray-600">{appt.professional.name}</p>
                                        </div>
                                    </div>
                                
                                    {/* Status & Actions (Row 2, Col 2) */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div className="flex flex-col items-start gap-1">
                                            <StatusBadge status={appt.status} />
                                            {appt.status === 'completed' && <PaymentStatusBadge paymentStatus={appt.paymentStatus} paymentMethod={appt.paymentMethod} />}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 no-print">
                                            {isUpdating ? (
                                                <div className="flex items-center justify-center"><Spinner/> <span className="ml-2 text-sm text-gray-500">Atualizando...</span></div>
                                            ) : (
                                                <>
                                                    {appt.status === 'scheduled' && (
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="success" className="!px-3 !py-1 !text-xs" onClick={(e) => { e.stopPropagation(); setPaymentAppointment(appt); }}>Concluir</Button>
                                                            <Button variant="warning" className="!px-3 !py-1 !text-xs" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appt.id, 'no-show'); }}>Faltou</Button>
                                                            <Button variant="danger" className="!px-3 !py-1 !text-xs" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appt.id, 'cancelled'); }}>Cancelar</Button>
                                                        </div>
                                                    )}
                                                    { (appt.status === 'cancelled' || appt.status === 'no-show' || appt.status === 'completed') && (
                                                        <Button variant="light-success" className="!px-3 !py-1 !text-xs" onClick={(e) => { e.stopPropagation(); handleRevertStatus(appt); }}>Reverter</Button>
                                                    )}
                                                    { (appt.status === 'completed' && appt.paymentStatus === 'pending') && (
                                                        <Button variant="secondary" className="!px-3 !py-1 !text-xs" onClick={(e) => { e.stopPropagation(); setPaymentAppointment(appt); }}>Reg. Pagamento</Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
                {paymentAppointment && <PaymentModal appointment={paymentAppointment} onClose={() => setPaymentAppointment(null)} onConfirm={(method) => { handleUpdateStatus(paymentAppointment.id, 'completed', method); setPaymentAppointment(null); }} onSkip={() => { handleUpdateStatus(paymentAppointment.id, 'completed'); setPaymentAppointment(null); }} isPaymentMandatory={isPaymentMandatory} />}
                <AppointmentDetailsModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />
            </div>
        )
    }
    
    // Customer View
    return (
        <div className="bg-gray-100">
            {isLoading ? <CardSkeleton count={5} /> : (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-700 mb-4">Próximos Agendamentos</h3>
                        <div className="space-y-4">
                            {upcomingAppointments.length > 0 ? upcomingAppointments.map(appt => (
                                <div key={appt.id} className={`bg-white shadow-sm rounded-lg flex flex-col sm:flex-row p-4 gap-4 ${appt.service.color}`}>
                                    <div className="text-center sm:text-left sm:w-24 flex-shrink-0"><p className="text-base font-semibold text-gray-500">{appt.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p><p className="text-xl font-bold text-gray-800">{appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p></div>
                                    <div className="flex-grow text-center sm:text-left"><p className="font-bold text-lg text-gray-800">{appt.service.name}</p><div className="flex items-center justify-center sm:justify-start gap-2 text-base text-gray-600 mt-1"><i className="fas fa-user-tie text-gray-400 w-4 text-center"></i><span className="text-gray-600">{appt.professional.name}</span></div></div>
                                    <div className="flex flex-col items-stretch justify-center gap-2 w-full sm:w-32 mt-4 sm:mt-0">
                                        {appt.status === 'scheduled' && Number(new Date(appt.date).getTime()) > Number(new Date('2025-10-15T12:00:00Z').getTime()) && (<><Button variant="warning" className="!px-2 !py-1 text-sm" fullWidth onClick={() => alert('Funcionalidade em desenvolvimento.')}>Reagendar</Button><Button variant="danger" className="!px-2 !py-1 text-sm" fullWidth onClick={() => handleUpdateStatus(appt.id, 'cancelled')}>Cancelar</Button></>)}
                                    </div>
                                </div>
                            )) : <div className="text-center p-8 border-2 border-dashed rounded-lg"><p className="text-lg text-gray-500">Você não tem agendamentos futuros.</p></div>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-700 mb-4">Histórico de Agendamentos</h3>
                        {pastAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {paginatedPastAppointments.map(appt => (
                                    <div key={appt.id} className={`bg-white shadow-sm rounded-lg flex flex-col sm:flex-row p-4 gap-4 ${appt.service.color}`}>
                                        <div className="text-center sm:text-left sm:w-24 flex-shrink-0"><p className="text-base font-semibold text-gray-500">{appt.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p><p className="text-xl font-bold text-gray-800">{appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p></div>
                                        <div className="flex-grow text-center sm:text-left"><p className="font-bold text-lg text-gray-800">{appt.service.name}</p><div className="flex items-center justify-center sm:justify-start gap-2 text-base text-gray-600 mt-1"><i className="fas fa-user-tie text-gray-400 w-4 text-center"></i><span className="text-gray-600">{appt.professional.name}</span></div></div>
                                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0"><StatusBadge status={appt.status} />{appt.status === 'completed' && onRebook && (<Button variant="secondary" className="!px-2 !py-1 text-sm" onClick={() => onRebook(appt.service)}>Reagendar</Button>)}</div>
                                    </div>
                                ))}
                                {totalPages > 1 && (<div className="flex justify-center items-center gap-4 pt-4"><Button variant="secondary" disabled={pastAppointmentsPage === 1} onClick={() => setPastAppointmentsPage(p => p - 1)}>Anterior</Button><span>Página {pastAppointmentsPage} de {totalPages}</span><Button variant="secondary" disabled={pastAppointmentsPage === totalPages} onClick={() => setPastAppointmentsPage(p => p + 1)}>Próximo</Button></div>)}
                            </div>
                        ) : <div className="text-center p-8 border-2 border-dashed rounded-lg"><p className="text-lg text-gray-500">Você ainda não possui agendamentos passados.</p></div>}
                    </div>
                </div>
            )}
        </div>
    );
};
