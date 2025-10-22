import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Product, Branding, FontStyleControl } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { Button } from '../../components/ui/Button';
import { HelpTooltip } from '../../components/ui/HelpTooltip';

// --- ICONS ---
const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>;
const PencilIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-blue-500'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const AlertIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.85-1.21 3.486 0l5.58 10.622c.636 1.21-.462 2.779-1.743 2.779H4.42c-1.281 0-2.379-1.569-1.743-2.779L8.257 3.099zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SpinnerIcon: React.FC<{className?: string}> = ({className}) => <svg className={`animate-spin ${className ?? ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" /></svg>;
const ImageUploadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const LinkIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const TrashIconForImage: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;


const FONT_WEIGHTS = [ { value: '300', label: 'Leve (300)'}, { value: '400', label: 'Normal (400)'}, { value: '500', label: 'Médio (500)'}, { value: '600', label: 'Semi-negrito (600)'}, { value: '700', label: 'Negrito (700)'}, { value: '800', label: 'Extra-negrito (800)'}, { value: '900', label: 'Preto (900)'}, ];

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, children, isOpen, onToggle }) => (
    <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <button onClick={onToggle} className="w-full flex justify-between items-center p-6 text-left">
            <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
            <ChevronDownIcon className={isOpen ? 'rotate-180' : ''} />
        </button>
        {isOpen && (
            <div className="p-6 pt-0 animate-fade-in-down">
                {children}
            </div>
        )}
    </div>
);

const ColorInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div className="p-4 rounded-lg border-2 bg-gray-50">
        <div className="flex justify-between items-center">
            <label className="font-semibold text-gray-800">{label}</label>
            <div className="flex items-center gap-2 border border-gray-300 bg-white rounded-lg px-2">
                <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 bg-transparent border-none cursor-pointer" />
                <input type="text" value={value} onChange={e => onChange(e.target.value)} className="font-mono text-sm p-1 w-20 outline-none" />
            </div>
        </div>
    </div>
);

const FontStyleEditor: React.FC<{ label: string, style: FontStyleControl, onStyleChange: (field: keyof FontStyleControl, value: any) => void }> = ({ label, style, onStyleChange }) => {
    return (
        <div className="p-4 rounded-lg border bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-600">Tamanho da Fonte</label>
                    <div className="flex items-center gap-2">
                        <input type="range" min="10" max="72" value={style.fontSize} onChange={e => onStyleChange('fontSize', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                        <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-center text-gray-800 w-14">{style.fontSize}px</span>
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-600">Peso da Fonte</label>
                    <select value={style.fontWeight} onChange={e => onStyleChange('fontWeight', e.target.value)} className="select-dark text-sm w-full mt-1">
                        {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                </div>
                 <div>
                     <label className="text-xs text-gray-600">Estilo da Fonte</label>
                     <div className="flex items-center gap-2 mt-1">
                        <button type="button" onClick={() => onStyleChange('fontStyle', 'normal')} className={`px-3 py-1.5 rounded-md border text-sm font-semibold transition-colors flex-1 ${style.fontStyle === 'normal' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>Normal</button>
                         <button type="button" onClick={() => onStyleChange('fontStyle', 'italic')} className={`px-3 py-1.5 rounded-md border text-sm italic transition-colors flex-1 ${style.fontStyle === 'italic' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>Itálico</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODALS ---
const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b"><h3 className="font-bold text-lg">{title}</h3></header>
                <main className="p-5 text-gray-600">{children}</main>
                <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-danger">Excluir Produto</button>
                </footer>
            </div>
        </div>
    );
};

const ProductModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (product: Omit<Product, 'id'>) => void; productToEdit: Product | null; }> = ({ isOpen, onClose, onSave, productToEdit }) => {
    const [draft, setDraft] = useState<Omit<Product, 'id'>>({ name: '', description: '', price: 0, promotionalPrice: undefined, imageUrl: '', stock: 0, minimumStock: 0, isBestseller: false, isNew: false, isFeatured: false });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen) {
            setDraft(productToEdit || { name: '', description: '', price: 0, promotionalPrice: undefined, imageUrl: '', stock: 0, minimumStock: 0, isBestseller: false, isNew: false, isFeatured: false });
            setImageFile(null);
        }
    }, [productToEdit, isOpen]);

    useEffect(() => {
        const blobUrl = draft.imageUrl;
        return () => {
            if (blobUrl && blobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [draft.imageUrl]);

    if (!isOpen) return null;

    const handleChange = (field: keyof typeof draft, value: any) => {
        setDraft(prev => ({ ...prev, [field]: value }));
    };
    
    const handleNumberChange = (field: keyof typeof draft, value: string) => {
        if (value === '') {
            handleChange(field, undefined);
            return;
        }
        const num = parseFloat(value);
        if (!isNaN(num)) {
            handleChange(field, num);
        }
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (draft.imageUrl && draft.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(draft.imageUrl);
            }
            setImageFile(file);
            handleChange('imageUrl', URL.createObjectURL(file));
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (draft.imageUrl && draft.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(draft.imageUrl);
        }
        setImageFile(null);
        handleChange('imageUrl', e.target.value);
    };

    const handleRemoveImage = () => {
        if (draft.imageUrl && draft.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(draft.imageUrl);
        }
        setImageFile(null);
        handleChange('imageUrl', '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalData = { ...draft };
        if (imageFile) {
            finalData.imageUrl = await fileToBase64(imageFile);
        }
        onSave(finalData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b"><h3 className="font-bold text-lg">{productToEdit ? 'Editar' : 'Adicionar'} Produto</h3></header>
                <main className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div><label className="input-label-layout">Nome do Produto *</label><input type="text" value={draft.name} onChange={e => handleChange('name', e.target.value)} required className="input-dark mt-1"/></div>
                    <div><label className="input-label-layout">Descrição</label><textarea value={draft.description} onChange={e => handleChange('description', e.target.value)} className="textarea-dark mt-1" rows={3}/></div>
                    
                    <div>
                        <label className="input-label-layout">Imagem do Produto</label>
                        <div className="mt-1 p-4 bg-gray-50 rounded-lg border space-y-3">
                            {draft.imageUrl && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden group shadow-sm bg-gray-200">
                                    <img src={draft.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIconForImage />
                                    </button>
                                </div>
                            )}
                            <button type="button" onClick={() => document.getElementById('product-file-upload')?.click()} className="w-full btn-secondary flex items-center justify-center">
                                <ImageUploadIcon /> Carregar Arquivo
                            </button>
                            <input id="product-file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageFileChange} />
                            <div className="relative flex items-center">
                                <LinkIcon />
                                <input 
                                    type="text" 
                                    value={draft.imageUrl.startsWith('blob:') ? '' : draft.imageUrl} 
                                    onChange={handleImageUrlChange} 
                                    placeholder="Ou cole a URL da imagem" 
                                    className="w-full pl-8 input-dark"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="input-label-layout">Preço de Venda (R$) *</label><input type="number" step="0.01" value={draft.price} onChange={e => handleNumberChange('price', e.target.value)} required className="input-dark mt-1"/></div>
                        <div><label className="input-label-layout">Preço Promocional (R$)</label><input type="number" step="0.01" value={draft.promotionalPrice || ''} onChange={e => handleNumberChange('promotionalPrice', e.target.value)} className="input-dark mt-1"/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="input-label-layout">Estoque Atual *</label><input type="number" value={draft.stock} onChange={e => handleNumberChange('stock', e.target.value)} required className="input-dark mt-1"/></div>
                        <div><label className="input-label-layout">Estoque Mínimo *</label><input type="number" value={draft.minimumStock} onChange={e => handleNumberChange('minimumStock', e.target.value)} required className="input-dark mt-1"/></div>
                    </div>
                    <div className="space-y-3 pt-3 border-t">
                        <h4 className="font-semibold text-gray-800">Destaques na Vitrine</h4>
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"><label className="font-medium text-gray-800">Mais Vendido</label><ToggleSwitch enabled={!!draft.isBestseller} setEnabled={value => handleChange('isBestseller', value)}/></div>
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"><label className="font-medium text-gray-800">Novidade</label><ToggleSwitch enabled={!!draft.isNew} setEnabled={value => handleChange('isNew', value)}/></div>
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"><label className="font-medium text-gray-800">Destaque na Home Page</label><ToggleSwitch enabled={!!draft.isFeatured} setEnabled={value => handleChange('isFeatured', value)}/></div>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Salvar</button></footer>
            </form>
        </div>
    );
};


// --- MAIN COMPONENT ---
const StoreSettingsScreen: React.FC = () => {
    const { products, setProducts, branding, setBranding } = useAppContext();
    const [draftProducts, setDraftProducts] = useState<Product[]>(products);
    const [draftBranding, setDraftBranding] = useState<Branding>(branding);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>('products');

    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        setDraftProducts(products);
        setDraftBranding(branding);
    }, [products, branding]);

    useEffect(() => {
        const productsChanged = JSON.stringify(draftProducts) !== JSON.stringify(products);
        const brandingChanged = JSON.stringify(draftBranding) !== JSON.stringify(branding);
        setHasChanges(productsChanged || brandingChanged);
    }, [draftProducts, products, draftBranding, branding]);

    const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
        setDraftProducts(prev => {
            if (productToEdit) {
                return prev.map(p => p.id === productToEdit.id ? { ...productToEdit, ...productData } : p);
            }
            return [...prev, { ...productData, id: Date.now() }];
        });
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (productToDelete) {
            setDraftProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        }
        setIsConfirmOpen(false);
    };

    const handleSaveChanges = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setProducts(draftProducts);
            setBranding(draftBranding);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };

    const handleRevertChanges = () => {
        setDraftProducts(products);
        setDraftBranding(branding);
    };

    const openEditModal = (product: Product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const openConfirmModal = (product: Product) => {
        setProductToDelete(product);
        setIsConfirmOpen(true);
    };

    const handleAccordionToggle = (accordionId: string) => {
        setOpenAccordion(prev => (prev === accordionId ? null : accordionId));
    };
    
    const handleStoreFontStyleChange = (styleKey: keyof Branding['store'], field: keyof FontStyleControl, value: any) => {
        setDraftBranding(prev => ({
            ...prev,
            store: {
                ...prev.store,
                [styleKey]: {
                    ...(prev.store[styleKey] as FontStyleControl),
                    [field]: value
                }
            }
        }));
    };

    const handleStoreColorChange = (colorKey: keyof Branding['store']['colors'], value: string) => {
        setDraftBranding(prev => ({
            ...prev,
            store: {
                ...prev.store,
                colors: {
                    ...prev.store.colors,
                    [colorKey]: value
                }
            }
        }));
    };

    const handleStoreBrandingTextChange = (field: 'titleText' | 'subtitleText', value: string) => {
        setDraftBranding(prev => ({
            ...prev,
            store: {
                ...prev.store,
                [field]: value,
            },
        }));
    };

    const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
        const isLowStock = product.stock < product.minimumStock;
        return (
            <div className={`bg-white rounded-xl shadow-md border ${isLowStock ? 'border-red-300' : 'border-gray-200'} overflow-hidden flex flex-col`}>
                <div className="relative">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                        {product.isBestseller && <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">Mais Vendido</span>}
                        {product.isNew && <span className="text-xs font-bold bg-blue-400 text-white px-2 py-1 rounded-full">Novidade</span>}
                        {product.isFeatured && <span className="text-xs font-bold bg-pink-500 text-white px-2 py-1 rounded-full">Destaque</span>}
                    </div>
                </div>
                <div className="p-4 flex-grow">
                    <h4 className="font-bold text-gray-800">{product.name}</h4>
                    <div className="flex items-baseline gap-2 mt-2">
                        <p className={`text-xl font-bold ${product.promotionalPrice ? 'text-gray-500 line-through' : 'text-brand-primary'}`}>{formatCurrency(product.price)}</p>
                        {product.promotionalPrice && <p className="text-2xl font-bold text-brand-primary">{formatCurrency(product.promotionalPrice)}</p>}
                    </div>
                </div>
                <div className={`p-3 border-t ${isLowStock ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
                    <div className="flex justify-between items-center text-sm font-semibold">
                        <span>Estoque: {product.stock}</span>
                        <span>Mínimo: {product.minimumStock}</span>
                        {isLowStock && <AlertIcon className="text-red-500" />}
                    </div>
                </div>
                <div className="p-3 bg-gray-100 flex justify-end gap-2">
                    <Button variant="secondary" className="!py-1 !px-3 !text-sm" onClick={() => openEditModal(product)}><PencilIcon className="!text-blue-500" /></Button>
                    <Button variant="secondary" className="!py-1 !px-3 !text-sm" onClick={() => openConfirmModal(product)}><TrashIcon /></Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-24">
            <style>{`.animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
            <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} productToEdit={productToEdit} />
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} title="Confirmar Exclusão">
                <p>Tem certeza de que deseja excluir o produto <strong>{productToDelete?.name}</strong>? Esta ação não pode ser desfeita.</p>
            </ConfirmationModal>

            <AccordionItem title="Gerenciamento de Produtos" isOpen={openAccordion === 'products'} onToggle={() => handleAccordionToggle('products')}>
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">Adicione, edite ou remova produtos do seu e-commerce.</p>
                    <Button variant="primary" onClick={openAddModal}><PlusCircleIcon className="text-white mr-2"/>Adicionar Produto</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {draftProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </AccordionItem>

            <AccordionItem title="Textos & Títulos da Loja" isOpen={openAccordion === 'texts'} onToggle={() => handleAccordionToggle('texts')}>
                 <div className="space-y-4">
                    <div>
                        <label className="input-label-layout">Título da Seção</label>
                        <input type="text" value={draftBranding.store.titleText} onChange={e => handleStoreBrandingTextChange('titleText', e.target.value)} className="input-dark mt-1" />
                    </div>
                     <div>
                        <label className="input-label-layout">Subtítulo da Seção</label>
                        <textarea value={draftBranding.store.subtitleText} onChange={e => handleStoreBrandingTextChange('subtitleText', e.target.value)} className="textarea-dark mt-1" rows={3} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <FontStyleEditor label="Estilo do Título da Seção" style={draftBranding.store.sectionTitle} onStyleChange={(field, value) => handleStoreFontStyleChange('sectionTitle', field, value)} />
                        <FontStyleEditor label="Estilo do Subtítulo da Seção" style={draftBranding.store.sectionSubtitle} onStyleChange={(field, value) => handleStoreFontStyleChange('sectionSubtitle', field, value)} />
                        <FontStyleEditor label="Nome do Produto (Card)" style={draftBranding.store.cardTitle} onStyleChange={(field, value) => handleStoreFontStyleChange('cardTitle', field, value)} />
                        <FontStyleEditor label="Descrição do Produto (Card)" style={draftBranding.store.cardDescription} onStyleChange={(field, value) => handleStoreFontStyleChange('cardDescription', field, value)} />
                        <FontStyleEditor label="Preço do Produto (Card)" style={draftBranding.store.cardPrice} onStyleChange={(field, value) => handleStoreFontStyleChange('cardPrice', field, value)} />
                        <FontStyleEditor label="Texto do Botão 'Comprar'" style={draftBranding.store.cardButtonText} onStyleChange={(field, value) => handleStoreFontStyleChange('cardButtonText', field, value)} />
                    </div>
                 </div>
            </AccordionItem>
            
            <AccordionItem title="Cores da Loja" isOpen={openAccordion === 'colors'} onToggle={() => handleAccordionToggle('colors')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorInput label="Fundo da Seção (Home)" value={draftBranding.store.colors.sectionBg} onChange={value => handleStoreColorChange('sectionBg', value)} />
                    <ColorInput label="Fundo do Card de Produto" value={draftBranding.store.colors.cardBg} onChange={value => handleStoreColorChange('cardBg', value)} />
                    <ColorInput label="Cor do Nome do Produto" value={draftBranding.store.colors.titleColor} onChange={value => handleStoreColorChange('titleColor', value)} />
                    <ColorInput label="Cor do Preço" value={draftBranding.store.colors.priceColor} onChange={value => handleStoreColorChange('priceColor', value)} />
                    <ColorInput label="Fundo do Botão" value={draftBranding.store.colors.buttonBg} onChange={value => handleStoreColorChange('buttonBg', value)} />
                    <ColorInput label="Texto do Botão" value={draftBranding.store.colors.buttonTextColor} onChange={value => handleStoreColorChange('buttonTextColor', value)} />
                    <ColorInput label="Fundo do Botão (Hover)" value={draftBranding.store.colors.buttonHoverBg} onChange={value => handleStoreColorChange('buttonHoverBg', value)} />
                    <ColorInput label="Texto do Botão (Hover)" value={draftBranding.store.colors.buttonHoverTextColor} onChange={value => handleStoreColorChange('buttonHoverTextColor', value)} />
                </div>
            </AccordionItem>

            {hasChanges && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50">
                    <div className="bg-brand-dark text-white rounded-xl shadow-2xl p-4 flex justify-between items-center animate-fade-in-up">
                        <p className="font-semibold">Você tem alterações não salvas!</p>
                        <div className="flex gap-4">
                            <button onClick={handleRevertChanges} className="font-semibold hover:underline">Reverter</button>
                            <Button onClick={handleSaveChanges} isLoading={saveStatus === 'saving'} disabled={saveStatus === 'saving'} variant="primary">
                                {saveStatus === 'saved' ? '✓ Salvo!' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreSettingsScreen;