

import React, { useState } from 'react';
import type { FullAppointment } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { getMockNow } from '../../utils/dateUtils';

const NOW = getMockNow();

export type PeriodSelection = {
    type: 'quick' | 'best' | 'custom';
    key: string;
    label: string;
    start: Date;
    end: Date;
    comparison?: {
        label: string;
        start: Date;
        end: Date;
    }
};

const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>;

const quickPeriodOptions: { key: string; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: 'yesterday', label: 'Ontem' },
    { key: 'last7', label: 'Últimos 7 dias' },
    { key: 'last30', label: 'Últimos 30 dias' },
    { key: 'thisMonth', label: 'Este Mês' },
    { key: 'lastMonth', label: 'Mês Passado' },
    { key: 'last90', label: 'Últimos 90 dias' },
    { key: 'thisYear', label: 'Este Ano' },
    { key: 'allTime', label: 'Todo período' },
];

const bestPeriodOptions: { key: string; label: string, days: number }[] = [
    { key: 'bestDay', label: 'Melhor Dia', days: 1 },
    { key: 'bestWeek', label: 'Melhor Semana', days: 7 },
    { key: 'bestMonth', label: 'Melhor Mês', days: 30 },
    { key: 'bestQuarter', label: 'Melhor Trimestre', days: 90 },
    { key: 'bestYear', label: 'Melhor Ano', days: 365 },
];

export function getQuickPeriodDates(periodKey: string): { start: Date, end: Date } {
    const end = new Date(NOW);
    const start = new Date(NOW);
    
    end.setUTCHours(23, 59, 59, 999);
    start.setUTCHours(0, 0, 0, 0);

    switch (periodKey) {
        case 'today': break;
        case 'yesterday': start.setUTCDate(start.getUTCDate() - 1); end.setUTCDate(end.getUTCDate() - 1); break;
        case 'last7': start.setUTCDate(start.getUTCDate() - 6); break;
        case 'last30': start.setUTCDate(start.getUTCDate() - 29); break;
        case 'thisMonth': start.setUTCDate(1); break;
        case 'lastMonth': end.setUTCDate(0); start.setUTCMonth(start.getUTCMonth() - 1, 1); break;
        case 'last90': start.setUTCDate(start.getUTCDate() - 89); break;
        case 'thisYear': start.setUTCMonth(0, 1); break;
    }
    return { start, end };
}

const findBestPeriod = (allAppointments: FullAppointment[], days: number): { start: Date, end: Date, revenue: number } => {
    if (allAppointments.length === 0) return { start: NOW, end: NOW, revenue: 0 };

    const sortedAppts = allAppointments.slice().filter(a => a.status === 'completed').sort((a, b) => Number(a.date.getTime()) - Number(b.date.getTime()));
    if (sortedAppts.length === 0) return { start: NOW, end: NOW, revenue: 0 };
    
    let bestPeriod = { start: sortedAppts[0].date, end: sortedAppts[0].date, revenue: 0 };
    let currentWindow: FullAppointment[] = [];
    let currentRevenue = 0;

    const getPrice = (appt: FullAppointment): number => {
        const priceString = (appt.service.price || '0');
        const numberString = priceString.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
        return parseFloat(numberString) || 0;
    };
    
    for (let i = 0; i < sortedAppts.length; i++) {
        const newAppt = sortedAppts[i];
        currentWindow.push(newAppt);
        currentRevenue += Number(getPrice(newAppt));
        
        while (currentWindow.length > 0 && (Number(newAppt.date.getTime()) - Number(currentWindow[0].date.getTime()) > days * 24 * 60 * 60 * 1000)) {
            const removedAppt = currentWindow.shift();
            if (removedAppt) {
                currentRevenue -= Number(getPrice(removedAppt));
            }
        }

        if (currentWindow.length > 0 && currentRevenue > bestPeriod.revenue) {
            bestPeriod = {
                start: currentWindow[0].date,
                end: newAppt.date,
                revenue: currentRevenue
            };
        }
    }
    return bestPeriod;
};


export const PeriodSelector: React.FC<{
    allAppointments?: FullAppointment[];
    onSelect: (selection: PeriodSelection) => void;
}> = ({ allAppointments, onSelect }) => {
    const [view, setView] = useState<'quick' | 'best' | 'custom'>('quick');
    const [customStart, setCustomStart] = useState<string>('');
    const [customEnd, setCustomEnd] = useState<string>('');
    const [customComparison, setCustomComparison] = useState<'previous' | 'year'>('previous');
    const [customError, setCustomError] = useState('');

    const handleQuickSelect = (key: string, label: string) => {
        if (key === 'allTime') {
            if (!allAppointments || allAppointments.length === 0) {
                const today = getQuickPeriodDates('today');
                onSelect({ type: 'quick', key, label, start: today.start, end: today.end });
                return;
            }
            const dates = allAppointments.map(a => a.date.getTime());
            const minTime = Math.min.apply(null, dates);
            const maxTime = Math.max.apply(null, dates);
            
            const start = new Date(minTime);
            start.setUTCHours(0, 0, 0, 0);
            
            const end = new Date(maxTime);
            end.setUTCHours(23, 59, 59, 999);

            onSelect({ type: 'quick', key, label, start, end });
        } else {
            const { start, end } = getQuickPeriodDates(key);
            onSelect({ type: 'quick', key, label, start, end });
        }
    };

    const handleBestSelect = (key: string, label: string, days: number) => {
        if (!allAppointments) return;
        const { start, end, revenue } = findBestPeriod(allAppointments, days);
        onSelect({ type: 'best', key, label: `${label} (${formatCurrency(revenue)})`, start, end });
    };
    
    const handleCustomSubmit = () => {
        if (!customStart || !customEnd) {
            setCustomError("Ambas as datas de início e fim são obrigatórias.");
            return;
        }
        const start = new Date(customStart + 'T00:00:00Z');
        const end = new Date(customEnd + 'T23:59:59Z');

        if (Number(start.getTime()) > Number(end.getTime())) {
            setCustomError("A data de início deve ser anterior à data de fim.");
            return;
        }
        
        let comparison: PeriodSelection['comparison'];
        if(customComparison === 'previous') {
            const duration = Number(end.getTime()) - Number(start.getTime());
            const compEnd = new Date(Number(start.getTime()) - (24 * 60 * 60 * 1000));
            const compStart = new Date(Number(compEnd.getTime()) - duration);
            comparison = { label: 'vs. período anterior', start: compStart, end: compEnd };
        } else { // year
            const compStart = new Date(start);
            compStart.setFullYear(start.getFullYear() - 1);
            const compEnd = new Date(end);
            compEnd.setFullYear(end.getFullYear() - 1);
            comparison = { label: 'vs. ano anterior', start: compStart, end: compEnd };
        }

        onSelect({
            type: 'custom',
            key: 'custom',
            label: `${start.toLocaleDateString('pt-BR', {timeZone: 'UTC'})} - ${end.toLocaleDateString('pt-BR', {timeZone: 'UTC'})}`,
            start,
            end,
            comparison
        });
    };

    return (
        <div className="absolute top-full mt-2 z-50 bg-white shadow-xl rounded-lg border w-96 max-w-[calc(100vw-2rem)] left-0 text-brand-dark">
            <div className="p-2 border-b grid grid-cols-3 gap-1">
                <button onClick={() => setView('quick')} className={`px-2 py-1 text-sm font-semibold rounded ${view === 'quick' ? 'bg-brand-primary text-white' : 'hover:bg-gray-100'}`}>Rápidos</button>
                {allAppointments && <button onClick={() => setView('best')} className={`px-2 py-1 text-sm font-semibold rounded ${view === 'best' ? 'bg-brand-primary text-white' : 'hover:bg-gray-100'}`}>Melhores Períodos</button>}
                <button onClick={() => setView('custom')} className={`px-2 py-1 text-sm font-semibold rounded ${view === 'custom' ? 'bg-brand-primary text-white' : 'hover:bg-gray-100'}`}>Personalizado</button>
            </div>
            <div className="p-3">
                {view === 'quick' && <div className="grid grid-cols-2 gap-2">{quickPeriodOptions.map(opt => <button key={opt.key} onClick={() => handleQuickSelect(opt.key, opt.label)} className="text-left p-2 rounded text-sm hover:bg-gray-100">{opt.label}</button>)}</div>}
                {view === 'best' && allAppointments && <div className="space-y-2">{bestPeriodOptions.map(opt => <button key={opt.key} onClick={() => handleBestSelect(opt.key, opt.label, opt.days)} className="w-full text-left p-2 rounded text-sm hover:bg-gray-100 flex justify-between items-center"><span>{opt.label}</span><TrophyIcon /></button>)}</div>}
                {view === 'custom' && (
                    <div className="space-y-4 p-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-sm font-medium text-gray-700">De</label><input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full mt-1 text-sm input-dark" /></div>
                            <div><label className="text-sm font-medium text-gray-700">Até</label><input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full mt-1 text-sm input-dark" /></div>
                        </div>
                        <div><label className="text-sm font-medium text-gray-700">Comparar com</label><select value={customComparison} onChange={e => setCustomComparison(e.target.value as any)} className="w-full mt-1 text-sm select-dark"><option value="previous">Período Anterior</option><option value="year">Ano Anterior</option></select></div>
                        {customError && <p className="text-red-600 text-xs">{customError}</p>}
                        <button onClick={handleCustomSubmit} className="w-full font-sans font-bold py-3 px-4 rounded-xl text-lg bg-brand-primary text-white shadow-lg hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-all duration-300">Aplicar</button>
                    </div>
                )}
            </div>
        </div>
    );
};
