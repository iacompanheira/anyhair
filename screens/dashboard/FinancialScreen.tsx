import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, PieChart, Pie, Cell, LabelList, BarChart } from 'recharts';
import type { Transaction, FullAppointment, FinancialSettings, FixedCosts, UnifiedUser, Service, Material, ServiceRecipe, ServiceRecipeMaterial } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import * as api from '../../api';
import { ReportToolbar } from '../../components/dashboard/ReportToolbar';
import type { PeriodSelection } from '../../components/dashboard/PeriodSelector';
import { getQuickPeriodDates } from '../../components/dashboard/PeriodSelector';
import { useAppContext } from '../../contexts/AppContext';
import { HelpTooltip } from '../../components/ui/HelpTooltip';
import { Button } from '../../components/ui/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';

// --- ICONS ---
const AlertIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.85-1.21 3.486 0l5.58 10.622c.636 1.21-.462 2.779-1.743 2.779H4.42c-1.281 0-2.379-1.569-1.743-2.779L8.257 3.099zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const PlusCircleIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>;
const PencilIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-blue-500'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const CalendarIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SpinnerIcon: React.FC<{className?: string}> = ({className}) => <svg className={`animate-spin ${className ?? ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const ChevronDownIcon: React.FC<{ open: boolean }> = ({ open }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
const UpArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
const DownArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;
const ImageUploadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const LinkIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const TrashIconForImage: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ComboIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;


const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b"><h3 className="font-bold text-lg">{title}</h3></header>
                <main className="p-5 text-gray-600">{children}</main>
                <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-danger">Excluir</button>
                </footer>
            </div>
        </div>
    );
};

const PIE_CHART_COLORS = ['#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6'];

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

const unitOptions = ['Unidades', 'Kg', 'g', 'mg', 'L', 'dL', 'mL'];
const parseDurationToMinutes = (duration: string): number => {
    if (!duration || typeof duration !== 'string') return 0;
    const parts = duration.split(' ');
    if (parts.length < 1) return 0;
    const value = parseInt(parts[0], 10);
    if (isNaN(value)) return 0;
    if (parts.length > 1 && parts[1].toLowerCase().startsWith('h')) {
        return value * 60;
    }
    return value;
};
const calculateTotalFixedCost = (settings: FinancialSettings, usersList: UnifiedUser[]): number => {
    const employees = usersList.filter(u => ['super_admin', 'admin', 'professional'].includes(u.accessLevel));
    const totalSalaries = employees.reduce((sum, user) => {
        return sum + (settings.individualSalaries[user.id] ?? settings.salaryPerEmployee);
    }, 0) + settings.fixedCosts.proLabore;
    const totalPersonnelCost = totalSalaries * (1 + (settings.socialChargesPercentage / 100));
    const totalOtherFixedCosts = Object.entries(settings.fixedCosts)
        .filter(([key]) => key !== 'proLabore')
        .reduce((sum, [, value]) => sum + (value as number), 0);
    return totalPersonnelCost + totalOtherFixedCosts;
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ServiceCostCalculatorPanel: React.FC<{ allAppointments: FullAppointment[] }> = ({ allAppointments }) => {
    const { serviceRecipes, setServiceRecipes } = useAppContext();
    const [view, setView] = useState<'list' | 'form'>('list');
    const [currentRecipe, setCurrentRecipe] = useState<ServiceRecipe | null>(null);
    const [isMaterialModalOpen, setMaterialModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const handleNewRecipe = () => {
        setCurrentRecipe({
            id: Date.now(),
            name: '',
            materials: [],
            yields: 1,
            additionalCostsPercentage: 10,
            safetyMarginPercentage: 5,
            desiredProfitMargin: 50, // Default to a valid margin
            notes: '',
            durationInMinutes: 0,
        });
        setView('form');
    };

    const handleEditRecipe = (recipe: ServiceRecipe) => {
        setCurrentRecipe(recipe);
        setView('form');
    };

    const handleDeleteRecipe = (recipe: ServiceRecipe) => {
        setCurrentRecipe(recipe);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (!currentRecipe) return;
        setServiceRecipes(prev => prev.filter(r => r.id !== currentRecipe.id));
        setConfirmDeleteOpen(false);
        setCurrentRecipe(null);
    };

    const handleSave = (recipeToSave: ServiceRecipe) => {
        setServiceRecipes(prev => {
            const exists = prev.some(r => r.id === recipeToSave.id);
            if (exists) {
                return prev.map(r => r.id === recipeToSave.id ? recipeToSave : r);
            }
            return [...prev, recipeToSave];
        });
        setView('list');
        setCurrentRecipe(null);
    };
    
    return (
        <div className="space-y-6">
            {isConfirmDeleteOpen && currentRecipe && (
                <ConfirmationModal 
                    isOpen={isConfirmDeleteOpen} 
                    onClose={() => setConfirmDeleteOpen(false)} 
                    onConfirm={confirmDelete}
                    title="Confirmar Exclusão"
                >
                    <p>Deseja excluir a receita <strong>{currentRecipe.name}</strong>? Esta ação é irreversível.</p>
                </ConfirmationModal>
            )}

            {isMaterialModalOpen && currentRecipe && (
                <MaterialSelectionModal
                    onClose={() => setMaterialModalOpen(false)}
                    currentMaterials={currentRecipe.materials}
                    onSave={(newMaterials) => {
                        setCurrentRecipe(prev => prev ? { ...prev, materials: newMaterials } : null);
                        setMaterialModalOpen(false);
                    }}
                />
            )}
            
            {view === 'list' ? (
                <div className="bg-white p-6 rounded-xl shadow-md border">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Calculadora de Custo de Serviço</h3>
                        <button onClick={handleNewRecipe} className="btn-primary flex items-center gap-2">
                            <PlusCircleIcon className="w-5 h-5 text-white" />
                            Nova Receita de Serviço
                        </button>
                    </div>
                    {serviceRecipes.length > 0 ? (
                        <div className="space-y-3">
                            {serviceRecipes.map(recipe => (
                                <div key={recipe.id} className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                                    <p className="font-bold text-gray-800">{recipe.name}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditRecipe(recipe)} className="btn-secondary">Editar</button>
                                        <button onClick={() => handleDeleteRecipe(recipe)} className="btn-danger">Apagar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 italic py-8">Nenhuma receita de serviço cadastrada.</p>
                    )}
                </div>
            ) : currentRecipe && (
                <ServiceCostCalculator 
                    recipe={currentRecipe}
                    onSave={handleSave}
                    onCancel={() => setView('list')}
                    onOpenMaterialModal={() => setMaterialModalOpen(true)}
                    onRecipeChange={setCurrentRecipe}
                    allAppointments={allAppointments}
                />
            )}
        </div>
    );
};

interface MaterialSelectionModalProps {
    onClose: () => void;
    currentMaterials: ServiceRecipeMaterial[];
    onSave: (newMaterials: ServiceRecipeMaterial[]) => void;
}
const MaterialSelectionModal: React.FC<MaterialSelectionModalProps> = ({ onClose, currentMaterials, onSave }) => {
    const { materials } = useAppContext();
    const [draftMaterials, setDraftMaterials] = useState<ServiceRecipeMaterial[]>(() => JSON.parse(JSON.stringify(currentMaterials)));
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMaterials = useMemo(() => {
        if (!searchTerm) return materials;
        return materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [materials, searchTerm]);


    const handleQuantityChange = (materialId: number, quantityStr: string) => {
        const quantity = parseFloat(quantityStr);
        const existing = draftMaterials.find(m => m.materialId === materialId);
        
        if (!isNaN(quantity) && quantity > 0) {
            if (existing) {
                setDraftMaterials(prev => prev.map(m => m.materialId === materialId ? { ...m, quantity } : m));
            } else {
                setDraftMaterials(prev => [...prev, { materialId, quantity }]);
            }
        } else {
            setDraftMaterials(prev => prev.filter(m => m.materialId !== materialId));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[70] p-4" onClick={onClose}>
            <div className="bg-brand-dark text-white w-full max-w-lg rounded-xl shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b border-b-gray-700">
                    <h3 className="font-bold text-lg">Adicionar Materiais e Quantidades</h3>
                    <input 
                        type="text" 
                        placeholder="Buscar material pelo nome..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full input-dark mt-3"
                    />
                </header>
                <main className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                    {filteredMaterials.map(material => (
                        <div key={material.id} className="grid grid-cols-[1fr_auto] gap-4 items-center">
                            <div>
                                <label htmlFor={`mat-${material.id}`} className="text-sm block cursor-pointer">
                                    {material.name} 
                                    <span className="text-gray-400 text-xs ml-1">({material.contentValue}{material.contentUnit})</span>
                                </label>
                                <p className="text-xs text-pink-400 font-semibold mt-1">{formatCurrency(material.price)} por embalagem</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    id={`mat-${material.id}`} 
                                    type="number" 
                                    step="any"
                                    placeholder="0"
                                    value={draftMaterials.find(m => m.materialId === material.id)?.quantity || ''}
                                    onChange={e => handleQuantityChange(material.id, e.target.value)} 
                                    className="input-dark w-24 text-center"
                                />
                                <span className="text-sm text-gray-400 w-12">{material.contentUnit.replace('Unidades', 'un')}</span>
                            </div>
                        </div>
                    ))}
                </main>
                <footer className="p-4 bg-gray-900 flex justify-end gap-3 rounded-b-xl">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="button" onClick={() => onSave(draftMaterials)} className="btn-success">Salvar Materiais</button>
                </footer>
            </div>
        </div>
    );
};

interface ServiceCostCalculatorProps {
    recipe: ServiceRecipe;
    onSave: (recipe: ServiceRecipe) => void;
    onCancel: () => void;
    onOpenMaterialModal: () => void;
    onRecipeChange: (recipe: ServiceRecipe) => void;
    allAppointments: FullAppointment[];
}
const ServiceCostCalculator: React.FC<ServiceCostCalculatorProps> = ({ recipe, onSave, onCancel, onOpenMaterialModal, onRecipeChange, allAppointments }) => {
    const { materials, services, users, financialSettings } = useAppContext();
    const [simulatedPrice, setSimulatedPrice] = useState<number | ''>('');

    const handleChange = (field: keyof ServiceRecipe, value: any) => {
        const newRecipe = { ...recipe, [field]: value };
        onRecipeChange(newRecipe);
    };
    
    const handleDeleteMaterial = (materialId: number) => {
        const newRecipe = {
            ...recipe,
            materials: recipe.materials.filter(m => m.materialId !== materialId),
        };
        onRecipeChange(newRecipe);
    };

    const {
        custoMateriais,
        custoMaoDeObra,
        custoComAdicionais,
        custoTotalComSeguranca,
        precoVendaFinal,
        lucroBrutoSugerido,
        precoPorUnidade,
        profitStatus
    } = useMemo(() => {
        const custoMateriais = recipe.materials.reduce((total, recipeMaterial) => {
            const materialInfo = materials.find(m => m.id === recipeMaterial.materialId);
            if (!materialInfo || !materialInfo.contentValue || materialInfo.price <= 0) return total;
            const costPerUnitOfMeasure = materialInfo.price / materialInfo.contentValue;
            return total + (costPerUnitOfMeasure * recipeMaterial.quantity);
        }, 0);

        const serviceDuration = recipe.durationInMinutes || 0;
        
        const employees = users.filter(u => ['super_admin', 'admin', 'professional'].includes(u.accessLevel));
        const totalSalaries = employees.reduce((sum, user) => {
            return sum + (financialSettings.individualSalaries[user.id] ?? financialSettings.salaryPerEmployee);
        }, 0) + financialSettings.fixedCosts.proLabore;
        
        const totalSalariesWithCharges = totalSalaries * (1 + (financialSettings.socialChargesPercentage / 100));

        let estimatedMonthlyCommission = 0;
        const completedAppointments = allAppointments.filter(a => a.status === 'completed');
        if (completedAppointments.length > 0) {
            const dates = completedAppointments.map(a => a.date.getTime());
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            const timespanMonths = (maxDate.getUTCFullYear() - minDate.getUTCFullYear()) * 12 + (maxDate.getUTCMonth() - minDate.getUTCMonth()) + 1;
    
            const totalRevenue = completedAppointments.reduce((sum, a) => {
                const price = parseFloat(a.service.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                return sum + price;
            }, 0);
    
            const avgMonthlyRevenue = timespanMonths > 0 ? totalRevenue / timespanMonths : 0;
            const avgCommissionRate = financialSettings.defaultCommission / 100;
            estimatedMonthlyCommission = avgMonthlyRevenue * avgCommissionRate;
        }

        const totalPersonnelCostPlusCommission = totalSalariesWithCharges + estimatedMonthlyCommission;
        
        const numberOfEmployees = employees.length > 0 ? employees.length : 1;
        const averageMonthlyCostPerEmployee = totalPersonnelCostPlusCommission / numberOfEmployees;

        const costPerDay = averageMonthlyCostPerEmployee / 22;
        const costPerHour = costPerDay / 24;
        const costPerMinute = costPerHour / 60;
        
        const custoMaoDeObra = costPerMinute * serviceDuration;
        
        const custoComAdicionais = custoMateriais * (1 + (Number(recipe.additionalCostsPercentage) / 100));
        const custoTotalComSeguranca = (custoComAdicionais + custoMaoDeObra) * (1 + (Number(recipe.safetyMarginPercentage) / 100));
        
        let precoVendaFinal = 0;
        const profitMargin = Number(recipe.desiredProfitMargin);
        if (profitMargin < 100 && profitMargin >= 0) {
            precoVendaFinal = custoTotalComSeguranca / (1 - (profitMargin / 100));
        }

        const lucroBrutoSugerido = precoVendaFinal - custoTotalComSeguranca;
        const yields = Number(recipe.yields) > 0 ? Number(recipe.yields) : 1;
        const precoPorUnidade = precoVendaFinal / yields;
        
        let status: 'healthy' | 'danger' = 'healthy';
        if (lucroBrutoSugerido < 0 || precoVendaFinal <= 0) {
            status = 'danger';
        }
        
        return { 
            custoMateriais,
            custoMaoDeObra, 
            custoComAdicionais, 
            custoTotalComSeguranca, 
            precoVendaFinal, 
            lucroBrutoSugerido, 
            precoPorUnidade, 
            profitStatus: status 
        };
    }, [recipe, materials, users, financialSettings, allAppointments]);
    
    const simulatedProfitMargin = useMemo(() => {
        if (typeof simulatedPrice !== 'number' || simulatedPrice <= 0) return null;
        if (custoTotalComSeguranca > simulatedPrice) return ((simulatedPrice - custoTotalComSeguranca) / custoTotalComSeguranca) * 100; // Show negative markup on cost
        return ((simulatedPrice - custoTotalComSeguranca) / simulatedPrice) * 100;
    }, [simulatedPrice, custoTotalComSeguranca]);

    const statusConfig = {
        healthy: { text: "Lucrativo", bgColor: "bg-green-900/50", borderColor: "border-green-700" },
        danger: { text: "Prejuízo", bgColor: "bg-red-900/50", borderColor: "border-red-700" }
    };
    const currentStatus = statusConfig[profitStatus];

    return (
        <div className="bg-brand-dark text-white p-6 rounded-xl shadow-lg border border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-center">{recipe.id > 100000 ? 'Nova Receita de Serviço' : 'Editar Receita'}</h2>
            
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="input-label-layout">Nome do Serviço/Receita *</label>
                    <input type="text" value={recipe.name} onChange={e => handleChange('name', e.target.value)} className="input-dark mt-1" required />
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Seleção de Materiais</h3>
                <button onClick={onOpenMaterialModal} className="btn-primary w-full">ADICIONAR MATERIAIS E QUANTIDADES</button>
                {recipe.materials.length > 0 ? (
                    <div className="space-y-2">
                        {recipe.materials.map(mat => {
                            const materialInfo = materials.find(m => m.id === mat.materialId);
                            if (!materialInfo) return null;
                            const cost = (materialInfo.price / materialInfo.contentValue) * mat.quantity;
                            return (
                                <div key={mat.materialId} className="bg-gray-900 border border-gray-700 p-2 rounded-lg flex justify-between items-center text-sm">
                                    <div className="flex-grow">
                                        <p>{mat.quantity}{materialInfo.contentUnit.replace('Unidades', 'un')} - {materialInfo.name}</p>
                                        <p className="font-mono text-xs text-gray-400">Custo: {formatCurrency(cost)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                        <button type="button" onClick={onOpenMaterialModal} className="p-1 text-blue-400 hover:text-blue-300" title="Editar materiais">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => handleDeleteMaterial(mat.materialId)} className="p-1 text-red-400 hover:text-red-300" title="Remover material">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-400 bg-gray-900 rounded-lg border border-gray-700">Serviço sem materiais cadastrados</div>
                )}
            </div>

            <div className="space-y-4">
                 <h3 className="text-lg font-semibold">Parâmetros de Cálculo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="input-label-layout">Tempo de Execução (minutos)</label>
                        <input type="number" min="0" step="1" value={recipe.durationInMinutes || ''} onChange={e => handleChange('durationInMinutes', Number(e.target.value))} className="input-dark mt-1" />
                    </div>
                    <div><label className="input-label-layout">Rendimento</label><input type="number" min="1" step="1" value={recipe.yields} onChange={e => handleChange('yields', Number(e.target.value))} className="input-dark mt-1" /></div>
                    <div><label className="input-label-layout">Custos Adicionais (%)</label><input type="number" min="0" value={recipe.additionalCostsPercentage} onChange={e => handleChange('additionalCostsPercentage', Number(e.target.value))} className="input-dark mt-1" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="input-label-layout flex items-center gap-1">Margem de Segurança (%) <HelpTooltip text="Proteção contra variações de preço e perdas." /></label><input type="number" min="0" value={recipe.safetyMarginPercentage} onChange={e => handleChange('safetyMarginPercentage', Number(e.target.value))} className="input-dark mt-1" /></div>
                    <div><label className="input-label-layout flex items-center gap-1">Lucro Esperado (%) <HelpTooltip text="A margem de lucro desejada sobre o preço de venda final. Deve ser entre 0 e 99." /></label><input type="number" min="0" max="99" step="1" value={recipe.desiredProfitMargin} onChange={e => handleChange('desiredProfitMargin', e.target.value)} className="input-dark mt-1" /></div>
                </div>
            </div>

            <div className={`p-4 rounded-lg border ${currentStatus.borderColor} ${currentStatus.bgColor} space-y-2`}>
                <h3 className="font-bold text-center text-lg">Resumo da Precificação</h3>
                <div className="flex justify-between text-sm"><span className="text-gray-300">Custo de Materiais:</span><span className="font-mono">{formatCurrency(custoMateriais)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-300">Custo com Adicionais:</span><span className="font-mono">{formatCurrency(custoComAdicionais - custoMateriais)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-300">Custo por Mão de Obra:</span><span className="font-mono">{formatCurrency(custoMaoDeObra)}</span></div>
                <div className="flex justify-between font-semibold"><span className="text-gray-200">Custo Total (c/ Segurança):</span><span className="font-mono">{formatCurrency(custoTotalComSeguranca)}</span></div>
                <div className="flex justify-between items-center border-t border-gray-600 pt-2 mt-2"><span className="text-lg font-bold text-green-400">Preço de Venda Final:</span><span className="text-xl font-bold text-green-400 font-mono">{precoVendaFinal > 0 ? formatCurrency(precoVendaFinal) : 'Inválido'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-300">Lucro Bruto Sugerido:</span><span className={`font-mono ${lucroBrutoSugerido < 0 ? 'text-red-400' : ''}`}>{precoVendaFinal > 0 ? formatCurrency(lucroBrutoSugerido) : 'N/A'}</span></div>
                {recipe.yields > 1 && <div className="flex justify-between text-sm"><span className="text-gray-300">Preço por Unidade:</span><span className="font-mono">{precoVendaFinal > 0 ? formatCurrency(precoPorUnidade) : 'N/A'}</span></div>}
            </div>
            
            <div className="p-4 rounded-lg bg-gray-900 border border-gray-700 space-y-3">
                <h3 className="font-bold text-center">Simulador 'E se?'</h3>
                <p className="text-sm text-center text-gray-400">Digite um preço de venda e veja a margem de lucro resultante instantaneamente.</p>
                <div className="flex items-center gap-4">
                    <div className="relative flex-grow"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span><input type="number" value={simulatedPrice} onChange={e => setSimulatedPrice(e.target.value === '' ? '' : Number(e.target.value))} className="input-dark w-full pl-8" /></div>
                    <div className="bg-gray-800 p-3 rounded-lg w-48 text-center">
                        <p className="text-xs text-gray-400">Margem de Lucro</p>
                        <p className={`text-2xl font-bold ${simulatedProfitMargin === null ? 'text-white' : simulatedProfitMargin < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {simulatedProfitMargin !== null ? `${simulatedProfitMargin.toFixed(1)}%` : '-'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="input-label-layout">Anotações</label>
                <textarea value={recipe.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} className="textarea-dark mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
                <button type="button" onClick={() => onSave(recipe)} className="btn-success">Salvar Receita</button>
            </div>
        </div>
    );
};
// --- END: NEW COMPONENT - ServiceCostCalculator ---

// --- FinancialDashboardPanel remains largely the same ---
const FinancialDashboardPanel: React.FC<{ allAppointments: FullAppointment[], isLoading: boolean }> = ({ allAppointments, isLoading }) => {
    const { users, financialSettings } = useAppContext();
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [periodSelection, setPeriodSelection] = useState<PeriodSelection>(() => {
        const { start, end } = getQuickPeriodDates('last30');
        return { type: 'quick', key: 'last30', label: 'Últimos 30 dias', start, end };
    });

    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [defaultTransactionType, setDefaultTransactionType] = useState<'income' | 'expense'>('income');
    
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [expenseView, setExpenseView] = useState<'pie' | 'bar'>('bar');
    const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'amount'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
    const [transactionFilter, setTransactionFilter] = useState<'all' | 'income' | 'expense' | 'Produtos' | 'Salário'>('all');
    const [transactionsPage, setTransactionsPage] = useState(1);
    const TRANSACTIONS_PER_PAGE = 10;
    
    const TrendIndicator: React.FC<{ trend: number, invertColor?: boolean }> = ({ trend, invertColor = false }) => {
        if (!isFinite(trend) || trend === 0) {
            return <span className="text-xs font-bold text-gray-500">-</span>;
        }
        let isPositive = trend > 0;
        if (invertColor) isPositive = !isPositive;
    
        return (
            <div className={`text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? <UpArrowIcon /> : <DownArrowIcon />}
                {Math.abs(trend).toFixed(1)}%
            </div>
        );
    };

    const generateMockExpenses = (settings: FinancialSettings): Transaction[] => {
        const expenses: Transaction[] = [];
        const YEAR = 2025;
        
        const employees = users.filter(u => ['super_admin', 'admin', 'professional'].includes(u.accessLevel));
        const totalBaseSalary = employees.reduce((sum, user) => {
            const salary = settings.individualSalaries[user.id] ?? settings.salaryPerEmployee;
            return sum + salary;
        }, 0);

        const totalSalaryCost = totalBaseSalary * (1 + (settings.socialChargesPercentage / 100));
        
        const monthlyExpenses = {
            'Salário': totalSalaryCost,
            'Aluguel': settings.fixedCosts.rent,
            'Contas': settings.fixedCosts.bills,
            'Produtos': settings.fixedCosts.products,
            'Marketing': settings.fixedCosts.marketing,
            'Contabilidade': settings.fixedCosts.accounting,
            'Sistema': settings.fixedCosts.managementSystem,
            'Manutenção': settings.fixedCosts.maintenance,
            'Pró-labore': settings.fixedCosts.proLabore,
            'Impostos Fixos': settings.fixedCosts.fixedTaxes,
            'Depreciação': settings.fixedCosts.depreciation,
            'Outros': settings.fixedCosts.others,
        };
    
        let transactionId = 10001;
    
        const categoryMapping: Record<string, Transaction['category']> = {
            'Salário': 'Salário',
            'Aluguel': 'Aluguel',
            'Produtos': 'Produtos',
            'Marketing': 'Marketing',
            'Contas': 'Contas',
            'Contabilidade': 'Contas',
            'Sistema': 'Contas',
            'Impostos Fixos': 'Contas',
        };

        for (let month = 0; month < 12; month++) {
            Object.entries(monthlyExpenses).forEach(([categoryStr, amount]) => {
                if (amount > 0) {
                    const category = categoryMapping[categoryStr] || 'Outros';
                    expenses.push({
                        id: transactionId++,
                        description: `Pagamento - ${categoryStr}`,
                        amount: amount,
                        date: new Date(Date.UTC(YEAR, month, 5)).toISOString().split('T')[0],
                        type: 'expense',
                        category: category,
                        paymentMethod: 'Pix'
                    });
                }
            });
        }
        
        return expenses;
    };

    useEffect(() => {
        if (isLoading) return;
        const incomeFromAppointments: Transaction[] = allAppointments
            .filter(a => a.status === 'completed')
            .map(a => {
                const priceString = (a.service.price || '0');
                const numberString = priceString.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                const paymentMethods: Transaction['paymentMethod'][] = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];

                return {
                    id: Number(a.id),
                    description: a.service.name,
                    amount: parseFloat(numberString) || 0,
                    date: a.date.toISOString().split('T')[0],
                    type: 'income',
                    paymentMethod: paymentMethods[Number(a.id) % paymentMethods.length],
                };
            });
        
        const expenses = generateMockExpenses(financialSettings);
        const allTransactions = [...incomeFromAppointments, ...expenses]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTransactions(allTransactions);
    }, [financialSettings, users, allAppointments, isLoading]);

    const filteredTransactions = useMemo(() => {
        const { start, end } = periodSelection;
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            transactionDate.setUTCHours(0,0,0,0);
            return transactionDate.getTime() >= start.getTime() && transactionDate.getTime() <= end.getTime();
        });
    }, [transactions, periodSelection]);

    const comparisonTransactions = useMemo(() => {
        if (!periodSelection.comparison) return [];
        const { start, end } = periodSelection.comparison;
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            transactionDate.setUTCHours(0,0,0,0);
            return transactionDate.getTime() >= start.getTime() && transactionDate.getTime() <= end.getTime();
        });
    }, [transactions, periodSelection.comparison]);


    const { totalRevenue, totalExpenses, netProfit, breakEvenPoint, contributionMarginRatio, trendRevenue, trendExpenses, trendNetProfit } = useMemo(() => {
        const calculateMetrics = (txs: Transaction[]) => {
            const revenue = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            return { revenue, expenses, netProfit: revenue - expenses };
        };

        const currentMetrics = calculateMetrics(filteredTransactions);
        const previousMetrics = calculateMetrics(comparisonTransactions);
        
        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? Infinity : 0;
            return ((current - previous) / previous) * 100;
        };
        
        const employees = users.filter(u => ['super_admin', 'admin', 'professional'].includes(u.accessLevel));
        const totalBaseSalary = employees.reduce((sum, user) => {
            const salary = financialSettings.individualSalaries[user.id] ?? financialSettings.salaryPerEmployee;
            return sum + salary;
        }, 0);
        const totalSalaryWithCharges = totalBaseSalary * (1 + (financialSettings.socialChargesPercentage / 100));

        const { rent, bills, products, marketing, accounting, managementSystem, maintenance, proLabore, fixedTaxes, depreciation, others } = financialSettings.fixedCosts;
        const totalFixedCost = totalSalaryWithCharges + rent + bills + products + marketing + accounting + managementSystem + maintenance + proLabore + fixedTaxes + depreciation + others;

        const incomeTransactions = filteredTransactions.filter(t => t.type === 'income' && t.id < 10000); // Only from appointments
        let totalContributionMargin = 0;
        
        incomeTransactions.forEach(t => {
            const appointment = allAppointments.find(a => String(a.id) === String(t.id));
            if (appointment) {
                const service = appointment.service;
                const price = parseFloat(service.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                const commissionRate = (financialSettings.individualCommissions[appointment.professional.id] ?? financialSettings.defaultCommission) / 100;
                const cardFeeRate = financialSettings.cardFeePercentage / 100;
                const taxRate = financialSettings.taxOnServicesPercentage / 100;
                
                const variableCosts = (service.productCost || 0) + (price * commissionRate) + (price * cardFeeRate) + (price * taxRate);
                totalContributionMargin += (price - variableCosts);
            }
        });
        
        const marginRatio = currentMetrics.revenue > 0 ? totalContributionMargin / currentMetrics.revenue : 0;
        const breakEven = marginRatio > 0 ? totalFixedCost / marginRatio : 0;

        return { 
            totalRevenue: currentMetrics.revenue, 
            totalExpenses: currentMetrics.expenses, 
            netProfit: currentMetrics.netProfit,
            breakEvenPoint: breakEven,
            contributionMarginRatio: marginRatio * 100,
            trendRevenue: calculateTrend(currentMetrics.revenue, previousMetrics.revenue),
            trendExpenses: calculateTrend(currentMetrics.expenses, previousMetrics.expenses),
            trendNetProfit: calculateTrend(currentMetrics.netProfit, previousMetrics.netProfit),
        };
    }, [filteredTransactions, comparisonTransactions, financialSettings, users, allAppointments]);


    const cashFlowData = useMemo(() => {
        const durationDays = (periodSelection.end.getTime() - periodSelection.start.getTime()) / (1000 * 3600 * 24);
        const groupByDay = durationDays <= 62;

        const dataMap: { [key: string]: { Faturamento: number; Despesas: number, date: Date } } = {};
        
        const dateFormatter = new Intl.DateTimeFormat('pt-BR', 
            { timeZone: 'UTC', ...(groupByDay 
                ? { day: '2-digit', month: '2-digit' } 
                : { month: 'short', year: '2-digit' })
            }
        );

        filteredTransactions.forEach(t => {
            const date = new Date(t.date);
            date.setUTCHours(12, 0, 0, 0);
            const key = dateFormatter.format(date);

            if (!dataMap[key]) {
                dataMap[key] = { Faturamento: 0, Despesas: 0, date: date };
            }
            if (t.type === 'income') dataMap[key].Faturamento += t.amount;
            else dataMap[key].Despesas += t.amount;
        });
        
        let cumulativeBalance = 0;
        const sortedData = Object.entries(dataMap)
            .map(([dateKey, values]) => ({ dateKey, ...values }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
            
        return sortedData.map(item => {
            cumulativeBalance += item.Faturamento - item.Despesas;
            return {
                ...item,
                Saldo: cumulativeBalance
            };
        });
    }, [filteredTransactions, periodSelection]);
    
    const expensesByCategory = useMemo(() => {
        const categories: Record<string, number> = {};
        const expenseTxs = filteredTransactions.filter(t => t.type === 'expense' && t.category);
        const totalExpensesValue = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

        expenseTxs.forEach(t => {
                if (!categories[t.category!]) {
                    categories[t.category!] = 0;
                }
                categories[t.category!] += t.amount;
            });

        return Object.entries(categories)
            .map(([name, value]) => ({ 
                name, 
                value,
                percent: totalExpensesValue > 0 ? (value / totalExpensesValue) * 100 : 0
            }))
            .sort((a,b) => b.value - a.value);
    }, [filteredTransactions]);

    const displayedTransactions = useMemo(() => {
        const sorted = [...filteredTransactions].sort((a, b) => {
            let comparison = 0;
            if (sortConfig.key === 'date') {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else {
                comparison = a.amount - b.amount;
            }
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    
        if (transactionFilter === 'all') return sorted;
        if (transactionFilter === 'income' || transactionFilter === 'expense') {
            return sorted.filter(t => t.type === transactionFilter);
        }
        return sorted.filter(t => t.category === transactionFilter);
    }, [filteredTransactions, sortConfig, transactionFilter]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (transactionsPage - 1) * TRANSACTIONS_PER_PAGE;
        return displayedTransactions.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE);
    }, [displayedTransactions, transactionsPage]);

    const totalTransactionPages = Math.ceil(displayedTransactions.length / TRANSACTIONS_PER_PAGE);
    
    useEffect(() => {
        setTransactionsPage(1);
    }, [transactionFilter, periodSelection]);

    const handleOpenTransactionModal = (type: 'income' | 'expense', transaction: Transaction | null = null) => {
        setTransactionToEdit(transaction);
        setDefaultTransactionType(type);
        setTransactionModalOpen(true);
    };

    const handleSaveTransaction = (data: Omit<Transaction, 'id'> & { id?: number }) => {
        setTransactions(prev => {
            if (data.id) {
                return prev.map(t => t.id === data.id ? { ...t, ...data } as Transaction : t);
            } else {
                const newTransaction: Transaction = { ...data, id: Date.now() } as Transaction;
                return [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
        });
        setTransactionModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (transactionToDelete) {
            setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
        }
        setConfirmModalOpen(false);
        setTransactionToDelete(null);
    };

    const handleExportCsv = () => {
        const headers = ["ID", "Data", "Descrição", "Valor", "Tipo", "Categoria", "Meio de Pagamento"];
        const rows = displayedTransactions.map(t => [
            t.id,
            t.date,
            t.description,
            t.amount,
            t.type === 'income' ? 'Entrada' : 'Saída',
            t.category || '',
            t.paymentMethod
        ]);
        exportToCsv(`relatorio_financeiro_${periodSelection.label}.csv`, [headers, ...rows]);
    };
    
    const handleSort = (key: 'date' | 'amount') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handlePrint = () => {
        window.print();
    };

    const renderTransactionCard = (t: Transaction) => {
        const isAppointmentIncome = t.type === 'income' && t.id < 10000;
        return (
            <div key={t.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow min-w-0">
                        <InfoTooltip text={t.description}>
                            <div className="flex items-center gap-2">
                                 {t.type === 'income' && <CalendarIcon className="text-gray-400 shrink-0" />}
                                <p className="font-bold text-gray-800 truncate">{t.description}</p>
                            </div>
                        </InfoTooltip>
                        <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                    </div>
                    <p className={`font-bold text-lg whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(t.amount)}
                    </p>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-end gap-3 no-print">
                     <button onClick={(e) => { e.stopPropagation(); handleOpenTransactionModal(t.type, t); }} className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" disabled={isAppointmentIncome}>
                        <PencilIcon />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if(!isAppointmentIncome) {setTransactionToDelete(t); setConfirmModalOpen(true);} }} className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" disabled={isAppointmentIncome}>
                        <TrashIcon />
                    </button>
                </div>
            </div>
        );
    }
    
    interface TransactionModalProps { isOpen: boolean; onClose: () => void; onSave: (data: Omit<Transaction, 'id'> & { id?: number }) => void; transactionToEdit: Transaction | null; defaultType: 'income' | 'expense'; }
    const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit, defaultType }) => {
        const [description, setDescription] = useState('');
        const [amount, setAmount] = useState('');
        const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
        const [type, setType] = useState<'income' | 'expense'>(defaultType);
        const [category, setCategory] = useState<Transaction['category']>('Outros');
        const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('Pix');
        const [isIncomeFromAppointment, setIsIncomeFromAppointment] = useState(false);
    
    
        useEffect(() => {
            if (isOpen) {
                if (transactionToEdit) {
                    setDescription(transactionToEdit.description);
                    setAmount(String(transactionToEdit.amount));
                    setDate(transactionToEdit.date);
                    setType(transactionToEdit.type);
                    setCategory(transactionToEdit.category || 'Outros');
                    setPaymentMethod(transactionToEdit.paymentMethod);
                    // Check if the ID is less than the expense threshold, indicating it's from an appointment
                    setIsIncomeFromAppointment(transactionToEdit.id < 10000);
                } else {
                    setDescription('');
                    setAmount('');
                    setDate(new Date().toISOString().split('T')[0]);
                    setType(defaultType);
                    setCategory('Outros');
                    setPaymentMethod('Pix');
                    setIsIncomeFromAppointment(false);
                }
            }
        }, [transactionToEdit, isOpen, defaultType]);
        
        if (!isOpen) return null;
    
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave({
                id: transactionToEdit?.id,
                description,
                amount: parseFloat(amount) || 0,
                date,
                type,
                category: type === 'expense' ? category : undefined,
                paymentMethod,
            });
        };
    
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
                <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="p-5 border-b"><h3 className="font-bold text-lg">{transactionToEdit ? 'Editar' : 'Adicionar'} Transação</h3></header>
                    <main className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        {isIncomeFromAppointment && (
                            <div className="md:col-span-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
                                Esta é uma entrada gerada automaticamente a partir de um agendamento. A edição é limitada.
                            </div>
                        )}
                        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Descrição *</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="input-dark" disabled={isIncomeFromAppointment} /></div>
                        <div><label className="block text-sm font-medium mb-1">Valor (R$) *</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="input-dark" disabled={isIncomeFromAppointment} /></div>
                        <div><label className="block text-sm font-medium mb-1">Data *</label><input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-dark" disabled={isIncomeFromAppointment} /></div>
                        <div><label className="block text-sm font-medium mb-1">Tipo *</label><select value={type} onChange={e => setType(e.target.value as any)} className="select-dark" disabled={isIncomeFromAppointment}><option value="income">Entrada</option><option value="expense">Saída</option></select></div>
                        {type === 'expense' && (
                            <div><label className="block text-sm font-medium mb-1">Categoria *</label><select value={category} onChange={e => setCategory(e.target.value as any)} className="select-dark"><option>Salário</option><option>Aluguel</option><option>Marketing</option><option>Produtos</option><option>Contas</option><option>Outros</option></select></div>
                        )}
                        <div className={type === 'income' ? 'md:col-span-2' : ''}><label className="block text-sm font-medium mb-1">Meio de Pagamento *</label><select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="select-dark"><option>Pix</option><option>Cartão de Crédito</option><option>Cartão de Débito</option><option>Dinheiro</option></select></div>
                    </main>
                    <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={isIncomeFromAppointment}>Salvar</button>
                    </footer>
                </form>
            </div>
        );
    };
    
    const InfoTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
        <div className="relative group">
            {children}
            <div className="absolute bottom-full mb-2 w-max max-w-xs bg-brand-dark text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                {text}
            </div>
        </div>
    );
    
    const SortButton: React.FC<{
        label: string;
        sortKey: 'date' | 'amount';
        currentSort: typeof sortConfig;
        onClick: (key: 'date' | 'amount') => void;
    }> = ({ label, sortKey, currentSort, onClick }) => (
        <button className="flex items-center gap-1" onClick={() => onClick(sortKey)}>
            {label}
            {currentSort.key === sortKey && (currentSort.direction === 'asc' ? <UpArrowIcon/> : <DownArrowIcon/>)}
        </button>
    );

    const FilterButton: React.FC<{ onClick: () => void; isActive: boolean; children: React.ReactNode; }> = ({ onClick, isActive, children }) => (
        <button onClick={onClick} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${ isActive ? 'bg-brand-primary text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`} >
            {children}
        </button>
    );

    const renderTransactionRow = (t: Transaction) => {
        const isAppointmentIncome = t.type === 'income' && t.id < 10000;
        return (
            <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
                </td>
                <td className="px-4 py-4 max-w-sm">
                    <div className="text-sm text-gray-900 font-medium truncate" title={t.description}>{t.description}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(t.amount)}
                    </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenTransactionModal(t.type, t); }} 
                            className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={isAppointmentIncome}
                            aria-label={`Editar transação ${t.description}`}
                        >
                            <PencilIcon />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); if(!isAppointmentIncome) {setTransactionToDelete(t); setConfirmModalOpen(true);} }} 
                            className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={isAppointmentIncome}
                            aria-label={`Excluir transação ${t.description}`}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </td>
            </tr>
        );
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
            <div className="space-y-8">
                 <ReportToolbar
                    periodSelection={periodSelection}
                    onPeriodSelect={setPeriodSelection}
                    allAppointments={allAppointments}
                    onPrint={handlePrint}
                    onExportCsv={handleExportCsv}
                >
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenTransactionModal('income')} className="btn-success flex items-center gap-2"><PlusCircleIcon /> Adicionar Entrada</button>
                        <button onClick={() => handleOpenTransactionModal('expense')} className="btn-primary flex items-center gap-2 !bg-red-100 !text-red-800 hover:!bg-red-200"><PlusCircleIcon /> Adicionar Saída</button>
                    </div>
                </ReportToolbar>

                <h2 className="text-xl font-bold my-4 hidden print:block">Relatório Financeiro: {periodSelection.label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-lg shadow-md border"><div className="flex justify-between items-start"><p className="text-sm font-semibold text-gray-500">Faturamento Total</p><TrendIndicator trend={trendRevenue} /></div><p className="text-3xl font-bold text-green-500">{formatCurrency(totalRevenue)}</p></div>
                    <div className="bg-white p-5 rounded-lg shadow-md border"><div className="flex justify-between items-start"><p className="text-sm font-semibold text-gray-500">Despesas Totais</p><TrendIndicator trend={trendExpenses} invertColor={true} /></div><p className="text-3xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p></div>
                    <div className="bg-white p-5 rounded-lg shadow-md border"><div className="flex justify-between items-start"><p className="text-sm font-semibold text-gray-500">Lucro Líquido</p><TrendIndicator trend={trendNetProfit} /></div><p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{formatCurrency(netProfit)}</p></div>
                    <div className="bg-white p-5 rounded-lg shadow-md border">
                        <p className="text-sm font-semibold text-gray-500 flex items-center gap-1">Ponto de Equilíbrio (Mês) <HelpTooltip text={`Meta de faturamento mensal para cobrir todos os custos fixos, com base na margem de contribuição de ${contributionMarginRatio.toFixed(1)}% do período.`} /></p>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(breakEvenPoint)}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min((totalRevenue / (breakEvenPoint || 1)) * 100, 100)}%` }}></div></div>
                            <span className="text-sm font-bold text-blue-600">{Math.min((totalRevenue / (breakEvenPoint || 1)) * 100, 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <h3 className="text-lg font-bold text-brand-dark">Despesas por Categoria</h3>
                        <div className="flex gap-1 p-1 bg-gray-200 rounded-lg no-print">
                            <button onClick={() => setExpenseView('pie')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${expenseView === 'pie' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>Pizza</button>
                            <button onClick={() => setExpenseView('bar')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${expenseView === 'bar' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>Barras</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <ResponsiveContainer width="100%" height={300}>
                            {expenseView === 'pie' ? (
                                <PieChart>
                                    <Pie data={expensesByCategory} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" >
                                        {expensesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                                        <LabelList
                                            dataKey="percent"
                                            position="inside"
                                            formatter={(value: number) => `${value.toFixed(0)}%`}
                                            style={{ fill: 'white', fontWeight: 'bold', fontSize: '14px' }}
                                        />
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                </PieChart>
                            ) : (
                                <BarChart data={expensesByCategory} layout="vertical" margin={{ top: 5, right: 120, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Bar dataKey="value" name="Despesa" radius={[0, 4, 4, 0]}>
                                        {expensesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                                        <LabelList dataKey="percent" position="right" formatter={(value: number) => `${value.toFixed(1)}%`} fontSize={12} fill="#333" fontWeight="bold"/>
                                    </Bar>
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {expensesByCategory.map((entry, index) => (
                                <div key={entry.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100">
                                    <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}></span><span className="font-medium text-gray-700">{entry.name}</span></div>
                                    <div className="text-right">
                                        <span className="font-bold text-gray-800">{formatCurrency(entry.value)}</span>
                                        <span className="text-sm text-gray-500 ml-2">({entry.percent.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-bold text-brand-dark mb-4">Fluxo de Caixa</h3>
                    <ResponsiveContainer width="100%" height={300}>
                         <ComposedChart data={cashFlowData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="dateKey" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" tickFormatter={(value) => `R$${value/1000}k`} tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `R$${value/1000}k`} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend wrapperStyle={{fontSize: "14px"}} />
                            <Bar yAxisId="left" dataKey="Faturamento" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="left" dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="Saldo" name="Saldo Acumulado" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-bold text-brand-dark mb-4">Últimas Transações no Período</h3>
                    <div className="flex flex-wrap gap-2 mb-4 no-print">
                        <FilterButton onClick={() => setTransactionFilter('all')} isActive={transactionFilter === 'all'}>Todos</FilterButton>
                        <FilterButton onClick={() => setTransactionFilter('income')} isActive={transactionFilter === 'income'}>Entradas</FilterButton>
                        <FilterButton onClick={() => setTransactionFilter('expense')} isActive={transactionFilter === 'expense'}>Saídas</FilterButton>
                        <FilterButton onClick={() => setTransactionFilter('Produtos')} isActive={transactionFilter === 'Produtos'}>
                            Produtos
                        </FilterButton>
                        <FilterButton onClick={() => setTransactionFilter('Salário')} isActive={transactionFilter === 'Salário'}>
                            Salário
                        </FilterButton>
                    </div>
                     {/* Desktop View */}
                    <div className="hidden md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                        <SortButton label="Data" sortKey="date" currentSort={sortConfig} onClick={handleSort} />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Descrição</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                        <SortButton label="Valor" sortKey="amount" currentSort={sortConfig} onClick={handleSort} />
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase no-print">Ações</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-100">
                                {paginatedTransactions.map(renderTransactionRow)}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile View */}
                    <div className="space-y-3 md:hidden">
                        {paginatedTransactions.map(renderTransactionCard)}
                    </div>

                    {totalTransactionPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-4 mt-4 border-t no-print">
                            <Button variant="secondary" disabled={transactionsPage === 1} onClick={() => setTransactionsPage(p => p - 1)}>Anterior</Button>
                            <span className="text-sm font-semibold">Página {transactionsPage} de {totalTransactionPages}</span>
                            <Button variant="secondary" disabled={transactionsPage === totalTransactionPages} onClick={() => setTransactionsPage(p => p + 1)}>Próximo</Button>
                        </div>
                    )}
                </div>
                <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setTransactionModalOpen(false)} onSave={handleSaveTransaction} transactionToEdit={transactionToEdit} defaultType={defaultTransactionType} />
                <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão">
                    <p>Você tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.</p>
                </ConfirmationModal>
            </div>
        </div>
    );
};


const CostsPanel: React.FC = () => {
    // ... (rest of the component is unchanged)
    const { financialSettings, setFinancialSettings, users } = useAppContext();
    
    const [openAccordion, setOpenAccordion] = useState<string | null>('pessoal');
    const [draft, setDraft] = useState(financialSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        setDraft(financialSettings);
    }, [financialSettings]);

    useEffect(() => {
        const changesDetected = JSON.stringify(draft) !== JSON.stringify(financialSettings);
        if (changesDetected !== hasChanges) {
             setHasChanges(changesDetected);
        }
    }, [draft, financialSettings, hasChanges]);

    const handleRevert = () => {
        setDraft(financialSettings);
        setSaveStatus('idle');
    };

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setFinancialSettings(draft);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };
    
    const handleAccordionToggle = (sectionId: string) => {
        setOpenAccordion(prev => (prev === sectionId ? null : sectionId));
    };

    const handleCostChange = (group: 'fixedCosts' | 'root', field: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setDraft(prev => {
            if (group === 'fixedCosts') {
                return { ...prev, fixedCosts: { ...prev.fixedCosts, [field]: numValue } };
            }
            return { ...prev, [field]: numValue };
        });
    };
    
    const handleIndividualSalaryChange = (userId: number, value: string) => {
        const numValue = parseFloat(value);
        setDraft(prev => {
            const newSalaries = { ...prev.individualSalaries };
            if (isNaN(numValue) || value === '') {
                delete newSalaries[userId];
            } else {
                newSalaries[userId] = numValue;
            }
            return { ...prev, individualSalaries: newSalaries };
        });
    };
    
    const employees = useMemo(() => users.filter(u => ['super_admin', 'admin', 'professional'].includes(u.accessLevel)), [users]);

    const { totalCost, costPerHour, costPerMinute } = useMemo(() => {
        const total = calculateTotalFixedCost(draft, employees);
        const totalWorkHoursInMonth = (draft.workDaysInMonth * 8) || 1; // Assume 8 hours/day, prevent division by zero
        const perHour = total / totalWorkHoursInMonth;
        const perMinute = perHour / 60;

        return { totalCost: total, costPerHour: perHour, costPerMinute: perMinute };
    }, [draft, employees]);

    const CostInput: React.FC<{
        label: string;
        tooltip: string;
        value: number;
        onChange: (value: string) => void;
        isPercentage?: boolean;
    }> = ({ label, tooltip, value, onChange, isPercentage = false }) => (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-900">{label}</label>
                <HelpTooltip text={tooltip} />
            </div>
            <div className="relative mt-1">
                {!isPercentage && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>}
                <input
                    type="number"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    step="0.01"
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-right ${isPercentage ? 'pr-8' : 'pr-3 pl-10'}`}
                />
                {isPercentage && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>}
            </div>
        </div>
    );
    const AccordionSection: React.FC<{ title: string; sectionId: string; openAccordion: string | null; onToggle: (id: string) => void; children: React.ReactNode; }> = ({ title, sectionId, openAccordion, onToggle, children }) => {
        const isOpen = openAccordion === sectionId;
        return (
            <div className="bg-white rounded-xl shadow-sm border">
                <button onClick={() => onToggle(sectionId)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isOpen}>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <ChevronDownIcon open={isOpen} />
                </button>
                {isOpen && (
                    <div className="p-6 pt-0 animate-fade-in-down">
                        <div className="border-t pt-6">
                            {children}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4 pb-24">
             <style>{`.animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>

            <AccordionSection title="Custos com Pessoal" sectionId="pessoal" openAccordion={openAccordion} onToggle={handleAccordionToggle}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CostInput label="Salário Base Padrão" tooltip="Valor padrão usado para funcionários sem um salário individual definido." value={draft.salaryPerEmployee} onChange={v => handleCostChange('root', 'salaryPerEmployee', v)} />
                    <CostInput label="Dias Úteis no Mês" tooltip="Número médio de dias que o salão opera no mês. Usado para calcular o custo por hora/minuto." value={draft.workDaysInMonth} onChange={v => handleCostChange('root', 'workDaysInMonth', v)} />
                    <CostInput label="Encargos Sociais (%)" tooltip="Percentual médio de encargos (INSS, FGTS, etc.) sobre o valor total da folha de pagamento." value={draft.socialChargesPercentage} onChange={v => handleCostChange('root', 'socialChargesPercentage', v)} isPercentage />
                </div>
                <div className="mt-6 border-t pt-6">
                    <h4 className="font-bold mb-4 text-gray-800">Gerenciar Salários Individuais</h4>
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {employees.map(employee => (
                            <div key={employee.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                                <img src={employee.imageUrl} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
                                <label htmlFor={`salary-${employee.id}`} className="flex-grow font-semibold text-gray-800">{employee.name}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                    <input id={`salary-${employee.id}`} type="number" value={draft.individualSalaries[employee.id] ?? ''} placeholder={String(draft.salaryPerEmployee)} onChange={e => handleIndividualSalaryChange(employee.id, e.target.value)} className="w-40 text-right pr-3 pl-10 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection title="Custos Operacionais" sectionId="operacionais" openAccordion={openAccordion} onToggle={handleAccordionToggle}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CostInput label="Aluguel" tooltip="Custo mensal do aluguel do imóvel." value={draft.fixedCosts.rent} onChange={v => handleCostChange('fixedCosts', 'rent', v)} />
                    <CostInput label="Contas (Água, Luz, etc)" tooltip="Soma de água, luz, telefone, internet, TV, etc." value={draft.fixedCosts.bills} onChange={v => handleCostChange('fixedCosts', 'bills', v)} />
                    <CostInput label="Produtos (Estimativa)" tooltip="Estimativa do custo fixo mensal com produtos de uso recorrente no salão." value={draft.fixedCosts.products} onChange={v => handleCostChange('fixedCosts', 'products', v)} />
                    <CostInput label="Limpeza e Manutenção" tooltip="Custos com produtos de limpeza e manutenções preventivas." value={draft.fixedCosts.maintenance} onChange={v => handleCostChange('fixedCosts', 'maintenance', v)} />
                </div>
            </AccordionSection>

            <AccordionSection title="Custos Administrativos" sectionId="administrativos" openAccordion={openAccordion} onToggle={handleAccordionToggle}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CostInput label="Marketing e Publicidade" tooltip="Investimento mensal em divulgação, redes sociais, etc." value={draft.fixedCosts.marketing} onChange={v => handleCostChange('fixedCosts', 'marketing', v)} />
                    <CostInput label="Assessoria Contábil" tooltip="Honorários mensais do contador." value={draft.fixedCosts.accounting} onChange={v => handleCostChange('fixedCosts', 'accounting', v)} />
                    <CostInput label="Sistemas e Software" tooltip="Custo mensal com sistema de gestão, agendamento, etc." value={draft.fixedCosts.managementSystem} onChange={v => handleCostChange('fixedCosts', 'managementSystem', v)} />
                    <CostInput label="Pró-labore" tooltip="Remuneração mensal definida para os donos do salão." value={draft.fixedCosts.proLabore} onChange={v => handleCostChange('fixedCosts', 'proLabore', v)} />
                    <CostInput label="Depreciação" tooltip="Valor mensal estimado para a desvalorização de equipamentos." value={draft.fixedCosts.depreciation} onChange={v => handleCostChange('fixedCosts', 'depreciation', v)} />
                    <CostInput label="Outras Despesas" tooltip="Custos como assinaturas de revistas, café, etc." value={draft.fixedCosts.others} onChange={v => handleCostChange('fixedCosts', 'others', v)} />
                </div>
            </AccordionSection>

            <AccordionSection title="Impostos e Taxas" sectionId="impostos" openAccordion={openAccordion} onToggle={handleAccordionToggle}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CostInput label="Impostos Fixos" tooltip="Impostos como IPTU, taxas anuais, etc. (valor mensalizado)." value={draft.fixedCosts.fixedTaxes} onChange={v => handleCostChange('fixedCosts', 'fixedTaxes', v)} />
                    <CostInput label="Taxa de Cartão (%)" tooltip="A taxa média percentual cobrada pelas operadoras de cartão sobre cada transação." value={draft.cardFeePercentage} onChange={v => handleCostChange('root', 'cardFeePercentage', v)} isPercentage />
                    <CostInput label="Imposto sobre Serviços (%)" tooltip="A alíquota de imposto (ex: ISS) que incide sobre o valor de cada serviço prestado." value={draft.taxOnServicesPercentage} onChange={v => handleCostChange('root', 'taxOnServicesPercentage', v)} isPercentage />
                </div>
            </AccordionSection>
            
            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-xl mb-4 text-center">Resumo dos Custos Fixos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-indigo-200">Custo Total / Mês</p>
                        <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
                    </div>
                    <div className="sm:border-l sm:border-r border-indigo-700 px-4">
                        <p className="text-sm text-indigo-200 flex items-center justify-center gap-1">Custo / Hora <HelpTooltip text="Custo para manter o salão aberto por hora, baseado nos dias úteis e 8h de trabalho/dia." /></p>
                        <p className="text-3xl font-bold">{formatCurrency(costPerHour)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-indigo-200">Custo / Minuto</p>
                        <p className="text-3xl font-bold">{formatCurrency(costPerMinute)}</p>
                    </div>
                </div>
            </div>

            {hasChanges && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50">
                    <div className="bg-brand-dark text-white rounded-xl shadow-2xl p-4 flex justify-between items-center animate-fade-in-up">
                        <p className="font-semibold">Você tem alterações não salvas!</p>
                        <div className="flex gap-4">
                            <button onClick={handleRevert} className="font-semibold hover:underline">Reverter</button>
                            <Button onClick={handleSave} isLoading={saveStatus === 'saving'} disabled={saveStatus === 'saving'} variant="primary">
                                {saveStatus === 'saved' ? '✓ Salvo!' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... (rest of the file remains the same)
// --- START: NEW COMPONENT - MaterialsPanel ---
// ... (rest of the component is unchanged)
// --- END: NEW COMPONENT - MaterialsPanel ---

// --- START: NEW COMPONENT - CombosPanel ---
// ... (rest of the component is unchanged)
// --- END: NEW COMPONENT - CombosPanel ---

// --- MAIN WRAPPER SCREEN ---
export const FinancialScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'costs' | 'services' | 'materials' | 'combos'>('services');
    const [allAppointments, setAllAppointments] = useState<FullAppointment[]>([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingAppointments(true);
            try {
                const appointments = await api.getAppointments();
                setAllAppointments(appointments);
            } catch (error) {
                console.error("Failed to load appointment data for financial screen:", error);
            } finally {
                setIsLoadingAppointments(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-1 flex flex-wrap gap-1 w-full sm:w-auto mx-auto max-w-4xl">
                <button onClick={() => setActiveTab('dashboard')} className={`flex-1 text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-brand-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>Visão Geral</button>
                <button onClick={() => setActiveTab('costs')} className={`flex-1 text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'costs' ? 'bg-brand-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>Configuração de Custos</button>
                <button onClick={() => setActiveTab('services')} className={`flex-1 text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'services' ? 'bg-brand-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>Serviços Individuais</button>
                <button onClick={() => setActiveTab('materials')} className={`flex-1 text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'materials' ? 'bg-brand-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>Materiais e Estoque</button>
                <button onClick={() => setActiveTab('combos')} className={`flex-1 text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'combos' ? 'bg-brand-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>Combos & Pacotes</button>
            </div>
            {activeTab === 'dashboard' && <FinancialDashboardPanel allAppointments={allAppointments} isLoading={isLoadingAppointments} />}
            {activeTab === 'costs' && <CostsPanel />}
            {activeTab === 'services' && <ServiceCostCalculatorPanel allAppointments={allAppointments} />}
            {activeTab === 'materials' && <MaterialsPanel />}
            {activeTab === 'combos' && <CombosPanel />}
        </div>
    );
}

// FIX: The following components were missing or needed updates, so they are included here.
// These are necessary for the screen to function as requested.
const MaterialsPanel: React.FC = () => {
    const { materials, setMaterials } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
    const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

    const handleSave = (data: Omit<Material, 'id'>) => {
        setMaterials(prev => {
            if (materialToEdit) {
                return prev.map(m => m.id === materialToEdit.id ? { ...m, ...data } : m);
            }
            return [...prev, { ...data, id: Date.now() }];
        });
        setModalOpen(false);
        setMaterialToEdit(null);
    };

    const handleDelete = () => {
        if (!materialToDelete) return;
        setMaterials(prev => prev.filter(m => m.id !== materialToDelete.id));
        setMaterialToDelete(null);
    };

    const getStatusStyles = (material: Material) => {
        if (material.currentStock < material.minimumStock) return 'bg-red-50 border-red-200';
        if (material.currentStock === material.minimumStock) return 'bg-yellow-50 border-yellow-200';
        return 'bg-gray-50 border-gray-200';
    };

    return (
        <div className="space-y-6">
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={() => setModalOpen(false)}>
                    <div className="bg-brand-dark text-white w-full max-w-md rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                        <MaterialForm onSave={handleSave} onCancel={() => setModalOpen(false)} initialData={materialToEdit} />
                    </div>
                </div>
            )}
            {materialToDelete && (
                 <ConfirmationModal 
                    isOpen={!!materialToDelete}
                    onClose={() => setMaterialToDelete(null)}
                    onConfirm={handleDelete}
                    title="Confirmar Exclusão"
                >
                    <p>Deseja excluir o material <strong>{materialToDelete.name}</strong>?</p>
                </ConfirmationModal>
            )}
            
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Gerenciamento de Materiais e Estoque</h2>
                <button onClick={() => { setMaterialToEdit(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2"><PlusCircleIcon /> Novo Material</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {materials.map(mat => {
                    const costPerUnit = mat.contentValue > 0 ? mat.price / mat.contentValue : 0;
                    const stockStatus = mat.currentStock < mat.minimumStock ? 'low' : mat.currentStock === mat.minimumStock ? 'min' : 'ok';
                    return (
                        <div key={mat.id} className={`p-4 rounded-lg border ${getStatusStyles(mat)}`}>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    {stockStatus !== 'ok' && <AlertIcon className={stockStatus === 'low' ? 'text-red-500' : 'text-yellow-500'} />}
                                    {mat.name}
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={() => { setMaterialToEdit(mat); setModalOpen(true); }} className="p-1"><PencilIcon /></button>
                                    <button onClick={() => setMaterialToDelete(mat)} className="p-1"><TrashIcon /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div className="bg-white p-2 border rounded-md"><p className="text-xs text-gray-500">Preço Embalagem</p><p className="font-semibold">{formatCurrency(mat.price)}</p></div>
                                <div className="bg-white p-2 border rounded-md"><p className="text-xs text-gray-500">Conteúdo</p><p className="font-semibold">{mat.contentValue} {mat.contentUnit}</p></div>
                                <div className="bg-white p-2 border rounded-md"><p className="text-xs text-gray-500">Custo p/ Unidade</p><p className="font-semibold">{formatCurrency(costPerUnit)}</p></div>
                                <div className="bg-white p-2 border rounded-md"><p className="text-xs text-gray-500">Estoque Atual</p><p className="font-semibold">{mat.currentStock}</p></div>
                                <div className="bg-white p-2 border rounded-md"><p className="text-xs text-gray-500">Estoque Mínimo</p><p className="font-semibold">{mat.minimumStock}</p></div>
                                <div className="bg-white p-2 border rounded-md"><p className="text-xs text-gray-500">Rendimento</p><p className="font-semibold">{mat.servicesYield} serv.</p></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
interface MaterialFormProps {
    onSave: (data: Omit<Material, 'id'>) => void;
    onCancel: () => void;
    initialData: Material | null;
}
const MaterialForm: React.FC<MaterialFormProps> = ({ onSave, onCancel, initialData }) => {
    const [form, setForm] = useState({
        name: initialData?.name || '',
        price: initialData?.price || 0,
        contentValue: initialData?.contentValue || 0,
        contentUnit: initialData?.contentUnit || 'g',
        servicesYield: initialData?.servicesYield || 0,
        currentStock: initialData?.currentStock || 0,
        minimumStock: initialData?.minimumStock || 0,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'name' || name === 'contentUnit' ? value : Number(value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit}>
            <header className="p-5 border-b border-gray-700"><h3 className="font-bold text-lg">{initialData ? 'Editar' : 'Adicionar'} Material</h3></header>
            <main className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Nome do Material *</label><input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full input-dark" /></div>
                <div><label className="block text-sm font-medium mb-1">Preço (R$) *</label><input type="number" name="price" value={form.price} onChange={handleChange} required className="w-full input-dark" /></div>
                <div><label className="block text-sm font-medium mb-1">Rendimento (serviços)</label><input type="number" name="servicesYield" value={form.servicesYield} onChange={handleChange} className="w-full input-dark" /></div>
                <div className="flex gap-2">
                    <div className="flex-grow"><label className="block text-sm font-medium mb-1">Conteúdo *</label><input type="number" name="contentValue" value={form.contentValue} onChange={handleChange} required className="w-full input-dark" /></div>
                    <div><label className="block text-sm font-medium mb-1">Unidade *</label><select name="contentUnit" value={form.contentUnit} onChange={handleChange} className="select-dark h-full">{unitOptions.map(u => <option key={u}>{u}</option>)}</select></div>
                </div>
                <div></div>
                <div><label className="block text-sm font-medium mb-1">Estoque Atual *</label><input type="number" name="currentStock" value={form.currentStock} onChange={handleChange} required className="w-full input-dark" /></div>
                <div><label className="block text-sm font-medium mb-1">Estoque Mínimo *</label><input type="number" name="minimumStock" value={form.minimumStock} onChange={handleChange} required className="w-full input-dark" /></div>
            </main>
            <footer className="p-4 bg-gray-900 flex justify-end gap-3 rounded-b-xl">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
            </footer>
        </form>
    );
};
const CombosPanel: React.FC = () => {
    const { services, setServices } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [comboToEdit, setComboToEdit] = useState<Service | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [comboToDelete, setComboToDelete] = useState<Service | null>(null);

    const { combos, individualServices } = useMemo(() => {
        const combosList = services.filter(s => s.includesServiceIds && s.includesServiceIds.length > 0);
        const individualServicesList = services.filter(s => !s.includesServiceIds || s.includesServiceIds.length === 0);
        return { combos: combosList, individualServices: individualServicesList };
    }, [services]);

    const handleSaveCombo = (comboData: Omit<Service, 'id'>, id?: number) => {
        setServices(prev => {
            if (id) { // Editing
                return prev.map(s => s.id === id ? { ...comboData, id } : s);
            }
            // Creating
            const newCombo = { ...comboData, id: Date.now() };
            return [...prev, newCombo];
        });
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (comboToDelete) {
            setServices(prev => prev.filter(s => s.id !== comboToDelete.id));
        }
        setIsConfirmOpen(false);
        setComboToDelete(null);
    };
    
    return (
         <div className="space-y-6">
             <ComboModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveCombo} 
                comboToEdit={comboToEdit}
                individualServices={individualServices}
             />
             <ConfirmationModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)} 
                onConfirm={handleDelete} 
                title="Confirmar Exclusão"
            >
                <p>Tem certeza de que deseja excluir o pacote <strong>{comboToDelete?.name}</strong>? Esta ação é irreversível.</p>
             </ConfirmationModal>

            <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Gerenciamento de Pacotes e Combos</h3>
                    <button onClick={() => { setComboToEdit(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><PlusCircleIcon />Criar Novo Pacote</button>
                </div>
                {combos.length > 0 ? (
                    <div className="space-y-3">
                        {combos.map(combo => (
                            <div key={combo.id} className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-md bg-purple-100 flex items-center justify-center shrink-0">
                                        <ComboIcon className="text-purple-600 w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{combo.name}</p>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-x-3">
                                            <span>{combo.price} - {combo.duration}</span>
                                            <span className="text-xs text-gray-400">{combo.includesServiceIds?.length || 0} serviços</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setComboToEdit(combo); setIsModalOpen(true); }} className="btn-secondary">Editar</button>
                                    <button onClick={() => { setComboToDelete(combo); setIsConfirmOpen(true); }} className="btn-danger">Excluir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 italic py-8 border-2 border-dashed rounded-lg">
                        <p>Nenhum pacote criado.</p>
                        <p className="text-sm mt-1">Clique em "Criar Novo Pacote" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ComboModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (comboData: Omit<Service, 'id'>, id?: number) => void;
    comboToEdit: Service | null;
    individualServices: Service[];
}
const ComboModal: React.FC<ComboModalProps> = ({ isOpen, onClose, onSave, comboToEdit, individualServices }) => {
    const { financialSettings, users } = useAppContext();
    const [name, setName] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [finalPrice, setFinalPrice] = useState<number | ''>('');
    const [discount, setDiscount] = useState<number | ''>('');

    const isEditing = !!comboToEdit;
    const priceInputRef = useRef<HTMLInputElement>(null);
    const discountInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(comboToEdit?.name || '');
            setSelectedServiceIds(comboToEdit?.includesServiceIds || []);
            setFinalPrice(comboToEdit ? parseFloat(comboToEdit.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) : '');
            setDiscount('');
        }
    }, [comboToEdit, isOpen]);
    
    const { somaPrecosAvulsos, custoOperacionalTotal, lucroLiquido, margemLucro } = useMemo(() => {
        const costPerMinute = (calculateTotalFixedCost(financialSettings, users) / (financialSettings.workDaysInMonth * 8 * 60)) || 0;
        
        const selectedServices = individualServices.filter(s => selectedServiceIds.includes(s.id));
        
        const somaAvulso = selectedServices.reduce((sum, s) => sum + (parseFloat(s.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0), 0);

        const custoOperacional = selectedServices.reduce((sum, s) => {
            const duration = parseDurationToMinutes(s.duration);
            const proratedFixedCost = costPerMinute * duration;
            return sum + (s.productCost || 0) + proratedFixedCost;
        }, 0);
        
        const price = typeof finalPrice === 'number' ? finalPrice : 0;
        const lucro = price - custoOperacional;
        const margem = price > 0 ? (lucro / price) * 100 : 0;
        
        return { somaPrecosAvulsos: somaAvulso, custoOperacionalTotal: custoOperacional, lucroLiquido: lucro, margemLucro: margem };

    }, [selectedServiceIds, individualServices, financialSettings, users, finalPrice]);

    useEffect(() => {
        if (somaPrecosAvulsos > 0 && typeof finalPrice === 'number' && document.activeElement !== discountInputRef.current) {
            const calculatedDiscount = 100 - (finalPrice / somaPrecosAvulsos * 100);
            setDiscount(Math.round(calculatedDiscount));
        } else if (somaPrecosAvulsos === 0) {
            setDiscount('');
        }
    }, [finalPrice, somaPrecosAvulsos]);

    useEffect(() => {
        if (somaPrecosAvulsos > 0 && typeof discount === 'number' && document.activeElement === discountInputRef.current) {
            const calculatedPrice = somaPrecosAvulsos * (1 - (discount / 100));
            setFinalPrice(parseFloat(calculatedPrice.toFixed(2)));
        }
    }, [discount, somaPrecosAvulsos]);
    
    const handleServiceToggle = (serviceId: number) => {
        setSelectedServiceIds(prev => prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedServices = individualServices.filter(s => selectedServiceIds.includes(s.id));
        const totalDuration = selectedServices.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);
        const totalProductCost = selectedServices.reduce((sum, s) => sum + s.productCost, 0);

        const comboData: Omit<Service, 'id'> = {
            name,
            description: selectedServices.map(s => s.name).join(' + '),
            price: `R$ ${Number(finalPrice).toFixed(2)}`,
            duration: `${totalDuration} min`,
            imageUrl: 'https://picsum.photos/seed/combo/400/300',
            isPriceHidden: false,
            productCost: totalProductCost,
            includesServiceIds: selectedServiceIds,
            icon: 'fas fa-layer-group',
        };
        onSave(comboData, comboToEdit?.id);
    };

    const getProfitColor = (profit: number) => profit >= 0 ? 'text-green-500' : 'text-red-500';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-brand-dark text-white w-full max-w-2xl rounded-xl shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b border-gray-700"><h3 className="font-bold text-lg">{isEditing ? 'Editar' : 'Criar'} Pacote</h3></header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                        {/* Left Column: Form */}
                        <div className="space-y-4">
                            <div><label className="input-label-layout">Nome do Pacote *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-dark mt-1" /></div>
                            <div>
                                <label className="input-label-layout">Serviços Inclusos *</label>
                                <div className="mt-1 p-3 bg-gray-900 border border-gray-700 rounded-lg max-h-48 overflow-y-auto space-y-2">
                                    {individualServices.map(service => (
                                        <label key={service.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-800 p-1 rounded-md">
                                            <input type="checkbox" checked={selectedServiceIds.includes(service.id)} onChange={() => handleServiceToggle(service.id)} className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary bg-gray-700 border-gray-600"/>
                                            {service.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="input-label-layout">Preço Final (R$)</label><input ref={priceInputRef} type="number" step="0.1" value={finalPrice} onChange={e => setFinalPrice(e.target.value === '' ? '' : Number(e.target.value))} className="input-dark mt-1" /></div>
                                <div><label className="input-label-layout">Desconto (%)</label><input ref={discountInputRef} type="number" value={discount} onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))} className="input-dark mt-1" /></div>
                            </div>
                        </div>
                        {/* Right Column: Analysis */}
                        <div className="space-y-3 p-4 bg-gray-900 rounded-lg border border-gray-700 h-fit">
                            <h3 className="font-bold text-center text-lg">Análise do Pacote</h3>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between"><span>Soma dos Preços Avulsos:</span><span className="font-mono">{formatCurrency(somaPrecosAvulsos)}</span></div>
                                <div className="flex justify-between"><span>Custo Operacional Total:</span><span className="font-mono">{formatCurrency(custoOperacionalTotal)}</span></div>
                                <div className="flex justify-between border-t border-gray-600 pt-2 text-base"><strong>Lucro Líquido:</strong><strong className={`font-mono ${getProfitColor(lucroLiquido)}`}>{formatCurrency(lucroLiquido)}</strong></div>
                                <div className="flex justify-between text-base"><strong>Margem de Lucro:</strong><strong className={`font-mono ${getProfitColor(lucroLiquido)}`}>{margemLucro.toFixed(1)}%</strong></div>
                            </div>
                        </div>
                    </main>
                    <footer className="p-4 bg-gray-900 flex justify-end gap-3 rounded-b-xl"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" className="btn-success">Salvar Pacote</button></footer>
                </form>
            </div>
        </div>
    );
};