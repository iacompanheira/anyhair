
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Service, UnifiedUser, DateTimeSelection } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { PROFESSIONALS_FOR_BOOKING, MOCK_AVAILABILITY } from '../constants';

import ProgressIndicator, { Step } from '../components/booking/ProgressIndicator';
import { UserIcon, ScissorsIcon, CalendarIcon } from '../components/ui/Icons';
import { getMockNow } from '../utils/dateUtils';
import StepSelectService from '../components/booking/SelectServiceModal';

// --- HELPER TO GET SLOTS ---
const getNextAvailableSlots = (proId: number, count: number): DateTimeSelection[] => {
    if (proId === 0) return [];
    const slots: DateTimeSelection[] = [];
    const today = getMockNow();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 90 && slots.length < count; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];

        const now = getMockNow();
        const isToday = date.toDateString() === now.toDateString();

        const schedule = MOCK_AVAILABILITY[proId];
        if (schedule && schedule[dateKey] && schedule[dateKey].length > 0) {
            for (const time of schedule[dateKey]) {
                 if (isToday) {
                    const [hour, minute] = time.split(':').map(Number);
                    if (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes())) {
                        continue;
                    }
                }
                if (slots.length < count) {
                    slots.push({ date, time });
                } else {
                    break;
                }
            }
        }
    }
    return slots;
};


// --- NEW PROFESSIONAL OPTIONS VIEW ---
const ProfessionalOptionsView: React.FC<{
  professional: UnifiedUser;
  onConfirm: (dt: DateTimeSelection) => void;
  onBack: () => void;
  suggestedDatesCount: number;
  suggestedSlotsCount: number;
}> = ({ professional, onConfirm, onBack, suggestedDatesCount, suggestedSlotsCount }) => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [slots, setSlots] = useState<DateTimeSelection[]>([]);
  
  const datesToRender = useMemo(() => {
        const proSchedule = MOCK_AVAILABILITY[professional.id];
        if (!proSchedule) return [];

        const dates: Date[] = [];
        const today = getMockNow();
        today.setUTCHours(0, 0, 0, 0);

        // Loop for up to 90 days to find N available dates
        for (let i = 0; i < 90 && dates.length < suggestedDatesCount; i++) {
            const currentDate = new Date(today);
            currentDate.setUTCDate(today.getUTCDate() + i);
            const dateKey = currentDate.toISOString().split('T')[0];

            if (proSchedule[dateKey] && proSchedule[dateKey].length > 0) {
                const now = getMockNow();
                const isToday = currentDate.toDateString() === now.toDateString();
                if (isToday) {
                    const hasFutureSlots = proSchedule[dateKey].some(time => {
                        const [hour, minute] = time.split(':').map(Number);
                        return hour > now.getHours() || (hour === now.getHours() && minute > now.getMinutes());
                    });
                    if (hasFutureSlots) dates.push(currentDate);
                } else {
                    dates.push(currentDate);
                }
            }
        }
        return dates;
    }, [professional.id, suggestedDatesCount]);

  const [selectedDateForCalendar, setSelectedDateForCalendar] = useState<Date>(() => datesToRender[0] || getMockNow());

  useEffect(() => {
    // If the selected date is no longer in the list of available dates (e.g. on professional change), update it
    if (datesToRender.length > 0 && !datesToRender.find(d => d.toDateString() === selectedDateForCalendar.toDateString())) {
        setSelectedDateForCalendar(datesToRender[0]);
    } else if (datesToRender.length === 0) {
        setSelectedDateForCalendar(getMockNow());
    }
  }, [datesToRender, selectedDateForCalendar]);
  
  useEffect(() => {
    const nextSlots = getNextAvailableSlots(professional.id, suggestedSlotsCount); // Fetch N slots for the list view
    setSlots(nextSlots);
  }, [professional, suggestedSlotsCount]);

  const suggestedSlot = slots.length > 0 ? slots[0] : null;
  const otherSlots = slots.slice(1);
  
  const calendarAvailableTimes = useMemo(() => {
    const dateKey = selectedDateForCalendar.toISOString().split('T')[0];
    const proSchedule = MOCK_AVAILABILITY[professional.id];
    if (!proSchedule || !proSchedule[dateKey]) return [];

    const now = getMockNow();
    const isToday = selectedDateForCalendar.toDateString() === now.toDateString();
    
    const allDaySlots = proSchedule[dateKey].sort();

    if (isToday) {
        return allDaySlots.filter(time => {
            const [hour, minute] = time.split(':').map(Number);
            return hour > now.getHours() || (hour === now.getHours() && minute > now.getMinutes());
        });
    }
    return allDaySlots;
  }, [selectedDateForCalendar, professional.id]);

  const renderCalendarPicker = () => {
    return (
        <div className="bg-brand-dark text-white p-4 rounded-lg border border-gray-700 animate-fade-in-down">
            <h4 className="font-semibold text-center mb-3 text-gray-200">Escolha uma das próximas {suggestedDatesCount} datas disponíveis</h4>
            <div className="grid grid-cols-4 gap-2 mb-4">
                {datesToRender.length > 0 ? datesToRender.map(date => {
                    const isSelected = date.toDateString() === selectedDateForCalendar.toDateString();
                    return (
                        <button key={date.toISOString()} onClick={() => setSelectedDateForCalendar(date)} className={`p-2 rounded-lg text-center ${isSelected ? 'bg-brand-primary text-white' : 'bg-brand-input-bg text-white hover:bg-gray-700'}`}>
                            <p className="text-xs font-bold uppercase">{date.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' })}</p>
                            <p className="font-bold text-lg">{date.getDate()}</p>
                        </button>
                    )
                }) : (
                    <p className="col-span-full text-center text-sm text-gray-400 py-4">Nenhuma data com horários disponíveis encontrada para este profissional.</p>
                )}
            </div>
             <div className="border-t border-gray-700 pt-4">
                <h4 className="font-semibold text-center mb-3 text-gray-200">Horários para {selectedDateForCalendar.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', timeZone: 'UTC'})}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {calendarAvailableTimes.length > 0 ? calendarAvailableTimes.map(time => (
                        <button key={time} onClick={() => onConfirm({ date: selectedDateForCalendar, time })} className="py-2 px-3 rounded-lg bg-brand-input-bg text-white hover:bg-gray-700 text-sm text-center">
                            {time}
                        </button>
                    )) : <p className="col-span-full text-center text-sm text-gray-400 py-4">Nenhum horário disponível para esta data.</p>}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-down">
        {/* Professional Info Header (fixed part) */}
        <div className="flex items-center gap-4 p-2 shrink-0">
            <img src={professional.imageUrl} alt={professional.name} className="w-16 h-16 rounded-full object-cover" />
            <div>
                <h3 className="text-lg font-bold text-brand-dark text-gray-800">{professional.name}</h3>
                <p className="font-semibold text-gray-700">{professional.specialty}</p>
            </div>
        </div>
      
        {/* Scrollable Area */}
        <div className="flex-grow overflow-y-auto pr-2 my-4">
            {view === 'list' ? (
                <div className="space-y-4">
                    {suggestedSlot && (
                        <div className="p-4 bg-brand-dark border-2 border-brand-primary rounded-xl text-center">
                            <h4 className="font-semibold text-gray-100">Horário Sugerido</h4>
                            <p className="text-lg font-bold text-white my-2">
                                {suggestedSlot.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })} às {suggestedSlot.time}
                            </p>
                            <button onClick={() => onConfirm(suggestedSlot)} className="w-full btn-primary mt-2">Agendar este horário</button>
                        </div>
                    )}
                    
                    {otherSlots.length > 0 && (
                         <div className="p-4 bg-brand-dark border border-gray-700 rounded-xl">
                            <h4 className="font-semibold text-center mb-3 text-gray-200">Ou escolha um dos próximos horários</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {otherSlots.map(slot => (
                                    <button key={`${slot.date.toISOString()}-${slot.time}`} onClick={() => onConfirm(slot)} className="py-2 px-3 rounded-lg bg-brand-input-bg text-white hover:bg-gray-700 border border-gray-600 text-sm text-center">
                                        {slot.date.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' })} <br/> <span className="font-bold">{slot.time}</span>
                                    </button>
                                ))}
                            </div>
                         </div>
                    )}
                </div>
            ) : (
                renderCalendarPicker()
            )}
        </div>

        {/* Sticky Footer Area */}
        <div className="shrink-0 pt-4 border-t border-gray-200">
            <div className="p-4 bg-brand-dark border border-gray-700 rounded-xl text-center">
                <h4 className="font-semibold text-gray-200 mb-2">Não encontrou o que queria?</h4>
                <button onClick={() => setView('calendar')} className="w-full btn-secondary">Escolher outra data e hora</button>
            </div>
        </div>
    </div>
  );
};


// --- INTELLIGENT PROFESSIONAL SELECTOR ---
const useNextAvailableTimes = (professionals: UnifiedUser[], selectedServices: Service[]): {
  isLoading: boolean;
  sortedProfessionals: { pro: UnifiedUser; nextAvailable: DateTimeSelection | null }[];
  overallNextAvailable: { pro: UnifiedUser; nextAvailable: DateTimeSelection } | null;
} => {
  const [data, setData] = useState<{ sortedProfessionals: { pro: UnifiedUser; nextAvailable: DateTimeSelection | null }[]; overallNextAvailable: { pro: UnifiedUser; nextAvailable: DateTimeSelection } | null; }>({ sortedProfessionals: [], overallNextAvailable: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const getNextAvailableForPro = (proId: number): DateTimeSelection | null => {
        const slots = getNextAvailableSlots(proId, 1);
        return slots.length > 0 ? slots[0] : null;
    };
    
    const timer = setTimeout(() => {
        const selectedServiceIds = new Set(selectedServices.map(s => s.id));
        const availableProfessionals = professionals.filter(p => {
            if (p.id === 0) return false;
            if (selectedServiceIds.size === 0) return true;
            return [...selectedServiceIds].every(serviceId => p.serviceIds?.includes(serviceId));
        });

        const prosWithAvailability = availableProfessionals
            .map(pro => ({ pro, nextAvailable: getNextAvailableForPro(pro.id) }));
            
        const sorted = prosWithAvailability
            .sort((a, b) => {
                if (!a.nextAvailable) return 1;
                if (!b.nextAvailable) return -1;
                const timeA = a.nextAvailable.date.getTime() + timeToMinutes(a.nextAvailable.time);
                const timeB = b.nextAvailable.date.getTime() + timeToMinutes(b.nextAvailable.time);
                return timeA - timeB;
            });

        const overallNextAvailable = sorted.find(s => s.nextAvailable) as { pro: UnifiedUser; nextAvailable: DateTimeSelection } | null;

        setData({ sortedProfessionals: sorted, overallNextAvailable });
        setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [professionals, selectedServices]);

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return { isLoading, ...data };
};

interface IntelligentProfessionalSelectorProps {
  professionals: UnifiedUser[];
  selectedServices: Service[];
  onViewDetails: (professional: UnifiedUser) => void;
  onFastTrack: (professional: UnifiedUser, dateTime: DateTimeSelection) => void;
}

const IntelligentProfessionalSelector: React.FC<IntelligentProfessionalSelectorProps> = ({ professionals, selectedServices, onViewDetails, onFastTrack }) => {
    const { isLoading, sortedProfessionals, overallNextAvailable } = useNextAvailableTimes(professionals, selectedServices);

    const handleFastTrack = () => {
        if (overallNextAvailable?.nextAvailable) {
            onFastTrack(overallNextAvailable.pro, overallNextAvailable.nextAvailable);
        }
    };
    
    if (isLoading) {
        return (
            <div className="space-y-3 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <div className="h-20 bg-gray-200 rounded-xl"></div>
                <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
         <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {overallNextAvailable && overallNextAvailable.nextAvailable && (
                 <div className="p-4 rounded-xl bg-brand-dark text-white border-2 border-brand-primary shadow-lg text-center">
                    <h4 className="font-bold text-lg text-white">Encontrar o horário mais próximo</h4>
                    <p className="text-sm text-gray-300 mb-3">Você será atendido(a) pelo primeiro profissional disponível.</p>
                    <div className="p-3 bg-gray-700 rounded-lg mb-4">
                        <p className="font-semibold text-pink-400">
                            Próximo horário: {overallNextAvailable.nextAvailable.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })} às {overallNextAvailable.nextAvailable.time}
                        </p>
                         <p className="text-sm text-gray-200 flex items-baseline justify-center gap-1"><span>com</span><span className="font-semibold text-lg">{overallNextAvailable.pro.name}</span></p>
                    </div>
                    <button onClick={handleFastTrack} className="w-full font-sans font-bold py-3 px-4 rounded-xl text-lg bg-brand-primary text-white shadow-lg hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-all duration-300">
                        Agendar este horário
                    </button>
                </div>
            )}
           
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center"><span className="px-2 bg-brand-light text-sm text-gray-500 font-medium">ou escolha seu profissional</span></div>
            </div>

            <div className="space-y-3">
                {sortedProfessionals.map(({ pro, nextAvailable }) => (
                     <div key={pro.id} onClick={() => onViewDetails(pro)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewDetails(pro)} className="flex items-center p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary bg-brand-input-bg text-white border border-gray-700 cursor-pointer hover:bg-gray-700">
                        <img src={pro.imageUrl} alt={pro.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                        <div className="flex-grow">
                            <p className="font-semibold text-white text-lg">{pro.name}</p>
                             <p className="text-sm text-gray-400">
                                {nextAvailable
                                    ? `Próximo horário: ${nextAvailable.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às ${nextAvailable.time}`
                                    : 'Sem horários disponíveis'
                                }
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- BOOKING DRAWER ---

interface BookingScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onServicesChange: React.Dispatch<React.SetStateAction<Service[]>>;
  onProfessionalSelect: React.Dispatch<React.SetStateAction<UnifiedUser | null>>;
  onDateTimeSelect: React.Dispatch<React.SetStateAction<DateTimeSelection | null>>;
  onBookingComplete: () => void;
  selectedServices: Service[];
  selectedProfessional: UnifiedUser | null;
  selectedDateTime: DateTimeSelection | null;
  resetBooking: () => void;
}

const BookingScreen: React.FC<BookingScreenProps> = ({ isOpen, onClose, onServicesChange, onProfessionalSelect, onDateTimeSelect, onBookingComplete, selectedServices, selectedProfessional, selectedDateTime, resetBooking }) => {
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const { 
      services,
      serviceSelectionMode,
      suggestedSlotsCount,
      suggestedDatesCount,
  } = useAppContext();
  const [viewingProfessional, setViewingProfessional] = useState<UnifiedUser | null>(null);
  
  useEffect(() => {
    if (isOpen) {
        setViewingProfessional(null);
        // This effect should only run when the drawer opens to set the initial step.
        // It should not re-run when `selectedServices` changes during the selection process,
        // as that would incorrectly advance the step. `selectedServices` is intentionally
        // omitted from the dependency array to prevent this behavior.
        setCurrentStep(selectedServices.length > 0 ? 'professional' : 'service');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  
  const goToNextStep = () => {
    setCurrentStep((prev: Step) => {
        switch (prev) {
            case 'service': return 'professional';
            case 'professional': return 'summary';
            default: return prev;
        }
    });
  };
  
  const handleToggleService = (toggledService: Service) => {
    onProfessionalSelect(null);
    onDateTimeSelect(null);
  
    if (serviceSelectionMode === 'single') {
      const finalSelection = new Map<number, Service>();
      finalSelection.set(toggledService.id, toggledService);
  
      if (toggledService.includesServiceIds?.length) {
        const included = services.filter(s => toggledService.includesServiceIds!.includes(s.id));
        included.forEach(s => finalSelection.set(s.id, s));
      }
  
      onServicesChange(Array.from(finalSelection.values()));
      goToNextStep();
      return;
    }
  
    // --- MULTIPLE SELECTION MODE ---
    const newSelectedServices = new Map(selectedServices.map(s => [s.id, s]));
    const isCurrentlySelected = newSelectedServices.has(toggledService.id);
  
    if (isCurrentlySelected) {
      // DESELECTION LOGIC
      // Check if the service to be deselected is an included part of another selected service.
      const parentService = Array.from(newSelectedServices.values()).find((s: Service) => s.includesServiceIds?.includes(toggledService.id));
  
      const serviceToDeselect = parentService || toggledService;
  
      // Deselect the service (either parent or the clicked one) and all its children.
      newSelectedServices.delete((serviceToDeselect as Service).id);
      (serviceToDeselect as Service).includesServiceIds?.forEach(id => newSelectedServices.delete(id));
  
    } else {
      // SELECTION LOGIC
      // Add the clicked service and all its included services.
      newSelectedServices.set(toggledService.id, toggledService);
      if (toggledService.includesServiceIds?.length) {
        const included = services.filter(s => toggledService.includesServiceIds!.includes(s.id));
        included.forEach(s => newSelectedServices.set(s.id, s));
      }
    }
  
    onServicesChange(Array.from(newSelectedServices.values()));
  };
  
  const handleViewProfessionalDetails = (pro: UnifiedUser) => {
    setViewingProfessional(pro);
  };

  const handleConfirmSelection = (professional: UnifiedUser, dt: DateTimeSelection) => {
    onProfessionalSelect(professional);
    onDateTimeSelect(dt);
    setCurrentStep('summary');
  };

  const handleFastTrack = (professional: UnifiedUser, dateTime: DateTimeSelection) => {
    onProfessionalSelect(professional);
    onDateTimeSelect(dateTime);
    setCurrentStep('summary');
  };

  const stepsStatus = useMemo(() => ({
      service: selectedServices.length > 0,
      professional: !!selectedProfessional && !!selectedDateTime,
  }), [selectedServices, selectedProfessional, selectedDateTime]);
  
  const goToPrevStep = useCallback(() => {
    if (currentStep === 'professional' && viewingProfessional) {
        setViewingProfessional(null);
        return;
    }
    setCurrentStep((prev: Step) => {
        switch (prev) {
            case 'summary':
                setViewingProfessional(null);
                return 'professional';
            case 'professional':
                return 'service';
            default:
                return prev;
        }
    });
  }, [currentStep, viewingProfessional]);

  const handleStepClick = (step: 'service' | 'professional') => {
    if (stepsStatus[step]) {
        if (step === 'professional') {
            setViewingProfessional(null);
        }
        setCurrentStep(step);
    }
  };

  const totalPrice = useMemo(() => selectedServices.reduce((total, service) => {
    const price = parseFloat(service.price.replace('R$', '').replace(',', '.'));
    return total + (isNaN(price) ? 0 : price);
  }, 0).toFixed(2).replace('.', ','), [selectedServices]);

  const titles: Record<Step, { title: string; subtitle: string }> = { 
    service: { title: 'Escolha o Serviço', subtitle: 'Selecione um ou mais serviços que deseja agendar.'}, 
    professional: { title: 'Profissional e Horário', subtitle: viewingProfessional ? `Opções para ${viewingProfessional.name}` : 'Selecione um profissional ou o próximo horário disponível.' }, 
    summary: { title: 'Confirme seu Agendamento', subtitle: 'Revise os detalhes abaixo antes de confirmar.'}
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-black/60 transition-opacity animate-fade-in" onClick={onClose}></div>
        <div className="relative w-full max-w-lg bg-brand-light flex flex-col transition-transform transform translate-x-0 animate-slide-in-right">
             <header className="p-4 flex items-center justify-between border-b shrink-0">
                <h2 className="text-xl font-bold text-brand-dark">{titles[currentStep].title}</h2>
                <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 text-3xl leading-none text-brand-dark">&times;</button>
            </header>
            
             <main className="flex-grow p-6 flex flex-col overflow-hidden">
                <div className="shrink-0">
                    <ProgressIndicator currentStep={currentStep} onStepClick={handleStepClick} stepsStatus={stepsStatus} />
                    <p className="text-center text-gray-600 mb-6">{titles[currentStep].subtitle}</p>
                </div>

                <div className="flex-grow overflow-y-auto -mr-6 pr-6">
                    {currentStep === 'service' && <StepSelectService services={services} selectedServices={selectedServices} onToggleService={handleToggleService} />}
                    {currentStep === 'professional' && !viewingProfessional && <IntelligentProfessionalSelector professionals={PROFESSIONALS_FOR_BOOKING} selectedServices={selectedServices} onViewDetails={handleViewProfessionalDetails} onFastTrack={handleFastTrack} />}
                    {currentStep === 'professional' && viewingProfessional && 
                        <ProfessionalOptionsView 
                            professional={viewingProfessional} 
                            onConfirm={(dt) => handleConfirmSelection(viewingProfessional, dt)} 
                            onBack={() => setViewingProfessional(null)}
                            suggestedDatesCount={suggestedDatesCount}
                            suggestedSlotsCount={suggestedSlotsCount}
                        />}
                    {currentStep === 'summary' && <StepSummary selectedServices={selectedServices} selectedProfessional={selectedProfessional} selectedDateTime={selectedDateTime} />}
                </div>
            </main>

            <footer className="w-full p-4 border-t bg-white shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm">
                        <p className="font-semibold text-gray-700">Total</p>
                        <p className="text-xl font-bold text-brand-dark">R$ {totalPrice}</p>
                    </div>
                     <div className="flex gap-2">
                        {currentStep !== 'service' && <button onClick={goToPrevStep} className="py-3 px-6 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 btn-text-layout">Voltar</button>}
                        
                        {currentStep === 'summary' ? (
                          <button onClick={onBookingComplete} className="py-3 px-6 rounded-xl bg-brand-primary text-white hover:bg-brand-accent btn-text-layout">Confirmar</button>
                        ) : currentStep === 'service' ? (
                          <button onClick={goToNextStep} disabled={!stepsStatus[currentStep]} className="py-3 px-6 rounded-xl bg-brand-primary text-white hover:bg-brand-accent disabled:bg-gray-300 btn-text-layout">Avançar</button>
                        ) : null}
                    </div>
                </div>
            </footer>
        </div>
        <style>{`
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
            .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
            @keyframes slide-in-right { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }
            .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
            @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-15px); } 100% { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
  );
};

const StepSummary: React.FC<{ selectedServices: Service[]; selectedProfessional: UnifiedUser | null; selectedDateTime: DateTimeSelection | null; }> = ({ selectedServices, selectedProfessional, selectedDateTime }) => {
  return (
    <div className="bg-white p-6 rounded-lg border space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center text-gray-700 mb-2"><ScissorsIcon /><h4 className="ml-2 font-semibold">Serviço(s)</h4></div>
            <ul className="list-disc list-inside ml-2 text-gray-600">{selectedServices.map(s => <li key={s.id}>{s.name}</li>)}</ul>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center text-gray-700 mb-2"><UserIcon /><h4 className="ml-2 font-semibold">Profissional</h4></div>
            <p className="ml-2 text-gray-600 text-lg font-medium">{selectedProfessional?.name}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center text-gray-700 mb-2"><CalendarIcon /><h4 className="ml-2 font-semibold">Data e Hora</h4></div>
            <p className="ml-2 text-gray-600">{selectedDateTime?.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {selectedDateTime?.time}</p>
        </div>
    </div>
  );
};


export default BookingScreen;
