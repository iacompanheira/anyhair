import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UnifiedUser, FullAppointment } from '../types';
import { useAppContext } from '../contexts/AppContext';
import * as api from '../api';
import { EyeIcon, EyeOffIcon } from '../components/ui/Icons';

// --- ICONS ---
const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const Spinner = () => (<svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;


// --- HELPER COMPONENTS ---
const StatusBadge: React.FC<{ status: FullAppointment['status'] }> = ({ status }) => {
    const statusMap = {
        completed: { text: 'Concluído', color: 'bg-green-100 text-green-800' },
        cancelled: { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
        'no-show': { text: 'Faltou', color: 'bg-yellow-100 text-yellow-800' },
        scheduled: { text: 'Agendado', color: 'bg-blue-100 text-blue-800' },
    };
    const { text, color } = statusMap[status] || statusMap.scheduled;
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>{text}</span>;
};

const PaymentStatusBadge: React.FC<{ paymentStatus?: 'paid' | 'pending'; paymentMethod?: string; }> = ({ paymentStatus, paymentMethod }) => {
    if (paymentStatus === 'paid') {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Pago ({paymentMethod})</span>;
    }
    if (paymentStatus === 'pending') {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Pendente</span>;
    }
    return null;
}

const DatePickerCalendar: React.FC<{
    currentMonth: Date;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    onMonthChange: (offset: number) => void;
}> = ({ currentMonth, selectedDate, onDateSelect, onMonthChange }) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array.from({ length: (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1) });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    
    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="bg-brand-input-bg text-white p-3 rounded-xl shadow-xl border border-gray-700 absolute top-full mt-2 z-10 w-72">
            <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={() => onMonthChange(-1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors w-8 h-8 flex items-center justify-center">&lt;</button>
                <span className="font-semibold text-sm capitalize">{currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                <button type="button" onClick={() => onMonthChange(1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors w-8 h-8 flex items-center justify-center">&gt;</button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-medium">
                {weekDays.map(day => <div key={day} className="h-8 flex items-center justify-center">{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
                {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                {days.map(day => {
                    const date = new Date(Date.UTC(year, month, day));
                    const isSelected = selectedDate.getUTCFullYear() === date.getUTCFullYear() &&
                                     selectedDate.getUTCMonth() === date.getUTCMonth() &&
                                     selectedDate.getUTCDate() === date.getUTCDate();
                    
                    const isToday = today.getFullYear() === date.getUTCFullYear() &&
                                  today.getMonth() === date.getUTCMonth() &&
                                  today.getDate() === date.getUTCDate();
                    
                    let dayButtonClasses = 'w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-150';

                    if (isSelected) {
                        dayButtonClasses += ' bg-brand-primary text-white ring-2 ring-offset-2 ring-brand-primary ring-offset-brand-input-bg';
                    } else if (isToday) {
                        dayButtonClasses += ' border border-pink-500/70 text-pink-400 hover:bg-gray-700';
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


const isProfessional = (user: any): user is UnifiedUser => {
    return user && user.accessLevel === 'professional';
};

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
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
                        <button onClick={onSkip} className="btn-secondary">Concluir sem Pagar</button>
                    )}
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN MODAL ---
interface StaffAccessModalProps { isOpen: boolean; onClose: () => void; }

export const StaffAccessModal: React.FC<StaffAccessModalProps> = ({ isOpen, onClose }) => {
  const { users, setMasterPassword, masterPassword, isPaymentMandatory } = useAppContext();
  const [view, setView] = useState<'select_role' | 'login' | 'view_appointments'>('select_role');
  const [activeTab, setActiveTab] = useState<'professional' | 'admin'>('professional');
  const [selectedUser, setSelectedUser] = useState<UnifiedUser | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [allAppointments, setAllAppointments] = useState<FullAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAppointments, setUpdatingAppointments] = useState<string[]>([]);

  // Appointments view state
  const [selectedDate, setSelectedDate] = useState(new Date('2025-10-15T12:00:00Z'));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date('2025-10-15T12:00:00Z'));
  const [adminSelectedProId, setAdminSelectedProId] = useState<number | 'all'>('all');
  const [paymentAppointment, setPaymentAppointment] = useState<FullAppointment | null>(null);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const canShare = useMemo(() => typeof navigator !== 'undefined' && !!navigator.share, []);


  useEffect(() => {
    if (isOpen) {
      const fetchAppointments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getAppointments();
            setAllAppointments(data);
        } catch (err) {
            console.error("Failed to load appointments:", err);
            setError("Não foi possível carregar os agendamentos. Verifique sua conexão e tente novamente.");
        } finally {
            setIsLoading(false);
        }
      };
      fetchAppointments();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
            setIsCalendarOpen(false);
        }
    };

    if (isCalendarOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const filteredAppointments = useMemo(() => {
    if (!selectedUser) return [];

    const start = new Date(selectedDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setUTCHours(23, 59, 59, 999);
    
    return allAppointments
      .filter(a => {
        const isCorrectDate = a.date.getTime() >= start.getTime() && a.date.getTime() <= end.getTime();
        if (!isCorrectDate) return false;

        if (isProfessional(selectedUser)) {
            return a.professional.id === selectedUser.id;
        } else { // Admin view
            return adminSelectedProId === 'all' ? true : a.professional.id === adminSelectedProId;
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

  }, [allAppointments, selectedUser, selectedDate, adminSelectedProId]);

  const handleSelectUser = (user: UnifiedUser) => {
    setSelectedUser(user);
    setView('login');
    setLoginError('');
  };
  
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        if (!selectedUser) return;

        const storedPass = localStorage.getItem(`user_pass_${selectedUser.id}`);
        let defaultPass: string | null = null;
        
        if (selectedUser.accessLevel === 'super_admin') {
            defaultPass = 'admin123';
        } else {
            defaultPass = '123456';
        }

        if (password === masterPassword) {
            setView('view_appointments');
            setPassword('');
            return;
        }

        if (storedPass) {
            if (password === storedPass) {
                setView('view_appointments');
                setPassword('');
            } else {
                setLoginError('Senha incorreta.');
            }
        } else {
            if (password === defaultPass) {
                setView('view_appointments');
                setPassword('');
            } else {
                setLoginError('Senha incorreta.');
            }
        }
    };


  const handleUpdateStatus = async (id: string, status: FullAppointment['status'], paymentMethod?: string) => {
    setUpdatingAppointments(prev => [...prev, id]);
    const originalAppointments = [...allAppointments];

    setAllAppointments(prev => prev.map(a => {
        if (a.id === id) {
            const updatedAppt: FullAppointment = { ...a, status };
             if (status === 'completed') {
                if (paymentMethod) {
                    updatedAppt.paymentStatus = 'paid';
                    updatedAppt.paymentMethod = paymentMethod;
                } else if (a.paymentStatus !== 'paid') {
                     updatedAppt.paymentStatus = 'pending';
                }
            } else if (status === 'scheduled') { // Reverting status
                updatedAppt.paymentStatus = 'pending';
                updatedAppt.paymentMethod = undefined;
            }
            return updatedAppt;
        }
        return a;
    }));

    try {
        await api.updateAppointmentStatus(id, status, paymentMethod);
    } catch (error) {
        console.error('Falha ao atualizar status:', error);
        alert('Ocorreu um erro ao atualizar o agendamento. Tente novamente.');
        setAllAppointments(originalAppointments);
    } finally {
        setUpdatingAppointments(prev => prev.filter(appId => appId !== id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!canShare) {
        alert('A função de compartilhamento não é suportada neste navegador.');
        return;
    }

    const userName = selectedUser?.name || "Equipe";
    const dateString = selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    
    let shareText = `Agenda de ${userName} - ${dateString}:\n\n`;

    if (filteredAppointments.length === 0) {
        shareText += "Nenhum agendamento para este dia.";
    } else {
        shareText += filteredAppointments.map(appt => {
            const time = appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
            let line = `- ${time}: ${appt.client.name} - ${appt.service.name}`;
            if (!isProfessional(selectedUser) && adminSelectedProId === 'all') {
                line += ` (com ${appt.professional.name})`;
            }
            return line;
        }).join('\n');
    }

    try {
        await navigator.share({
            title: `Agenda de ${userName} para ${dateString}`,
            text: shareText,
        });
    } catch (err) {
        console.error('Erro ao compartilhar:', err);
    }
  };

  const handleBack = () => {
    if (view === 'login') {
      setView('select_role');
      setSelectedUser(null);
      setPassword('');
      setLoginError('');
    } else if (view === 'view_appointments') {
      setView('login');
    }
  };
  
  const handleResetMasterPassword = () => {
    if (window.confirm('Tem certeza que deseja redefinir a senha mestra para o padrão "admin123"?')) {
        setMasterPassword('admin123');
        alert('Senha mestra redefinida com sucesso!');
        setPassword('');
        setLoginError('');
    }
  };

  const resetAndClose = () => {
    setView('select_role');
    setSelectedUser(null);
    setPassword('');
    setLoginError('');
    setActiveTab('professional');
    setShowPassword(false);
    onClose();
  }

  if (!isOpen) return null;

  const renderContent = () => {
    if (error) {
        return (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                 <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start" role="alert">
                    <ErrorIcon />
                    <div>
                        <p className="font-bold">Ocorreu um Erro</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><p>Carregando dados...</p></div>;
    }

    switch (view) {
        case 'login':
            return (
                <div className="p-6 flex flex-col items-center justify-center h-full">
                    <img src={selectedUser?.imageUrl} alt={selectedUser?.name} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 shadow-lg" />
                    <p className="font-semibold text-xl mb-6">{selectedUser?.name}</p>
                    <form onSubmit={handleLogin} className="w-full max-w-xs">
                        <div>
                            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <div className="relative">
                                <input 
                                    id="password-input" 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full input-dark pr-10"
                                    autoFocus 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
                        <button type="submit" className="w-full mt-6 bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-accent transition-colors">
                            Entrar
                        </button>
                    </form>
                     <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={handleResetMasterPassword}
                            className="text-sm font-medium text-brand-primary hover:text-brand-accent hover:underline focus:outline-none"
                        >
                            Esqueceu a senha? Resetar senha mestra.
                        </button>
                    </div>
                </div>
            );
        case 'view_appointments':
            const today = new Date('2025-10-15T12:00:00Z');
            const pastDueAppointments = filteredAppointments.filter(a => a.date.getTime() < today.getTime() && a.status === 'scheduled');

            return (
                <div id="staff-agenda-view">
                  <div className="sticky top-0 bg-gray-50 p-4 border-b z-10 space-y-3 no-print">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setSelectedDate(new Date('2025-10-15T12:00:00Z')); setIsCalendarOpen(false); }} className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-brand-input-bg text-white border border-gray-700 hover:bg-gray-700">Hoje</button>
                            <div className="relative" ref={datePickerRef}>
                                <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-input-bg border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors justify-between">
                                    <CalendarIcon />
                                    {selectedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                                </button>
                                {isCalendarOpen && (
                                    <DatePickerCalendar
                                        currentMonth={calendarMonth}
                                        selectedDate={selectedDate}
                                        onMonthChange={(offset) => setCalendarMonth(prev => {
                                            const newDate = new Date(prev);
                                            newDate.setMonth(newDate.getMonth() + offset, 1);
                                            return newDate;
                                        })}
                                        onDateSelect={(date) => {
                                            setSelectedDate(date);
                                            setCalendarMonth(date);
                                            setIsCalendarOpen(false);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button title="Imprimir" onClick={handlePrint} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><PrintIcon /></button>
                            <button title="Salvar PDF" onClick={handlePrint} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><PdfIcon /></button>
                            <button title="Enviar" onClick={handleShare} disabled={!canShare} className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ShareIcon /></button>
                        </div>
                    </div>
                    
                    <p className="text-center font-semibold text-gray-700">
                        {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </p>
                    
                    {!isProfessional(selectedUser) && (
                        <div>
                             <select value={String(adminSelectedProId)} onChange={e => setAdminSelectedProId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                                <option value="all">Todos os Profissionais</option>
                                {users.filter(p => p.accessLevel === 'professional').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                  </div>
                  
                  <div id="printable-agenda">
                     <div className="hidden print:block p-4">
                        <h3 className="text-2xl font-bold">Agenda de {selectedUser?.name}</h3>
                        <p className="text-lg">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        {(!isProfessional(selectedUser) && adminSelectedProId !== 'all') && 
                            <p className="text-md font-semibold">Filtrado por: {users.find(u => u.id === adminSelectedProId)?.name}</p>
                        }
                    </div>
                    {pastDueAppointments.length > 0 && (
                        <div className="bg-yellow-50 p-4 border-b no-print">
                            <h4 className="font-bold text-yellow-800">Atenção: {pastDueAppointments.length} agendamento(s) passado(s) com status pendente.</h4>
                        </div>
                    )}
                    {filteredAppointments.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {filteredAppointments.map(appt => {
                                const isUpdating = updatingAppointments.includes(appt.id);
                                const isPastDue = appt.date.getTime() < today.getTime() && appt.status === 'scheduled';
                                return (
                                <li key={appt.id} className={`p-4 ${isPastDue ? 'bg-yellow-50' : 'bg-white'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 text-center shrink-0">
                                            <p className="font-bold text-lg text-brand-dark">{appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</p>
                                            <StatusBadge status={appt.status} />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-900">{appt.client.name}</p>
                                            <p className="text-sm text-gray-600">{appt.service.name}</p>
                                            {(!isProfessional(selectedUser) && adminSelectedProId === 'all') && <p className="text-xs text-brand-primary font-medium">com {appt.professional.name}</p>}
                                        </div>
                                    </div>
                                    {appt.status === 'completed' && <div className="mt-2 pl-20"><PaymentStatusBadge paymentStatus={appt.paymentStatus} paymentMethod={appt.paymentMethod}/></div>}
                                    <div className="flex items-center justify-end gap-2 mt-3 no-print">
                                        {isUpdating ? <div className="flex items-center"><Spinner /><span className="ml-2 text-sm text-gray-500">Atualizando...</span></div> : (
                                            <>
                                                {appt.status === 'scheduled' && (
                                                    <>
                                                        <button onClick={() => setPaymentAppointment(appt)} className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full hover:bg-green-600">Concluir</button>
                                                        <button onClick={() => handleUpdateStatus(appt.id, 'no-show')} className="px-3 py-1 text-xs font-semibold text-white bg-yellow-500 rounded-full hover:bg-yellow-600">Faltou</button>
                                                        <button onClick={() => handleUpdateStatus(appt.id, 'cancelled')} className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full hover:bg-red-600">Cancelar</button>
                                                    </>
                                                )}
                                                { (appt.status === 'completed' && appt.paymentStatus === 'pending') && (
                                                     <button onClick={() => setPaymentAppointment(appt)} className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600">Reg. Pagamento</button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </li>
                            )})}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <p>Nenhum agendamento para {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}.</p>
                        </div>
                    )}
                </div>
                {paymentAppointment && <PaymentModal 
                    appointment={paymentAppointment} 
                    onClose={() => setPaymentAppointment(null)} 
                    onConfirm={(method) => { handleUpdateStatus(paymentAppointment.id, 'completed', method); setPaymentAppointment(null); }}
                    onSkip={() => { handleUpdateStatus(paymentAppointment.id, 'completed'); setPaymentAppointment(null); }}
                    isPaymentMandatory={isPaymentMandatory}
                />}
            </div>
            );
        case 'select_role':
        default:
            const professionals = users.filter(u => u.accessLevel === 'professional' && u.isEnabled);
            const admins = users.filter(u => u.accessLevel === 'admin' || u.accessLevel === 'super_admin');
            
            return (
                <div className="p-6">
                    <div className="flex border-b mb-4">
                        <button onClick={() => setActiveTab('professional')} className={`px-4 py-2 font-semibold ${activeTab === 'professional' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500'}`}>Profissional</button>
                        <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 font-semibold ${activeTab === 'admin' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500'}`}>Administrativo</button>
                    </div>
                    <ul className="space-y-3 max-h-[70vh] overflow-y-auto">
                        {(activeTab === 'professional' ? professionals : admins).map(user => (
                            <li key={user.id} onClick={() => handleSelectUser(user)} className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                <img src={user.imageUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                                <div><p className="font-semibold">{user.name}</p><p className="text-sm text-gray-500">{user.specialty || user.accessLevel.replace('_', ' ')}</p></div>
                            </li>
                        ))}
                    </ul>
                </div>
            );
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="fixed inset-0 bg-black/60" onClick={resetAndClose}></div>
      <div className="relative bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg h-[90vh] max-h-[800px] flex flex-col transition-transform transform scale-95 opacity-0 animate-scale-in">
        <header className="flex items-center justify-between p-4 border-b bg-white rounded-t-xl">
          <button onClick={handleBack} className={`p-2 rounded-full hover:bg-gray-200 ${view === 'select_role' ? 'invisible' : ''}`}><ArrowLeftIcon /></button>
          <h2 className="font-bold text-lg text-brand-dark">{view === 'select_role' ? 'Acesso da Equipe' : 'Minha Agenda'}</h2>
          <button onClick={resetAndClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon /></button>
        </header>
        <main className="flex-grow overflow-y-auto">
            {renderContent()}
        </main>
      </div>
      <style>{`.animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; } @keyframes scale-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
};