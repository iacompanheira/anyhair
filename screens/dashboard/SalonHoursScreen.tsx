import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';

// --- ICONS ---
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpinnerIcon: React.FC<{className?: string}> = ({className}) => <svg className={`animate-spin ${className ?? ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const CopyIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CloseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const TrashIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

// --- TYPES ---
interface DayHours { enabled: boolean; opensAt: string; closesAt: string; lunchEnabled: boolean; lunchStartsAt: string; lunchEndsAt: string; }
interface WeeklyHours { weekdays: DayHours; saturday: DayHours; sunday: DayHours; }
interface SpecialDate { date: string; status: 'closed' | 'special'; opensAt: string; closesAt: string; description: string; }
interface GeneralSettings { masterPasswordEnabled: boolean; remindersEnabled: boolean; reminderLeadTime: '24h' | '48h' | '72h'; }
interface SalonHoursSettings { weeklyHours: WeeklyHours; specialDates: SpecialDate[]; generalSettings: GeneralSettings; }
type DayKey = keyof WeeklyHours;
type TimeValidationErrors = { [day in DayKey]?: { closesAt?: string; lunch?: string; } };

// --- MOCK DATA ---
const MOCK_SETTINGS: SalonHoursSettings = {
    weeklyHours: {
        weekdays: { enabled: true, opensAt: '08:00', closesAt: '18:00', lunchEnabled: true, lunchStartsAt: '12:00', lunchEndsAt: '13:00' },
        saturday: { enabled: true, opensAt: '09:00', closesAt: '16:00', lunchEnabled: false, lunchStartsAt: '12:00', lunchEndsAt: '13:00' },
        sunday: { enabled: false, opensAt: '09:00', closesAt: '12:00', lunchEnabled: false, lunchStartsAt: '12:00', lunchEndsAt: '13:00' },
    },
    specialDates: [
        { date: '2025-12-25', status: 'closed', opensAt: '', closesAt: '', description: 'Natal' },
        { date: '2026-01-01', status: 'closed', opensAt: '', closesAt: '', description: 'Ano Novo' },
        { date: '2025-11-20', status: 'special', opensAt: '10:00', closesAt: '14:00', description: 'Consciência Negra' },
    ],
    generalSettings: {
        masterPasswordEnabled: false,
        remindersEnabled: true,
        reminderLeadTime: '24h',
    },
};

const MOCK_HOLIDAYS = [
    { date: '2025-11-15', name: 'Proclamação da República' },
    { date: '2025-12-25', name: 'Natal' },
    { date: '2026-01-01', name: 'Confraternização Universal' },
    { date: '2026-03-03', name: 'Carnaval' },
    { date: '2026-04-17', name: 'Sexta-feira Santa' },
    { date: '2026-04-21', name: 'Tiradentes' },
    { date: '2026-05-01', name: 'Dia do Trabalho' },
];

const timeToMinutes = (time: string): number => {
    if(!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
};

const dateToYyyyMmDd = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// --- HELPER & UI COMPONENTS ---
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => ( <div className="relative group flex items-center"> {children} <div className="absolute bottom-full mb-2 w-max max-w-xs bg-brand-dark text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg"> {text} </div> </div> );
const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; flash?: boolean; }> = ({ title, children, defaultOpen = false, flash = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [shouldFlash, setShouldFlash] = useState(false);

    useEffect(() => {
        if (flash) {
            setShouldFlash(true);
            const timer = setTimeout(() => setShouldFlash(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <div className={`bg-white rounded-xl shadow-md border overflow-hidden transition-colors duration-300 ${shouldFlash ? 'animate-flash-bg' : ''}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-6 text-left">
                <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
                <ChevronDownIcon className={isOpen ? 'rotate-180' : ''} />
            </button>
            {isOpen && <div className="p-6 pt-0 animate-fade-in-down">{children}</div>}
        </div>
    );
};
const DayHoursEditor: React.FC<{ dayKey: DayKey; dayName: string; hours: DayHours; onHoursChange: (dayKey: DayKey, newHours: DayHours) => void; onCopy: (sourceDay: DayKey) => void; errors: { closesAt?: string; lunch?: string; } | undefined; errorRef: React.RefObject<HTMLDivElement>; }> = ({ dayKey, dayName, hours, onHoursChange, onCopy, errors, errorRef }) => {
    const [isEditorOpen, setEditorOpen] = useState(dayKey === 'weekdays');
    
    const handleChange = (field: keyof DayHours, value: any) => {
        const newHours = { ...hours, [field]: value };
        if (field === 'lunchStartsAt') {
            const lunchStartsMinutes = timeToMinutes(value);
            if (!isNaN(lunchStartsMinutes)) {
                const lunchEndsMinutes = lunchStartsMinutes + 60; // Assume 1 hour lunch
                const h = Math.floor(lunchEndsMinutes / 60) % 24;
                const m = lunchEndsMinutes % 60;
                newHours.lunchEndsAt = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            }
        }
        onHoursChange(dayKey, newHours);
    };
    const hasError = !!(errors?.closesAt || errors?.lunch);

    return (
        <div ref={errorRef} className={`p-4 border rounded-lg ${!hours.enabled ? 'bg-gray-100' : 'bg-white'} ${hasError ? 'border-red-400 ring-2 ring-red-200' : ''} transition-all`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 cursor-pointer flex-grow" onClick={() => setEditorOpen(!isEditorOpen)}>
                    <ToggleSwitch enabled={hours.enabled} setEnabled={value => handleChange('enabled', value)} />
                    <div>
                        <p className={`font-semibold ${!hours.enabled ? 'text-gray-500' : 'text-brand-dark'}`}>{dayName}</p>
                        {!hours.enabled ? <p className="text-sm text-gray-500">Fechado</p> : <p className="text-sm text-gray-500">{hours.opensAt} - {hours.closesAt}</p>}
                    </div>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); onCopy(dayKey); }} className="p-2 rounded-full hover:bg-gray-200" aria-label={`Copiar horário de ${dayName}`}><CopyIcon /></button>
            </div>
            {isEditorOpen && hours.enabled && (
                <div className="mt-4 pt-4 border-t space-y-4 animate-fade-in-down">
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-700">Abre às</label><input type="time" value={hours.opensAt} onChange={e => handleChange('opensAt', e.target.value)} className="w-full mt-1 input-dark" /></div>
                        <div><label className="text-sm font-medium text-gray-700">Fecha às</label><input type="time" value={hours.closesAt} onChange={e => handleChange('closesAt', e.target.value)} className={`w-full mt-1 input-dark ${errors?.closesAt ? '!border-red-500' : ''}`} /></div>
                    </div>
                    {errors?.closesAt && <p className="text-red-600 text-xs mt-1" role="alert">{errors.closesAt}</p>}
                    <div>
                        <div className="flex items-center gap-2 mb-2"><ToggleSwitch enabled={hours.lunchEnabled} setEnabled={value => handleChange('lunchEnabled', value)} /><label className="text-sm font-medium text-gray-700">Intervalo de almoço</label></div>
                        {hours.lunchEnabled && (
                            <div className={`grid grid-cols-2 gap-4 p-3 border rounded-md bg-gray-50 ${errors?.lunch ? 'border-red-400' : ''}`}>
                                <div><label className="text-xs font-medium text-gray-700">Início</label><input type="time" value={hours.lunchStartsAt} onChange={e => handleChange('lunchStartsAt', e.target.value)} className="w-full mt-1 input-dark text-sm"/></div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700">Fim (Automático)</label>
                                    <div className="w-full mt-1 input-dark text-sm h-[35.5px] flex items-center px-3 bg-gray-600 text-gray-300">
                                        {hours.lunchEndsAt}
                                    </div>
                                </div>
                            </div>
                        )}
                        {errors?.lunch && <p className="text-red-600 text-xs mt-1" role="alert">{errors.lunch}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

const SpecialDateModal: React.FC<{isOpen: boolean; onClose: () => void; onSave: (data: Omit<SpecialDate, 'date'>) => void; dates: string[];}> = ({ isOpen, onClose, onSave, dates }) => {
    const [status, setStatus] = useState<'closed' | 'special'>('closed');
    const [opensAt, setOpensAt] = useState('09:00');
    const [closesAt, setClosesAt] = useState('17:00');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => { onSave({ status, opensAt, closesAt, description }); };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b flex justify-between items-center"><h3 className="font-bold text-lg">Configurar Data Especial</h3><button onClick={onClose}><CloseIcon/></button></header>
                <main className="p-5 space-y-4">
                    <p className="text-sm text-gray-600">Você está editando <strong className="text-brand-primary">{dates.length}</strong> dia(s) selecionado(s).</p>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Ex: Feriado Municipal)</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="w-full input-dark"/></div>
                    <div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="status" value="closed" checked={status === 'closed'} onChange={() => setStatus('closed')} className="h-4 w-4 text-brand-primary focus:ring-brand-primary" /> Fechado</label><label className="flex items-center gap-2"><input type="radio" name="status" value="special" checked={status === 'special'} onChange={() => setStatus('special')} className="h-4 w-4 text-brand-primary focus:ring-brand-primary" /> Horário Especial</label></div>
                    {status === 'special' && (<div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50 animate-fade-in-down"><div><label className="text-sm font-medium text-gray-700">Abre às</label><input type="time" value={opensAt} onChange={e => setOpensAt(e.target.value)} className="w-full mt-1 input-dark"/></div><div><label className="text-sm font-medium text-gray-700">Fecha às</label><input type="time" value={closesAt} onChange={e => setClosesAt(e.target.value)} className="w-full mt-1 input-dark"/></div></div>)}
                </main>
                <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="button" onClick={handleSubmit} className="btn-primary">Salvar Exceção</button></footer>
            </div>
        </div>
    );
};


const SalonHoursScreen: React.FC = () => {
    const [originalSettings, setOriginalSettings] = useState<SalonHoursSettings>(MOCK_SETTINGS);
    const [draft, setDraft] = useState<SalonHoursSettings>(MOCK_SETTINGS);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [errors, setErrors] = useState<TimeValidationErrors>({});
    const [copySource, setCopySource] = useState<{ day: DayKey; name: string } | null>(null);
    const [copyTargets, setCopyTargets] = useState<DayKey[]>([]);
    const [changedAccordions, setChangedAccordions] = useState({ standard: false, exceptions: false, general: false });
    const [liveMessage, setLiveMessage] = useState('');

    // State for exceptions calendar
    const [calendarDate, setCalendarDate] = useState(new Date(2025, 10, 1)); // Nov 2025
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [lastSelectedDate, setLastSelectedDate] = useState<string | null>(null);
    const [isSpecialDateModalOpen, setIsSpecialDateModalOpen] = useState(false);
    
    const editorRefs = { weekdays: useRef<HTMLDivElement>(null), saturday: useRef<HTMLDivElement>(null), sunday: useRef<HTMLDivElement>(null), };

    const validateTimes = useCallback((settings: SalonHoursSettings): TimeValidationErrors => {
        const newErrors: TimeValidationErrors = {};
        const checkDay = (dayKey: DayKey, dayData: DayHours) => {
            if (!dayData.enabled) return;
            const opens = timeToMinutes(dayData.opensAt);
            const closes = timeToMinutes(dayData.closesAt);
            if (closes <= opens) {
                if (!newErrors[dayKey]) newErrors[dayKey] = {};
                newErrors[dayKey]!.closesAt = "O horário de fechamento deve ser posterior ao de abertura.";
            }
            if (dayData.lunchEnabled) {
                const lunchStarts = timeToMinutes(dayData.lunchStartsAt);
                const lunchEnds = timeToMinutes(dayData.lunchEndsAt);
                if (lunchEnds <= lunchStarts) { if (!newErrors[dayKey]) newErrors[dayKey] = {}; newErrors[dayKey]!.lunch = "O fim do almoço deve ser após o início."; }
                else if (lunchStarts < opens || lunchEnds > closes) { if (!newErrors[dayKey]) newErrors[dayKey] = {}; newErrors[dayKey]!.lunch = "O almoço deve ocorrer dentro do horário de expediente."; }
            }
        };
        (Object.keys(settings.weeklyHours) as DayKey[]).forEach(key => checkDay(key, settings.weeklyHours[key]));
        return newErrors;
    }, []);

    useEffect(() => {
        const isWeeklyChanged = JSON.stringify(draft.weeklyHours) !== JSON.stringify(originalSettings.weeklyHours);
        const areExceptionsChanged = JSON.stringify(draft.specialDates) !== JSON.stringify(originalSettings.specialDates);
        const areGeneralChanged = JSON.stringify(draft.generalSettings) !== JSON.stringify(originalSettings.generalSettings);
        setHasChanges(isWeeklyChanged || areExceptionsChanged || areGeneralChanged);
        setErrors(validateTimes(draft));
    }, [draft, originalSettings, validateTimes]);

    const handleRevert = () => { setDraft(originalSettings); setLiveMessage('Alterações revertidas.'); };

    const handleSave = () => {
        const currentErrors = validateTimes(draft);
        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            const firstErrorKey = Object.keys(currentErrors)[0] as DayKey;
            editorRefs[firstErrorKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setLiveMessage('Existem erros de validação que precisam ser corrigidos.');
            return;
        }
        setSaveStatus('saving');
        setLiveMessage('Salvando alterações...');

        setChangedAccordions({
            standard: JSON.stringify(draft.weeklyHours) !== JSON.stringify(originalSettings.weeklyHours),
            exceptions: JSON.stringify(draft.specialDates) !== JSON.stringify(originalSettings.specialDates),
            general: JSON.stringify(draft.generalSettings) !== JSON.stringify(originalSettings.generalSettings),
        });

        setTimeout(() => {
            setOriginalSettings(draft);
            setSaveStatus('saved');
            setLiveMessage('Configurações salvas com sucesso!');
            setTimeout(() => {
                setSaveStatus('idle');
                setChangedAccordions({ standard: false, exceptions: false, general: false });
            }, 1500);
        }, 1500);
    };

    const handleHoursChange = (dayKey: DayKey, newHours: DayHours) => { setDraft(prev => ({ ...prev, weeklyHours: { ...prev.weeklyHours, [dayKey]: newHours } })); };
    const handleGeneralChange = (field: keyof GeneralSettings, value: any) => { setDraft(prev => ({ ...prev, generalSettings: { ...prev.generalSettings, [field]: value } })); };
    
    const handleExecuteCopy = () => {
        if (copySource && copyTargets.length > 0) {
            let newWeeklyHours = { ...draft.weeklyHours };
            const sourceHours = draft.weeklyHours[copySource.day];
            copyTargets.forEach(target => { newWeeklyHours[target] = sourceHours; });
            setDraft(prev => ({ ...prev, weeklyHours: newWeeklyHours }));
        }
        setCopySource(null);
        setCopyTargets([]);
    };

    // --- Calendar & Exceptions Logic ---
    const specialDatesMap = useMemo(() => draft.specialDates.reduce((acc, sp) => { acc[sp.date] = sp; return acc; }, {} as Record<string, SpecialDate>), [draft.specialDates]);
    const upcomingHolidays = useMemo(() => MOCK_HOLIDAYS.filter(h => !specialDatesMap[h.date]), [specialDatesMap]);
    
    const handleDayClick = (day: number, e: React.MouseEvent) => {
        const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
        const dateStr = dateToYyyyMmDd(date);
        
        if (e.shiftKey && lastSelectedDate) {
            const start = new Date(lastSelectedDate);
            const end = date;
            const range: string[] = [];
            for (let dt = new Date(Math.min(start.getTime(), end.getTime())); dt.getTime() <= Math.max(start.getTime(), end.getTime()); dt.setDate(dt.getDate() + 1)) {
                range.push(dateToYyyyMmDd(new Date(dt)));
            }
            const newSelection = Array.from(new Set([...selectedDates, ...range]));
            setSelectedDates(newSelection);
        } else if (e.ctrlKey || e.metaKey) {
            setSelectedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
        } else {
            setSelectedDates([dateStr]);
        }
        setLastSelectedDate(dateStr);
    };

    const handleSaveSpecialDate = (data: Omit<SpecialDate, 'date'>) => {
        const newSpecialDates = selectedDates.map(date => ({ ...data, date }));
        setDraft(prev => ({
            ...prev,
            specialDates: [
                ...prev.specialDates.filter(sd => !selectedDates.includes(sd.date)),
                ...newSpecialDates
            ]
        }));
        setIsSpecialDateModalOpen(false);
        setSelectedDates([]);
    };

    const handleRemoveSpecialDate = (date: string) => {
        setDraft(prev => ({...prev, specialDates: prev.specialDates.filter(sd => sd.date !== date)}));
    };
    
    const handleAddHoliday = (holiday: {date: string; name: string}) => {
        const newSpecialDate: SpecialDate = { date: holiday.date, description: holiday.name, status: 'closed', opensAt: '', closesAt: '' };
        setDraft(prev => ({ ...prev, specialDates: [...prev.specialDates.filter(sd => sd.date !== holiday.date), newSpecialDate] }));
    };

    const renderCalendar = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const blanks = Array.from({ length: (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1) });
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        
        return (<>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-gray-100">&lt;</button>
                <h3 className="text-lg font-bold text-brand-dark">{calendarDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-gray-100">&gt;</button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
                {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                {days.map(day => {
                    const dateStr = dateToYyyyMmDd(new Date(year, month, day));
                    const exception = specialDatesMap[dateStr];
                    const isSelected = selectedDates.includes(dateStr);
                    const tooltipText = exception ? `${exception.description} (${exception.status === 'closed' ? 'Fechado' : `${exception.opensAt}-${exception.closesAt}`})` : '';

                    return (
                        <Tooltip key={day} text={tooltipText}>
                            <div onClick={(e) => handleDayClick(day, e)} className={`h-12 border-t p-1 flex items-center justify-center cursor-pointer relative ${isSelected ? 'bg-brand-primary' : 'hover:bg-gray-100'}`}>
                                <span className={isSelected ? 'text-white' : 'text-brand-dark'}>{day}</span>
                                {exception && <div className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${exception.status === 'closed' ? 'bg-red-500' : 'bg-green-500'}`}></div>}
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        </>);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <SpecialDateModal isOpen={isSpecialDateModalOpen} onClose={() => setIsSpecialDateModalOpen(false)} onSave={handleSaveSpecialDate} dates={selectedDates} />
            <div aria-live="polite" className="sr-only">{liveMessage}</div>
            <style>{`@keyframes flash-bg { 0% { background-color: #d1fae5; } 100% { background-color: #ffffff; } } .animate-flash-bg { animation: flash-bg 1.5s ease-out forwards; }`}</style>

            {copySource && (
                <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 animate-fade-in-up">
                    <div className="bg-white rounded-xl shadow-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border">
                        <p className="font-semibold text-sm">Copiar de <span className="font-bold text-brand-primary">{copySource.name}</span> para:</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {(Object.keys(draft.weeklyHours) as DayKey[]).filter(d => d !== copySource.day).map(day => (
                                <label key={day} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={copyTargets.includes(day)} onChange={() => setCopyTargets(p => p.includes(day) ? p.filter(t => t !== day) : [...p, day])} className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary" />
                                    {day === 'weekdays' ? 'Semana' : day === 'saturday' ? 'Sábado' : 'Domingo'}
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2"><button onClick={() => setCopySource(null)} className="btn-secondary text-sm">Cancelar</button><button onClick={handleExecuteCopy} className="btn-primary text-sm">Copiar</button></div>
                    </div>
                </div>
            )}

            <AccordionItem title="Horários Padrão" defaultOpen flash={changedAccordions.standard}>
                <div className="space-y-4">
                    <DayHoursEditor dayKey="weekdays" dayName="Segunda a Sexta" hours={draft.weeklyHours.weekdays} onHoursChange={handleHoursChange} onCopy={(day) => setCopySource({day, name: "Segunda a Sexta"})} errors={errors.weekdays} errorRef={editorRefs.weekdays} />
                    <DayHoursEditor dayKey="saturday" dayName="Sábados" hours={draft.weeklyHours.saturday} onHoursChange={handleHoursChange} onCopy={(day) => setCopySource({day, name: "Sábados"})} errors={errors.saturday} errorRef={editorRefs.saturday} />
                    <DayHoursEditor dayKey="sunday" dayName="Domingos" hours={draft.weeklyHours.sunday} onHoursChange={handleHoursChange} onCopy={(day) => setCopySource({day, name: "Domingos"})} errors={errors.sunday} errorRef={editorRefs.sunday} />
                </div>
            </AccordionItem>
            
            <AccordionItem title="Exceções (Feriados e Datas Especiais)" flash={changedAccordions.exceptions}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700">Calendário de Exceções</h4>
                        <div className="p-4 border rounded-lg">{renderCalendar()}</div>
                        {selectedDates.length > 0 && (<div className="flex gap-2 animate-fade-in-up"><button onClick={() => setIsSpecialDateModalOpen(true)} className="btn-primary w-full">Adicionar Exceção</button><button onClick={() => setSelectedDates([])} className="btn-secondary">Limpar Seleção</button></div>)}
                    </div>
                     <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700">Sugestões de Feriados</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">{upcomingHolidays.map(holiday => (<div key={holiday.date} className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm"><p className="text-gray-800">{holiday.name} <span className="text-gray-500">({new Date(holiday.date + 'T00:00:00').toLocaleDateString('pt-BR')})</span></p><button onClick={() => handleAddHoliday(holiday)} className="text-brand-primary font-semibold hover:underline text-xs">Adicionar</button></div>))}</div>
                        <h4 className="font-semibold text-gray-700 pt-4 border-t">Exceções Configuradas</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">{draft.specialDates.length > 0 ? draft.specialDates.sort((a,b) => a.date.localeCompare(b.date)).map(sp => (<div key={sp.date} className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm"><p className="text-gray-800">{new Date(sp.date + 'T00:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: 'long'})}: <span className="font-semibold text-brand-dark">{sp.description}</span></p><button onClick={() => handleRemoveSpecialDate(sp.date)} className="text-gray-400 hover:text-red-600 p-1"><TrashIcon className="w-4 h-4" /></button></div>)) : <p className="text-sm text-gray-500 text-center">Nenhuma exceção cadastrada.</p>}</div>
                    </div>
                </div>
            </AccordionItem>

            <AccordionItem title="Configurações Gerais" flash={changedAccordions.general}>
                <div className="space-y-4">
                     <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                        <div>
                            <label className="font-medium text-gray-800">Senha mestra para fechar caixa</label>
                            <Tooltip text="Exigirá uma senha de administrador para finalizar as operações do dia, garantindo mais segurança.">
                                <InfoIcon className="inline-block ml-1 text-gray-400" />
                            </Tooltip>
                        </div>
                        <ToggleSwitch enabled={draft.generalSettings.masterPasswordEnabled} setEnabled={value => handleGeneralChange('masterPasswordEnabled', value)} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                            <div><label className="font-medium text-gray-800">Lembretes de agendamento</label></div>
                            <ToggleSwitch enabled={draft.generalSettings.remindersEnabled} setEnabled={value => handleGeneralChange('remindersEnabled', value)} />
                        </div>
                        {draft.generalSettings.remindersEnabled && (
                            <div className="mt-4 pt-4 border-t">
                                <label className="text-sm font-medium text-gray-700">Enviar lembrete com antecedência de:</label>
                                <select value={draft.generalSettings.reminderLeadTime} onChange={e => handleGeneralChange('reminderLeadTime', e.target.value as any)} className="w-full mt-1 select-dark">
                                    <option value="24h">24 horas</option><option value="48h">48 horas</option><option value="72h">72 horas</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </AccordionItem>

            {hasChanges && (
                 <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50">
                    <div className="bg-brand-dark text-white rounded-xl shadow-2xl p-4 flex justify-between items-center animate-fade-in-up">
                        <p className="font-semibold">Você tem alterações não salvas!</p>
                        <div className="flex gap-4">
                            <button onClick={handleRevert} className="font-semibold hover:underline">Reverter</button>
                            <button onClick={handleSave} disabled={Object.keys(errors).length > 0 || saveStatus === 'saving'} className="btn-primary flex items-center gap-2 disabled:bg-gray-500">
                                {saveStatus === 'saving' && <SpinnerIcon className="w-5 h-5 -ml-1 mr-1" />}
                                {saveStatus === 'saved' ? '✓ Salvo!' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalonHoursScreen;