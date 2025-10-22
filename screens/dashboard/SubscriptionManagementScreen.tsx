import React, { useState, useEffect, useMemo } from 'react';
import type { SubscriptionPlan, Service } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { formatCurrency } from '../../utils/formatters';

// --- ICONS ---
const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>;
const PencilIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-blue-500'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

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

// --- MODAL COMPONENTS ---
const PlanModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<SubscriptionPlan, 'id' | 'features'> & { id?: number }) => void;
  planToEdit: SubscriptionPlan | null;
}> = ({ isOpen, onClose, onSave, planToEdit }) => {
    const { services, financialSettings, users } = useAppContext();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [period, setPeriod] = useState<'mês' | 'ano'>('mês');
    const [includedServices, setIncludedServices] = useState<{ serviceId: number, quantity: number }[]>([]);
    const [isPopular, setIsPopular] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(planToEdit?.name || '');
            setPrice(String(planToEdit?.price || ''));
            setPeriod(planToEdit?.period || 'mês');
            setIncludedServices(planToEdit?.includedServices || []);
            setIsPopular(planToEdit?.isPopular || false);
            setDiscountPercentage(String(planToEdit?.discountPercentage || '0'));
        }
    }, [planToEdit, isOpen]);
    
    const { totalOperationalCost, suggestedMinimumPrice } = useMemo(() => {
        if (!services || services.length === 0) return { totalOperationalCost: 0, suggestedMinimumPrice: 0 };
    
        const { workDaysInMonth, defaultCommission, planSafetyMargin, salaryPerEmployee, individualSalaries, socialChargesPercentage, fixedCosts } = financialSettings;
    
        const employees = users.filter(u => ['super_admin', 'admin', 'professional'].includes(u.accessLevel));
    
        const totalSalaries = employees.reduce((sum, user) => {
            return sum + (individualSalaries[user.id] ?? salaryPerEmployee);
        }, 0) + fixedCosts.proLabore;
        
        const totalPersonnelCost = totalSalaries * (1 + (socialChargesPercentage / 100));
        
        const totalOtherFixedCosts = Object.entries(fixedCosts)
            .filter(([key]) => key !== 'proLabore')
            .reduce((sum, [, value]) => sum + (value as number), 0);
            
        const totalFixedCost = totalPersonnelCost + totalOtherFixedCosts;
        const totalWorkHoursInMonth = (workDaysInMonth * 8) || 1; // Assume 8 hours/day
        const costPerMinute = (totalFixedCost / totalWorkHoursInMonth) / 60;
    
        let totalCost = 0;
        
        includedServices.forEach(({ serviceId, quantity }) => {
            const service = services.find(s => s.id === serviceId);
            if (!service) return;

            const servicePrice = parseFloat(service.price.replace('R$', '').replace(',', '.')) || 0;
            const serviceDuration = parseDurationToMinutes(service.duration);
            
            const productCost = service.productCost * quantity;
            const commissionCost = (servicePrice * (defaultCommission / 100)) * quantity;
            const fixedCostProrated = (costPerMinute * serviceDuration) * quantity;
            
            totalCost += productCost + commissionCost + fixedCostProrated;
        });
        
        const suggestedPrice = totalCost * (1 + (planSafetyMargin / 100));

        return { totalOperationalCost: totalCost, suggestedMinimumPrice: suggestedPrice };
    }, [includedServices, services, financialSettings, users]);


    if (!isOpen) return null;

    const handleServiceQuantityChange = (serviceId: number, quantity: number) => {
        const existing = includedServices.find(s => s.serviceId === serviceId);
        if (quantity <= 0) {
            setIncludedServices(prev => prev.filter(s => s.serviceId !== serviceId));
        } else if (existing) {
            setIncludedServices(prev => prev.map(s => s.serviceId === serviceId ? { ...s, quantity } : s));
        } else {
            setIncludedServices(prev => [...prev, { serviceId, quantity }]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: planToEdit?.id,
            name,
            price: parseFloat(price) || 0,
            period,
            includedServices,
            isPopular,
            discountPercentage: parseFloat(discountPercentage) || 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b"><h3 className="font-bold text-lg">{planToEdit ? 'Editar' : 'Adicionar'} Plano</h3></header>
                <form onSubmit={handleSubmit}>
                    <main className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Nome do Plano *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-dark" /></div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Serviços Inclusos no Plano</label>
                            <div className="p-3 bg-gray-50 border rounded-lg max-h-48 overflow-y-auto space-y-2">
                                {services.map(service => (
                                    <div key={service.id} className="grid grid-cols-[1fr_80px] gap-2 items-center">
                                        <label htmlFor={`service-${service.id}`} className="text-sm">{service.name}</label>
                                        <input
                                            id={`service-${service.id}`}
                                            type="number"
                                            min="0"
                                            value={includedServices.find(s => s.serviceId === service.id)?.quantity || 0}
                                            onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value, 10) || 0)}
                                            className="input-dark text-center"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                         <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                             <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-blue-800">Custo Operacional Estimado:</span>
                                <span className="font-bold text-blue-900">{formatCurrency(totalOperationalCost)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-blue-800">Preço Mínimo Sugerido (com margem):</span>
                                <span className="font-bold text-blue-900">{formatCurrency(suggestedMinimumPrice)}</span>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1">Preço do Plano (R$) *</label><input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="input-dark" /></div>
                            <div><label className="block text-sm font-medium mb-1">Período *</label><select value={period} onChange={e => setPeriod(e.target.value as any)} className="select-dark"><option value="mês">Mensal</option><option value="ano">Anual</option></select></div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Desconto em Outros Serviços (%)</label>
                            <input
                                type="number"
                                value={discountPercentage}
                                onChange={e => setDiscountPercentage(e.target.value)}
                                placeholder="Ex: 10"
                                className="input-dark w-full"
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                           <ToggleSwitch enabled={isPopular} setEnabled={setIsPopular} />
                           <label className="font-medium text-gray-800">Marcar como "Mais Popular"</label>
                        </div>
                    </main>
                    <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar Plano</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; planName: string; }> = ({ isOpen, onClose, onConfirm, planName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="font-bold text-lg">Confirmar Exclusão</h3>
                    <p className="mt-2 text-gray-600">
                        Você tem certeza que deseja excluir o plano <strong>{planName}</strong>? Esta ação é irreversível.
                    </p>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-danger">Excluir</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const SubscriptionManagementScreen: React.FC = () => {
    const { services, subscriptionPlans, setSubscriptionPlans } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<SubscriptionPlan | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

    const handleOpenEditModal = (plan: SubscriptionPlan) => {
        setPlanToEdit(plan);
        setIsModalOpen(true);
    };
    
    const handleOpenAddModal = () => {
        setPlanToEdit(null);
        setIsModalOpen(true);
    };
    
    const handleSavePlan = (planData: Omit<SubscriptionPlan, 'id' | 'features'> & { id?: number }) => {
        setSubscriptionPlans(prev => {
            const getFeaturesFromIncluded = (included: { serviceId: number, quantity: number }[], discount?: number): string[] => {
                const features: string[] = included.map(({serviceId, quantity}) => {
                    const service = services.find(s => s.id === serviceId);
                    return `${quantity} ${service?.name || 'Serviço Removido'}(s) por mês`;
                });

                if (discount && discount > 0) {
                    features.push(`${discount}% de desconto em outros serviços`);
                }

                return features;
            };

            if (planData.id) {
                return prev.map(p => p.id === planData.id ? { ...p, ...planData, features: getFeaturesFromIncluded(planData.includedServices, planData.discountPercentage) } as SubscriptionPlan : p);
            }
            const newPlan: SubscriptionPlan = { ...planData, id: Date.now(), features: getFeaturesFromIncluded(planData.includedServices, planData.discountPercentage) };
            return [...prev, newPlan];
        });
    };
    
    const handleDelete = () => {
        if (planToDelete) {
            setSubscriptionPlans(prev => prev.filter(p => p.id !== planToDelete.id));
        }
        setIsConfirmOpen(false);
        setPlanToDelete(null);
    };

    const handleOpenConfirmModal = (plan: SubscriptionPlan) => {
        setPlanToDelete(plan);
        setIsConfirmOpen(true);
    };

    return (
        <div className="space-y-6">
            <PlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSavePlan} planToEdit={planToEdit} />
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} planName={planToDelete?.name || ''} />
            
            <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                     <div>
                        <h2 className="text-xl font-bold">Gerenciamento de Planos</h2>
                        <p className="text-gray-600">Crie, edite ou remova os planos de assinatura para seus clientes.</p>
                    </div>
                    <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2 self-start md:self-center">
                        <PlusCircleIcon className="w-5 h-5 text-white" />
                        Adicionar Plano
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptionPlans.map(plan => (
                        <div key={plan.id} className={`p-6 bg-gray-50 rounded-lg border-2 flex flex-col ${plan.isPopular ? 'border-brand-primary' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-brand-dark">{plan.name}</h3>
                                {plan.isPopular && <span className="text-xs font-bold bg-brand-primary text-white px-2 py-1 rounded-full">POPULAR</span>}
                            </div>
                            <p className="font-bold text-2xl text-brand-primary my-2">{formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-500">/{plan.period}</span></p>
                            <ul className="space-y-2 text-sm text-gray-700 mt-4 border-t pt-4 flex-grow">
                                {plan.includedServices.map(({serviceId, quantity}) => {
                                    const service = services.find(s => s.id === serviceId);
                                    return (
                                        <li key={serviceId} className="flex items-start gap-2"><CheckIcon/><span>{quantity}x {service?.name || 'Serviço Indisponível'}</span></li>
                                    )
                                })}
                                {plan.discountPercentage && plan.discountPercentage > 0 && (
                                    <li className="flex items-start gap-2"><CheckIcon/><span>{plan.discountPercentage}% de desconto em outros serviços</span></li>
                                )}
                            </ul>
                            <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                                <button onClick={() => handleOpenEditModal(plan)} className="p-2 hover:bg-gray-200 rounded-full" title="Editar"><PencilIcon /></button>
                                <button onClick={() => handleOpenConfirmModal(plan)} className="p-2 hover:bg-gray-200 rounded-full" title="Excluir"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                     {subscriptionPlans.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                            <p>Nenhum plano de assinatura cadastrado.</p>
                            <p>Clique em "Adicionar Plano" para começar.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManagementScreen;
