
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as api from '../../api';
import type { FullAppointment, UnifiedUser, FinancialSettings } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { ReportToolbar } from '../../components/dashboard/ReportToolbar';
import type { PeriodSelection } from '../../components/dashboard/PeriodSelector';
import { getQuickPeriodDates } from '../../components/dashboard/PeriodSelector';

// --- ICONS ---
const PrintIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const FileCsvIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const UpArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
const DownArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;
const SpinnerIcon: React.FC<{className?: string}> = ({className}) => <svg className={`animate-spin ${className ?? ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

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

// --- MAIN COMPONENT ---
interface CommissionData {
    professionalId: number;
    professionalName: string;
    totalRevenue: number;
    totalAppointments: number;
    commissionRate: number;
    commissionAmount: number;
}

const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    return ((current - previous) / previous) * 100;
};

const TrendIndicator: React.FC<{ trend: number, label: string }> = ({ trend, label }) => {
    if (!isFinite(trend)) return null;

    const isPositive = trend >= 0;
    const trendText = `${isPositive ? '+' : ''}${trend.toFixed(1)}%`;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
        <p className={`text-xs font-bold flex items-center gap-1 ${colorClass}`}>
            {isPositive ? <UpArrowIcon /> : <DownArrowIcon />}
            {trendText} {label}
        </p>
    );
};

const CommissionsScreen: React.FC = () => {
    const { users, financialSettings, setFinancialSettings } = useAppContext();
    const [allAppointments, setAllAppointments] = useState<FullAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [periodSelection, setPeriodSelection] = useState<PeriodSelection>(() => {
        const { start, end } = getQuickPeriodDates('thisMonth');
        return { type: 'quick', key: 'thisMonth', label: 'Este Mês', start, end };
    });

    const [draftSettings, setDraftSettings] = useState<FinancialSettings>(financialSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        setHasChanges(JSON.stringify(draftSettings) !== JSON.stringify(financialSettings));
    }, [draftSettings, financialSettings]);

    useEffect(() => {
        setDraftSettings(financialSettings);
    }, [financialSettings]);

    useEffect(() => {
        api.getAppointments()
            .then(data => setAllAppointments(data))
            .catch(err => {
                console.error("Failed to load appointments:", err);
                setError("Não foi possível carregar os dados para o relatório de comissões.");
            })
            .finally(() => setIsLoading(false));
    }, []);

    const professionals = useMemo(() => users.filter(u => u.accessLevel === 'professional' && u.id !== 0), [users]);
    
    const processCommissionData = (appointments: FullAppointment[], pros: UnifiedUser[], settings: FinancialSettings): CommissionData[] => {
         const dataByProfessional: Record<number, Pick<CommissionData, 'totalRevenue' | 'totalAppointments'>> = {};

        appointments.forEach(appt => {
            const proId = appt.professional.id;
            if (!dataByProfessional[proId]) {
                dataByProfessional[proId] = { totalRevenue: 0, totalAppointments: 0 };
            }
            
            const price = parseFloat(appt.service.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
            dataByProfessional[proId].totalRevenue = dataByProfessional[proId].totalRevenue + price;
            dataByProfessional[proId].totalAppointments = dataByProfessional[proId].totalAppointments + 1;
        });
        
        return pros.map(pro => {
            const data = dataByProfessional[pro.id] || { totalRevenue: 0, totalAppointments: 0 };
            const commissionRate = (settings.individualCommissions[pro.id] ?? settings.defaultCommission) / 100;
            return {
                professionalId: pro.id,
                professionalName: pro.name,
                ...data,
                commissionRate: commissionRate,
                commissionAmount: data.totalRevenue * commissionRate,
            };
        }).sort((a, b) => b.commissionAmount - a.commissionAmount);
    };

    const commissionData = useMemo(() => {
        const { start, end } = periodSelection;
        const filteredAppointments = allAppointments.filter(appt => {
            const apptDate = appt.date;
            return appt.status === 'completed' && Number(apptDate.getTime()) >= Number(start.getTime()) && Number(apptDate.getTime()) <= Number(end.getTime());
        });
        return processCommissionData(filteredAppointments, professionals, draftSettings);
    }, [allAppointments, professionals, periodSelection, draftSettings]);
    
    const comparisonCommissionData = useMemo(() => {
        if (!periodSelection.comparison) return [];
        const { start, end } = periodSelection.comparison;
         const filteredAppointments = allAppointments.filter(appt => {
            const apptDate = appt.date;
            return appt.status === 'completed' && Number(apptDate.getTime()) >= Number(start.getTime()) && Number(apptDate.getTime()) <= Number(end.getTime());
        });
        return processCommissionData(filteredAppointments, professionals, draftSettings);
    }, [allAppointments, professionals, periodSelection.comparison, draftSettings]);

    const { totalRevenue, totalCommission, totalAppointments, trendRevenue, trendCommission, trendAppointments } = useMemo(() => {
        const currentTotals = commissionData.reduce((acc, data) => {
            acc.totalRevenue = acc.totalRevenue + data.totalRevenue;
            acc.totalCommission = acc.totalCommission + data.commissionAmount;
            acc.totalAppointments = acc.totalAppointments + data.totalAppointments;
            return acc;
        }, { totalRevenue: 0, totalCommission: 0, totalAppointments: 0 });
        
        if (comparisonCommissionData.length === 0) {
            return { ...currentTotals, trendRevenue: 0, trendCommission: 0, trendAppointments: 0 };
        }
        
        const previousTotals = comparisonCommissionData.reduce((acc, data) => {
            acc.totalRevenue = acc.totalRevenue + data.totalRevenue;
            acc.totalCommission = acc.totalCommission + data.commissionAmount;
            acc.totalAppointments = acc.totalAppointments + data.totalAppointments;
            return acc;
        }, { totalRevenue: 0, totalCommission: 0, totalAppointments: 0 });

        return {
            ...currentTotals,
            trendRevenue: calculateTrend(currentTotals.totalRevenue, previousTotals.totalRevenue),
            trendCommission: calculateTrend(currentTotals.totalCommission, previousTotals.totalCommission),
            trendAppointments: calculateTrend(currentTotals.totalAppointments, previousTotals.totalAppointments),
        };

    }, [commissionData, comparisonCommissionData]);


    const handleApplyGlobalRate = () => {
        const newRates: Record<number, number> = {};
        professionals.forEach(pro => {
            newRates[pro.id] = draftSettings.defaultCommission;
        });
        setDraftSettings(prev => ({ ...prev, individualCommissions: newRates }));
    };
    
    const handleExportCsv = () => {
        const headers = ["Profissional", "Atendimentos", "Faturamento Total", "Taxa de Comissão (%)", "Valor da Comissão"];
        const rows = commissionData.map(data => [
            data.professionalName,
            data.totalAppointments,
            data.totalRevenue.toFixed(2),
            (data.commissionRate * 100).toFixed(0),
            data.commissionAmount.toFixed(2)
        ]);
        exportToCsv(`relatorio_comissoes_${periodSelection.label.replace(/\s/g, '_')}.csv`, [headers, ...rows]);
    };

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setFinancialSettings(draftSettings);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };

    const handleRevert = () => {
        setDraftSettings(financialSettings);
    };

    const handlePrint = () => window.print();

    if (error) {
        return <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start"><ErrorIcon /><div><p className="font-bold">Ocorreu um Erro</p><p className="text-sm">{error}</p></div></div>;
    }

    return (
        <div id="printable-area">
             <style>{`.no-print { display: block; } @media print { body * { visibility: hidden; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; } .no-print { display: none !important; } @page { size: auto; margin: 0.5in; } } .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
            <div className="space-y-6 pb-24">
                <ReportToolbar
                    periodSelection={periodSelection}
                    onPeriodSelect={setPeriodSelection}
                    allAppointments={allAppointments}
                    onPrint={handlePrint}
                    onExportCsv={handleExportCsv}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-lg shadow-md border"><p className="text-sm font-semibold text-gray-500">Faturamento no Período</p><p className="text-3xl font-bold text-green-500">{formatCurrency(totalRevenue)}</p><TrendIndicator trend={trendRevenue} label="vs. período anterior"/></div>
                    <div className="bg-white p-5 rounded-lg shadow-md border"><p className="text-sm font-semibold text-gray-500">Total de Comissões</p><p className="text-3xl font-bold text-blue-500">{formatCurrency(totalCommission)}</p><TrendIndicator trend={trendCommission} label="vs. período anterior"/></div>
                    <div className="bg-white p-5 rounded-lg shadow-md border"><p className="text-sm font-semibold text-gray-500">Total de Atendimentos</p><p className="text-3xl font-bold text-brand-primary">{totalAppointments}</p><TrendIndicator trend={trendAppointments} label="vs. período anterior"/></div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden border">
                    <h2 className="text-xl font-bold m-4">Relatório de Comissões por Profissional</h2>
                    <div className="p-4 bg-gray-50 border-y no-print">
                         <h3 className="font-semibold mb-2">Ajuste Rápido de Comissões</h3>
                         <p className="text-sm text-gray-600 mb-2">Aplicar a mesma porcentagem para todos os profissionais.</p>
                         <div className="flex items-center gap-2 max-w-sm">
                            <div className="relative flex-grow">
                                <input type="number" value={draftSettings.defaultCommission} onChange={e => setDraftSettings(p => ({...p, defaultCommission: Number(e.target.value)}))} className="input-dark pl-4 pr-8" placeholder="Ex: 35" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
                            </div>
                            <button onClick={handleApplyGlobalRate} className="btn-secondary">Aplicar a Todos</button>
                         </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {isLoading ? (
                            <div className="p-4 text-center">Carregando dados...</div>
                        ) : commissionData.length === 0 ? (
                            <div className="p-4 text-center">Nenhum dado de comissão para o período selecionado.</div>
                        ) : (
                            commissionData.map(data => (
                                <div key={data.professionalId} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <p className="font-bold text-gray-800 md:col-span-1">{data.professionalName}</p>
                                    <div className="grid grid-cols-3 gap-4 md:col-span-3 items-center">
                                        <p><span className="text-xs text-gray-500 block">Faturamento</span><span className="font-semibold">{formatCurrency(data.totalRevenue)}</span></p>
                                        <div className="relative no-print">
                                            <label className="text-xs text-gray-500 block">Taxa %</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    value={draftSettings.individualCommissions[data.professionalId] ?? ''} 
                                                    onChange={e => setDraftSettings(prev => ({ ...prev, individualCommissions: { ...prev.individualCommissions, [data.professionalId]: Number(e.target.value) } }))}
                                                    placeholder={String(draftSettings.defaultCommission)}
                                                    className="input-dark w-24 pr-6"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">%</span>
                                            </div>
                                        </div>
                                        <p><span className="text-xs text-gray-500 block">Comissão</span><span className="font-bold text-green-600">{formatCurrency(data.commissionAmount)}</span></p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                     <div className="bg-gray-100 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 font-bold text-gray-800">
                        <p>TOTAIS</p>
                        <div className="md:col-start-2 grid grid-cols-3 gap-4 md:col-span-3">
                            <p>{formatCurrency(totalRevenue)}</p>
                            <p className="no-print"></p>
                            <p>{formatCurrency(totalCommission)}</p>
                        </div>
                    </div>
                </div>

                 {hasChanges && (
                    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50">
                        <div className="bg-brand-dark text-white rounded-xl shadow-2xl p-4 flex justify-between items-center animate-fade-in-up">
                            <p className="font-semibold">Você tem alterações não salvas!</p>
                            <div className="flex gap-4">
                                <button onClick={handleRevert} className="font-semibold hover:underline">Reverter</button>
                                <button onClick={handleSave} disabled={saveStatus === 'saving'} className="btn-primary flex items-center gap-2 disabled:bg-gray-500">
                                    {saveStatus === 'saving' && <SpinnerIcon className="w-5 h-5 -ml-1 mr-1" />}
                                    {saveStatus === 'saved' ? '✓ Salvo!' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommissionsScreen;
