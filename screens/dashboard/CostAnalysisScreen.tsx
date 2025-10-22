
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useAppContext } from '../../contexts/AppContext';
import type { SubscriptionPlan, Service, FinancialSettings, UnifiedUser } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { HelpTooltip } from '../../components/ui/HelpTooltip';
import { Button } from '../../components/ui/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';

// --- ICONS ---
const ChevronDownIcon: React.FC<{ open: boolean }> = ({ open }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
const AlertIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.85-1.21 3.486 0l5.58 10.622c.636 1.21-.462 2.779-1.743 2.779H4.42c-1.281 0-2.379-1.569-1.743-2.779L8.257 3.099zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

const parseDurationToMinutes = (duration: string): number => {
    if (!duration || typeof duration !== 'string') return 0;
    const parts = duration.split(' ');
    if (parts.length < 1) return 0;
    const value = parseInt(parts[0], 10);
    if (isNaN(value)) return 0;
    if (parts.length > 1 && parts[1].toLowerCase().startsWith('h')) {
        return value * 60;
    }
    return value; // Assume minutes if not specified
};

const roundUpTo990 = (num: number): number => {
  const base10 = Math.floor(num / 10) * 10;
  let candidate = base10 + 9.90;
  if (num - candidate > 0.001) {
    candidate += 10;
  }
  return parseFloat(candidate.toFixed(2));
};


const SliderInput: React.FC<{ label: string, description: string, value: number, onChange: (value: number) => void, min?: number, max?: number, step?: number, unit: string }> = ({ label, description, value, onChange, min = 0, max = 100, step = 1, unit }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            {label}
            <HelpTooltip text={description} />
        </label>
        <div className="flex items-center gap-4 mt-1">
            <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
            <div className="relative">
                 <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="input-dark w-24 text-center pr-6" />
                 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">{unit}</span>
            </div>
        </div>
    </div>
);


const GlobalSettingsAccordion: React.FC<{
    settings: FinancialSettings;
    onChange: (field: keyof FinancialSettings, value: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    costIncreasePercentage: number;
    onApplySuggestedIncrease: () => void;
    totalFixedCost: number;
}> = ({ settings, onChange, isOpen, onToggle, costIncreasePercentage, onApplySuggestedIncrease, totalFixedCost }) => {
    return (
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
            <button onClick={onToggle} className="w-full flex justify-between items-center p-6 text-left">
                <div>
                    <h2 className="text-2xl font-bold">Configurações Globais de Análise</h2>
                    {!isOpen && <p className="text-sm text-gray-500 mt-1">Custo Fixo: {formatCurrency(totalFixedCost)} | Dias Úteis: {settings.workDaysInMonth} | Comissão: {settings.defaultCommission}%</p>}
                </div>
                <ChevronDownIcon open={isOpen} />
            </button>
            {isOpen && (
                <div className="p-6 pt-0 animate-fade-in-down">
                    {costIncreasePercentage > 0 && (
                        <div className="p-4 mb-6 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                            <h4 className="font-bold">Aumento de Custo Detectado!</h4>
                            <p className="text-sm mt-1">
                                Seu custo fixo mensal aumentou em <strong>{costIncreasePercentage.toFixed(1)}%</strong>. Para manter sua lucratividade, recomendamos reajustar os preços na mesma proporção.
                            </p>
                            <Button onClick={onApplySuggestedIncrease} variant="primary" className="!bg-blue-500 hover:!bg-blue-600 mt-3 text-sm">
                                Reajustar Preços em {costIncreasePercentage.toFixed(1)}%
                            </Button>
                        </div>
                    )}
                    <div className="p-4 mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg">
                        <h4 className="font-bold">Custo Fixo Mensal Calculado</h4>
                        <p className="text-2xl font-bold">{formatCurrency(totalFixedCost)}</p>
                        <p className="text-xs mt-1">Este valor é calculado com base nos salários, aluguel, contas e outras despesas definidas na tela Financeira.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                Dias Úteis no Mês
                                <HelpTooltip text="Número médio de dias que o salão opera no mês. Usado para calcular o custo fixo por minuto." />
                            </label>
                            <input type="number" value={settings.workDaysInMonth} onChange={e => onChange('workDaysInMonth', e.target.value)} className="input-dark mt-1" />
                        </div>
                        <SliderInput label="Comissão Padrão (%)" description="Porcentagem padrão paga aos profissionais sobre o valor de cada serviço. Pode ser ajustada individualmente no cadastro do profissional." value={settings.defaultCommission} onChange={value => onChange('defaultCommission', String(value))} unit="%" />
                        <SliderInput label="Margem de Segurança (%)" description="Sua meta de lucro mínima a ser adicionada sobre o custo total de um serviço ou plano para calcular o preço de venda sugerido." value={settings.planSafetyMargin} onChange={value => onChange('planSafetyMargin', String(value))} unit="%" />
                    </div>
                </div>
            )}
        </div>
    );
};

const CostAnalysisScreen: React.FC = () => {
    const { 
        financialSettings, setFinancialSettings, 
        subscriptionPlans, setSubscriptionPlans,
        services, setServices,
        users
    } = useAppContext();

    const [draftSettings, setDraftSettings] = useState<FinancialSettings>(financialSettings);
    const [draftServices, setDraftServices] = useState<Service[]>(services);
    const [draftPlans, setDraftPlans] = useState<SubscriptionPlan[]>(subscriptionPlans);

    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'plans' | 'discounts' | 'services'>('services');
    const [recentlyUpdated, setRecentlyUpdated] = useState<{ type: 'service' | 'plan', id: number, status: 'neutral' | 'danger' } | null>(null);
    const [profitMarginAdjustment, setProfitMarginAdjustment] = useState(10);
    const [autoDePor, setAutoDePor] = useState(false);
    const [isAutoIncreaseEnabled, setIsAutoIncreaseEnabled] = useState(false);
    const [scheduledForUpdate, setScheduledForUpdate] = useState<number[]>([]);
    
    // For demo purposes, we can simulate it's the 25th of the month
    const IS_DAY_25_DEMO = true; 

    const calculateTotalFixedCost = useCallback((settings: FinancialSettings): number => {
        const employees = users.filter(u => ['super_admin', 'admin', 'professional'].includes(u.accessLevel));
        const totalSalaries = employees.reduce((sum, user) => {
            return sum + (settings.individualSalaries[user.id] ?? settings.salaryPerEmployee);
        }, 0) + settings.fixedCosts.proLabore;
        
        const totalPersonnelCost = totalSalaries * (1 + (settings.socialChargesPercentage / 100));
        
        const totalOtherFixedCosts = Object.entries(settings.fixedCosts)
            .filter(([key]) => key !== 'proLabore')
            .reduce((sum, [, value]) => sum + (value as number), 0);
            
        return totalPersonnelCost + totalOtherFixedCosts;
    }, [users]);

    const flashUpdate = (type: 'service' | 'plan', id: number, status: 'neutral' | 'danger' = 'neutral') => {
        setRecentlyUpdated({ type, id, status });
        setTimeout(() => setRecentlyUpdated(null), 1200);
    };

    useEffect(() => {
        const settingsChanged = JSON.stringify(draftSettings) !== JSON.stringify(financialSettings);
        const servicesChanged = JSON.stringify(draftServices) !== JSON.stringify(services);
        const plansChanged = JSON.stringify(draftPlans) !== JSON.stringify(subscriptionPlans);
        setHasChanges(settingsChanged || servicesChanged || plansChanged);
    }, [draftSettings, draftServices, draftPlans, financialSettings, services, subscriptionPlans]);

    useEffect(() => {
        if (autoDePor) {
            setDraftPlans(prevPlans => 
                prevPlans.map(plan => {
                    if (plan.price > 0) {
                        return { ...plan, originalPrice: roundUpTo990(plan.price * 1.20) };
                    }
                    return plan;
                })
            );
        }
    }, [autoDePor]); 

    const handleSettingChange = (field: keyof typeof draftSettings, value: string) => {
        const numValue = parseFloat(value);
        const finalValue = !isNaN(numValue) && numValue >= 0 ? numValue : 0;
        setDraftSettings(prev => ({ ...prev, [field]: finalValue }));
    };

    const handleServiceChange = (serviceId: number, field: 'productCost' | 'price', value: string) => {
        const numValue = parseFloat(value.replace('R$', '').replace(',', '.'));
        
        let newServices: Service[] = [];
        if (!isNaN(numValue) && numValue >= 0) {
            newServices = draftServices.map(s => s.id === serviceId ? { ...s, [field]: field === 'price' ? `R$ ${numValue.toFixed(2)}` : numValue } : s);
        } else if (value === '') {
            newServices = draftServices.map(s => s.id === serviceId ? { ...s, [field]: field === 'price' ? 'R$ 0.00' : 0 } : s);
        } else { return; }
        setDraftServices(newServices);
        
        const updatedService = newServices.find(s => s.id === serviceId);
        if(updatedService) {
            const totalFixedCost = calculateTotalFixedCost(draftSettings);
            const { workDaysInMonth, defaultCommission } = draftSettings;
            const costPerMinute = (totalFixedCost / (workDaysInMonth * 8 * 60)) || 0;
            const servicePrice = parseFloat(updatedService.price.replace('R$', '').replace(',', '.')) || 0;
            const totalOperationalCost = (updatedService.productCost || 0) + (servicePrice * (defaultCommission / 100)) + (costPerMinute * parseDurationToMinutes(updatedService.duration));
            const profit = servicePrice - totalOperationalCost;
            flashUpdate('service', serviceId, profit < 0 ? 'danger' : 'neutral');
        }
    };
    
    const handlePlanPriceChange = (planId: number, newPrice: string) => {
        const numPrice = parseFloat(newPrice);
        if (isNaN(numPrice) && newPrice !== '') return;
        
        const priceValue = isNaN(numPrice) ? 0 : numPrice;
    
        setDraftPlans(prev => prev.map(p => {
            if (p.id === planId) {
                const newPlan = { ...p, price: priceValue };
                if (autoDePor) { newPlan.originalPrice = roundUpTo990(priceValue * 1.20); }
                return newPlan;
            }
            return p;
        }));
        
        flashUpdate('plan', planId);
    };

    const handlePlanOriginalPriceChange = (planId: number, newOriginalPrice: string) => {
        const numPrice = parseFloat(newOriginalPrice);
        if (!isNaN(numPrice) && numPrice > 0) {
            setDraftPlans(prev => prev.map(p => p.id === planId ? { ...p, originalPrice: numPrice } : p));
        } else if (newOriginalPrice === '') {
             setDraftPlans(prev => prev.map(p => p.id === planId ? { ...p, originalPrice: undefined } : p));
        }
        flashUpdate('plan', planId);
    };

    const handleApplySuggestion = (planId: number, suggestedPrice: number) => {
        setDraftPlans(prev => prev.map(p => {
            if (p.id === planId) {
                const newPlan = { ...p, price: suggestedPrice };
                 if (isAutoIncreaseEnabled && IS_DAY_25_DEMO) {
                    alert(`Ajuste automático aplicado para o plano "${newPlan.name}". Notificação de reajuste enviada aos clientes.`);
                }
                return newPlan;
            }
            return p;
        }));
        flashUpdate('plan', planId);
    };
    
    const handleScheduleUpdate = (planId: number, planName: string) => {
        setScheduledForUpdate(prev => [...prev, planId]);
        alert(`Reajuste para o plano "${planName}" agendado para o dia 25! Clientes serão notificados na data.`);
    };

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setFinancialSettings(draftSettings);
            setServices(draftServices);
            setSubscriptionPlans(draftPlans);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };

    const handleRevert = () => {
        setDraftSettings(financialSettings);
        setDraftServices(services);
        setDraftPlans(subscriptionPlans);
    };
    
    const costIncreasePercentage = useMemo(() => {
        const originalCost = calculateTotalFixedCost(financialSettings);
        const draftCost = calculateTotalFixedCost(draftSettings);
        if (originalCost > 0 && draftCost > originalCost) {
            return ((draftCost - originalCost) / originalCost) * 100;
        }
        return 0;
    }, [draftSettings, financialSettings, calculateTotalFixedCost]);

    const handleApplySuggestedIncrease = useCallback(() => {
        if (costIncreasePercentage <= 0) return;
        const multiplier = 1 + (costIncreasePercentage / 100);
        const newServices = draftServices.map(s => ({ ...s, price: `R$ ${(parseFloat(s.price.replace('R$', '').replace(',', '.')) * multiplier).toFixed(2)}` }));
        const newPlans = draftPlans.map(p => ({ ...p, price: roundUpTo990(p.price * multiplier), originalPrice: p.originalPrice ? roundUpTo990(p.originalPrice * multiplier) : undefined }));
        setDraftServices(newServices);
        setDraftPlans(newPlans);
    }, [costIncreasePercentage, draftServices, draftPlans]);

    const analysisData = useMemo(() => {
        const totalFixedCost = calculateTotalFixedCost(draftSettings);
        const { workDaysInMonth, defaultCommission, planSafetyMargin, cardFeePercentage, taxOnServicesPercentage } = draftSettings;
        const costPerMinute = (totalFixedCost / (workDaysInMonth * 8 * 60)) || 0;
        const commissionRate = defaultCommission / 100;
        const cardFeeRate = cardFeePercentage / 100;
        const taxRate = taxOnServicesPercentage / 100;

        const servicesAnalysis = draftServices.map(service => {
            const servicePrice = parseFloat(service.price.replace('R$', '').replace(',', '.')) || 0;
            const serviceDuration = parseDurationToMinutes(service.duration);
            
            const variableCosts = (service.productCost || 0) + (servicePrice * commissionRate) + (servicePrice * cardFeeRate) + (servicePrice * taxRate);
            const contributionMargin = servicePrice - variableCosts;
            
            const proratedFixedCost = costPerMinute * serviceDuration;
            const totalOperationalCost = variableCosts + proratedFixedCost;
            
            const profit = servicePrice - totalOperationalCost;
            const vpm = serviceDuration > 0 ? profit / serviceDuration : 0;
            
            const suggestedPrice = totalOperationalCost * (1 + (planSafetyMargin / 100));

            return { ...service, variableCosts, contributionMargin, proratedFixedCost, totalOperationalCost, profit, vpm, suggestedPrice, isWarning: servicePrice < suggestedPrice && profit > 0, isDanger: profit <= 0 };
        });

        const plansAnalysis = draftPlans.map(plan => {
            let totalOperationalCost = 0;
            let totalDurationMinutes = 0;

            plan.includedServices.forEach(({ serviceId, quantity }) => {
                const service = servicesAnalysis.find(s => s.id === serviceId);
                if (!service) return;
                totalOperationalCost += service.totalOperationalCost * quantity;
                totalDurationMinutes += parseDurationToMinutes(service.duration) * quantity;
            });
            
            const costBasedSuggestedPrice = totalOperationalCost * (1 + (planSafetyMargin / 100));
            const finalSuggestedPrice = roundUpTo990(costBasedSuggestedPrice * (1 + ((plan.discountPercentage || 0) / 100)));

            const currentProfitOrLoss = plan.price - totalOperationalCost;
            const vpm = totalDurationMinutes > 0 ? currentProfitOrLoss / totalDurationMinutes : 0;
            
            let healthStatus: 'healthy' | 'warning' | 'danger' = 'healthy';
            if (currentProfitOrLoss < 0) healthStatus = 'danger';
            else if (plan.price < finalSuggestedPrice) healthStatus = 'warning';

            return { ...plan, totalOperationalCost, currentProfitOrLoss, suggestedMinimumPrice: finalSuggestedPrice, healthStatus, vpm };
        }).sort((a,b) => a.vpm - b.vpm);
        
        const plansDiscountAnalysis = draftPlans.map(plan => {
            const valorAvulso = plan.includedServices.reduce((sum, item) => sum + (parseFloat(draftServices.find(s => s.id === item.serviceId)?.price.replace('R$', '').replace(',', '.') || '0') * item.quantity), 0);
            const originalPlanAnalysis = plansAnalysis.find(p => p.id === plan.id);
            return { ...plan, valorAvulso, economia: valorAvulso - plan.price, descontoReal: valorAvulso > 0 ? ((valorAvulso - plan.price) / valorAvulso) * 100 : 0, ...originalPlanAnalysis };
        }).sort((a,b) => b.descontoReal - a.descontoReal);

        return { servicesAnalysis, plansAnalysis, plansDiscountAnalysis };
    }, [draftPlans, draftServices, draftSettings, calculateTotalFixedCost, users]);
    
    const handleApplyProfitabilityAdjustment = () => {
        setDraftPlans(prevPlans => prevPlans.map(plan => {
            const analysis = analysisData.plansDiscountAnalysis.find(p => p.id === plan.id);
            if (analysis && analysis.currentProfitOrLoss < 0) {
                const newPrice = roundUpTo990(analysis.suggestedMinimumPrice * (1 + profitMarginAdjustment / 100));
                flashUpdate('plan', plan.id);
                return { ...plan, price: newPrice };
            }
            return plan;
        }));
    };
    
    const statusConfig = {
        healthy: { text: "Lucrativo", icon: <CheckCircleIcon className="text-green-500"/>, color: "#10B981", bgColor: "bg-green-50", borderColor: "border-green-500", textColor: "text-green-700" },
        warning: { text: "Alerta de Margem", icon: <AlertIcon className="text-yellow-500"/>, color: "#F59E0B", bgColor: "bg-yellow-50", borderColor: "border-yellow-500", textColor: "text-yellow-800" },
        danger: { text: "Prejuízo", icon: <AlertIcon className="text-red-500"/>, color: "#EF4444", bgColor: "bg-red-50", borderColor: "border-red-500", textColor: "text-red-800" }
    };

    const getProfitColor = (profit: number) => {
        if (profit < 0) return 'text-red-600'; if (profit < 5) return 'text-yellow-600'; return 'text-green-600';
    };

    const getFlashClass = (type: 'service' | 'plan', id: number) => {
        if (recentlyUpdated?.type === type && recentlyUpdated.id === id) {
            return recentlyUpdated.status === 'danger' ? 'animate-flash-bg-danger' : 'animate-flash-bg-neutral';
        } return '';
    };

    return (
        <div className="space-y-8 pb-24">
            <style>{`.animate-flash-bg-neutral { animation: flash-bg-neutral 1.2s ease-out; } @keyframes flash-bg-neutral { 0% { background-color: #FEF3C7; } 100% { background-color: transparent; } } .animate-flash-bg-danger { animation: flash-bg-danger 1.2s ease-out; } @keyframes flash-bg-danger { 0% { background-color: #FEE2E2; } 100% { background-color: transparent; } } .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
            <GlobalSettingsAccordion
                settings={draftSettings}
                onChange={handleSettingChange}
                isOpen={isAccordionOpen}
                onToggle={() => setIsAccordionOpen(p => !p)}
                costIncreasePercentage={costIncreasePercentage}
                onApplySuggestedIncrease={handleApplySuggestedIncrease}
                totalFixedCost={calculateTotalFixedCost(draftSettings)}
            />
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="sm:border-b border-gray-200 mb-4">
                    <div className="flex flex-col sm:flex-row -mx-6 sm:mx-0 px-6 sm:px-0">
                        <button onClick={() => setActiveTab('services')} className={`px-4 py-3 font-semibold text-center w-full sm:w-auto sm:whitespace-nowrap transition-colors duration-200 ${activeTab === 'services' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:bg-gray-100 border-b-2 border-gray-200 sm:border-transparent'}`}>Análise de Serviços</button>
                        <button onClick={() => setActiveTab('plans')} className={`px-4 py-3 font-semibold text-center w-full sm:w-auto sm:whitespace-nowrap transition-colors duration-200 ${activeTab === 'plans' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:bg-gray-100 border-b-2 border-gray-200 sm:border-transparent'}`}>Análise de Planos (Rentabilidade)</button>
                        <button onClick={() => setActiveTab('discounts')} className={`px-4 py-3 font-semibold text-center w-full sm:w-auto sm:whitespace-nowrap transition-colors duration-200 ${activeTab === 'discounts' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:bg-gray-100 border-b-2 border-gray-200 sm:border-transparent'}`}>Análise de Planos (Descontos)</button>
                    </div>
                </div>

                {activeTab === 'plans' && (
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-gray-50 border space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">Aumento Automático de Preços de Planos<HelpTooltip text="Quando ativo, o sistema aplicará automaticamente o 'Preço Sugerido' a todos os planos não lucrativos no dia 25 de cada mês e simulará uma notificação aos clientes. Se desativado, um alerta será exibido para que você acione o reajuste manualmente."/></h3>
                                <ToggleSwitch enabled={isAutoIncreaseEnabled} setEnabled={setIsAutoIncreaseEnabled} />
                            </div>
                        </div>
                        {analysisData.plansAnalysis.map(plan => {
                            const config = statusConfig[plan.healthStatus];
                            const isScheduled = scheduledForUpdate.includes(plan.id);
                            return (
                                <div key={plan.id} className={`p-6 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} ${getFlashClass('plan', plan.id)}`}>
                                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4"><h3 className="text-xl font-bold text-gray-900">{plan.name}</h3><div className={`mt-1 px-3 py-1 text-sm font-bold rounded-full border ${config.borderColor} ${config.textColor} flex items-center gap-2 w-fit`}>{config.icon} {config.text}</div></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                                        <div><label className="text-sm text-gray-500 flex items-center justify-center gap-1">Preço Atual <HelpTooltip text="O preço de venda atual do plano."/></label><input type="number" step="1" value={plan.price} onChange={e => handlePlanPriceChange(plan.id, e.target.value)} className="w-full input-dark mt-1 text-2xl font-bold text-center !py-1"/></div>
                                        <div className="bg-white p-3 rounded-md shadow-sm border"><p className="text-sm text-gray-500 flex items-center justify-center gap-1">Custo Operacional <HelpTooltip text="A soma de todos os custos para oferecer os serviços do plano." /></p><p className="text-2xl font-bold text-gray-800">{formatCurrency(plan.totalOperationalCost)}</p></div>
                                        <div className="bg-white p-3 rounded-md shadow-sm border"><p className="text-sm text-gray-500 flex items-center justify-center gap-1">Lucro / Prejuízo <HelpTooltip text="A diferença entre o Preço Atual e o Custo Operacional." /></p><p className={`text-2xl font-bold ${plan.currentProfitOrLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(plan.currentProfitOrLoss)}</p></div>
                                        <div className={`p-3 rounded-md shadow-sm border-2 bg-green-50 border-green-200`}>
                                            <p className="text-sm text-green-800 font-semibold flex items-center justify-center gap-1">Preço Sugerido <HelpTooltip text={`O preço mínimo recomendado, calculado para cobrir custos, absorver descontos e garantir sua margem de lucro de ${draftSettings.planSafetyMargin}%.`} /></p>
                                            <div className="flex items-center justify-center gap-2 mt-1">
                                                <p className="text-2xl font-bold text-green-700">{formatCurrency(plan.suggestedMinimumPrice)}</p>
                                                <Button variant="light-success" className="!px-2 !py-1 !text-xs" onClick={() => handleApplySuggestion(plan.id, plan.suggestedMinimumPrice)}>Aplicar</Button>
                                            </div>
                                        </div>
                                    </div>
                                    {plan.healthStatus !== 'healthy' && (
                                        <div className="mt-4 p-3 rounded-md bg-white border border-gray-200">
                                            {isAutoIncreaseEnabled && IS_DAY_25_DEMO ? (
                                                <div className="flex items-center justify-between"><p className="text-sm font-semibold text-blue-800">Ajuste automático será aplicado hoje.</p><Button variant="primary" className="!bg-blue-500 hover:!bg-blue-600 !text-xs" onClick={() => handleApplySuggestion(plan.id, plan.suggestedMinimumPrice)}>Aplicar Agora</Button></div>
                                            ) : !isAutoIncreaseEnabled ? (
                                                isScheduled ? (<p className="text-sm font-semibold text-green-700 text-center">✓ Reajuste agendado para o dia 25.</p>) : (<Button onClick={() => handleScheduleUpdate(plan.id, plan.name)} fullWidth variant="warning" className="animate-pulse">ALERTA URGENTE: Reajuste Necessário. Agendar para o dia 25?</Button>)
                                            ) : (<p className={`text-sm font-semibold ${config.textColor}`}>Aguardando dia 25 para o ajuste automático.</p>)}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                {activeTab === 'discounts' && ( <div className="space-y-6">{analysisData.plansDiscountAnalysis.map(plan => { const config = statusConfig[plan.healthStatus]; const promotionalDiscount = plan.originalPrice && plan.originalPrice > plan.price ? ((plan.originalPrice - plan.price) / plan.price) * 100 : 0; return ( <div key={plan.id} className={`p-6 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} ${getFlashClass('plan', plan.id)}`}><div className="flex flex-col md:flex-row justify-between md:items-start mb-4"><div><h3 className="text-xl font-bold text-gray-900">{plan.name}</h3><div className={`mt-1 px-3 py-1 text-sm font-bold rounded-full border ${config.borderColor} ${config.textColor} flex items-center gap-2 w-fit`}>{config.icon} {config.text}</div></div></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center"><div className="bg-white p-3 rounded-md shadow-sm border"><p className="text-sm text-gray-500 flex items-center justify-center gap-1">Valor Avulso <HelpTooltip text="Soma dos preços de todos os serviços incluídos no plano, como se fossem comprados separadamente." /></p><p className="text-2xl font-bold text-gray-800">{formatCurrency(plan.valorAvulso)}</p></div><div><label className="text-sm text-gray-500 flex items-center justify-center gap-1">Preço Original ('De') <HelpTooltip text="Defina um preço 'de/por' para criar uma percepção de desconto para o cliente."/></label><input type="number" placeholder="Ex: 149" value={plan.originalPrice || ''} onChange={e => handlePlanOriginalPriceChange(plan.id, e.target.value)} className="w-full input-dark mt-1 text-xl font-bold text-center !py-1" disabled={autoDePor} /></div><div><label className="text-sm text-gray-500 flex items-center justify-center gap-1">Preço do Plano ('Por') <HelpTooltip text="O valor mensal que o cliente paga pelo plano. Você pode ajustar este valor aqui."/></label>{promotionalDiscount > 0 ? <p className="text-xs text-gray-500 line-through h-4">De: {formatCurrency(plan.originalPrice!)}</p> : <div className="h-4"></div>}<input type="number" step="1" value={plan.price} onChange={e => handlePlanPriceChange(plan.id, e.target.value)} className="w-full input-dark mt-1 text-xl font-bold text-center !py-1"/></div><div className="bg-white p-3 rounded-md shadow-sm border"><p className="text-sm text-gray-500 flex items-center justify-center gap-1">Desconto Real (%) <HelpTooltip text="A economia real em termos percentuais. Útil para entender o quão atrativo o plano é para o cliente." /></p><p className={`text-2xl font-bold ${plan.descontoReal >= 25 ? 'text-green-600' : plan.descontoReal > 0 ? 'text-yellow-600' : 'text-red-600'}`}>{plan.descontoReal.toFixed(1)}%</p></div></div><div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="sm:col-span-1 bg-white p-3 rounded-md shadow-sm border text-center"><p className="text-sm text-gray-500 flex items-center justify-center gap-1">Economia Real (R$) <HelpTooltip text="A diferença entre o 'Valor Avulso' e o 'Preço do Plano'. Mostra quanto o cliente economiza em dinheiro de verdade." /></p><p className={`text-xl font-bold ${plan.economia >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(plan.economia)}</p></div><div className={`sm:col-span-2 p-3 rounded-md flex items-center justify-center ${promotionalDiscount > 0 ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-100 border'}`}><div className="text-sm text-center text-gray-600 flex items-center justify-center gap-1">{promotionalDiscount > 0 ? <>Desconto <strong>promocional</strong> percebido: <strong className="text-yellow-800 text-lg">{promotionalDiscount.toFixed(1)}%</strong></> : "Nenhuma promoção 'De/Por' ativa."}<HelpTooltip text="Este é o desconto que o cliente percebe ao ver o preço 'de/por'. É diferente do 'Desconto Real' (baseado no valor avulso dos serviços)." /></div></div></div>
                    <div className={`mt-4 p-3 rounded-md shadow-sm border-2 bg-green-50 border-green-200`}>
                        <div className="text-sm text-green-800 font-semibold flex items-center justify-center gap-1">
                            Preço Sugerido para Lucratividade
                            <HelpTooltip text={`O preço mínimo recomendado para este plano, para cobrir todos os custos e garantir sua margem de segurança de ${draftSettings.planSafetyMargin}%.`} />
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <p className="text-2xl font-bold text-green-700">{formatCurrency(plan.suggestedMinimumPrice)}</p>
                            <Button variant="light-success" className="!px-2 !py-1 !text-xs" onClick={() => handleApplySuggestion(plan.id, plan.suggestedMinimumPrice)}>Aplicar Sugestão</Button>
                        </div>
                    </div>
                </div>)})}</div>)}
                {activeTab === 'services' && (
                    <div>
                        {/* Desktop Table View */}
                        <div className="overflow-x-auto hidden lg:block">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Serviço</th>
                                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Preço Venda</th>
                                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                            <div className="flex items-center justify-end gap-1">
                                                <span>Custos Variáveis</span>
                                                <HelpTooltip text="Custo de produto + comissão + taxas. O valor detalhado é mostrado ao passar o mouse sobre o ícone de ajuda na linha de cada serviço." />
                                            </div>
                                        </th>
                                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Margem Contrib.</th>
                                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Custo Fixo Rateado</th>
                                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Lucro Líquido</th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                                            <div className="flex items-center justify-center gap-1">
                                                <span>Alerta</span>
                                                <HelpTooltip text="Indica se o preço de venda está abaixo do sugerido para garantir a lucratividade." />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {analysisData.servicesAnalysis.map(service => (
                                        <tr key={service.id} className={getFlashClass('service', service.id)}>
                                            <td className="px-3 py-2 font-medium text-gray-800">{service.name}</td>
                                            <td className="px-3 py-2 w-40"><input type="number" step="0.5" value={parseFloat(service.price.replace('R$ ', ''))} onChange={e => handleServiceChange(service.id, 'price', e.target.value)} className="input-dark text-right"/></td>
                                            <td className="px-3 py-2 text-right text-sm text-gray-600">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span>{formatCurrency(service.variableCosts)}</span>
                                                    <HelpTooltip text={`Produto: ${formatCurrency(service.productCost)} | Comissão: ${formatCurrency(parseFloat(service.price.replace('R$ ', ''))*(draftSettings.defaultCommission/100))} | Taxas: ${formatCurrency(parseFloat(service.price.replace('R$ ', '')) * (draftSettings.cardFeePercentage/100) + parseFloat(service.price.replace('R$ ', '')) * (draftSettings.taxOnServicesPercentage/100))}`} />
                                                </div>
                                            </td>
                                            <td className={`px-3 py-2 text-right text-sm font-bold ${getProfitColor(service.contributionMargin)}`}>{formatCurrency(service.contributionMargin)}</td>
                                            <td className="px-3 py-2 text-right text-sm text-gray-600">{formatCurrency(service.proratedFixedCost)}</td>
                                            <td className={`px-3 py-2 text-right text-sm font-bold ${getProfitColor(service.profit)}`}>{formatCurrency(service.profit)}</td>
                                            <td className="px-3 py-2 text-center">
                                                {(service.isWarning || service.isDanger) && 
                                                    <div className="flex items-center justify-center gap-1">
                                                        <AlertIcon className={service.isDanger ? 'text-red-500' : 'text-yellow-500'} />
                                                        <HelpTooltip text={`Preço sugerido: ${formatCurrency(service.suggestedPrice)}`} />
                                                    </div>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile/Tablet Card View */}
                        <div className="space-y-4 lg:hidden">
                            {analysisData.servicesAnalysis.map(service => (
                                <div key={service.id} className={`p-4 rounded-lg border ${getFlashClass('service', service.id)} ${service.isDanger ? 'bg-red-50 border-red-200' : service.isWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-gray-800 flex-grow pr-2">{service.name}</h4>
                                        {(service.isWarning || service.isDanger) && <HelpTooltip text={`Preço sugerido: ${formatCurrency(service.suggestedPrice)}`}><AlertIcon className={service.isDanger ? 'text-red-500' : 'text-yellow-500'} /></HelpTooltip>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-medium text-gray-600">Preço Venda</label><input type="number" step="0.5" value={parseFloat(service.price.replace('R$ ', ''))} onChange={e => handleServiceChange(service.id, 'price', e.target.value)} className="input-dark text-right w-full mt-1"/></div>
                                        <div className="bg-white p-2 rounded-md border"><p className="text-xs text-gray-500">Lucro Líquido</p><p className={`font-bold text-sm ${getProfitColor(service.profit)}`}>{formatCurrency(service.profit)}</p></div>
                                        <div className="bg-white p-2 rounded-md border"><p className="text-xs text-gray-500">Custos Variáveis</p><p className="font-semibold text-sm text-gray-700">{formatCurrency(service.variableCosts)}</p></div>
                                        <div className="bg-white p-2 rounded-md border"><p className="text-xs text-gray-500">Margem Contrib.</p><p className={`font-semibold text-sm ${getProfitColor(service.contributionMargin)}`}>{formatCurrency(service.contributionMargin)}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {hasChanges && (
                <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
                    <div className="bg-brand-dark text-white rounded-xl shadow-2xl p-3 flex items-center gap-3">
                        <button onClick={handleRevert} className="font-semibold hover:underline text-sm px-2">Reverter</button>
                        <Button onClick={handleSave} isLoading={saveStatus === 'saving'} disabled={saveStatus === 'saving'} variant="primary" className="!py-2 !px-3 !text-sm">
                            {saveStatus === 'saved' ? '✓ Salvo' : 'Salvar'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CostAnalysisScreen;
